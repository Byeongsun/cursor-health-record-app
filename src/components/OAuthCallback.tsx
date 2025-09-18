// OAuth 콜백 처리 컴포넌트
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import { supabase } from '../lib/supabase'
import { setUser, getUserProfile } from '../store/slices/authSlice'
import type { AppDispatch } from '../store'

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth 콜백 처리 시작')

        // URL에서 인증 정보 확인 (hash와 search 모두 확인)
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        const code = urlParams.get('code') || hashParams.get('code')
        const error = urlParams.get('error') || hashParams.get('error')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        console.log('URL 파라미터:', { 
          code, 
          error, 
          accessToken: accessToken ? '있음' : '없음',
          refreshToken: refreshToken ? '있음' : '없음'
        })

        if (error) {
          console.error('OAuth 에러:', error)
          navigate('/login')
          return
        }

        // URL에 토큰이 있으면 직접 세션 설정
        if (accessToken && refreshToken) {
          console.log('URL에서 토큰 발견, 직접 세션 설정')
          
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          console.log('세션 설정 결과:', session, '에러:', sessionError)
          
          if (session?.user) {
            console.log('사용자 인증 성공:', session.user)
            dispatch(setUser(session.user))
            dispatch(getUserProfile(session.user.id))
            navigate('/dashboard')
            return
          }
        }

        // URL 정리 (토큰 제거)
        window.history.replaceState({}, document.title, window.location.pathname)

        // 잠시 대기 후 세션 확인 (Supabase가 자동으로 처리하도록)
        console.log('Supabase 자동 세션 처리 대기 중...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('세션 확인 결과:', session, '에러:', sessionError)

        if (session?.user) {
          console.log('사용자 인증 성공:', session.user)
          dispatch(setUser(session.user))
          dispatch(getUserProfile(session.user.id))
          navigate('/dashboard')
        } else {
          console.log('세션을 찾을 수 없음, 로그인 페이지로 이동')
          navigate('/login')
        }

      } catch (err) {
        console.error('OAuth 콜백 처리 중 에러:', err)
        navigate('/login')
      }
    }

    handleOAuthCallback()
  }, [navigate, dispatch])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        구글 로그인 처리 중...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        잠시만 기다려주세요.
      </Typography>
    </Box>
  )
}

export default OAuthCallback
