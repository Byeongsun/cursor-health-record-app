// 건강 수치 검증 및 위험 알림 유틸리티

// 정상 범위 정의
export const HEALTH_RANGES = {
  blood_pressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
    description: '정상 혈압: 90-140/60-90 mmHg'
  },
  blood_sugar: {
    fasting: { min: 70, max: 100 },
    post_meal: { min: 70, max: 140 },
    description: '정상 혈당: 공복 70-100mg/dL, 식후 70-140mg/dL'
  },
  weight: {
    bmi_normal: { min: 18.5, max: 24.9 },
    description: '정상 BMI: 18.5-24.9'
  },
  heart_rate: {
    normal: { min: 60, max: 100 },
    description: '정상 맥박: 60-100 bpm'
  }
}

// 위험 수치 정의
export const DANGER_THRESHOLDS = {
  blood_pressure: {
    systolic: { high: 180, low: 80 },
    diastolic: { high: 110, low: 50 }
  },
  blood_sugar: {
    high: 200,
    low: 60
  },
  heart_rate: {
    high: 120,
    low: 40
  }
}

// 혈압 검증
export const validateBloodPressure = (systolic: number, diastolic: number) => {
  const results = {
    isNormal: true,
    isDanger: false,
    warnings: [] as string[],
    level: 'normal' as 'normal' | 'warning' | 'danger'
  }

  // 고혈압 검사
  if (systolic >= DANGER_THRESHOLDS.blood_pressure.systolic.high || 
      diastolic >= DANGER_THRESHOLDS.blood_pressure.diastolic.high) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 고혈압 위험! 즉시 의료진과 상담하세요.')
  }
  // 저혈압 검사
  else if (systolic <= DANGER_THRESHOLDS.blood_pressure.systolic.low || 
           diastolic <= DANGER_THRESHOLDS.blood_pressure.diastolic.low) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 저혈압 위험! 의료진과 상담하세요.')
  }
  // 경계선 고혈압
  else if (systolic > HEALTH_RANGES.blood_pressure.systolic.max || 
           diastolic > HEALTH_RANGES.blood_pressure.diastolic.max) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 경계선 고혈압입니다. 주의가 필요합니다.')
  }
  // 경계선 저혈압
  else if (systolic < HEALTH_RANGES.blood_pressure.systolic.min || 
           diastolic < HEALTH_RANGES.blood_pressure.diastolic.min) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 경계선 저혈압입니다. 수분 섭취를 늘리세요.')
  }

  return results
}

// 혈당 검증
export const validateBloodSugar = (value: number, type: 'fasting' | 'post_meal') => {
  const results = {
    isNormal: true,
    isDanger: false,
    warnings: [] as string[],
    level: 'normal' as 'normal' | 'warning' | 'danger'
  }

  const range = HEALTH_RANGES.blood_sugar[type]

  // 고혈당 위험
  if (value >= DANGER_THRESHOLDS.blood_sugar.high) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 고혈당 위험! 즉시 의료진과 상담하세요.')
  }
  // 저혈당 위험
  else if (value <= DANGER_THRESHOLDS.blood_sugar.low) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 저혈당 위험! 당분을 섭취하세요.')
  }
  // 경계선 고혈당
  else if (value > range.max) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 경계선 고혈당입니다. 식단 관리가 필요합니다.')
  }
  // 경계선 저혈당
  else if (value < range.min) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 경계선 저혈당입니다. 규칙적인 식사를 하세요.')
  }

  return results
}

// 맥박 검증
export const validateHeartRate = (value: number) => {
  const results = {
    isNormal: true,
    isDanger: false,
    warnings: [] as string[],
    level: 'normal' as 'normal' | 'warning' | 'danger'
  }

  // 빈맥 위험
  if (value >= DANGER_THRESHOLDS.heart_rate.high) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 빈맥 위험! 즉시 의료진과 상담하세요.')
  }
  // 서맥 위험
  else if (value <= DANGER_THRESHOLDS.heart_rate.low) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 서맥 위험! 의료진과 상담하세요.')
  }
  // 경계선 높음
  else if (value > HEALTH_RANGES.heart_rate.normal.max) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 맥박이 빠릅니다. 휴식을 취하세요.')
  }
  // 경계선 낮음
  else if (value < HEALTH_RANGES.heart_rate.normal.min) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 맥박이 느립니다. 운동을 고려해보세요.')
  }

  return results
}

// 체중 검증 (BMI 기준)
export const validateWeight = (weight: number, height: number) => {
  const results = {
    isNormal: true,
    isDanger: false,
    warnings: [] as string[],
    level: 'normal' as 'normal' | 'warning' | 'danger',
    bmi: 0
  }

  if (height <= 0) {
    results.warnings.push('키 정보가 필요합니다.')
    return results
  }

  const bmi = weight / ((height / 100) ** 2)
  results.bmi = Math.round(bmi * 10) / 10

  if (bmi >= 30) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 비만 위험! 의료진과 상담하여 체중 관리 계획을 세우세요.')
  }
  else if (bmi <= 18.5) {
    results.isNormal = false
    results.isDanger = true
    results.level = 'danger'
    results.warnings.push('⚠️ 저체중 위험! 영양사와 상담하세요.')
  }
  else if (bmi > 25) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 과체중입니다. 식단과 운동 관리가 필요합니다.')
  }
  else if (bmi < 20) {
    results.isNormal = false
    results.level = 'warning'
    results.warnings.push('⚠️ 체중이 약간 부족합니다. 균형 잡힌 식사를 하세요.')
  }

  return results
}

// 전체 건강 상태 평가
export const evaluateOverallHealth = (records: any[]) => {
  const recentRecords = records
    .sort((a, b) => new Date(b.measurement_time).getTime() - new Date(a.measurement_time).getTime())
    .slice(0, 7) // 최근 7일

  const results = {
    overallScore: 100,
    warnings: [] as string[],
    level: 'good' as 'good' | 'fair' | 'poor',
    recommendations: [] as string[]
  }

  let warningCount = 0
  let dangerCount = 0

  recentRecords.forEach(record => {
    if (record.record_type === 'blood_pressure' && record.systolic_pressure && record.diastolic_pressure) {
      const bpResult = validateBloodPressure(record.systolic_pressure, record.diastolic_pressure)
      if (bpResult.isDanger) dangerCount++
      else if (!bpResult.isNormal) warningCount++
      results.warnings.push(...bpResult.warnings)
    }

    if (record.record_type === 'blood_sugar' && record.blood_sugar) {
      const bsResult = validateBloodSugar(record.blood_sugar, record.blood_sugar_type || 'fasting')
      if (bsResult.isDanger) dangerCount++
      else if (!bsResult.isNormal) warningCount++
      results.warnings.push(...bsResult.warnings)
    }

    if (record.heart_rate) {
      const hrResult = validateHeartRate(record.heart_rate)
      if (hrResult.isDanger) dangerCount++
      else if (!hrResult.isNormal) warningCount++
      results.warnings.push(...hrResult.warnings)
    }
  })

  // 전체 점수 계산
  results.overallScore = Math.max(0, 100 - (warningCount * 10) - (dangerCount * 30))

  // 전체 상태 평가
  if (results.overallScore >= 80) {
    results.level = 'good'
    results.recommendations.push('🎉 건강 상태가 양호합니다! 꾸준히 관리하세요.')
  } else if (results.overallScore >= 60) {
    results.level = 'fair'
    results.recommendations.push('⚠️ 건강 관리에 더 주의가 필요합니다.')
  } else {
    results.level = 'poor'
    results.recommendations.push('🚨 건강 상태가 우려됩니다. 의료진과 상담하세요.')
  }

  return results
}




