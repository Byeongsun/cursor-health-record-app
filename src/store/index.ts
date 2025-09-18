// Redux 스토어 설정
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import healthRecordsReducer from './slices/healthRecordsSlice'
import goalsReducer from './slices/goalsSlice'
import notificationsReducer from './slices/notificationsSlice'
import notificationSettingsReducer from './slices/notificationSettingsSlice'
import csvImportReducer from './slices/csvImportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    healthRecords: healthRecordsReducer,
    goals: goalsReducer,
    notifications: notificationsReducer,
    notificationSettings: notificationSettingsReducer,
    csvImport: csvImportReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

