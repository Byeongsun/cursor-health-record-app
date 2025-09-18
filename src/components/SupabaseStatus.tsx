// Supabase 연결 상태를 표시하는 컴포넌트 (개발 환경에서만 사용)
import React, { useState, useEffect } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material'
import { checkSupabaseConnection, checkEnvironmentVariables } from '../lib/supabaseConfig'

const SupabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [envStatus, setEnvStatus] = useState<{
    url: boolean
    key: boolean
    allSet: boolean
  } | null>(null)

  // 프로덕션 환경에서는 렌더링하지 않음
  if (import.meta.env.PROD) {
    return null
  }

  useEffect(() => {
    // 환경 변수 확인
    const env = checkEnvironmentVariables()
    setEnvStatus(env)
  }, [])

  const handleCheckConnection = async () => {
    setIsChecking(true)
    const connected = await checkSupabaseConnection()
    setIsConnected(connected)
    setIsChecking(false)
  }

  if (!envStatus?.allSet) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>환경 변수 설정 필요</AlertTitle>
        Supabase URL과 API 키를 설정해주세요.
        <br />
        <strong>설정 방법:</strong>
        <br />
        1. 프로젝트 루트에 <code>.env</code> 파일 생성
        <br />
        2. 다음 내용 추가:
        <br />
        <code>
          VITE_SUPABASE_URL=your_supabase_url_here<br />
          VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
        </code>
      </Alert>
    )
  }

  return (
    <Card sx={{ mb: 2, border: '2px dashed #ccc' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.secondary">
          Supabase 연결 상태 (개발 환경 전용)
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleCheckConnection}
            disabled={isChecking}
            startIcon={isChecking ? <CircularProgress size={20} /> : null}
          >
            {isChecking ? '연결 확인 중...' : '연결 확인'}
          </Button>
        </Box>

        {isConnected === true && (
          <Alert severity="success">
            <AlertTitle>연결 성공!</AlertTitle>
            Supabase 데이터베이스에 성공적으로 연결되었습니다.
          </Alert>
        )}

        {isConnected === false && (
          <Alert severity="error">
            <AlertTitle>연결 실패</AlertTitle>
            Supabase 데이터베이스 연결에 실패했습니다.
            <br />
            환경 변수와 Supabase 프로젝트 설정을 확인해주세요.
          </Alert>
        )}

        {envStatus && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              환경 변수 상태:
            </Typography>
            <Typography variant="body2">
              • VITE_SUPABASE_URL: {envStatus.url ? '✅ 설정됨' : '❌ 설정되지 않음'}
            </Typography>
            <Typography variant="body2">
              • VITE_SUPABASE_ANON_KEY: {envStatus.key ? '✅ 설정됨' : '❌ 설정되지 않음'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SupabaseStatus


