// 인증 관련 커스텀 훅
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../lib/supabase'
import { setUser, getUserProfile } from '../store/slices/authSlice'
import type { RootState } from '../store'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, profile, loading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('현재 세션:', session, '에러:', error)
        if (session?.user) {
          dispatch(setUser(session.user))
          dispatch(getUserProfile(session.user.id))
        } else {
          dispatch(setUser(null))
        }
      } catch (err) {
        console.error('세션 확인 에러:', err)
        dispatch(setUser(null))
      }
    }

    getSession()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('인증 상태 변화:', event, session)
        try {
          if (session?.user) {
            dispatch(setUser(session.user))
            dispatch(getUserProfile(session.user.id))
          } else {
            dispatch(setUser(null))
          }
        } catch (err) {
          console.error('인증 상태 변화 처리 에러:', err)
          dispatch(setUser(null))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
  }
}
