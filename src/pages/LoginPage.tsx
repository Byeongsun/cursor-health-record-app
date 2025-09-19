// 로그인 페이지 컴포넌트
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Link,
  Stack,
} from '@mui/material'
import {
  Google as GoogleIcon,
} from '@mui/icons-material'
import { signIn, signUp, signInWithGoogle } from '../store/slices/authSlice'
import { useAuth } from '../hooks/useAuth'
import SocialLoginGuide from '../components/SocialLoginGuide'

const LoginPage: React.FC = () => {
  const dispatch = useDispatch()
  const { loading, error } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      dispatch(signUp(formData))
    } else {
      dispatch(signIn({ email: formData.email, password: formData.password }))
    }
  }

  const handleGoogleLogin = () => {
    dispatch(signInWithGoogle())
  }


  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 4 }
      }}
    >
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 6,
            width: '100%',
            maxWidth: 500,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '4rem', mb: 2 }}>
              🏥
            </Typography>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {isSignUp ? '회원가입' : '로그인'}
            </Typography>
            
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
              건강 기록을 시작해보세요
            </Typography>
          </Box>

          {/* 개발 환경 전용 소셜 로그인 설정 가이드 */}
          {/* 프로덕션 빌드에서는 자동으로 숨겨집니다 */}
          <SocialLoginGuide />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: 3, 
            p: 4, 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <TextField
                  fullWidth
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: '#333',
                    },
                    '& .MuiInputLabel-root': {
                      color: '#333',
                    }
                  }}
                />
              )}
              
              <TextField
                fullWidth
                label="이메일"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#333',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#333',
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#333',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#333',
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading}
                sx={{ 
                  mt: 4, 
                  mb: 3, 
                  py: 2,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.5)',
                  }
                }}
              >
                {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
              </Button>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.3)' }}>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                  또는
                </Typography>
              </Divider>

              {/* 소셜 로그인 버튼들 */}
              <Stack spacing={3} sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="medium"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  sx={{ 
                    py: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  Google로 로그인
                </Button>

              </Stack>

              <Box textAlign="center">
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => setIsSignUp(!isSignUp)}
                  sx={{ 
                    textDecoration: 'none',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
                </Link>
              </Box>
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage
