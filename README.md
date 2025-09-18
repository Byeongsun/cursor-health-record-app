# 🏥 Health Record App

어르신을 위한 건강 기록 관리 웹 애플리케이션

## 📋 프로젝트 개요

이 프로젝트는 고혈압, 당뇨병 등 만성질환을 가진 어르신들이 쉽게 건강 수치를 기록하고 관리할 수 있도록 설계된 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 인증 시스템
- 이메일/비밀번호 로그인
- 구글 OAuth 로그인
- 카카오 OAuth 로그인 (설정 필요)

### 📊 건강 수치 기록
- **혈압 측정**: 수축기/이완기 혈압, 맥박
- **혈당 측정**: 공복/식후 혈당
- **체중 측정**: 일일 체중 기록
- **측정 시간과 입력 시간 분리**: 실제 측정한 시간과 데이터 입력 시간 구분

### 📈 데이터 시각화
- 혈압, 혈당, 체중 차트
- 최근 7일/14일간 데이터 추이
- 건강 상태 위험도 표시

### 🎯 목표 관리
- 건강 목표 설정 (혈압, 혈당, 체중)
- 목표 달성률 추적
- 시각적 진행률 표시

### 🔔 알림 시스템
- 측정 리마인더
- 위험 수치 알림
- 일일 요약 알림
- 사용자 맞춤 알림 설정

### 📁 데이터 관리
- CSV 파일 일괄 가져오기
- 데이터 템플릿 다운로드
- 측정 시간과 입력 시간 구분 지원

## 🛠️ 기술 스택

### Frontend
- **React 19.1.1** - UI 라이브러리
- **TypeScript 5.8.3** - 타입 안전성
- **Vite 7.1.2** - 빌드 도구
- **Material-UI 7.3.2** - UI 컴포넌트
- **Redux Toolkit 2.9.0** - 상태 관리
- **React Router DOM 7.9.1** - 라우팅
- **Recharts** - 차트 라이브러리

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL 데이터베이스
  - 인증 시스템
  - 실시간 데이터베이스

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd health-record-app
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
`.env` 파일을 생성하고 다음 변수들을 설정하세요:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 확인**
http://localhost:5173 에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── charts/         # 차트 컴포넌트들
│   ├── CSVImportDialog.tsx
│   ├── GoalSetting.tsx
│   ├── NotificationCenter.tsx
│   └── ...
├── hooks/              # 커스텀 React 훅
│   └── useAuth.ts
├── lib/                # 유틸리티 라이브러리
│   └── supabase.ts
├── pages/              # 페이지 컴포넌트
│   ├── DashboardPage.tsx
│   ├── HealthRecordPage.tsx
│   └── LoginPage.tsx
├── store/              # Redux 스토어
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── healthRecordsSlice.ts
│       ├── goalsSlice.ts
│       ├── notificationsSlice.ts
│       └── ...
├── utils/              # 유틸리티 함수
│   ├── csvParser.ts
│   └── healthValidation.ts
└── App.tsx
```

## 🎨 디자인 원칙

### 어르신 친화적 디자인
- **큰 글씨**: 모든 텍스트가 읽기 쉽도록 크게 설정
- **높은 대비**: 색상 대비를 높여 가독성 향상
- **직관적 네비게이션**: 단순하고 명확한 메뉴 구조
- **명확한 피드백**: 버튼 클릭, 폼 제출 등에 대한 명확한 시각적 피드백

### 접근성
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상에만 의존하지 않는 정보 전달

## 📊 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `health_records` - 건강 기록
- `health_goals` - 건강 목표
- `notifications` - 알림
- `notification_settings` - 알림 설정

## 🔧 개발 가이드

### 코드 스타일
- TypeScript strict 모드 사용
- ESLint + Prettier 설정
- 컴포넌트별 단일 책임 원칙
- 커스텀 훅을 통한 로직 분리

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정, 의존성 등
```

## 🚀 배포

### 프로덕션 빌드
```bash
npm run build
```

### Vercel 배포 (권장)
1. Vercel 계정 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 자동 배포 설정

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

프로젝트에 대한 질문이나 문제가 있으시면 이슈를 생성해 주세요.

---

**건강한 하루 되세요! 💚**