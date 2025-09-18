// 혈당 차트 컴포넌트 (어르신 친화적 디자인)
import React, { useMemo } from 'react'
import { Box, Typography, Chip, Grid } from '@mui/material'
import { Bloodtype as BloodSugarIcon } from '@mui/icons-material'
import type { HealthRecord } from '../../store/slices/healthRecordsSlice'
import BaseChart from './BaseChart'

interface BloodSugarChartProps {
  data: HealthRecord[]
  height?: number
}

// 혈당 상태 판정 함수
const getBloodSugarStatus = (value: number, type: 'fasting' | 'post_meal') => {
  if (type === 'fasting') {
    if (value >= 126) {
      return { status: '당뇨', color: '#e74c3c', severity: 'danger' }
    } else if (value >= 100) {
      return { status: '당뇨 전단계', color: '#f39c12', severity: 'warning' }
    } else {
      return { status: '정상', color: '#27ae60', severity: 'normal' }
    }
  } else {
    if (value >= 200) {
      return { status: '당뇨', color: '#e74c3c', severity: 'danger' }
    } else if (value >= 140) {
      return { status: '당뇨 전단계', color: '#f39c12', severity: 'warning' }
    } else {
      return { status: '정상', color: '#27ae60', severity: 'normal' }
    }
  }
}

const BloodSugarChart: React.FC<BloodSugarChartProps> = ({ 
  data, 
  height = 400 
}) => {
  // 혈당 데이터만 필터링
  const bloodSugarData = useMemo(() => {
    return data.filter(record => record.record_type === 'blood_sugar')
  }, [data])

  // 공복/식후 데이터 분리
  const fastingData = useMemo(() => {
    return bloodSugarData.filter(record => record.blood_sugar_type === 'fasting')
  }, [bloodSugarData])
  
  const postMealData = useMemo(() => {
    return bloodSugarData.filter(record => record.blood_sugar_type === 'post_meal')
  }, [bloodSugarData])
  
  // 평균 혈당 계산
  const averageFasting = useMemo(() => {
    const validData = fastingData.filter(record => record.blood_sugar)
    return validData.length > 0 
      ? Math.round(validData.reduce((sum, record) => sum + (record.blood_sugar || 0), 0) / validData.length)
      : 0
  }, [fastingData])
  
  const averagePostMeal = useMemo(() => {
    const validData = postMealData.filter(record => record.blood_sugar)
    return validData.length > 0 
      ? Math.round(validData.reduce((sum, record) => sum + (record.blood_sugar || 0), 0) / validData.length)
      : 0
  }, [postMealData])

  const fastingStatus = averageFasting > 0 ? getBloodSugarStatus(averageFasting, 'fasting') : null
  const postMealStatus = averagePostMeal > 0 ? getBloodSugarStatus(averagePostMeal, 'post_meal') : null

  // 툴팁 포맷터
  const tooltipFormatter = (value: any, name: string) => {
    if (name === 'blood_sugar') return [`${value} mg/dL`, '혈당']
    return [value, name]
  }


  return (
    <Box>
      {/* BaseChart 사용 */}
      <BaseChart
        data={bloodSugarData}
        height={height}
        title="혈당 변화 추이"
        icon={<BloodSugarIcon sx={{ fontSize: 32, color: '#3498db' }} />}
        chartType="line"
        lines={[
          {
            dataKey: 'blood_sugar',
            stroke: '#3498db',
            name: '혈당',
            strokeWidth: 4
          }
        ]}
        referenceLines={[
          { y: 100, stroke: '#27ae60', strokeDasharray: '5 5', label: '정상 공복' },
          { y: 140, stroke: '#f39c12', strokeDasharray: '5 5', label: '정상 식후' }
        ]}
        yAxisDomain={[50, 300]}
        yAxisLabel="mg/dL"
        tooltipFormatter={tooltipFormatter}
        emptyMessage="혈당 기록이 없습니다"
        panningTip="차트를 드래그하여 날짜 범위를 선택할 수 있습니다"
      />

      {/* 평균 혈당 표시 */}
      {bloodSugarData.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📊 평균 혈당
          </Typography>
          <Grid container spacing={2}>
            {averageFasting > 0 && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                    공복:
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                    {averageFasting} mg/dL
                  </Typography>
                  {fastingStatus && (
                    <Chip 
                      label={fastingStatus.status} 
                      sx={{ 
                        backgroundColor: fastingStatus.color,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            )}
            {averagePostMeal > 0 && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                    식후:
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                    {averagePostMeal} mg/dL
                  </Typography>
                  {postMealStatus && (
                    <Chip 
                      label={postMealStatus.status} 
                      sx={{ 
                        backgroundColor: postMealStatus.color,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* 혈당 기준 안내 */}
      <Box sx={{ mt: 2, p: 3, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          💡 <strong>혈당 기준:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            label="정상 공복: 100mg/dL 미만" 
            sx={{ backgroundColor: '#27ae60', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
          <Chip 
            label="정상 식후: 140mg/dL 미만" 
            sx={{ backgroundColor: '#27ae60', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
          <Chip 
            label="당뇨 전단계: 100-125/140-199" 
            sx={{ backgroundColor: '#f39c12', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
          <Chip 
            label="당뇨: 126/200 이상" 
            sx={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default BloodSugarChart

