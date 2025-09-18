// 혈압 차트 컴포넌트 (어르신 친화적 디자인)
import React, { useMemo } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { Favorite as BloodPressureIcon } from '@mui/icons-material'
import type { HealthRecord } from '../../store/slices/healthRecordsSlice'
import BaseChart from './BaseChart'

interface BloodPressureChartProps {
  data: HealthRecord[]
  height?: number
}

// 혈압 상태 판정 함수
const getBloodPressureStatus = (systolic: number, diastolic: number) => {
  if (systolic >= 140 || diastolic >= 90) {
    return { status: '고혈압', color: '#e74c3c', severity: 'danger' }
  } else if (systolic >= 120 || diastolic >= 80) {
    return { status: '고혈압 전단계', color: '#f39c12', severity: 'warning' }
  } else {
    return { status: '정상', color: '#27ae60', severity: 'normal' }
  }
}

const BloodPressureChart: React.FC<BloodPressureChartProps> = ({ 
  data, 
  height = 400 
}) => {
  // 혈압 데이터만 필터링
  const bloodPressureData = useMemo(() => {
    return data.filter(record => record.record_type === 'blood_pressure')
  }, [data])

  // 평균 혈압 계산
  const averageSystolic = useMemo(() => {
    const validData = bloodPressureData.filter(record => record.systolic_pressure)
    return validData.length > 0 
      ? Math.round(validData.reduce((sum, record) => sum + (record.systolic_pressure || 0), 0) / validData.length)
      : 0
  }, [bloodPressureData])
  
  const averageDiastolic = useMemo(() => {
    const validData = bloodPressureData.filter(record => record.diastolic_pressure)
    return validData.length > 0 
      ? Math.round(validData.reduce((sum, record) => sum + (record.diastolic_pressure || 0), 0) / validData.length)
      : 0
  }, [bloodPressureData])

  const averageStatus = useMemo(() => {
    return getBloodPressureStatus(averageSystolic, averageDiastolic)
  }, [averageSystolic, averageDiastolic])

  // 툴팁 포맷터
  const tooltipFormatter = (value: any, name: string) => {
    if (name === 'systolic') return [`${value} mmHg`, '수축기']
    if (name === 'diastolic') return [`${value} mmHg`, '이완기']
    if (name === 'heartRate') return [`${value} bpm`, '맥박']
    return [value, name]
  }

  return (
    <Box>
      {/* BaseChart 사용 */}
      <BaseChart
        data={bloodPressureData}
        height={height}
        title="혈압 변화 추이"
        icon={<BloodPressureIcon sx={{ fontSize: 32, color: '#e74c3c' }} />}
        chartType="line"
        lines={[
          {
            dataKey: 'systolic_pressure',
            stroke: '#e74c3c',
            name: '수축기 혈압',
            strokeWidth: 4
          },
          {
            dataKey: 'diastolic_pressure',
            stroke: '#3498db',
            name: '이완기 혈압',
            strokeWidth: 4
          },
          {
            dataKey: 'heart_rate',
            stroke: '#f39c12',
            name: '맥박',
            strokeWidth: 3
          }
        ]}
        referenceLines={[
          { y: 120, stroke: '#27ae60', strokeDasharray: '5 5', label: '정상 수축기' },
          { y: 80, stroke: '#27ae60', strokeDasharray: '5 5', label: '정상 이완기' }
        ]}
        yAxisDomain={[60, 200]}
        yAxisLabel="mmHg"
        tooltipFormatter={tooltipFormatter}
        emptyMessage="혈압 기록이 없습니다"
        panningTip="차트를 드래그하여 날짜 범위를 선택할 수 있습니다"
      />

      {/* 평균 혈압 표시 */}
      {bloodPressureData.length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            📊 평균 혈압
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                수축기:
              </Typography>
              <Typography variant="h5" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {averageSystolic} mmHg
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                이완기:
              </Typography>
              <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                {averageDiastolic} mmHg
              </Typography>
            </Box>
            <Chip 
              label={averageStatus.status} 
              sx={{ 
                backgroundColor: averageStatus.color,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            />
          </Box>
        </Box>
      )}

      {/* 혈압 기준 안내 */}
      <Box sx={{ mt: 2, p: 3, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
          💡 <strong>혈압 기준:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            label="정상: 120/80 미만" 
            sx={{ backgroundColor: '#27ae60', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
          <Chip 
            label="고혈압 전단계: 120-139/80-89" 
            sx={{ backgroundColor: '#f39c12', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
          <Chip 
            label="고혈압: 140/90 이상" 
            sx={{ backgroundColor: '#e74c3c', color: 'white', fontSize: '1rem', fontWeight: 600, py: 1 }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default BloodPressureChart

