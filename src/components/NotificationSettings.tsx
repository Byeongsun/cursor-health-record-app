// 알림 설정 컴포넌트
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  Divider,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotificationSettings, updateNotificationSetting } from '../store/slices/notificationSettingsSlice'
import type { RootState } from '../store'
import type { AppDispatch } from '../store'
import type { NotificationSetting } from '../store/slices/notificationSettingsSlice'

interface NotificationSettingsProps {
  open: boolean
  onClose: () => void
  userId: string
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose, userId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { settings, loading } = useSelector((state: RootState) => state.notificationSettings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<NotificationSetting[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // 컴포넌트 마운트 시 설정 불러오기
  useEffect(() => {
    if (open && userId) {
      dispatch(fetchNotificationSettings(userId))
    }
  }, [dispatch, open, userId])

  // 설정이 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    if (settings.length > 0) {
      setLocalSettings(settings)
      setHasChanges(false)
    }
  }, [settings])

  const settingTypes = [
    {
      key: 'measurement_reminder',
      label: '측정 리마인더',
      description: '정기적인 건강 측정 알림',
      icon: <ScheduleIcon />,
      color: '#2196f3'
    },
    {
      key: 'danger_alert',
      label: '위험 수치 알림',
      description: '정상 범위를 벗어난 수치 감지',
      icon: <WarningIcon />,
      color: '#f44336'
    },
    {
      key: 'goal_achievement',
      label: '목표 달성 알림',
      description: '목표 달성 시 축하 알림',
      icon: <CheckCircleIcon />,
      color: '#4caf50'
    },
    {
      key: 'daily_summary',
      label: '일일 요약',
      description: '하루 건강 측정 요약',
      icon: <AssessmentIcon />,
      color: '#ff9800'
    }
  ]

  const measurementTypes = [
    { value: 'blood_pressure', label: '혈압' },
    { value: 'blood_sugar', label: '혈당' },
    { value: 'weight', label: '체중' },
    { value: 'exercise', label: '운동' }
  ]

  const weekDays = [
    { value: 0, label: '일' },
    { value: 1, label: '월' },
    { value: 2, label: '화' },
    { value: 3, label: '수' },
    { value: 4, label: '목' },
    { value: 5, label: '금' },
    { value: 6, label: '토' }
  ]

  // 로컬 상태 업데이트 함수들
  const updateLocalSetting = (settingId: string, field: string, value: any) => {
    setLocalSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, [field]: value }
        : setting
    ))
    setHasChanges(true)
  }

  const handleMeasurementTypesChange = (settingId: string, newTypes: string[]) => {
    updateLocalSetting(settingId, 'measurement_types', newTypes)
  }

  const handleDaysChange = (settingId: string, newDays: number[]) => {
    updateLocalSetting(settingId, 'days', newDays)
  }

  // 모든 변경사항 저장
  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 변경된 설정들을 순차적으로 저장
      for (const setting of localSettings) {
        const originalSetting = settings.find(s => s.id === setting.id)
        if (!originalSetting) continue

        // 변경사항이 있는지 확인
        const hasChanged = Object.keys(setting).some(key => 
          key !== 'created_at' && key !== 'updated_at' && 
          setting[key as keyof NotificationSetting] !== originalSetting[key as keyof NotificationSetting]
        )

        if (hasChanged) {
          await dispatch(updateNotificationSetting({
            settingId: setting.id,
            settingData: {
              is_enabled: setting.is_enabled,
              frequency: setting.frequency,
              time: setting.time,
              days: setting.days,
              measurement_types: setting.measurement_types
            }
          })).unwrap()
        }
      }
      
      setHasChanges(false)
      onClose()
    } catch (error: any) {
      setError(error.message || '설정 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 변경사항 취소
  const handleCancelChanges = () => {
    setLocalSettings(settings)
    setHasChanges(false)
    setError(null)
    onClose()
  }

  const getSettingByType = (type: string) => {
    return localSettings.find(s => s.setting_type === type)
  }

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">알림 설정을 불러오는 중...</Typography>
        </DialogContent>
      </Dialog>
    )
  }

  // 다이얼로그 닫기 시 변경사항 확인
  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('저장되지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?')
      if (confirmed) {
        handleCancelChanges()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              알림 설정
            </Typography>
          </Box>
          {hasChanges && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1,
              backgroundColor: '#fff3cd',
              borderRadius: 2,
              border: '1px solid #ffeaa7'
            }}>
              <Typography variant="body2" sx={{ color: '#856404', fontWeight: 600 }}>
                저장되지 않은 변경사항이 있습니다
              </Typography>
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {settingTypes.map((settingType) => {
            const setting = getSettingByType(settingType.key)
            if (!setting) return null

            return (
              <Grid item xs={12} key={settingType.key}>
                <Box sx={{
                  p: 3,
                  border: '2px solid',
                  borderColor: settingType.color,
                  borderRadius: 3,
                  backgroundColor: `${settingType.color}10`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: settingType.color, mr: 2 }}>
                      {settingType.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {settingType.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {settingType.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={setting.is_enabled}
                          onChange={(e) => updateLocalSetting(setting.id, 'is_enabled', e.target.checked)}
                          disabled={isSubmitting}
                        />
                      }
                      label="활성화"
                    />
                  </Box>

                  {setting.is_enabled && (
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={3}>
                        {/* 주기 설정 */}
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="large">
                            <InputLabel>알림 주기</InputLabel>
                            <Select
                              value={setting.frequency}
                              onChange={(e) => updateLocalSetting(setting.id, 'frequency', e.target.value)}
                              label="알림 주기"
                              disabled={isSubmitting}
                            >
                              <MenuItem value="daily">매일</MenuItem>
                              <MenuItem value="weekly">매주</MenuItem>
                              <MenuItem value="monthly">매월</MenuItem>
                              <MenuItem value="custom">사용자 정의</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* 시간 설정 */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="알림 시간"
                            type="time"
                            value={setting.time}
                            onChange={(e) => updateLocalSetting(setting.id, 'time', e.target.value)}
                            size="large"
                            disabled={isSubmitting}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        {/* 요일 설정 (daily 또는 custom인 경우) */}
                        {(setting.frequency === 'daily' || setting.frequency === 'custom') && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                              알림 요일
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {weekDays.map((day) => (
                                <Chip
                                  key={day.value}
                                  label={day.label}
                                  onClick={() => {
                                    const newDays = setting.days.includes(day.value)
                                      ? setting.days.filter(d => d !== day.value)
                                      : [...setting.days, day.value]
                                    handleDaysChange(setting.id, newDays)
                                  }}
                                  color={setting.days.includes(day.value) ? 'primary' : 'default'}
                                  variant={setting.days.includes(day.value) ? 'filled' : 'outlined'}
                                  disabled={isSubmitting}
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}

                        {/* 측정 유형 설정 (측정 리마인더인 경우) */}
                        {setting.setting_type === 'measurement_reminder' && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                              측정 유형
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {measurementTypes.map((type) => (
                                <Chip
                                  key={type.value}
                                  label={type.label}
                                  onClick={() => {
                                    const newTypes = setting.measurement_types.includes(type.value)
                                      ? setting.measurement_types.filter(t => t !== type.value)
                                      : [...setting.measurement_types, type.value]
                                    handleMeasurementTypesChange(setting.id, newTypes)
                                  }}
                                  color={setting.measurement_types.includes(type.value) ? 'primary' : 'default'}
                                  variant={setting.measurement_types.includes(type.value) ? 'filled' : 'outlined'}
                                  disabled={isSubmitting}
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Grid>
            )
          })}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            💡 알림 팁
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • 측정 리마인더는 오늘 아직 측정하지 않은 항목에 대해서만 알림을 보냅니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • 위험 수치 알림은 정상 범위를 크게 벗어난 경우에만 표시됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            • 목표 달성 알림은 목표를 80% 이상 달성했을 때 표시됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 일일 요약은 하루에 측정한 항목들을 요약해서 보여줍니다.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleCancelChanges}
          size="large"
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant="contained"
          size="large"
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600,
            py: 1.5,
            px: 4
          }}
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NotificationSettings
