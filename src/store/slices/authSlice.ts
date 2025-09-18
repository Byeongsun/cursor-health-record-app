// 인증 관련 Redux 슬라이스
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'

// 사용자 정보 타입
export interface UserProfile {
  id: string
  email: string
  name: string
  birth_year?: number
  gender?: string
  phone?: string
  emergency_contact?: string
}

// 인증 상태 타입
interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

// 초기 상태
const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
}

// 비동기 액션들
export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) throw error
    return data
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }
)

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
})

// Google 로그인
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }
)

// 카카오 로그인
export const signInWithKakao = createAsyncThunk(
  'auth/signInWithKakao',
  async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }
)

// 프로필 업데이트
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }
)

// 슬라이스 생성
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 회원가입
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '회원가입에 실패했습니다.'
      })
      // 로그인
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '로그인에 실패했습니다.'
      })
      // 로그아웃
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.profile = null
        state.error = null
      })
      // 사용자 프로필 조회
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      // 프로필 업데이트
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || '프로필 업데이트에 실패했습니다.'
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer
