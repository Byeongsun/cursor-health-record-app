# 카카오 로그인 설정 가이드

## 1단계: 카카오 개발자 콘솔 설정

### 1.1 카카오 개발자 콘솔 접속
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인

### 1.2 애플리케이션 생성
1. "내 애플리케이션" 클릭
2. "애플리케이션 추가하기" 클릭
3. 애플리케이션 이름: `헬스케어 다이어리`
4. "저장" 클릭

### 1.3 플랫폼 설정
1. 생성된 애플리케이션 클릭
2. "플랫폼" > "Web 플랫폼 등록" 클릭
3. 사이트 도메인: `http://localhost:5174` 입력
4. "저장" 클릭

### 1.4 카카오 로그인 활성화
1. "제품 설정" > "카카오 로그인" 클릭
2. "카카오 로그인 활성화" ON
3. "동의항목" 클릭
4. 필요한 동의항목 설정:
   - 닉네임 (필수)
   - 이메일 (선택)
   - 프로필 사진 (선택)

### 1.5 Redirect URI 설정
1. "카카오 로그인" > "Redirect URI" 클릭
2. "URI 추가" 클릭
3. 다음 URI 추가:
   ```
   https://rkidyixevbnqkogcvhhy.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback
   ```
4. "저장" 클릭

### 1.6 REST API 키 확인
1. "앱 설정" > "앱 키" 클릭
2. **REST API 키** 복사 (Client ID로 사용)

## 2단계: Supabase 설정

### 2.1 Supabase 대시보드 접속
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 (rkidyixevbnqkogcvhhy)

### 2.2 카카오 OAuth 설정
1. "Authentication" > "Providers" 클릭
2. "Kakao" 섹션에서:
   - ✅ **Enable Kakao provider** 체크
   - **Client ID**: 카카오 개발자 콘솔에서 복사한 REST API 키 입력
   - **Client Secret**: 카카오는 Client Secret이 없으므로 비워둠
   - **Redirect URL**: `https://rkidyixevbnqkogcvhhy.supabase.co/auth/v1/callback` (자동 생성됨)

### 2.3 설정 저장
1. "Save" 클릭
2. 설정이 저장되었는지 확인

## 3단계: 테스트

### 3.1 카카오 로그인 테스트
1. 브라우저에서 `http://localhost:5174` 접속
2. 로그인 페이지에서 "카카오 로그인" 버튼 클릭
3. 카카오 인증 페이지로 리다이렉트되는지 확인
4. 카카오 계정으로 로그인
5. 대시보드로 자동 이동되는지 확인

### 3.2 문제 해결
- **"Unsupported provider" 에러**: Supabase에서 카카오 OAuth가 비활성화됨
- **리다이렉트 에러**: Redirect URI 설정 확인
- **권한 에러**: 카카오 개발자 콘솔에서 동의항목 설정 확인

## 4단계: 완료 확인

✅ **카카오 로그인이 정상 작동하는지 확인**
- 카카오 인증 페이지로 리다이렉트
- 인증 완료 후 대시보드로 이동
- 사용자 정보 정상 표시

---

**참고:** 카카오는 Client Secret이 없으므로 Supabase에서 Client Secret 필드는 비워두세요.



