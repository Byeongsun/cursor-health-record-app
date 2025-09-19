// 건강 기록 페이지 컴포넌트 (어르신 친화적 디자인)
import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material'
import {
  Favorite as BloodPressureIcon,
  Bloodtype as BloodSugarIcon,
  MonitorWeight as WeightIcon,
  AccessTime as TimeIcon,
  Save as SaveIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import UnifiedNavigation from '../components/UnifiedNavigation'
import { addHealthRecord } from '../store/slices/healthRecordsSlice'
import type { AppDispatch } from '../store'

type RecordType = 'blood_pressure' | 'blood_sugar' | 'weight'

interface HealthRecordData {
  recordType: RecordType
  systolicPressure?: number
  diastolicPressure?: number
  heartRate?: number
  bloodSugar?: number
  bloodSugarType?: 'fasting' | 'post_meal'
  weight?: number
  measurementTime: string
  notes: string
}

const HealthRecordPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  
  // URL 파라미터에서 측정 유형 가져오기
  const typeFromUrl = searchParams.get('type') as RecordType | null
  
  const [selectedType, setSelectedType] = useState<RecordType | null>(typeFromUrl)
  const [formData, setFormData] = useState<HealthRecordData>({
    recordType: typeFromUrl || 'blood_pressure',
    measurementTime: new Date().toISOString().slice(0, 16), // 현재 시간
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: keyof HealthRecordData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
      return
    }

    if (!selectedType) {
      setSubmitError('측정 유형을 선택해주세요.')
      return
    }

    // 필수 입력값 검증
    if (selectedType === 'blood_pressure') {
      if (!formData.systolicPressure || !formData.diastolicPressure) {
        setSubmitError('수축기와 이완기 혈압을 모두 입력해주세요.')
        return
      }
    } else if (selectedType === 'blood_sugar') {
      if (!formData.bloodSugar || !formData.bloodSugarType) {
        setSubmitError('혈당 수치와 측정 유형을 모두 입력해주세요.')
        return
      }
    } else if (selectedType === 'weight') {
      if (!formData.weight) {
        setSubmitError('체중을 입력해주세요.')
        return
      }
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // 폼 데이터를 Supabase 형식으로 변환
      const recordData = {
        user_id: user.id,
        record_type: selectedType,
        systolic_pressure: formData.systolicPressure || null,
        diastolic_pressure: formData.diastolicPressure || null,
        heart_rate: formData.heartRate || null,
        blood_sugar: formData.bloodSugar || null,
        blood_sugar_type: formData.bloodSugarType || null,
        weight: formData.weight || null,
        measurement_time: formData.measurementTime,
        notes: formData.notes || null,
      }

      console.log('저장할 데이터:', recordData)

      // Redux를 통해 Supabase에 저장
      const result = await dispatch(addHealthRecord(recordData)).unwrap()
      console.log('저장 성공:', result)
      
      // 성공 처리
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        navigate('/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('저장 실패 상세:', error)
      setSubmitError(error.message || '건강 기록 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecordTypeInfo = (type: RecordType) => {
    switch (type) {
      case 'blood_pressure':
        return {
          title: '혈압 측정',
          icon: <BloodPressureIcon sx={{ fontSize: 40 }} />,
          color: '#e74c3c',
          description: '수축기와 이완기 혈압을 입력해주세요',
        }
      case 'blood_sugar':
        return {
          title: '혈당 측정',
          icon: <BloodSugarIcon sx={{ fontSize: 40 }} />,
          color: '#3498db',
          description: '공복 또는 식후 혈당을 입력해주세요',
        }
      case 'weight':
        return {
          title: '체중 측정',
          icon: <WeightIcon sx={{ fontSize: 40 }} />,
          color: '#27ae60',
          description: '현재 체중을 입력해주세요',
        }
    }
  }

  const renderFormFields = () => {
    const info = getRecordTypeInfo(selectedType)

    switch (selectedType) {
      case 'blood_pressure':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: info.color }}>
              {info.icon} {info.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {info.description}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="수축기 혈압"
                  type="number"
                  value={formData.systolicPressure || ''}
                  onChange={(e) => handleInputChange('systolicPressure', parseInt(e.target.value) || null)}
                  placeholder="예: 120"
                  size="medium"
                  sx={{ fontSize: '1.2rem' }}
                  inputProps={{ 
                    style: { fontSize: '1.2rem' },
                    min: 50,
                    max: 300
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  mmHg
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="이완기 혈압"
                  type="number"
                  value={formData.diastolicPressure || ''}
                  onChange={(e) => handleInputChange('diastolicPressure', parseInt(e.target.value) || null)}
                  placeholder="예: 80"
                  size="medium"
                  sx={{ fontSize: '1.2rem' }}
                  inputProps={{ 
                    style: { fontSize: '1.2rem' },
                    min: 30,
                    max: 200
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  mmHg
                </Typography>
              </Grid>
            </Grid>

            {/* 맥박 입력 필드 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💓 맥박 (선택사항)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="맥박"
                    type="number"
                    value={formData.heartRate || ''}
                    onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value) || null)}
                    placeholder="예: 72"
                    size="medium"
                    sx={{ fontSize: '1.2rem' }}
                    inputProps={{ 
                      style: { fontSize: '1.2rem' },
                      min: 30,
                      max: 200
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    bpm (분당 심박수)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )

      case 'blood_sugar':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: info.color }}>
              {info.icon} {info.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {info.description}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel>측정 유형</InputLabel>
                  <Select
                    value={formData.bloodSugarType || ''}
                    onChange={(e) => handleInputChange('bloodSugarType', e.target.value)}
                    label="측정 유형"
                    sx={{ fontSize: '1.2rem' }}
                  >
                    <MenuItem value="fasting">공복 혈당</MenuItem>
                    <MenuItem value="post_meal">식후 혈당</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="혈당 수치"
                  type="number"
                  value={formData.bloodSugar || ''}
                  onChange={(e) => handleInputChange('bloodSugar', parseInt(e.target.value) || null)}
                  placeholder="예: 100"
                  size="medium"
                  sx={{ fontSize: '1.2rem' }}
                  inputProps={{ 
                    style: { fontSize: '1.2rem' },
                    min: 50,
                    max: 500
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  mg/dL
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )

      case 'weight':
        return (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: info.color }}>
              {info.icon} {info.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {info.description}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="체중"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
                  placeholder="예: 65.5"
                  size="medium"
                  sx={{ fontSize: '1.2rem' }}
                  inputProps={{ 
                    style: { fontSize: '1.2rem' },
                    min: 20,
                    max: 300,
                    step: 0.1
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  kg
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        onGoalSetting={() => {/* TODO: 목표 설정 구현 */}}
        onNotificationCenter={() => {/* TODO: 알림 센터 구현 */}}
        onNotificationSettings={() => {/* TODO: 알림 설정 구현 */}}
        onCsvImport={() => {/* TODO: CSV 가져오기 구현 */}}
        onDataExport={() => {/* TODO: 데이터 내보내기 구현 */}}
        onHealthRecord={(type) => navigate(`/record?type=${type}`)}
        onBulkDelete={() => {/* TODO: 다중 삭제 구현 */}}
        onEditRecord={() => {/* TODO: 편집 구현 */}}
      />

      <Container 
        maxWidth="md" 
        sx={{ 
          mt: { xs: 2, sm: 4 }, 
          mb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 }
        }}
      >
        {/* 페이지 제목 */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'text.primary', textAlign: 'center' }}>
          건강 기록 입력
        </Typography>
        
        {/* 성공 메시지 */}
        {submitSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<SuccessIcon />}
          >
            건강 기록이 성공적으로 저장되었습니다!
          </Alert>
        )}

        {/* 에러 메시지 */}
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
          >
            {submitError}
          </Alert>
        )}

        <Paper elevation={6} sx={{ 
          p: 6, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '2px solid rgba(102, 126, 234, 0.2)'
        }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontSize: '4rem', mb: 2 }}>
              📊
            </Typography>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              건강 수치 기록하기
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              측정하신 건강 수치를 입력해주세요
            </Typography>
          </Box>

          {/* 측정 유형 선택 - 선택하지 않은 경우에만 표시 */}
          {!selectedType && (
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
                측정 유형을 선택해주세요
              </Typography>
              <Grid container spacing={4}>
                {(['blood_pressure', 'blood_sugar', 'weight'] as RecordType[]).map((type) => {
                  const info = getRecordTypeInfo(type)
                  return (
                    <Grid item xs={12} sm={4} key={type}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: '3px solid transparent',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          '&:hover': {
                            border: `3px solid ${info.color}`,
                            backgroundColor: `${info.color}10`,
                            transform: 'translateY(-8px)',
                            boxShadow: `0 8px 30px ${info.color}40`,
                          }
                        }}
                        onClick={() => {
                          setSelectedType(type)
                          handleInputChange('recordType', type)
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                          <Box sx={{ color: info.color, mb: 2 }}>
                            {info.icon}
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                            {info.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {info.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}

          {/* 선택된 측정 유형이 있을 때만 표시 */}
          {selectedType && (
            <>
              <Divider sx={{ my: 3 }} />
              
              {/* 선택된 측정 유형 표시 및 변경 버튼 */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {(() => {
                    const info = getRecordTypeInfo(selectedType)
                    return (
                      <>
                        <Box sx={{ color: info.color }}>
                          {info.icon}
                        </Box>
                        <Typography variant="h5" sx={{ color: info.color, fontWeight: 'bold' }}>
                          {info.title}
                        </Typography>
                      </>
                    )
                  })()}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedType(null)
                    setFormData({
                      recordType: 'blood_pressure',
                      measurementTime: new Date().toISOString().slice(0, 16),
                      notes: '',
                    })
                  }}
                >
                  다른 측정 선택
                </Button>
              </Box>
            </>
          )}

          {/* 선택된 측정 유형이 있을 때만 표시 */}
          {selectedType && (
            <>
              {/* 측정 시간 */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2, border: '2px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, color: 'primary.main' }}>
                  <TimeIcon /> 📅 측정 시간 설정
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  실제로 건강 수치를 측정한 시간을 입력해주세요. 
                  <br />
                  <strong>측정 시간</strong>: 실제 측정한 시간 | <strong>입력 시간</strong>: 지금 데이터를 입력하는 시간
                </Typography>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="측정한 날짜와 시간"
                  value={formData.measurementTime}
                  onChange={(e) => handleInputChange('measurementTime', e.target.value)}
                  size="medium"
                  sx={{ 
                    fontSize: '1.2rem',
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 600
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1.2rem',
                      fontWeight: 500
                    }
                  }}
                  helperText="예: 오늘 아침 8시에 측정했다면 해당 시간을 선택하세요"
                />
              </Box>

              {/* 측정 유형별 입력 폼 */}
              {renderFormFields()}

              {/* 메모 입력 */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  메모 (선택사항)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="특이사항이나 기억할 점이 있으면 입력해주세요"
                  size="medium"
                />
              </Box>

              {/* 저장 버튼 */}
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{ 
                    py: 3, 
                    px: 8,
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    minHeight: 64,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {isSubmitting ? '저장 중...' : '건강 기록 저장하기'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  )
}

export default HealthRecordPage

