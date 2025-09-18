# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 초기 프로젝트 설정 및 기본 구조
- React + TypeScript + Vite 개발 환경 구성
- Material-UI 테마 설정 (어르신 친화적 디자인)

## [1.0.0] - 2024-01-XX

### Added
- 🔐 **인증 시스템**
  - 이메일/비밀번호 로그인
  - 구글 OAuth 로그인
  - 카카오 OAuth 로그인 (설정 필요)
  - Supabase 인증 통합

- 📊 **건강 수치 기록**
  - 혈압 측정 (수축기/이완기, 맥박)
  - 혈당 측정 (공복/식후)
  - 체중 측정
  - 측정 시간과 입력 시간 분리 기능

- 📈 **데이터 시각화**
  - 혈압 차트 (Line Chart)
  - 혈당 차트 (공복/식후 구분)
  - 체중 차트 (14일 추이)
  - 건강 상태 위험도 표시
  - 반응형 차트 디자인

- 🎯 **목표 관리 시스템**
  - 건강 목표 설정 (혈압, 혈당, 체중)
  - 목표 달성률 추적
  - 시각적 진행률 표시
  - 목표별 상세 설정

- 🔔 **알림 시스템**
  - 측정 리마인더 알림
  - 위험 수치 감지 알림
  - 일일 요약 알림
  - 사용자 맞춤 알림 설정
  - 알림 센터 (읽음 처리, 우선순위)

- 📁 **데이터 관리**
  - CSV 파일 일괄 가져오기
  - CSV 템플릿 다운로드
  - 데이터 검증 및 오류 처리
  - 측정 시간과 입력 시간 구분 지원

- 🎨 **UI/UX 개선**
  - 어르신 친화적 디자인
  - 큰 글씨 및 높은 대비
  - 직관적 네비게이션
  - 반응형 레이아웃
  - 접근성 개선

- 🏗️ **아키텍처**
  - Redux Toolkit 상태 관리
  - 컴포넌트 기반 아키텍처
  - 커스텀 훅 활용
  - TypeScript 타입 안전성
  - Cursor Rules 자동화

### Technical Details
- **Frontend**: React 19.1.1, TypeScript 5.8.3, Vite 7.1.2
- **UI Library**: Material-UI 7.3.2
- **State Management**: Redux Toolkit 2.9.0
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier

### Performance
- React useMemo를 통한 차트 성능 최적화
- 데이터 변경 감지 최적화
- 불필요한 리렌더링 방지

### Security
- Supabase RLS (Row Level Security) 적용
- 사용자별 데이터 격리
- 안전한 인증 토큰 관리

### Accessibility
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상에만 의존하지 않는 정보 전달
- 큰 글씨 및 높은 대비

---

## Version History

- **v1.0.0**: 초기 릴리즈 - 모든 핵심 기능 완성
- **v0.9.0**: CSV 가져오기 및 차트 최적화
- **v0.8.0**: 알림 시스템 및 목표 관리
- **v0.7.0**: 차트 및 데이터 시각화
- **v0.6.0**: 건강 기록 입력 시스템
- **v0.5.0**: 인증 시스템
- **v0.1.0**: 프로젝트 초기 설정



