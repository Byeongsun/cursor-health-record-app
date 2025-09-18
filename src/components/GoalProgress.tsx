// 목표 진행률 표시 컴포넌트
import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import type { HealthGoal } from '../store/slices/goalsSlice'

interface GoalProgressProps {
  goals: HealthGoal[]
  onEditGoal?: (goal: HealthGoal) => void
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals, onEditGoal }) => {
  const getGoalTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      blood_pressure: '혈압',
      blood_sugar: '혈당',
      weight: '체중',
      exercise: '운동',
      medication: '약물 복용',
    }
    return labels[type] || type
  }

  const getGoalTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      blood_pressure: '❤️',
      blood_sugar: '🩸',
      weight: '⚖️',
      exercise: '🏃',
      medication: '💊',
    }
    return icons[type] || '🎯'
  }

  const calculateProgress = (goal: HealthGoal) => {
    if (!goal.current_value || goal.current_value === 0) return 0
    return Math.min((goal.current_value / goal.target_value) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success'
    if (progress >= 80) return 'info'
    if (progress >= 50) return 'warning'
    return 'error'
  }

  const getProgressLabel = (progress: number) => {
    if (progress >= 100) return '목표 달성!'
    if (progress >= 80) return '거의 다 왔어요!'
    if (progress >= 50) return '절반 이상!'
    if (progress >= 20) return '시작했어요!'
    return '시작해보세요!'
  }

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (goals.length === 0) {
    return (
      <Card sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '2px solid rgba(102, 126, 234, 0.2)'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" sx={{ fontSize: '3rem', mb: 2 }}>
            🎯
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            아직 설정된 목표가 없습니다
          </Typography>
          <Typography variant="body1" color="text.secondary">
            건강 목표를 설정하여 동기부여를 받아보세요!
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
        🎯 목표 진행률
      </Typography>
      
      <Grid container spacing={3}>
        {goals.map((goal) => {
          const progress = calculateProgress(goal)
          const daysRemaining = getDaysRemaining(goal.target_date)
          const isOverdue = daysRemaining < 0
          const isAchieved = goal.is_achieved || progress >= 100

          return (
            <Grid item xs={12} md={6} key={goal.id}>
              <Card sx={{ 
                height: '100%',
                background: isAchieved 
                  ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                  : isOverdue
                  ? 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'visible',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h3" sx={{ fontSize: '2rem' }}>
                        {getGoalTypeIcon(goal.goal_type)}
                      </Typography>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {getGoalTypeLabel(goal.goal_type)}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {goal.target_value} {goal.unit}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      {onEditGoal && (
                        <Tooltip title="목표 수정">
                          <IconButton
                            size="small"
                            onClick={() => onEditGoal(goal)}
                            sx={{ color: 'white', mb: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {isAchieved ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="달성!"
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      ) : isOverdue ? (
                        <Chip
                          icon={<ScheduleIcon />}
                          label="기한 초과"
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`${daysRemaining}일 남음`}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        진행률
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {goal.current_value && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        현재 수치
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {goal.current_value} {goal.unit}
                      </Typography>
                    </Box>
                  )}

                  <Typography variant="body2" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                    {getProgressLabel(progress)}
                  </Typography>

                  {goal.notes && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        📝 {goal.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default GoalProgress




