// 목표 설정 컴포넌트
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Grid,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ko } from 'date-fns/locale'
import { useDispatch } from 'react-redux'
import { createGoal } from '../store/slices/goalsSlice'
import type { AppDispatch } from '../store'
import type { GoalInput } from '../store/slices/goalsSlice'

interface GoalSettingProps {
  open: boolean
  onClose: () => void
  userId: string
}

const GoalSetting: React.FC<GoalSettingProps> = ({ open, onClose, userId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState<GoalInput>({
    goal_type: 'blood_pressure',
    target_value: 0,
    unit: 'mmHg',
    target_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goalTypes = [
    { value: 'blood_pressure', label: '혈압', unit: 'mmHg', description: '목표 혈압 수치' },
    { value: 'blood_sugar', label: '혈당', unit: 'mg/dL', description: '목표 혈당 수치' },
    { value: 'weight', label: '체중', unit: 'kg', description: '목표 체중' },
    { value: 'exercise', label: '운동', unit: '분/일', description: '일일 운동 시간' },
    { value: 'medication', label: '약물 복용', unit: '회/일', description: '일일 약물 복용 횟수' },
  ]

  const handleInputChange = (field: keyof GoalInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // 목표 유형이 변경되면 단위도 업데이트
    if (field === 'goal_type') {
      const selectedType = goalTypes.find(type => type.value === value)
      if (selectedType) {
        setFormData(prev => ({
          ...prev,
          goal_type: value,
          unit: selectedType.unit,
        }))
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.target_value || formData.target_value <= 0) {
      setError('목표 수치를 올바르게 입력해주세요.')
      return
    }

    if (!formData.target_date) {
      setError('목표 날짜를 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log('목표 생성 시도:', { userId, goalData: formData })
      await dispatch(createGoal({ userId, goalData: formData })).unwrap()
      console.log('목표 생성 성공')
      onClose()
      setFormData({
        goal_type: 'blood_pressure',
        target_value: 0,
        unit: 'mmHg',
        target_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
    } catch (error: any) {
      console.error('목표 생성 에러:', error)
      setError(error.message || '목표 생성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedGoalType = goalTypes.find(type => type.value === formData.goal_type)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
            🎯 건강 목표 설정
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="large">
                <InputLabel>목표 유형</InputLabel>
                <Select
                  value={formData.goal_type}
                  onChange={(e) => handleInputChange('goal_type', e.target.value)}
                  label="목표 유형"
                >
                  {goalTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="목표 수치"
                type="number"
                value={formData.target_value || ''}
                onChange={(e) => handleInputChange('target_value', parseFloat(e.target.value) || 0)}
                size="large"
                inputProps={{ min: 0, step: 0.1 }}
                helperText={`단위: ${formData.unit}`}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="목표 날짜"
                value={new Date(formData.target_date)}
                onChange={(date) => handleInputChange('target_date', date?.toISOString().split('T')[0] || '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'large',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="현재 수치 (선택사항)"
                type="number"
                value={formData.current_value || ''}
                onChange={(e) => handleInputChange('current_value', parseFloat(e.target.value) || undefined)}
                size="large"
                inputProps={{ min: 0, step: 0.1 }}
                helperText="현재 상태를 입력하면 진행률을 확인할 수 있습니다"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="메모 (선택사항)"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                size="large"
                placeholder="목표에 대한 추가 정보나 동기부여 메시지를 입력해주세요"
              />
            </Grid>
          </Grid>

          {selectedGoalType && (
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                📋 목표 정보
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>목표 유형:</strong> {selectedGoalType.label}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>목표 수치:</strong> {formData.target_value} {formData.unit}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>목표 날짜:</strong> {new Date(formData.target_date).toLocaleDateString('ko-KR')}
              </Typography>
              {formData.current_value && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>현재 수치:</strong> {formData.current_value} {formData.unit}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={onClose}
            size="large"
            sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              py: 1.5,
              px: 4
            }}
          >
            {isSubmitting ? '생성 중...' : '목표 생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default GoalSetting

