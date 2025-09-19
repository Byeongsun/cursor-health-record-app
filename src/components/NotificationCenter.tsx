// 알림 센터 컴포넌트
import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Chip,
  Divider,
  Button,
  Alert,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { markAsRead, markAllAsRead, removeNotification } from '../store/slices/notificationsSlice'
import type { RootState } from '../store'
import type { AppDispatch } from '../store'

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />
      case 'warning':
        return <WarningIcon sx={{ color: '#f44336' }} />
      case 'reminder':
        return <ScheduleIcon sx={{ color: '#ff9800' }} />
      case 'info':
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
  }

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return '방금 전'
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ fontSize: '2rem' }} />
            </Badge>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              알림
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ fontSize: '0.9rem' }}
            >
              모두 읽음 처리
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              알림이 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              새로운 알림이 오면 여기에 표시됩니다
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : '#f5f5f5',
                  borderRadius: 2,
                  mb: 1,
                  border: notification.isRead ? 'none' : '1px solid #e0e0e0',
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: notification.isRead ? 500 : 700,
                          color: notification.isRead ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getPriorityColor(notification.priority) as any}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: notification.isRead ? 'text.secondary' : 'text.primary',
                          mb: 1,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                        {!notification.isRead && (
                          <Chip
                            label="새 알림"
                            size="small"
                            color="error"
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {!notification.isRead && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ color: 'primary.main' }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveNotification(notification.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default NotificationCenter





