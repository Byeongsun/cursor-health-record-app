import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider
} from '@mui/material'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import { updateHealthRecord, deleteHealthRecord } from '../store/slices/healthRecordsSlice'
import type { HealthRecord } from '../store/slices/healthRecordsSlice'

interface HealthRecordEditDialogProps {
  open: boolean
  onClose: () => void
  record: HealthRecord | null
  onSuccess?: () => void
}

const HealthRecordEditDialog: React.FC<HealthRecordEditDialogProps> = ({
  open,
  onClose,
  record,
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<HealthRecord>>({})

  // 기록이 변경될 때마다 폼 데이터 초기화
  useEffect(() => {
    if (record) {
      setFormData({
        record_type: record.record_type,
        systolic_pressure: record.systolic_pressure || '',
        diastolic_pressure: record.diastolic_pressure || '',
        heart_rate: record.heart_rate || '',
        blood_sugar: record.blood_sugar || '',
        blood_sugar_type: record.blood_sugar_type || 'fasting',
        weight: record.weight || '',
        temperature: record.temperature || '',
        measurement_time: record.measurement_time ? 
          new Date(record.measurement_time).toISOString().slice(0, 16) : '',
        notes: record.notes || ''
      })
      setError(null)
    }
  }, [record])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!record) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 데이터 검증
      const updates: Partial<HealthRecord> = {
        record_type: formData.record_type,
        measurement_time: formData.measurement_time ? 
          new Date(formData.measurement_time).toISOString() : record.measurement_time,
        notes: formData.notes
      }

      // 측정 유형별 데이터 추가
      if (formData.record_type === 'blood_pressure') {
        if (formData.systolic_pressure) updates.systolic_pressure = Number(formData.systolic_pressure)
        if (formData.diastolic_pressure) updates.diastolic_pressure = Number(formData.diastolic_pressure)
        if (formData.heart_rate) updates.heart_rate = Number(formData.heart_rate)
      } else if (formData.record_type === 'blood_sugar') {
        if (formData.blood_sugar) updates.blood_sugar = Number(formData.blood_sugar)
        if (formData.blood_sugar_type) updates.blood_sugar_type = formData.blood_sugar_type
      } else if (formData.record_type === 'weight') {
        if (formData.weight) updates.weight = Number(formData.weight)
      } else if (formData.record_type === 'temperature') {
        if (formData.temperature) updates.temperature = Number(formData.temperature)
      }

      await dispatch(updateHealthRecord({ id: record.id, updates })).unwrap()
      
      onSuccess?.()
      onClose()
    } catch (error: any) {
      setError(error.message || '기록 수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!record) return

    const confirmed = window.confirm('이 건강 기록을 삭제하시겠습니까?')
    if (!confirmed) return

    setIsSubmitting(true)
    setError(null)

    try {
      await dispatch(deleteHealthRecord(record.id)).unwrap()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      setError(error.message || '기록 삭제에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecordTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: '혈압',
      blood_sugar: '혈당',
      weight: '체중',
      heart_rate: '맥박',
      temperature: '체온'
    }
    return labels[type] || type
  }

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      blood_pressure: '#e3f2fd',
      blood_sugar: '#f3e5f5',
      weight: '#e8f5e8',
      heart_rate: '#fff3e0',
      temperature: '#fce4ec'
    }
    return colors[type] || '#f5f5f5'
  }

  if (!record) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              건강 기록 수정
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 측정 유형 표시 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: getRecordTypeColor(record.record_type), borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            📊 측정 유형
          </Typography>
          <Chip 
            label={getRecordTypeLabel(record.record_type)} 
            color="primary" 
            size="large"
            sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 측정 시간 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            📅 측정 시간
          </Typography>
          <TextField
            fullWidth
            type="datetime-local"
            value={formData.measurement_time}
            onChange={(e) => handleInputChange('measurement_time', e.target.value)}
            size="large"
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
          />
        </Box>

        {/* 측정 유형별 입력 필드 */}
        {record.record_type === 'blood_pressure' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              💓 혈압 측정값
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="수축기 혈압 (mmHg)"
                type="number"
                value={formData.systolic_pressure}
                onChange={(e) => handleInputChange('systolic_pressure', e.target.value)}
                size="large"
                sx={{ flex: 1 }}
              />
              <TextField
                label="이완기 혈압 (mmHg)"
                type="number"
                value={formData.diastolic_pressure}
                onChange={(e) => handleInputChange('diastolic_pressure', e.target.value)}
                size="large"
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              label="맥박 (bpm)"
              type="number"
              value={formData.heart_rate}
              onChange={(e) => handleInputChange('heart_rate', e.target.value)}
              size="large"
              sx={{ width: '200px' }}
            />
          </Box>
        )}

        {record.record_type === 'blood_sugar' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              🩸 혈당 측정값
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="혈당 수치 (mg/dL)"
                type="number"
                value={formData.blood_sugar}
                onChange={(e) => handleInputChange('blood_sugar', e.target.value)}
                size="large"
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>혈당 유형</InputLabel>
                <Select
                  value={formData.blood_sugar_type}
                  onChange={(e) => handleInputChange('blood_sugar_type', e.target.value)}
                  size="large"
                >
                  <MenuItem value="fasting">공복</MenuItem>
                  <MenuItem value="post_meal">식후</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {record.record_type === 'weight' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              ⚖️ 체중 측정값
            </Typography>
            <TextField
              label="체중 (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              size="large"
              sx={{ width: '200px' }}
            />
          </Box>
        )}

        {record.record_type === 'temperature' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
              🌡️ 체온 측정값
            </Typography>
            <TextField
              label="체온 (°C)"
              type="number"
              value={formData.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              size="large"
              sx={{ width: '200px' }}
            />
          </Box>
        )}

        {/* 메모 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            📝 메모
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="추가 메모를 입력하세요..."
            size="large"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleDelete}
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          size="large"
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          disabled={isSubmitting}
        >
          삭제
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          size="large"
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          size="large"
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600,
            py: 1.5,
            px: 4
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default HealthRecordEditDialog
