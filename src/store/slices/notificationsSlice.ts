// 알림 관리 Redux slice
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// 알림 타입 정의
export interface Notification {
  id: string
  type: 'reminder' | 'achievement' | 'warning' | 'info'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

// 알림 상태 타입
interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
}

// 알림 생성 함수 (중복 방지)
const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  priority: Notification['priority'] = 'medium',
  actionUrl?: string
): Notification => ({
  id: `${type}-${title}-${Date.now()}`,
  type,
  title,
  message,
  isRead: false,
  createdAt: new Date().toISOString(),
  actionUrl,
  priority,
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // 알림 추가 (중복 방지)
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'isRead' | 'createdAt'>>) => {
      // 같은 제목과 메시지를 가진 알림이 이미 있는지 확인
      const existingNotification = state.notifications.find(
        n => n.title === action.payload.title && 
             n.message === action.payload.message && 
             !n.isRead
      )
      
      if (existingNotification) {
        // 이미 같은 알림이 있으면 업데이트만
        existingNotification.createdAt = new Date().toISOString()
        return
      }

      const notification = createNotification(
        action.payload.type,
        action.payload.title,
        action.payload.message,
        action.payload.priority,
        action.payload.actionUrl
      )
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    
    // 알림 읽음 처리
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadCount -= 1
      }
    },
    
    // 모든 알림 읽음 처리
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true
        }
      })
      state.unreadCount = 0
    },
    
    // 알림 삭제
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.isRead) {
        state.unreadCount -= 1
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    // 모든 알림 삭제
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    
    // 중복 알림 정리
    cleanDuplicateNotifications: (state) => {
      const uniqueNotifications = []
      const seen = new Set()
      
      state.notifications.forEach(notification => {
        const key = `${notification.title}-${notification.message}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueNotifications.push(notification)
        }
      })
      
      state.notifications = uniqueNotifications
      state.unreadCount = state.notifications.filter(n => !n.isRead).length
    },
    
    // 측정 리마인더 알림 생성 (중복 방지)
    addMeasurementReminder: (state, action: PayloadAction<{ type: string; time: string }>) => {
      const title = '측정 시간입니다!'
      const message = `${action.payload.type} 측정 시간입니다. (${action.payload.time})`
      
      // 같은 제목과 메시지를 가진 알림이 이미 있는지 확인
      const existingNotification = state.notifications.find(
        n => n.title === title && n.message === message && !n.isRead
      )
      
      if (existingNotification) {
        // 이미 같은 알림이 있으면 업데이트만
        existingNotification.createdAt = new Date().toISOString()
        return
      }

      const notification = createNotification(
        'reminder',
        title,
        message,
        'high',
        '/record'
      )
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    
    // 목표 달성 알림 생성
    addAchievementNotification: (state, action: PayloadAction<{ goalType: string; goalValue: string }>) => {
      const notification = createNotification(
        'achievement',
        '목표 달성! 🎉',
        `${action.payload.goalType} 목표를 달성했습니다! (${action.payload.goalValue})`,
        'high',
        '/dashboard'
      )
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    
    // 위험 수치 알림 생성 (중복 방지)
    addWarningNotification: (state, action: PayloadAction<{ type: string; value: string; normalRange: string }>) => {
      const title = '주의! 위험 수치 감지'
      const message = `${action.payload.type}가 ${action.payload.value}로 정상 범위(${action.payload.normalRange})를 벗어났습니다.`
      
      // 같은 제목과 메시지를 가진 알림이 이미 있는지 확인
      const existingNotification = state.notifications.find(
        n => n.title === title && n.message === message && !n.isRead
      )
      
      if (existingNotification) {
        // 이미 같은 알림이 있으면 업데이트만
        existingNotification.createdAt = new Date().toISOString()
        return
      }

      const notification = createNotification(
        'warning',
        title,
        message,
        'high',
        '/record'
      )
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    
    // 일반 정보 알림 생성
    addInfoNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification = createNotification(
        'info',
        action.payload.title,
        action.payload.message,
        'medium'
      )
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  cleanDuplicateNotifications,
  addMeasurementReminder,
  addAchievementNotification,
  addWarningNotification,
  addInfoNotification,
} = notificationsSlice.actions

export default notificationsSlice.reducer

