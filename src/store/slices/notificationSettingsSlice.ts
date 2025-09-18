// 알림 설정 관리 Redux slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// 알림 설정 타입 정의
export interface NotificationSetting {
  id: string
  user_id: string
  setting_type: 'measurement_reminder' | 'danger_alert' | 'goal_achievement' | 'daily_summary'
  is_enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string // HH:MM 형식
  days: number[] // 요일 (0=일요일, 1=월요일, ...)
  measurement_types: string[] // 측정 유형 (혈압, 혈당, 체중 등)
  created_at: string
  updated_at: string
}

// 알림 설정 입력 타입
export interface NotificationSettingInput {
  setting_type: 'measurement_reminder' | 'danger_alert' | 'goal_achievement' | 'daily_summary'
  is_enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  time: string
  days: number[]
  measurement_types: string[]
}

// 알림 설정 상태 타입
interface NotificationSettingsState {
  settings: NotificationSetting[]
  loading: boolean
  error: string | null
}

const initialState: NotificationSettingsState = {
  settings: [],
  loading: false,
  error: null,
}

// 기본 알림 설정 생성
const createDefaultSettings = (userId: string): NotificationSettingInput[] => [
  {
    setting_type: 'measurement_reminder',
    is_enabled: true,
    frequency: 'daily',
    time: '09:00',
    days: [1, 2, 3, 4, 5], // 월-금
    measurement_types: ['blood_pressure', 'blood_sugar']
  },
  {
    setting_type: 'danger_alert',
    is_enabled: true,
    frequency: 'daily',
    time: '00:00',
    days: [],
    measurement_types: ['blood_pressure', 'blood_sugar']
  },
  {
    setting_type: 'goal_achievement',
    is_enabled: true,
    frequency: 'daily',
    time: '00:00',
    days: [],
    measurement_types: []
  },
  {
    setting_type: 'daily_summary',
    is_enabled: false,
    frequency: 'daily',
    time: '20:00',
    days: [1, 2, 3, 4, 5],
    measurement_types: []
  }
]

// 알림 설정 목록 조회
export const fetchNotificationSettings = createAsyncThunk(
  'notificationSettings/fetchNotificationSettings',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    
    // 기본 설정이 없으면 생성
    if (!data || data.length === 0) {
      const defaultSettings = createDefaultSettings(userId)
      const { data: insertedData, error: insertError } = await supabase
        .from('notification_settings')
        .insert(defaultSettings.map(setting => ({ ...setting, user_id: userId })))
        .select()
      
      if (insertError) throw insertError
      return insertedData as NotificationSetting[]
    }
    
    return data as NotificationSetting[]
  }
)

// 알림 설정 생성
export const createNotificationSetting = createAsyncThunk(
  'notificationSettings/createNotificationSetting',
  async ({ userId, settingData }: { userId: string; settingData: NotificationSettingInput }) => {
    const { data, error } = await supabase
      .from('notification_settings')
      .insert([{ ...settingData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data as NotificationSetting
  }
)

// 알림 설정 수정
export const updateNotificationSetting = createAsyncThunk(
  'notificationSettings/updateNotificationSetting',
  async ({ settingId, settingData }: { settingId: string; settingData: Partial<NotificationSettingInput> }) => {
    const { data, error } = await supabase
      .from('notification_settings')
      .update(settingData)
      .eq('id', settingId)
      .select()
      .single()

    if (error) throw error
    return data as NotificationSetting
  }
)

// 알림 설정 삭제
export const deleteNotificationSetting = createAsyncThunk(
  'notificationSettings/deleteNotificationSetting',
  async (settingId: string) => {
    const { error } = await supabase
      .from('notification_settings')
      .delete()
      .eq('id', settingId)

    if (error) throw error
    return settingId
  }
)

const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState,
  reducers: {
    clearNotificationSettings: (state) => {
      state.settings = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 알림 설정 목록 조회
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '알림 설정을 불러오는데 실패했습니다.'
      })
      
      // 알림 설정 생성
      .addCase(createNotificationSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNotificationSetting.fulfilled, (state, action) => {
        state.loading = false
        state.settings.push(action.payload)
      })
      .addCase(createNotificationSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '알림 설정 생성에 실패했습니다.'
      })
      
      // 알림 설정 수정
      .addCase(updateNotificationSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNotificationSetting.fulfilled, (state, action) => {
        state.loading = false
        const index = state.settings.findIndex(setting => setting.id === action.payload.id)
        if (index !== -1) {
          state.settings[index] = action.payload
        }
      })
      .addCase(updateNotificationSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '알림 설정 수정에 실패했습니다.'
      })
      
      // 알림 설정 삭제
      .addCase(deleteNotificationSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteNotificationSetting.fulfilled, (state, action) => {
        state.loading = false
        state.settings = state.settings.filter(setting => setting.id !== action.payload)
      })
      .addCase(deleteNotificationSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '알림 설정 삭제에 실패했습니다.'
      })
  },
})

export const { clearNotificationSettings } = notificationSettingsSlice.actions
export default notificationSettingsSlice.reducer



