// 건강 기록 관련 Redux 슬라이스
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// 건강 기록 타입
export interface HealthRecord {
  id: string
  user_id: string
  record_type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'heart_rate' | 'temperature'
  systolic_pressure?: number
  diastolic_pressure?: number
  blood_sugar?: number
  blood_sugar_type?: 'fasting' | 'post_meal'
  weight?: number
  heart_rate?: number
  temperature?: number
  measurement_time: string
  notes?: string
  created_at: string
}

// 건강 기록 상태 타입
interface HealthRecordsState {
  records: HealthRecord[]
  loading: boolean
  error: string | null
}

// 초기 상태
const initialState: HealthRecordsState = {
  records: [],
  loading: false,
  error: null,
}

// 비동기 액션들
export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchHealthRecords',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_time', { ascending: false })
    if (error) throw error
    return data
  }
)

export const addHealthRecord = createAsyncThunk(
  'healthRecords/addHealthRecord',
  async (record: Omit<HealthRecord, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('health_records')
      .insert([record])
      .select()
      .single()
    if (error) throw error
    return data
  }
)

export const updateHealthRecord = createAsyncThunk(
  'healthRecords/updateHealthRecord',
  async ({ id, updates }: { id: string; updates: Partial<HealthRecord> }) => {
    const { data, error } = await supabase
      .from('health_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
)

export const deleteHealthRecord = createAsyncThunk(
  'healthRecords/deleteHealthRecord',
  async (id: string) => {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id)
    if (error) throw error
    return id
  }
)

export const deleteMultipleHealthRecords = createAsyncThunk(
  'healthRecords/deleteMultipleHealthRecords',
  async (ids: string[]) => {
    const { error } = await supabase
      .from('health_records')
      .delete()
      .in('id', ids)
    if (error) throw error
    return ids
  }
)

// 슬라이스 생성
const healthRecordsSlice = createSlice({
  name: 'healthRecords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 건강 기록 조회
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = false
        state.records = action.payload
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '건강 기록을 불러오는데 실패했습니다.'
      })
      // 건강 기록 추가
      .addCase(addHealthRecord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addHealthRecord.fulfilled, (state, action) => {
        state.loading = false
        state.records.unshift(action.payload)
      })
      .addCase(addHealthRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '건강 기록 추가에 실패했습니다.'
      })
      // 건강 기록 수정
      .addCase(updateHealthRecord.fulfilled, (state, action) => {
        const index = state.records.findIndex(record => record.id === action.payload.id)
        if (index !== -1) {
          state.records[index] = action.payload
        }
      })
      // 건강 기록 삭제
      .addCase(deleteHealthRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(record => record.id !== action.payload)
      })
      // 다중 건강 기록 삭제
      .addCase(deleteMultipleHealthRecords.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultipleHealthRecords.fulfilled, (state, action) => {
        state.loading = false
        state.records = state.records.filter(record => !action.payload.includes(record.id))
      })
      .addCase(deleteMultipleHealthRecords.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '건강 기록 삭제에 실패했습니다.'
      })
  },
})

export const { clearError } = healthRecordsSlice.actions
export default healthRecordsSlice.reducer
