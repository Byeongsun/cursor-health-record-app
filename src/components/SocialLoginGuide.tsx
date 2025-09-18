// 소셜 로그인 설정 가이드 컴포넌트 (개발 환경에서만 사용)
import React from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Link,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Google as GoogleIcon,
  Chat as KakaoIcon,
  CheckCircle as CheckIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material'

const SocialLoginGuide: React.FC = () => {
  // 프로덕션 환경에서는 렌더링하지 않음
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <Alert severity="info" sx={{ mb: 3, border: '2px dashed #ccc' }}>
      <AlertTitle>소셜 로그인 설정 (개발 환경 전용)</AlertTitle>
      <Typography variant="body2" sx={{ mb: 2 }}>
        소셜 로그인을 사용하려면 각 플랫폼에서 OAuth 설정을 완료해야 합니다.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          href="https://console.cloud.google.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mr: 1, mb: 1 }}
        >
          Google Cloud Console 열기
        </Button>
        <Button
          variant="outlined"
          startIcon={<KakaoIcon />}
          href="https://developers.kakao.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mr: 1, mb: 1 }}
        >
          카카오 개발자 콘솔 열기
        </Button>
        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mb: 1 }}
        >
          Supabase 대시보드 열기
        </Button>
      </Box>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">🚀 빠른 설정 가이드 (5분 완료)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="1. Google Cloud Console에서 새 프로젝트 생성"
                secondary="프로젝트 이름: health-record-app"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="2. OAuth consent screen 설정"
                secondary="External 선택, 앱 이름: 헬스케어 다이어리"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="3. OAuth 2.0 클라이언트 ID 생성"
                secondary="Web application, 리다이렉트 URI 추가"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="4. 리다이렉트 URI (복사해서 사용)"
                secondary="https://rkidyixevbnqkogcvhhy.supabase.co/auth/v1/callback"
                sx={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="5. Supabase에서 Google OAuth 활성화"
                secondary="Authentication > Providers > Google"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">📱 카카오 로그인 설정</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            카카오 로그인을 사용하려면 카카오 개발자 콘솔에서 설정을 완료해야 합니다.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<KakaoIcon />}
            href="https://developers.kakao.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2 }}
          >
            카카오 개발자 콘솔 열기
          </Button>
          <Typography variant="body2" color="text.secondary">
            <strong>상세 가이드:</strong> <code>KAKAO_LOGIN_SETUP.md</code> 파일을 참고하세요.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">❌ 문제 해결</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>redirect_uri_mismatch 에러:</strong> 리다이렉트 URI가 정확한지 확인
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>access_denied 에러:</strong> OAuth consent screen에서 Test users에 본인 이메일 추가
          </Typography>
          <Typography variant="body2">
            <strong>기타 문제:</strong> 브라우저 캐시 삭제 후 다시 시도
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Alert>
  )
}

export default SocialLoginGuide
