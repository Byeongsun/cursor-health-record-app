// 체중 차트 컴포넌트 (어르신 친화적 디자인)
import React, { useMemo, useState, useRef, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import { Box, Typography, Paper, Chip, Grid } from '@mui/material'
import { MonitorWeight as WeightIcon, TrendingUp, TrendingDown } from '@mui/icons-material'
import type { HealthRecord } from '../../store/slices/healthRecordsSlice'

interface WeightChartProps {
  data: HealthRecord[]
  height?: number
}

// 차트 데이터 변환 함수
const transformDataForChart = (records: HealthRecord[]) => {
  return records
    .filter(record => record.record_type === 'weight')
    .sort((a, b) => new Date(a.measurement_time).getTime() - new Date(b.measurement_time).getTime())
    .map(record => ({
      date: new Date(record.measurement_time).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      }),
      fullDate: new Date(record.measurement_time).toLocaleDateString('ko-KR'),
      time: new Date(record.measurement_time).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      weight: record.weight,
      notes: record.notes
    }))
}

// 체중 변화 계산 함수
const calculateWeightChange = (data: any[]) => {
  if (data.length < 2) return { change: 0, percentage: 0, trend: 'stable' }
  
  const firstWeight = data[0].weight
  const lastWeight = data[data.length - 1].weight
  const change = lastWeight - firstWeight
  const percentage = ((change / firstWeight) * 100).toFixed(1)
  
  let trend = 'stable'
  if (change > 0.5) trend = 'up'
  else if (change < -0.5) trend = 'down'
  
  return { change, percentage: parseFloat(percentage), trend }
}

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          backgroundColor: 'white',
          border: '2px solid #27ae60',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" sx={{ color: '#27ae60', fontWeight: 'bold', mb: 1 }}>
          {data.fullDate} {data.time}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
              체중:
            </Typography>
            <Typography variant="h6" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
              {data.weight} kg
            </Typography>
          </Box>
          {data.notes && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 1 }}>
              📝 {data.notes}
            </Typography>
          )}
        </Box>
      </Paper>
    )
  }
  return null
}

const WeightChart: React.FC<WeightChartProps> = ({ 
  data, 
  height = 400 
}) => {
  // Panning 상태 관리
  const [panStart, setPanStart] = useState<number | null>(null)
  const [panEnd, setPanEnd] = useState<number | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // 데이터 변환을 useMemo로 최적화하여 데이터 변경 시에만 재계산
  const chartData = useMemo(() => {
    console.log('WeightChart: 데이터 변환 중...', data.length)
    return transformDataForChart(data)
  }, [data])
  
  // Panning에 따른 데이터 필터링
  const recentData = useMemo(() => {
    console.log('WeightChart: 최근 데이터 계산 중...', chartData.length)
    let filteredData = chartData
    
    if (panStart !== null && panEnd !== null) {
      const startIndex = Math.max(0, Math.min(panStart, panEnd))
      const endIndex = Math.min(chartData.length, Math.max(panStart, panEnd))
      filteredData = chartData.slice(startIndex, endIndex)
    } else {
      // 기본적으로 최근 14일간의 데이터만 표시
      filteredData = chartData.slice(-14)
    }
    
    return filteredData
  }, [chartData, panStart, panEnd])
  
  // 체중 통계 계산
  const weightStats = useMemo(() => {
    return {
      current: recentData.length > 0 ? recentData[recentData.length - 1].weight : 0,
      average: recentData.length > 0 
        ? (recentData.reduce((sum, item) => sum + item.weight, 0) / recentData.length).toFixed(1)
        : 0,
      min: recentData.length > 0 ? Math.min(...recentData.map(item => item.weight)) : 0,
      max: recentData.length > 0 ? Math.max(...recentData.map(item => item.weight)) : 0
    }
  }, [recentData])
  
  const weightChange = useMemo(() => {
    return calculateWeightChange(recentData)
  }, [recentData])

  // Panning 핸들러들
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relativeX = x / rect.width
    const dataIndex = Math.floor(relativeX * chartData.length)
    
    setPanStart(dataIndex)
    setIsPanning(true)
  }, [chartData.length])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !chartRef.current) return
    
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relativeX = x / rect.width
    const dataIndex = Math.floor(relativeX * chartData.length)
    
    setPanEnd(dataIndex)
  }, [isPanning, chartData.length])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false)
  }, [])

  const resetPanning = useCallback(() => {
    setPanStart(null)
    setPanEnd(null)
  }, [])

  if (recentData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <WeightIcon sx={{ fontSize: 60, color: '#27ae60', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          체중 기록이 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          체중을 측정하고 기록해보세요!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          💡 <strong>팁:</strong> 데이터가 있으면 차트를 드래그하여 날짜 범위를 선택할 수 있습니다
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* 차트 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WeightIcon sx={{ fontSize: 32, color: '#27ae60', mr: 2 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
              체중 변화 추이
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {panStart !== null && panEnd !== null 
                ? `선택된 기간: ${chartData[Math.min(panStart, panEnd)]?.date} ~ ${chartData[Math.max(panStart, panEnd) - 1]?.date}`
                : '최근 14일간의 체중 기록'
              }
            </Typography>
          </Box>
        </Box>
        {(panStart !== null || panEnd !== null) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              📊 드래그하여 날짜 범위 선택
            </Typography>
            <Chip
              label="초기화"
              onClick={resetPanning}
              sx={{ 
                cursor: 'pointer',
                backgroundColor: '#f0f0f0',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}
            />
          </Box>
        )}
      </Box>

      {/* 체중 통계 표시 */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📊 체중 통계
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                현재 체중
              </Typography>
              <Typography variant="h5" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
                {weightStats.current} kg
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                평균 체중
              </Typography>
              <Typography variant="h5" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
                {weightStats.average} kg
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                최저 체중
              </Typography>
              <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 'bold' }}>
                {weightStats.min} kg
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                최고 체중
              </Typography>
              <Typography variant="h5" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {weightStats.max} kg
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 체중 변화 표시 */}
        {recentData.length > 1 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              📈 체중 변화
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {weightChange.trend === 'up' && <TrendingUp sx={{ color: '#e74c3c' }} />}
              {weightChange.trend === 'down' && <TrendingDown sx={{ color: '#27ae60' }} />}
              <Typography variant="h6" sx={{ 
                color: weightChange.change > 0 ? '#e74c3c' : weightChange.change < 0 ? '#27ae60' : '#666',
                fontWeight: 'bold'
              }}>
                {weightChange.change > 0 ? '+' : ''}{weightChange.change.toFixed(1)} kg
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                ({weightChange.percentage > 0 ? '+' : ''}{weightChange.percentage}%)
              </Typography>
              <Chip 
                label={weightChange.trend === 'up' ? '증가' : weightChange.trend === 'down' ? '감소' : '유지'} 
                sx={{ 
                  backgroundColor: weightChange.trend === 'up' ? '#e74c3c' : 
                                 weightChange.trend === 'down' ? '#27ae60' : '#666',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* 차트 */}
      <Box sx={{ 
        width: '100%', 
        overflowX: 'auto',
        position: 'relative',
        cursor: isPanning ? 'grabbing' : 'grab',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      }}
      ref={chartRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      >
        <ResponsiveContainer width={Math.max(800, recentData.length * 80)} height={height}>
          <AreaChart data={recentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 14, fontWeight: 'bold' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fontSize: 14, fontWeight: 'bold' }}
            tickLine={{ stroke: '#666' }}
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          />
          
          {/* 체중 라인 및 영역 */}
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#27ae60"
            strokeWidth={4}
            fill="#27ae60"
            fillOpacity={0.1}
            dot={{ fill: '#27ae60', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#27ae60', strokeWidth: 2 }}
            name="체중"
          />
        </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* 체중 관리 안내 */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          💡 <strong>체중 관리 팁:</strong>
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="매일 같은 시간에 측정" 
            sx={{ backgroundColor: '#3498db', color: 'white', fontSize: '0.8rem' }}
          />
          <Chip 
            label="규칙적인 식사" 
            sx={{ backgroundColor: '#27ae60', color: 'white', fontSize: '0.8rem' }}
          />
          <Chip 
            label="적당한 운동" 
            sx={{ backgroundColor: '#f39c12', color: 'white', fontSize: '0.8rem' }}
          />
          <Chip 
            label="충분한 수면" 
            sx={{ backgroundColor: '#9b59b6', color: 'white', fontSize: '0.8rem' }}
          />
        </Box>
      </Box>
    </Paper>
  )
}

export default WeightChart

