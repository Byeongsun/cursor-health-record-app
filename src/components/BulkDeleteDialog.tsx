import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store'
import { deleteMultipleHealthRecords } from '../store/slices/healthRecordsSlice'
import type { HealthRecord } from '../store/slices/healthRecordsSlice'

interface BulkDeleteDialogProps {
  open: boolean
  onClose: () => void
  records: HealthRecord[]
  onSuccess?: () => void
}

const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onClose,
  records,
  onSuccess
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 다이얼로그가 열릴 때 선택 상태 초기화
  useEffect(() => {
    if (open) {
      setSelectedIds([])
      setError(null)
    }
  }, [open])

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(records.map(record => record.id))
    }
  }

  const handleSelectRecord = (recordId: string) => {
    setSelectedIds(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return

    const confirmed = window.confirm(
      `선택한 ${selectedIds.length}개의 건강 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
    if (!confirmed) return

    setIsSubmitting(true)
    setError(null)

    try {
      await dispatch(deleteMultipleHealthRecords(selectedIds)).unwrap()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      setError(error.message || '건강 기록 삭제에 실패했습니다.')
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

  const formatRecordValue = (record: HealthRecord) => {
    switch (record.record_type) {
      case 'blood_pressure':
        return `${record.systolic_pressure}/${record.diastolic_pressure} mmHg`
      case 'blood_sugar':
        return `${record.blood_sugar} mg/dL (${record.blood_sugar_type === 'fasting' ? '공복' : '식후'})`
      case 'weight':
        return `${record.weight} kg`
      case 'heart_rate':
        return `${record.heart_rate} bpm`
      case 'temperature':
        return `${record.temperature}°C`
      default:
        return '측정값 없음'
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ fontSize: '2rem', color: 'error.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              건강 기록 다중 삭제
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

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              삭제할 건강 기록을 선택하세요. 이 작업은 되돌릴 수 없습니다.
            </Typography>
          </Box>
        </Alert>

        {/* 전체 선택 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedIds.length === records.length && records.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < records.length}
                onChange={handleSelectAll}
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                size="large"
              />
            }
            label={
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                전체 선택 ({selectedIds.length}/{records.length})
              </Typography>
            }
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 기록 목록 */}
        <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
          <List>
            {records.map((record, index) => (
              <ListItem
                key={record.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: selectedIds.includes(record.id) ? '#fff3e0' : 'white',
                  '&:hover': {
                    backgroundColor: selectedIds.includes(record.id) ? '#ffe0b2' : '#f5f5f5'
                  }
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={selectedIds.includes(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    size="large"
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Chip 
                        label={getRecordTypeLabel(record.record_type)} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRecordTypeColor(record.record_type),
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatRecordValue(record)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        📅 {formatTime(record.measurement_time)}
                      </Typography>
                      {record.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          📝 {record.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {records.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              삭제할 건강 기록이 없습니다.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          size="large"
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600,
            py: 1.5,
            px: 4
          }}
          disabled={isSubmitting || selectedIds.length === 0}
        >
          {isSubmitting ? '삭제 중...' : `선택한 ${selectedIds.length}개 삭제`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BulkDeleteDialog



