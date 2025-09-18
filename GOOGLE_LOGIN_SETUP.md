# 구글 로그인 설정 가이드 (단계별)

## 1단계: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. Google 계정으로 로그인

## 2단계: 프로젝트 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: `health-record-app` (또는 원하는 이름)
4. "만들기" 클릭
5. 프로젝트가 생성될 때까지 대기 (1-2분)

## 3단계: OAuth 동의 화면 설정
1. 왼쪽 메뉴에서 "APIs & Services" > "OAuth consent screen" 클릭
2. "External" 선택 후 "CREATE" 클릭
3. 다음 정보 입력:
   - **App name**: `헬스케어 다이어리`
   - **User support email**: 본인 이메일
   - **Developer contact information**: 본인 이메일
4. "SAVE AND CONTINUE" 클릭
5. "Scopes" 페이지에서 "SAVE AND CONTINUE" 클릭
6. "Test users" 페이지에서 "ADD USERS" 클릭
   - 본인 이메일 추가
   - "SAVE AND CONTINUE" 클릭
7. "Summary" 페이지에서 "BACK TO DASHBOARD" 클릭

## 4단계: OAuth 2.0 클라이언트 ID 생성
1. 왼쪽 메뉴에서 "APIs & Services" > "Credentials" 클릭
2. "CREATE CREDENTIALS" > "OAuth 2.0 Client IDs" 클릭
3. Application type: "Web application" 선택
4. Name: `헬스케어 다이어리 웹 클라이언트`
5. Authorized redirect URIs에서 "ADD URI" 클릭
6. 다음 URI 추가:
   ```
   https://rkidyixevbnqkogcvhhy.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback
   ```
7. "CREATE" 클릭
8. **중요**: 생성된 Client ID와 Client Secret을 복사해서 메모장에 저장

## 5단계: Supabase에서 Google OAuth 설정
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Authentication" > "Providers" 클릭
4. "Google" 찾아서 클릭
5. "Enable Google provider" 토글을 ON으로 변경
6. 다음 정보 입력:
   - **Client ID**: 4단계에서 복사한 Client ID
   - **Client Secret**: 4단계에서 복사한 Client Secret
7. "Save" 클릭

## 6단계: 테스트
1. 브라우저에서 `http://localhost:5174` 접속
2. 로그인 페이지에서 "Google로 로그인" 버튼 클릭
3. Google 로그인 창이 열리면 본인 계정으로 로그인
4. 대시보드로 리다이렉트되는지 확인

## 문제 해결

### "redirect_uri_mismatch" 에러가 발생하는 경우:
- Google Cloud Console에서 Authorized redirect URIs에 정확한 URI가 추가되었는지 확인
- URI는 정확히 `https://rkidyixevbnqkogcvhhy.supabase.co/auth/v1/callback` 이어야 함

### "access_denied" 에러가 발생하는 경우:
- OAuth consent screen에서 Test users에 본인 이메일이 추가되었는지 확인
- 앱이 아직 검토 중인 경우, Test users만 로그인 가능

### 기타 문제:
- 브라우저 캐시 삭제 후 다시 시도
- Google Cloud Console에서 설정이 저장되었는지 확인
- Supabase에서 Google provider가 활성화되었는지 확인

## 완료 확인
✅ Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성 완료
✅ Supabase에서 Google OAuth 설정 완료
✅ 브라우저에서 Google 로그인 테스트 성공

이제 Google 로그인이 정상적으로 작동해야 합니다!
