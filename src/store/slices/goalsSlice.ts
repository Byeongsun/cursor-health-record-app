// 건강 목표 관리 Redux slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

// 목표 타입 정의
export interface HealthGoal {
  id: string
  user_id: string
  goal_type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'exercise' | 'medication'
  target_value: number
  current_value?: number
  unit: string
  target_date: string
  is_achieved: boolean
  created_at: string
  updated_at: string
  notes?: string
}

// 목표 생성/수정을 위한 데이터 타입
export interface GoalInput {
  goal_type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'exercise' | 'medication'
  target_value: number
  current_value?: number
  unit: string
  target_date: string
  notes?: string
}

// 목표 상태 타입
interface GoalsState {
  goals: HealthGoal[]
  loading: boolean
  error: string | null
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
}

// 목표 목록 조회
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as HealthGoal[]
  }
)

// 목표 생성
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async ({ userId, goalData }: { userId: string; goalData: GoalInput }) => {
    const { data, error } = await supabase
      .from('health_goals')
      .insert([{ ...goalData, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data as HealthGoal
  }
)

// 목표 수정
export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, goalData }: { goalId: string; goalData: Partial<GoalInput> }) => {
    const { data, error } = await supabase
      .from('health_goals')
      .update(goalData)
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error
    return data as HealthGoal
  }
)

// 목표 삭제
export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId: string) => {
    const { error } = await supabase
      .from('health_goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error
    return goalId
  }
)

// 목표 달성 상태 업데이트
export const updateGoalProgress = createAsyncThunk(
  'goals/updateGoalProgress',
  async ({ goalId, currentValue }: { goalId: string; currentValue: number }) => {
    const { data, error } = await supabase
      .from('health_goals')
      .update({ 
        current_value: currentValue,
        is_achieved: currentValue >= 0.8 // 80% 이상 달성 시 성공으로 간주
      })
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error
    return data as HealthGoal
  }
)

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoals: (state) => {
      state.goals = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 목표 목록 조회
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false
        state.goals = action.payload
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '목표를 불러오는데 실패했습니다.'
      })
      
      // 목표 생성
      .addCase(createGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false
        state.goals.unshift(action.payload)
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '목표 생성에 실패했습니다.'
      })
      
      // 목표 수정
      .addCase(updateGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '목표 수정에 실패했습니다.'
      })
      
      // 목표 삭제
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false
        state.goals = state.goals.filter(goal => goal.id !== action.payload)
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '목표 삭제에 실패했습니다.'
      })
      
      // 목표 진행률 업데이트
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        state.loading = false
        const index = state.goals.findIndex(goal => goal.id === action.payload.id)
        if (index !== -1) {
          state.goals[index] = action.payload
        }
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '목표 진행률 업데이트에 실패했습니다.'
      })
  },
})

export const { clearGoals } = goalsSlice.actions
export default goalsSlice.reducer

