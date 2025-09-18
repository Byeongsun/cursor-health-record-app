// 대시보드 페이지 컴포넌트
import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  IconButton,
} from '@mui/material'
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchHealthRecords } from '../store/slices/healthRecordsSlice'
import { fetchGoals } from '../store/slices/goalsSlice'
import { fetchNotificationSettings } from '../store/slices/notificationSettingsSlice'
import { cleanDuplicateNotifications } from '../store/slices/notificationsSlice'
import { useNotificationScheduler } from '../hooks/useNotificationScheduler'
import { store } from '../store'
type RootState = ReturnType<typeof store.getState>
import UnifiedNavigation from '../components/UnifiedNavigation'
import HealthChartsDashboard from '../components/charts/HealthChartsDashboard'
import GoalSetting from '../components/GoalSetting'
import GoalProgress from '../components/GoalProgress'
import NotificationCenter from '../components/NotificationCenter'
import NotificationSettings from '../components/NotificationSettings'
import CSVImportDialog from '../components/CSVImportDialog'
import HealthRecordEditDialog from '../components/HealthRecordEditDialog'
import DataExportDialog from '../components/DataExportDialog'

const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // 상태 관리
  const [goalSettingOpen, setGoalSettingOpen] = useState(false)
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [dataExportOpen, setDataExportOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  
  // Redux에서 데이터 가져오기
  const { records, loading, error } = useSelector((state: RootState) => state.healthRecords)
  const { goals, loading: goalsLoading } = useSelector((state: RootState) => state.goals)
  const { unreadCount } = useSelector((state: RootState) => state.notifications)
  const { success: csvImportSuccess, importedRecords } = useSelector((state: RootState) => state.csvImport)

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
      dispatch(fetchGoals(user.id))
      dispatch(fetchNotificationSettings(user.id))
      // 중복 알림 정리
      dispatch(cleanDuplicateNotifications())
    }
  }, [dispatch, user?.id])

  // CSV 가져오기 성공 시 데이터 새로고침
  useEffect(() => {
    if (csvImportSuccess && importedRecords > 0 && user?.id) {
      console.log('대시보드: CSV 가져오기 성공 감지!', { importedRecords, csvImportSuccess })
      
      // 즉시 새로고침
      console.log('대시보드: 즉시 새로고침 시작...')
      dispatch(fetchHealthRecords(user.id))
      dispatch(fetchGoals(user.id))
      
      // 0.5초 후 첫 번째 추가 새로고침
      setTimeout(() => {
        console.log('대시보드: 0.5초 후 새로고침...')
        dispatch(fetchHealthRecords(user.id))
        dispatch(fetchGoals(user.id))
      }, 500)
      
      // 1.5초 후 두 번째 추가 새로고침
      setTimeout(() => {
        console.log('대시보드: 1.5초 후 새로고침...')
        dispatch(fetchHealthRecords(user.id))
        dispatch(fetchGoals(user.id))
      }, 1500)
      
      // 3초 후 최종 새로고침
      setTimeout(() => {
        console.log('대시보드: 3초 후 최종 새로고침...')
        dispatch(fetchHealthRecords(user.id))
        dispatch(fetchGoals(user.id))
      }, 3000)
    }
  }, [csvImportSuccess, importedRecords, dispatch, user?.id])

  // 알림 스케줄러 활성화
  useNotificationScheduler({ 
    userId: user?.id || '', 
    isEnabled: !!user?.id 
  })

  // records가 변경될 때마다 로그 출력 (디버깅용)
  useEffect(() => {
    console.log('건강 기록 업데이트:', records)
  }, [records])

  // 핸들러 함수들 (UnifiedNavigation에서 처리)

  const handleHealthRecord = (type: 'blood_pressure' | 'blood_sugar' | 'weight') => {
    navigate(`/record?type=${type}`)
  }

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record)
    setEditDialogOpen(true)
  }

  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setSelectedRecord(null)
  }

  const handleEditSuccess = () => {
    if (user?.id) {
      dispatch(fetchHealthRecords(user.id))
    }
  }


  // 최근 기록 필터링 함수들
  const getRecentBloodPressure = () => {
    return records
      .filter(record => record.record_type === 'blood_pressure')
      .sort((a, b) => new Date(b.measurement_time).getTime() - new Date(a.measurement_time).getTime())
      .slice(0, 3)
  }

  const getRecentBloodSugar = () => {
    return records
      .filter(record => record.record_type === 'blood_sugar')
      .sort((a, b) => new Date(b.measurement_time).getTime() - new Date(a.measurement_time).getTime())
      .slice(0, 3)
  }

  const getRecentWeight = () => {
    return records
      .filter(record => record.record_type === 'weight')
      .sort((a, b) => new Date(b.measurement_time).getTime() - new Date(a.measurement_time).getTime())
      .slice(0, 3)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 측정 시간과 입력 시간을 구분해서 표시하는 함수
  const formatTimeInfo = (record: any) => {
    const measurementTime = new Date(record.measurement_time)
    const inputTime = new Date(record.created_at)
    
    const measurementStr = measurementTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const inputStr = inputTime.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // 측정 시간과 입력 시간이 같은 날이면 시간만 표시
    const isSameDay = measurementTime.toDateString() === inputTime.toDateString()
    
    if (isSameDay) {
      const timeDiff = Math.abs(inputTime.getTime() - measurementTime.getTime()) / (1000 * 60) // 분 단위
      if (timeDiff < 5) {
        return `측정: ${measurementStr}`
      } else {
        return `측정: ${measurementStr} | 입력: ${inputStr}`
      }
    } else {
      return `측정: ${measurementStr} | 입력: ${inputStr}`
    }
  }

  // 건강 상태 위험도 감지 함수
  const getHealthRiskLevel = (record: any) => {
    if (record.record_type === 'blood_pressure') {
      const systolic = record.systolic_pressure
      const diastolic = record.diastolic_pressure
      
      if (systolic >= 180 || diastolic >= 110) return { level: 'danger', text: '매우 위험', color: '#d32f2f' }
      if (systolic >= 160 || diastolic >= 100) return { level: 'warning', text: '위험', color: '#f57c00' }
      if (systolic >= 140 || diastolic >= 90) return { level: 'caution', text: '주의', color: '#fbc02d' }
      if (systolic < 90 || diastolic < 60) return { level: 'caution', text: '저혈압', color: '#fbc02d' }
      return { level: 'normal', text: '정상', color: '#388e3c' }
    }
    
    if (record.record_type === 'blood_sugar') {
      const sugar = record.blood_sugar
      
      if (record.blood_sugar_type === 'fasting') {
        if (sugar >= 126) return { level: 'danger', text: '매우 위험', color: '#d32f2f' }
        if (sugar >= 100) return { level: 'warning', text: '위험', color: '#f57c00' }
        if (sugar < 70) return { level: 'caution', text: '저혈당', color: '#fbc02d' }
        return { level: 'normal', text: '정상', color: '#388e3c' }
      } else {
        if (sugar >= 200) return { level: 'danger', text: '매우 위험', color: '#d32f2f' }
        if (sugar >= 140) return { level: 'warning', text: '위험', color: '#f57c00' }
        if (sugar < 80) return { level: 'caution', text: '저혈당', color: '#fbc02d' }
        return { level: 'normal', text: '정상', color: '#388e3c' }
      }
    }
    
    if (record.record_type === 'weight') {
      const weight = record.weight
      // BMI 계산을 위한 키는 평균값 사용 (실제로는 사용자 프로필에서 가져와야 함)
      const height = 1.7 // 평균 키 170cm
      const bmi = weight / (height * height)
      
      if (bmi >= 35) return { level: 'danger', text: '매우 위험', color: '#d32f2f' }
      if (bmi >= 30) return { level: 'warning', text: '위험', color: '#f57c00' }
      if (bmi >= 25) return { level: 'caution', text: '주의', color: '#fbc02d' }
      if (bmi < 18.5) return { level: 'caution', text: '저체중', color: '#fbc02d' }
      return { level: 'normal', text: '정상', color: '#388e3c' }
    }
    
    return { level: 'normal', text: '정상', color: '#388e3c' }
  }

  // 최근 위험 수치 감지
  const getRecentRiskRecords = () => {
    const recentRecords = records.slice(0, 10) // 최근 10개 기록
    return recentRecords.filter(record => {
      const risk = getHealthRiskLevel(record)
      return risk.level === 'danger' || risk.level === 'warning'
    })
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        onGoalSetting={() => setGoalSettingOpen(true)}
        onNotificationCenter={() => setNotificationCenterOpen(true)}
        onNotificationSettings={() => setNotificationSettingsOpen(true)}
        onCsvImport={() => setCsvImportOpen(true)}
        onDataExport={() => setDataExportOpen(true)}
        onHealthRecord={handleHealthRecord}
        onEditRecord={handleEditRecord}
      />

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {/* 환영 메시지 및 오늘의 건강 상태 요약 */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          p: 3,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px solid #e9ecef'
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
            안녕하세요, {profile?.name || user?.email}님! 👋
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            오늘의 건강 상태를 확인해보세요
          </Typography>
        </Box>

        {/* 오늘의 건강 상태 요약 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3} component="div">
            <Card sx={{ 
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: 2,
              textAlign: 'center',
              p: 2
            }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                📊
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#856404', mb: 1 }}>
                오늘 기록
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#856404' }}>
                {records.filter(record => {
                  const today = new Date()
                  const recordDate = new Date(record.measurement_time)
                  return recordDate.toDateString() === today.toDateString()
                }).length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#856404' }}>
                건의 측정
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} component="div">
            <Card sx={{ 
              backgroundColor: '#d1ecf1',
              border: '2px solid #17a2b8',
              borderRadius: 2,
              textAlign: 'center',
              p: 2
            }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                🎯
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0c5460', mb: 1 }}>
                활성 목표
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0c5460' }}>
                {goals.filter(goal => !goal.is_achieved).length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#0c5460' }}>
                개의 목표
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} component="div">
            <Card sx={{ 
              backgroundColor: '#d4edda',
              border: '2px solid #28a745',
              borderRadius: 2,
              textAlign: 'center',
              p: 2
            }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                ✅
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#155724', mb: 1 }}>
                완료된 목표
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#155724' }}>
                {goals.filter(goal => goal.is_achieved).length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#155724' }}>
                개 달성
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} component="div">
            <Card sx={{ 
              backgroundColor: '#f8d7da',
              border: '2px solid #dc3545',
              borderRadius: 2,
              textAlign: 'center',
              p: 2
            }}>
              <Typography variant="h2" sx={{ mb: 1 }}>
                🔔
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#721c24', mb: 1 }}>
                새 알림
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#721c24' }}>
                {unreadCount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#721c24' }}>
                개의 알림
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* 빠른 액션 버튼들 */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          📊 건강 수치 기록하기
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={4} component="div">
            <Card sx={{ 
              height: '100%',
              backgroundColor: '#fff',
              border: '2px solid #e74c3c',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(231, 76, 60, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.2)',
                border: '2px solid #c0392b',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
                    ❤️
                  </Typography>
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, color: '#e74c3c' }}>
                  혈압 측정
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
                  수축기/이완기 혈압과<br />맥박을 기록하세요
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  size="large"
                  onClick={() => handleHealthRecord('blood_pressure')}
                  sx={{
                    backgroundColor: '#e74c3c',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#c0392b',
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  기록하기
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} component="div">
            <Card sx={{ 
              height: '100%',
              backgroundColor: '#fff',
              border: '2px solid #3498db',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(52, 152, 219, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(52, 152, 219, 0.2)',
                border: '2px solid #2980b9',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
                    🩸
                  </Typography>
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, color: '#3498db' }}>
                  혈당 측정
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
                  공복/식후 혈당을<br />기록하세요
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  size="large"
                  onClick={() => handleHealthRecord('blood_sugar')}
                  sx={{
                    backgroundColor: '#3498db',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#2980b9',
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  기록하기
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} component="div">
            <Card sx={{ 
              height: '100%',
              backgroundColor: '#fff',
              border: '2px solid #27ae60',
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(39, 174, 96, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(39, 174, 96, 0.2)',
                border: '2px solid #229954',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
                    ⚖️
                  </Typography>
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, color: '#27ae60' }}>
                  체중 측정
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6 }}>
                  체중과 BMI를<br />기록하세요
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  size="large"
                  onClick={() => handleHealthRecord('weight')}
                  sx={{
                    backgroundColor: '#27ae60',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#229954',
                      transform: 'scale(1.02)',
                    }
                  }}
                >
                  기록하기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 최근 기록 요약 */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
          📈 최근 건강 기록
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} component="div">
            <Card sx={{ 
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ mr: 2, fontSize: '2.5rem' }}>
                      ❤️
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                      최근 혈압 기록
                    </Typography>
                  </Box>
                </Box>
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      기록을 불러오는 중...
                    </Typography>
                  </Box>
                ) : getRecentBloodPressure().length > 0 ? (
                  <Box>
                    {getRecentBloodPressure().map((record) => (
                      <Box key={record.id} sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: 'rgba(255,255,255,0.8)', 
                        borderRadius: 2,
                        border: '1px solid rgba(255,107,107,0.3)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                              {record.systolic_pressure}/{record.diastolic_pressure} mmHg
                            </Typography>
                            {(() => {
                              const risk = getHealthRiskLevel(record)
                              if (risk.level !== 'normal') {
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="body2" sx={{ 
                                      color: risk.color, 
                                      fontWeight: 600,
                                      backgroundColor: `${risk.color}20`,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      border: `1px solid ${risk.color}`
                                    }}>
                                      {risk.level === 'danger' ? '🚨' : risk.level === 'warning' ? '⚠️' : '⚡'} {risk.text}
                                    </Typography>
                                  </Box>
                                )
                              }
                              return null
                            })()}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'right' }}>
                              {formatTimeInfo(record)}
                            </Typography>
                            <IconButton
                              onClick={() => handleEditRecord(record)}
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {record.heart_rate && (
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            💓 맥박: {record.heart_rate} bpm
                          </Typography>
                        )}
                        {record.notes && (
                          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic', p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                            📝 {record.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      아직 기록이 없습니다
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      첫 번째 측정을 시작해보세요!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} component="div">
            <Card sx={{ 
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ mr: 2, fontSize: '2.5rem' }}>
                      🩸
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      최근 혈당 기록
                    </Typography>
                  </Box>
                </Box>
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      기록을 불러오는 중...
                    </Typography>
                  </Box>
                ) : getRecentBloodSugar().length > 0 ? (
                  <Box>
                    {getRecentBloodSugar().map((record) => (
                      <Box key={record.id} sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: 'rgba(255,255,255,0.8)', 
                        borderRadius: 2,
                        border: '1px solid rgba(78,205,196,0.3)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                              {record.blood_sugar} mg/dL
                            </Typography>
                            {(() => {
                              const risk = getHealthRiskLevel(record)
                              if (risk.level !== 'normal') {
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="body2" sx={{ 
                                      color: risk.color, 
                                      fontWeight: 600,
                                      backgroundColor: `${risk.color}20`,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      border: `1px solid ${risk.color}`
                                    }}>
                                      {risk.level === 'danger' ? '🚨' : risk.level === 'warning' ? '⚠️' : '⚡'} {risk.text}
                                    </Typography>
                                  </Box>
                                )
                              }
                              return null
                            })()}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'right' }}>
                              {formatTimeInfo(record)}
                            </Typography>
                            <IconButton
                              onClick={() => handleEditRecord(record)}
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          {record.blood_sugar_type === 'fasting' ? '🍽️ 공복 혈당' : '🍎 식후 혈당'}
                        </Typography>
                        {record.notes && (
                          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic', p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                            📝 {record.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      아직 기록이 없습니다
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      첫 번째 측정을 시작해보세요!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 체중 기록도 추가 */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6} component="div">
            <Card sx={{ 
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ mr: 2, fontSize: '2.5rem' }}>
                      ⚖️
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                      최근 체중 기록
                    </Typography>
                  </Box>
                </Box>
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      기록을 불러오는 중...
                    </Typography>
                  </Box>
                ) : getRecentWeight().length > 0 ? (
                  <Box>
                    {getRecentWeight().map((record) => (
                      <Box key={record.id} sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: 'rgba(255,255,255,0.8)', 
                        borderRadius: 2,
                        border: '1px solid rgba(69,183,209,0.3)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                              {record.weight} kg
                            </Typography>
                            {(() => {
                              const risk = getHealthRiskLevel(record)
                              if (risk.level !== 'normal') {
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="body2" sx={{ 
                                      color: risk.color, 
                                      fontWeight: 600,
                                      backgroundColor: `${risk.color}20`,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      border: `1px solid ${risk.color}`
                                    }}>
                                      {risk.level === 'danger' ? '🚨' : risk.level === 'warning' ? '⚠️' : '⚡'} {risk.text}
                                    </Typography>
                                  </Box>
                                )
                              }
                              return null
                            })()}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'right' }}>
                              {formatTimeInfo(record)}
                            </Typography>
                            <IconButton
                              onClick={() => handleEditRecord(record)}
                              size="small"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {record.notes && (
                          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic', p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                            📝 {record.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      아직 기록이 없습니다
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      첫 번째 측정을 시작해보세요!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 위험 수치 알림 섹션 */}
        {getRecentRiskRecords().length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: '#d32f2f' }}>
              ⚠️ 주의가 필요한 건강 수치
            </Typography>
            <Card sx={{ 
              backgroundColor: '#ffebee',
              border: '2px solid #d32f2f',
              borderRadius: 2
            }}>
              <CardContent>
                {getRecentRiskRecords().map((record) => {
                  const risk = getHealthRiskLevel(record)
                  return (
                    <Box key={record.id} sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: 'white', 
                      borderRadius: 2,
                      border: `2px solid ${risk.color}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: risk.color, mb: 1 }}>
                            {record.record_type === 'blood_pressure' ? '❤️ 혈압' : '🩸 혈당'} - {risk.text}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: risk.color }}>
                            {record.record_type === 'blood_pressure' 
                              ? `${record.systolic_pressure}/${record.diastolic_pressure} mmHg`
                              : `${record.blood_sugar} mg/dL (${record.blood_sugar_type === 'fasting' ? '공복' : '식후'})`
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {formatTimeInfo(record)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" sx={{ color: risk.color }}>
                            {risk.level === 'danger' ? '🚨' : '⚠️'}
                          </Typography>
                        </Box>
                      </Box>
                      {risk.level === 'danger' && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffcdd2', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                            💡 즉시 의료진과 상담하시기 바랍니다.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 목표 진행률 섹션 */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
            🎯 목표 진행률
          </Typography>
          {goals.length > 0 ? (
            <GoalProgress 
              goals={goals} 
              onEditGoal={(goal) => {
                // 목표 수정 기능 (추후 구현)
                console.log('목표 수정:', goal)
              }}
            />
          ) : (
            <Card sx={{ 
              backgroundColor: '#f8f9fa',
              border: '2px dashed #dee2e6',
              borderRadius: 2,
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h3" sx={{ mb: 2 }}>
                🎯
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                아직 설정된 목표가 없습니다
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                건강 목표를 설정하여 더 체계적으로 건강을 관리해보세요
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => setGoalSettingOpen(true)}
                sx={{
                  backgroundColor: '#1976d2',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    transform: 'scale(1.02)',
                  }
                }}
              >
                목표 설정하기
              </Button>
            </Card>
          )}
        </Box>

        {/* 건강 데이터 차트 섹션 */}
        {records.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
              📊 건강 데이터 분석
            </Typography>
            <HealthChartsDashboard data={records} />
          </Box>
        )}


        {/* 목표 설정 다이얼로그 */}
        {user && (
          <GoalSetting
            open={goalSettingOpen}
            onClose={() => setGoalSettingOpen(false)}
            userId={user.id}
          />
        )}

        {/* 알림 센터 */}
        <NotificationCenter
          open={notificationCenterOpen}
          onClose={() => setNotificationCenterOpen(false)}
        />

        {/* 알림 설정 */}
        {user && (
          <NotificationSettings
            open={notificationSettingsOpen}
            onClose={() => setNotificationSettingsOpen(false)}
            userId={user.id}
          />
        )}

        {/* CSV 가져오기 */}
        {user && (
          <CSVImportDialog
            open={csvImportOpen}
            onClose={() => setCsvImportOpen(false)}
            userId={user.id}
          />
        )}

        {/* 건강 기록 수정 */}
        <HealthRecordEditDialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          record={selectedRecord}
          onSuccess={handleEditSuccess}
        />

        {/* 데이터 내보내기 */}
        <DataExportDialog
          open={dataExportOpen}
          onClose={() => setDataExportOpen(false)}
          records={records}
          userName={profile?.name || user?.email || '사용자'}
        />

      </Container>
    </Box>
  )
}

export default DashboardPage
