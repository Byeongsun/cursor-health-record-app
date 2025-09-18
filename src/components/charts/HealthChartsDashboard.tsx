// 건강 차트 대시보드 컴포넌트 (어르신 친화적 디자인)
import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import BloodPressureChart from './BloodPressureChart'
import BloodSugarChart from './BloodSugarChart'
import WeightChart from './WeightChart'
import type { HealthRecord } from '../../store/slices/healthRecordsSlice'

interface HealthChartsDashboardProps {
  data: HealthRecord[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

// 탭 패널 컴포넌트
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

// 건강 지표 요약 카드 컴포넌트
const HealthSummaryCard: React.FC<{ 
  title: string
  value: string
  unit: string
  trend?: 'up' | 'down' | 'stable'
  color: string
  icon: React.ReactNode
}> = ({ title, value, unit, trend, color, icon }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUpIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
      case 'down': return <TrendingUpIcon sx={{ color: '#27ae60', fontSize: 20, transform: 'rotate(180deg)' }} />
      default: return null
    }
  }

  return (
    <Card sx={{ height: '100%', border: `2px solid ${color}20` }}>
      <CardContent sx={{ textAlign: 'center', p: 2 }}>
        <Box sx={{ color, mb: 1 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {unit}
          </Typography>
          {getTrendIcon()}
        </Box>
        {trend && (
          <Chip 
            label={trend === 'up' ? '증가' : trend === 'down' ? '감소' : '유지'} 
            size="small"
            sx={{ 
              backgroundColor: trend === 'up' ? '#e74c3c' : 
                             trend === 'down' ? '#27ae60' : '#666',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

const HealthChartsDashboard: React.FC<HealthChartsDashboardProps> = ({ data }) => {
  const [tabValue, setTabValue] = useState(0)
  const [fullscreenChart, setFullscreenChart] = useState<{
    open: boolean
    type: 'blood_pressure' | 'blood_sugar' | 'weight'
  }>({ open: false, type: 'blood_pressure' })

  // 건강 지표 통계 계산을 useMemo로 최적화
  const stats = useMemo(() => {
    console.log('HealthChartsDashboard: 통계 계산 중...', data.length)
    
    const bloodPressureRecords = data.filter(record => record.record_type === 'blood_pressure')
    const bloodSugarRecords = data.filter(record => record.record_type === 'blood_sugar')
    const weightRecords = data.filter(record => record.record_type === 'weight')

    // 최근 7일간의 데이터
    const recentBloodPressure = bloodPressureRecords.slice(-7)
    const recentBloodSugar = bloodSugarRecords.slice(-7)
    const recentWeight = weightRecords.slice(-7)

    // 평균 계산
    const avgSystolic = recentBloodPressure.length > 0 
      ? Math.round(recentBloodPressure.reduce((sum, r) => sum + (r.systolic_pressure || 0), 0) / recentBloodPressure.length)
      : 0
    const avgDiastolic = recentBloodPressure.length > 0 
      ? Math.round(recentBloodPressure.reduce((sum, r) => sum + (r.diastolic_pressure || 0), 0) / recentBloodPressure.length)
      : 0
    const avgBloodSugar = recentBloodSugar.length > 0 
      ? Math.round(recentBloodSugar.reduce((sum, r) => sum + (r.blood_sugar || 0), 0) / recentBloodSugar.length)
      : 0
    const avgWeight = recentWeight.length > 0 
      ? (recentWeight.reduce((sum, r) => sum + (r.weight || 0), 0) / recentWeight.length).toFixed(1)
      : '0'

    // 체중 변화 계산
    const weightChange = recentWeight.length > 1 
      ? recentWeight[recentWeight.length - 1].weight! - recentWeight[0].weight!
      : 0

    return {
      bloodPressure: {
        systolic: avgSystolic,
        diastolic: avgDiastolic,
        count: recentBloodPressure.length
      },
      bloodSugar: {
        average: avgBloodSugar,
        count: recentBloodSugar.length
      },
      weight: {
        average: avgWeight,
        change: weightChange,
        trend: weightChange > 0.5 ? 'up' : weightChange < -0.5 ? 'down' : 'stable' as const,
        count: recentWeight.length
      }
    }
  }, [data])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleFullscreen = (type: 'blood_pressure' | 'blood_sugar' | 'weight') => {
    setFullscreenChart({ open: true, type })
  }

  const handleCloseFullscreen = () => {
    setFullscreenChart({ open: false, type: 'blood_pressure' })
  }

  const renderFullscreenChart = () => {
    switch (fullscreenChart.type) {
      case 'blood_pressure':
        return <BloodPressureChart data={data} height={500} />
      case 'blood_sugar':
        return <BloodSugarChart data={data} height={500} />
      case 'weight':
        return <WeightChart data={data} height={500} />
      default:
        return null
    }
  }

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 32, color: '#1976d2', mr: 2 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            건강 데이터 분석
          </Typography>
          <Typography variant="body1" color="text.secondary">
            건강 수치의 변화를 차트로 확인해보세요
          </Typography>
        </Box>
      </Box>

      {/* 건강 지표 요약 카드들 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <HealthSummaryCard
            title="평균 혈압"
            value={`${stats.bloodPressure.systolic}/${stats.bloodPressure.diastolic}`}
            unit="mmHg"
            color="#e74c3c"
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthSummaryCard
            title="평균 혈당"
            value={stats.bloodSugar.average.toString()}
            unit="mg/dL"
            color="#3498db"
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthSummaryCard
            title="평균 체중"
            value={stats.weight.average}
            unit="kg"
            trend={stats.weight.trend}
            color="#27ae60"
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HealthSummaryCard
            title="총 기록 수"
            value={(stats.bloodPressure.count + stats.bloodSugar.count + stats.weight.count).toString()}
            unit="개"
            color="#9b59b6"
            icon={<BarChartIcon sx={{ fontSize: 32 }} />}
          />
        </Grid>
      </Grid>

      {/* 차트 탭 */}
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 'bold',
                py: 2
              }
            }}
          >
            <Tab 
              label="혈압 차트" 
              id="chart-tab-0"
              aria-controls="chart-tabpanel-0"
            />
            <Tab 
              label="혈당 차트" 
              id="chart-tab-1"
              aria-controls="chart-tabpanel-1"
            />
            <Tab 
              label="체중 차트" 
              id="chart-tab-2"
              aria-controls="chart-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ position: 'relative' }}>
            <BloodPressureChart data={data} height={400} />
            <IconButton
              onClick={() => handleFullscreen('blood_pressure')}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ position: 'relative' }}>
            <BloodSugarChart data={data} height={400} />
            <IconButton
              onClick={() => handleFullscreen('blood_sugar')}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ position: 'relative' }}>
            <WeightChart data={data} height={400} />
            <IconButton
              onClick={() => handleFullscreen('weight')}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Box>
        </TabPanel>
      </Paper>

      {/* 전체화면 차트 다이얼로그 */}
      <Dialog
        open={fullscreenChart.open}
        onClose={handleCloseFullscreen}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {fullscreenChart.type === 'blood_pressure' && '혈압 차트'}
            {fullscreenChart.type === 'blood_sugar' && '혈당 차트'}
            {fullscreenChart.type === 'weight' && '체중 차트'}
          </Typography>
          <IconButton onClick={handleCloseFullscreen}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {renderFullscreenChart()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFullscreen} variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HealthChartsDashboard

