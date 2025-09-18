// 프로필 페이지 컴포넌트
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
} from '@mui/material'
import {
  Save as SaveIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import UnifiedNavigation from '../components/UnifiedNavigation'
import { signOut, updateUserProfile } from '../store/slices/authSlice'

const ProfilePage: React.FC = () => {
  const { user, profile, loading, error } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    birth_year: profile?.birth_year || '',
    gender: profile?.gender || '',
    phone: profile?.phone || '',
    emergency_contact: profile?.emergency_contact || '',
  })

  // 프로필이 변경될 때 폼 데이터 업데이트
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        birth_year: profile.birth_year || '',
        gender: profile.gender || '',
        phone: profile.phone || '',
        emergency_contact: profile.emergency_contact || '',
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    if (user?.id) {
      dispatch(updateUserProfile({
        userId: user.id,
        updates: {
          name: formData.name,
          birth_year: formData.birth_year ? parseInt(formData.birth_year.toString()) : null,
          gender: formData.gender || null,
          phone: formData.phone || null,
          emergency_contact: formData.emergency_contact || null,
        }
      }))
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    dispatch(signOut())
    navigate('/login')
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 통합 네비게이션 */}
      <UnifiedNavigation
        onGoalSetting={() => {/* TODO: 목표 설정 구현 */}}
        onNotificationCenter={() => {/* TODO: 알림 센터 구현 */}}
        onNotificationSettings={() => {/* TODO: 알림 설정 구현 */}}
        onCsvImport={() => {/* TODO: CSV 가져오기 구현 */}}
        onDataExport={() => {/* TODO: 데이터 내보내기 구현 */}}
        onHealthRecord={(type) => navigate(`/record?type=${type}`)}
        onBulkDelete={() => {/* TODO: 다중 삭제 구현 */}}
        onEditRecord={() => {/* TODO: 편집 구현 */}}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          프로필 관리
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          개인 정보를 확인하고 수정할 수 있습니다.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                기본 정보
              </Typography>
              <Button
                variant={isEditing ? "contained" : "outlined"}
                startIcon={<SaveIcon />}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={loading}
              >
                {loading ? '저장 중...' : (isEditing ? '저장' : '수정')}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="이메일"
                  value={user?.email || ''}
                  disabled
                  size="medium"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="이름"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="출생년도"
                  name="birth_year"
                  type="number"
                  value={formData.birth_year}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="성별"
                  name="gender"
                  select
                  SelectProps={{ native: true }}
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  size="medium"
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="전화번호"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  size="medium"
                />
              </Grid>

              <Grid item xs={12} sm={6} component="div">
                <TextField
                  fullWidth
                  label="비상연락처"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  size="medium"
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Alert severity="info" sx={{ mt: 3 }}>
                정보를 수정한 후 저장 버튼을 클릭하세요.
              </Alert>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              계정 관리
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="large"
            >
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default ProfilePage
