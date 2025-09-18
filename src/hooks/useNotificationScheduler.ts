// 알림 스케줄러 훅
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMeasurementReminder, addWarningNotification, addInfoNotification } from '../store/slices/notificationsSlice'
import { validateBloodPressure, validateBloodSugar, validateHeartRate, HEALTH_RANGES } from '../utils/healthValidation'
import type { RootState } from '../store'
import type { AppDispatch } from '../store'

interface UseNotificationSchedulerProps {
  userId: string
  isEnabled?: boolean
}

export const useNotificationScheduler = ({ userId, isEnabled = true }: UseNotificationSchedulerProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { records } = useSelector((state: RootState) => state.healthRecords)
  const { settings } = useSelector((state: RootState) => state.notificationSettings)

  // 측정 리마인더 생성 (중복 방지)
  const createMeasurementReminder = useCallback(() => {
    const reminderSettings = settings.find(s => s.setting_type === 'measurement_reminder' && s.is_enabled)
    
    if (!reminderSettings) return

    // 오늘 측정한 기록이 있는지 확인
    const today = new Date().toDateString()
    const todayRecords = records.filter(record => 
      new Date(record.measurement_time).toDateString() === today
    )

    const measuredTypes = todayRecords.map(record => record.record_type)
    const requiredTypes = reminderSettings.measurement_types

    // 아직 측정하지 않은 유형들에 대해 리마인더 생성
    const missingTypes = requiredTypes.filter(type => !measuredTypes.includes(type))
    
    if (missingTypes.length > 0) {
      const typeNames = {
        blood_pressure: '혈압',
        blood_sugar: '혈당',
        weight: '체중',
        exercise: '운동'
      }

      const missingTypeNames = missingTypes.map(type => typeNames[type as keyof typeof typeNames] || type)
      
      // 한 번만 알림 생성
      dispatch(addMeasurementReminder({
        type: missingTypeNames.join(', '),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }))
    }
  }, [dispatch, records, settings])

  // 위험 수치 알림 생성
  const createDangerAlerts = useCallback(() => {
    const dangerSettings = settings.find(s => s.setting_type === 'danger_alert' && s.is_enabled)
    
    if (!dangerSettings) return

    // 최근 기록들 검사
    const recentRecords = records
      .sort((a, b) => new Date(b.measurement_time).getTime() - new Date(a.measurement_time).getTime())
      .slice(0, 3) // 최근 3개 기록

    recentRecords.forEach(record => {
      // 혈압 검사
      if (record.record_type === 'blood_pressure' && 
          record.systolic_pressure && record.diastolic_pressure) {
        const bpResult = validateBloodPressure(record.systolic_pressure, record.diastolic_pressure)
        if (bpResult.isDanger) {
          dispatch(addWarningNotification({
            type: '혈압',
            value: `${record.systolic_pressure}/${record.diastolic_pressure} mmHg`,
            normalRange: HEALTH_RANGES.blood_pressure.description
          }))
        }
      }

      // 혈당 검사
      if (record.record_type === 'blood_sugar' && record.blood_sugar) {
        const bsResult = validateBloodSugar(record.blood_sugar, record.blood_sugar_type || 'fasting')
        if (bsResult.isDanger) {
          dispatch(addWarningNotification({
            type: '혈당',
            value: `${record.blood_sugar} mg/dL`,
            normalRange: HEALTH_RANGES.blood_sugar.description
          }))
        }
      }

      // 맥박 검사
      if (record.heart_rate) {
        const hrResult = validateHeartRate(record.heart_rate)
        if (hrResult.isDanger) {
          dispatch(addWarningNotification({
            type: '맥박',
            value: `${record.heart_rate} bpm`,
            normalRange: HEALTH_RANGES.heart_rate.description
          }))
        }
      }
    })
  }, [dispatch, records, settings])

  // 일일 요약 알림 생성
  const createDailySummary = useCallback(() => {
    const summarySettings = settings.find(s => s.setting_type === 'daily_summary' && s.is_enabled)
    
    if (!summarySettings) return

    const today = new Date().toDateString()
    const todayRecords = records.filter(record => 
      new Date(record.measurement_time).toDateString() === today
    )

    if (todayRecords.length > 0) {
      const recordTypes = {
        blood_pressure: '혈압',
        blood_sugar: '혈당',
        weight: '체중'
      }

      const measuredTypes = [...new Set(todayRecords.map(record => 
        recordTypes[record.record_type as keyof typeof recordTypes] || record.record_type
      ))]

      dispatch(addInfoNotification({
        title: '오늘의 건강 요약',
        message: `오늘 ${measuredTypes.join(', ')} 측정을 완료하셨습니다. 꾸준한 건강 관리, 잘하고 계세요! 💪`
      }))
    }
  }, [dispatch, records, settings])

  // 알림 스케줄링 (중복 방지)
  useEffect(() => {
    if (!isEnabled || settings.length === 0) return

    // 1분마다 체크하되, 실제 알림은 하루에 한 번만
    const checkInterval = setInterval(() => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const currentDay = now.getDay()
      
      // 오늘 이미 알림을 보냈는지 확인하는 키
      const todayKey = `notifications_sent_${now.toDateString()}`

      // 각 설정에 대해 알림 시간 확인
      settings.forEach(setting => {
        if (!setting.is_enabled) return

        // 시간 확인
        if (setting.time !== currentTime) return

        // 요일 확인 (daily 설정이거나 오늘이 설정된 요일에 포함되는 경우)
        if (setting.frequency === 'daily' || setting.days.includes(currentDay)) {
          // 오늘 이미 이 알림을 보냈는지 확인
          const notificationKey = `${todayKey}_${setting.setting_type}`
          
          if (localStorage.getItem(notificationKey)) return

          switch (setting.setting_type) {
            case 'measurement_reminder':
              createMeasurementReminder()
              localStorage.setItem(notificationKey, 'sent')
              break
            case 'danger_alert':
              createDangerAlerts()
              localStorage.setItem(notificationKey, 'sent')
              break
            case 'daily_summary':
              createDailySummary()
              localStorage.setItem(notificationKey, 'sent')
              break
          }
        }
      })
    }, 60000) // 1분마다 체크

    return () => clearInterval(checkInterval)
  }, [isEnabled, settings, createMeasurementReminder, createDangerAlerts, createDailySummary])

  // 실시간 위험 수치 모니터링
  useEffect(() => {
    if (!isEnabled) return

    // 새로 추가된 기록이 있는지 확인
    const latestRecord = records[0]
    if (!latestRecord) return

    const recordTime = new Date(latestRecord.measurement_time)
    const now = new Date()
    const timeDiff = now.getTime() - recordTime.getTime()

    // 최근 5분 내에 추가된 기록만 검사
    if (timeDiff > 5 * 60 * 1000) return

    // 위험 수치 검사
    if (latestRecord.record_type === 'blood_pressure' && 
        latestRecord.systolic_pressure && latestRecord.diastolic_pressure) {
      const bpResult = validateBloodPressure(latestRecord.systolic_pressure, latestRecord.diastolic_pressure)
      if (bpResult.isDanger) {
        dispatch(addWarningNotification({
          type: '혈압',
          value: `${latestRecord.systolic_pressure}/${latestRecord.diastolic_pressure} mmHg`,
          normalRange: '정상: 90-140/60-90 mmHg'
        }))
      }
    }

    if (latestRecord.record_type === 'blood_sugar' && latestRecord.blood_sugar) {
      const bsResult = validateBloodSugar(latestRecord.blood_sugar, latestRecord.blood_sugar_type || 'fasting')
      if (bsResult.isDanger) {
        dispatch(addWarningNotification({
          type: '혈당',
          value: `${latestRecord.blood_sugar} mg/dL`,
          normalRange: '정상: 공복 70-100mg/dL, 식후 70-140mg/dL'
        }))
      }
    }

    if (latestRecord.heart_rate) {
      const hrResult = validateHeartRate(latestRecord.heart_rate)
      if (hrResult.isDanger) {
        dispatch(addWarningNotification({
          type: '맥박',
          value: `${latestRecord.heart_rate} bpm`,
          normalRange: '정상: 60-100 bpm'
        }))
      }
    }
  }, [dispatch, records, isEnabled])

  return {
    createMeasurementReminder,
    createDangerAlerts,
    createDailySummary
  }
}
