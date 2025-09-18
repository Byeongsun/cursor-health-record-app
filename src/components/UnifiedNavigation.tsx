import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Flag as FlagIcon,
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  MonitorHeart as MonitorHeartIcon,
  Bloodtype as BloodtypeIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from '../store/slices/authSlice'
import { store } from '../store'

type RootState = ReturnType<typeof store.getState>

interface UnifiedNavigationProps {
  onGoalSetting: () => void
  onNotificationCenter: () => void
  onNotificationSettings: () => void
  onCsvImport: () => void
  onDataExport: () => void
  onHealthRecord: (type: string) => void
  onBulkDelete: (type: string) => void
  onEditRecord: (record: any) => void
}

const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({
  onGoalSetting,
  onNotificationCenter,
  onNotificationSettings,
  onCsvImport,
  onDataExport,
  onHealthRecord,
  onBulkDelete,
  onEditRecord,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // 메뉴 상태 관리
  const [mainMenuAnchor, setMainMenuAnchor] = useState<null | HTMLElement>(null)
  const [dataMenuAnchor, setDataMenuAnchor] = useState<null | HTMLElement>(null)
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null)
  
  // Redux에서 데이터 가져오기
  const { unreadCount } = useSelector((state: RootState) => state.notifications)
  const { user, profile } = useSelector((state: RootState) => state.auth)

  // 메뉴 핸들러들
  const handleMainMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMainMenuAnchor(event.currentTarget)
  }

  const handleDataMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDataMenuAnchor(event.currentTarget)
  }

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMainMenuAnchor(null)
    setDataMenuAnchor(null)
    setSettingsMenuAnchor(null)
  }

  const handleLogout = () => {
    dispatch(signOut())
    handleMenuClose()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleMenuClose()
  }

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
    }}>
      <Toolbar sx={{ py: 1 }}>
        {/* 앱 제목 */}
        <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          🏥 헬스케어 다이어리
        </Typography>
        
        {/* 통합 네비게이션 메뉴들 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* 메인 메뉴 */}
          <Button
            color="inherit"
            startIcon={<MenuIcon />}
            onClick={handleMainMenuOpen}
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'auto',
              px: 2
            }}
          >
            메뉴
          </Button>
          <Menu
            anchorEl={mainMenuAnchor}
            open={Boolean(mainMenuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 200, mt: 1 }
            }}
          >
            <MenuItem onClick={() => handleNavigation('/dashboard')}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="대시보드" />
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/records')}>
              <ListItemIcon><ListIcon /></ListItemIcon>
              <ListItemText primary="전체 기록 보기" />
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/all-data')}>
              <ListItemIcon><BarChartIcon /></ListItemIcon>
              <ListItemText primary="전체 데이터 뷰" />
            </MenuItem>
          </Menu>

          {/* 데이터 관리 메뉴 */}
          <Button
            color="inherit"
            startIcon={<AssessmentIcon />}
            onClick={handleDataMenuOpen}
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'auto',
              px: 2
            }}
          >
            데이터 관리
          </Button>
          <Menu
            anchorEl={dataMenuAnchor}
            open={Boolean(dataMenuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                minWidth: 280, 
                mt: 1,
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 2
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                건강 데이터 입력
              </Typography>
            </Box>
            <MenuItem onClick={() => onHealthRecord('blood_pressure')}>
              <ListItemIcon><MonitorHeartIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="혈압 측정 기록" 
                secondary="수축기/이완기 혈압과 맥박"
              />
            </MenuItem>
            <MenuItem onClick={() => onHealthRecord('blood_sugar')}>
              <ListItemIcon><BloodtypeIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="혈당 측정 기록" 
                secondary="공복/식후 혈당 수치"
              />
            </MenuItem>
            <MenuItem onClick={() => onHealthRecord('weight')}>
              <ListItemIcon><ScaleIcon color="success" /></ListItemIcon>
              <ListItemText 
                primary="체중 측정 기록" 
                secondary="체중과 BMI 계산"
              />
            </MenuItem>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                데이터 관리
              </Typography>
            </Box>
            <MenuItem onClick={onCsvImport}>
              <ListItemIcon><UploadIcon color="info" /></ListItemIcon>
              <ListItemText 
                primary="CSV 파일 가져오기" 
                secondary="엑셀 파일로 데이터 일괄 입력"
              />
            </MenuItem>
            <MenuItem onClick={onDataExport}>
              <ListItemIcon><DownloadIcon color="success" /></ListItemIcon>
              <ListItemText 
                primary="데이터 내보내기" 
                secondary="PDF/Excel 보고서 생성"
              />
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/records')}>
              <ListItemIcon><ListIcon color="action" /></ListItemIcon>
              <ListItemText 
                primary="전체 기록 관리" 
                secondary="모든 기록 보기, 편집, 삭제"
              />
            </MenuItem>
          </Menu>

          {/* 알림 센터 */}
          <IconButton 
            color="inherit" 
            onClick={onNotificationCenter}
            sx={{ position: 'relative', mx: 1 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ fontSize: '2rem' }} />
            </Badge>
          </IconButton>

          {/* 설정 메뉴 */}
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={handleSettingsMenuOpen}
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'auto',
              px: 2
            }}
          >
            설정
          </Button>
          <Menu
            anchorEl={settingsMenuAnchor}
            open={Boolean(settingsMenuAnchor)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { 
                minWidth: 250, 
                mt: 1,
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 2
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                건강 관리 설정
              </Typography>
            </Box>
            <MenuItem onClick={onGoalSetting}>
              <ListItemIcon><FlagIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="목표 설정" 
                secondary="건강 목표를 설정하고 관리하세요"
              />
            </MenuItem>
            <MenuItem onClick={onNotificationSettings}>
              <ListItemIcon><NotificationsIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="알림 설정" 
                secondary="알림 시간과 종류를 설정하세요"
              />
            </MenuItem>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                계정 관리
              </Typography>
            </Box>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="프로필 관리" 
                secondary="개인정보를 수정하세요"
              />
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText 
                primary="로그아웃" 
                secondary="계정에서 로그아웃합니다"
                primaryTypographyProps={{ color: 'error.main' }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default UnifiedNavigation
