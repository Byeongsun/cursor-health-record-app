import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store } from './store'
import { useAuth } from './hooks/useAuth'

// 페이지 컴포넌트들 (추후 구현)
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import HealthRecordPage from './pages/HealthRecordPage'
import ProfilePage from './pages/ProfilePage'
import RecordsListPage from './pages/RecordsListPage'
import AllDataViewPage from './pages/AllDataViewPage'
import OAuthCallback from './components/OAuthCallback'

// Material-UI 테마 설정 (어르신 친화적)
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // 더 진한 녹색 (건강 관련)
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D32F2F', // 빨간색 (혈압 관련)
      light: '#F44336',
      dark: '#B71C1C',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA', // 부드러운 배경색
      paper: '#ffffff',
    },
    text: {
      primary: '#212121', // 높은 대비도
      secondary: '#424242',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#F57C00',
    },
    success: {
      main: '#388E3C',
    },
    info: {
      main: '#1976D2',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 18, // 기본 폰트 크기 대폭 증가
    h1: {
      fontSize: '3rem', // 매우 큰 제목
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '1.2rem', // 버튼 텍스트 크기 증가
      fontWeight: 700,
      textTransform: 'none', // 대문자 변환 비활성화
    },
    caption: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // 더 둥근 모서리
  },
  spacing: 8, // 기본 간격 증가
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 56, // 버튼 최소 높이 대폭 증가
          minWidth: 120, // 버튼 최소 너비 설정
          padding: '16px 32px',
          borderRadius: 12,
          fontSize: '1.2rem',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '1.2rem',
            padding: '16px 14px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '1.1rem',
            fontWeight: 500,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            minHeight: 56,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 12,
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          height: 32,
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          borderRadius: 12,
        },
      },
    },
  },
})

// 메인 앱 컴포넌트
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/record" 
          element={
            isAuthenticated ? <HealthRecordPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/records" 
          element={
            isAuthenticated ? <RecordsListPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/all-data" 
          element={
            isAuthenticated ? <AllDataViewPage /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

// 앱 루트 컴포넌트
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  )
}

export default App
