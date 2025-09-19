// 공통 차트 기능을 제공하는 기본 차트 컴포넌트
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
  BarChart,
  Bar
} from 'recharts'
import { Box, Typography, Paper, Chip } from '@mui/material'
import type { HealthRecord } from '../../store/slices/healthRecordsSlice'

export interface ChartData {
  date: string
  fullDate: string
  time: string
  [key: string]: any
}

export interface BaseChartProps {
  data: HealthRecord[]
  height?: number
  title: string
  icon: React.ReactNode
  chartType: 'line' | 'bar'
  lines: Array<{
    dataKey: string
    stroke: string
    name: string
    strokeWidth?: number
  }>
  referenceLines?: Array<{
    y: number
    stroke: string
    strokeDasharray?: string
    label?: string
  }>
  yAxisDomain?: [number, number]
  yAxisLabel?: string
  tooltipFormatter?: (value: any, name: string) => [string, string]
  emptyMessage?: string
  panningTip?: string
}

const BaseChart: React.FC<BaseChartProps> = ({
  data,
  height = 300,
  title,
  icon,
  chartType,
  lines,
  referenceLines = [],
  yAxisDomain,
  yAxisLabel,
  tooltipFormatter,
  emptyMessage = "데이터가 없습니다",
  panningTip = "차트를 드래그하여 날짜 범위를 선택할 수 있습니다"
}) => {
  const [panStart, setPanStart] = useState<Date | null>(null)
  const [panEnd, setPanEnd] = useState<Date | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // 차트 데이터 변환
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const filtered = panStart && panEnd 
      ? data.filter(record => {
          const recordDate = new Date(record.measurement_time)
          return recordDate >= panStart && recordDate <= panEnd
        })
      : data

    return filtered
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
        ...record
      }))
  }, [data, panStart, panEnd])

  // Panning 이벤트 핸들러
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (chartData.length === 0) return
    
    const rect = chartRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const chartWidth = rect.width
    const dataLength = chartData.length
    
    if (dataLength > 0) {
      const dataIndex = Math.floor((x / chartWidth) * dataLength)
      const clampedIndex = Math.max(0, Math.min(dataIndex, dataLength - 1))
      const recordDate = new Date(data[clampedIndex].measurement_time)
      setPanStart(recordDate)
      setPanEnd(recordDate)
      setIsPanning(true)
    }
  }, [chartData, data])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isPanning || chartData.length === 0) return
    
    const rect = chartRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const chartWidth = rect.width
    const dataLength = chartData.length
    
    if (dataLength > 0) {
      const dataIndex = Math.floor((x / chartWidth) * dataLength)
      const clampedIndex = Math.max(0, Math.min(dataIndex, dataLength - 1))
      const recordDate = new Date(data[clampedIndex].measurement_time)
      setPanEnd(recordDate)
    }
  }, [isPanning, chartData, data])

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

  // 빈 데이터 상태
  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1, color: 'text.secondary' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {panningTip}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3, backgroundColor: '#fff' }}>
      {/* 차트 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            {title}
          </Typography>
        </Box>
        
        {panStart && panEnd && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {panStart.toLocaleDateString('ko-KR')} ~ {panEnd.toLocaleDateString('ko-KR')}
            </Typography>
            <Chip
              label="초기화"
              size="small"
              onClick={resetPanning}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </Box>

      {/* 차트 컨테이너 */}
      <Box
        ref={chartRef}
        sx={{
          position: 'relative',
          cursor: isPanning ? 'grabbing' : 'grab',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      >
        <ResponsiveContainer
          width={Math.max(800, chartData.length * 80)}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#666' }}
              />
              <YAxis 
                domain={yAxisDomain}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#666' }}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const data = payload[0].payload
                    return `${data.fullDate} ${data.time}`
                  }
                  return label
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Legend />
              {referenceLines.map((refLine, index) => (
                <ReferenceLine
                  key={index}
                  y={refLine.y}
                  stroke={refLine.stroke}
                  strokeDasharray={refLine.strokeDasharray}
                  label={refLine.label}
                />
              ))}
              {lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth || 3}
                  name={line.name}
                  dot={{ r: 4, fill: line.stroke }}
                  activeDot={{ r: 6, stroke: line.stroke, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#666' }}
              />
              <YAxis 
                domain={yAxisDomain}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#666' }}
                label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    const data = payload[0].payload
                    return `${data.fullDate} ${data.time}`
                  }
                  return label
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Legend />
              {referenceLines.map((refLine, index) => (
                <ReferenceLine
                  key={index}
                  y={refLine.y}
                  stroke={refLine.stroke}
                  strokeDasharray={refLine.strokeDasharray}
                  label={refLine.label}
                />
              ))}
              {lines.map((line, index) => (
                <Bar
                  key={index}
                  dataKey={line.dataKey}
                  fill={line.stroke}
                  name={line.name}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}

export default BaseChart




