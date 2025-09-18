# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - [https://supabase.com](https://supabase.com)에 접속
   - "Start your project" 클릭하여 계정 생성 또는 로그인

2. **새 프로젝트 생성**
   - "New Project" 버튼 클릭
   - 프로젝트 이름: `health-record-app`
   - 데이터베이스 비밀번호: 안전한 비밀번호 설정 (기록해두세요!)
   - 지역: `Northeast Asia (Seoul)` 선택
   - "Create new project" 클릭

3. **프로젝트 생성 완료 대기**
   - 약 2-3분 소요
   - "Project is ready" 메시지가 나타나면 완료

## 2단계: 데이터베이스 스키마 설정

1. **SQL Editor로 이동**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

2. **스키마 실행**
   - `supabase/schema.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭하여 실행

3. **테이블 생성 확인**
   - 왼쪽 메뉴에서 "Table Editor" 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - `users`
     - `health_records`
     - `health_goals`
     - `medications`

## 3단계: 환경 변수 설정

1. **API 키 복사**
   - 왼쪽 메뉴에서 "Settings" > "API" 클릭
   - 다음 정보를 복사:
     - Project URL
     - Project API keys > anon public

2. **환경 변수 파일 생성**
   - 프로젝트 루트에 `.env` 파일 생성
   - 다음 내용 추가:

```env
VITE_SUPABASE_URL=여기에_Project_URL_붙여넣기
VITE_SUPABASE_ANON_KEY=여기에_anon_public_키_붙여넣기
```

## 4단계: 인증 설정

### 이메일 인증 설정
1. "Authentication" > "Settings" 이동
2. "Email" 섹션에서:
   - "Enable email confirmations" 체크
   - "Enable email change confirmations" 체크

### Google OAuth 설정 (선택사항)
1. [Google Cloud Console](https://console.cloud.google.com)에서:
   - 새 프로젝트 생성
   - "APIs & Services" > "Credentials" 이동
   - "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs에 추가:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
2. Supabase에서:
   - "Authentication" > "Providers" 이동
   - Google 활성화
   - Client ID와 Client Secret 입력

### 카카오 OAuth 설정 (선택사항)
1. [카카오 개발자 콘솔](https://developers.kakao.com)에서:
   - 애플리케이션 생성
   - "플랫폼" > "Web" 추가
   - "제품 설정" > "카카오 로그인" 활성화
   - Redirect URI 추가:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
2. Supabase에서:
   - "Authentication" > "Providers" 이동
   - 카카오 활성화
   - REST API 키 입력

## 5단계: 테스트

1. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

2. **브라우저에서 테스트**
   - `http://localhost:5174` 접속
   - 회원가입/로그인 테스트
   - 데이터베이스 연결 확인

## 문제 해결

### 일반적인 문제들:
- **CORS 에러**: Supabase 대시보드에서 도메인 설정 확인
- **RLS 에러**: 데이터베이스 정책 확인
- **인증 에러**: 환경 변수 설정 확인

### 지원:
- [Supabase 문서](https://supabase.com/docs)
- [Supabase 커뮤니티](https://github.com/supabase/supabase/discussions)



