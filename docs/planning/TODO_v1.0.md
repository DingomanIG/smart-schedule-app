# 📋 TODO 체크리스트

> 최종 업데이트: 2026-02-16 18:30

---

## ✅ 완료 (Phase 1-5 + 문서화)

### Phase 1: 기본 UI 구조
- [x] 프로젝트 생성 및 환경 세팅
- [x] 3-탭 레이아웃 (채팅/캘린더/리포트)
- [x] Header 및 Footer
- [x] 모바일 반응형

### Phase 2: Firebase 연동
- [x] Firebase 프로젝트 생성
- [x] Authentication (로그인/회원가입)
- [x] Firestore 초기화
- [x] 데모 모드 구현

### Phase 3: OpenAI 연동
- [x] OpenAI API 연동
- [x] 자연어 파싱 (parseSchedule)
- [x] 채팅 UI 연동

### Phase 4: 일정 CRUD
- [x] 일정 생성 (createEvent)
- [x] 일정 조회 (getEvents)
- [x] 일정 수정 (updateEvent)
- [x] 일정 삭제 (deleteEvent)

### Phase 5: 캘린더 뷰
- [x] react-calendar 연동
- [x] 월별 일정 표시
- [x] 날짜별 일정 목록
- [x] 일정 삭제 기능

### 📚 문서화 (NEW!)
- [x] **MASTER_GUIDE.md** - 프로젝트 전체 개요, 기술 스택, 비용/수익, 타임라인
- [x] **DEVELOPMENT_WORKFLOW.md** - Phase 1-8 상세 가이드, Claude Code 명령어
- [x] **DEPLOYMENT_CHECKLIST.md** - GitHub, Vercel, SEO, 애드센스, 수익화 전략

---

## 🔥 남은 작업

### Phase 6: 외부 서비스 (선택사항)
- [ ] Web3Forms 문의하기 폼
- [ ] Giscus 댓글 기능

### Phase 7: 애드센스 준비
- [ ] About 페이지
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Contact 페이지
- [ ] SEO 최적화 (메타 태그, sitemap)

### Phase 8: 배포 👈 다음 목표
- [ ] GitHub 업로드
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 도메인 연결 (선택)

---

## 📊 진행도

```
Phase 1: 기본 UI        ████████████████████ 100%
Phase 2: Firebase       ████████████████████ 100%
Phase 3: OpenAI         ████████████████████ 100%
Phase 4: 일정 CRUD      ████████████████████ 100%
Phase 5: 캘린더         ████████████████████ 100%
Phase 6: 외부 서비스    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 7: 애드센스       ░░░░░░░░░░░░░░░░░░░░   0%
Phase 8: 배포           ░░░░░░░░░░░░░░░░░░░░   0%
문서화: 가이드 3개      ████████████████████ 100%

전체: ███████████████░░░░░  75%
```

---

## 🎯 MVP 완성도

- [x] 서버 실행
- [x] 채팅 UI
- [x] AI 파싱
- [x] 일정 저장
- [x] 캘린더
- [ ] 배포

**5/6 완료** (83%)

---

## 🚀 다음 단계

### 옵션 1: 바로 배포하기 (권장)
```bash
# MVP 완성되었으니 바로 배포
claude-code "docs/DEPLOYMENT_CHECKLIST.md 참고해서 Vercel 배포 준비해줘"
```

### 옵션 2: 애드센스 준비 먼저
```bash
# 15개 페이지 만들기
claude-code "docs/DEVELOPMENT_WORKFLOW.md의 Phase 7을 구현해줘 (about, privacy, terms, faq, contact 페이지)"
```

### 옵션 3: 외부 서비스 추가
```bash
# 문의하기 + 댓글
claude-code "docs/DEVELOPMENT_WORKFLOW.md의 Phase 6을 구현해줘 (Web3Forms, Giscus)"
```

---

## 📚 활용 가이드

### 개발 진행
1. **docs/MASTER_GUIDE.md** 읽기 (10분) - 전체 프로젝트 이해
2. **docs/DEVELOPMENT_WORKFLOW.md** 따라하기 - Phase별 구현
3. **Claude Code 명령어 복사** - 각 Phase의 명령어 실행

### 배포 및 수익화
1. **docs/DEPLOYMENT_CHECKLIST.md** - GitHub → Vercel
2. **SEO 최적화** - Search Console, 사이트맵
3. **애드센스 신청** - 승인 조건 체크
4. **수익화 전략** - SNS 마케팅, 블로그, 커뮤니티

### 예상 수익 (6개월)
- 1개월: DAU 100명 → 월 $70
- 3개월: DAU 500명 → 월 $390
- 6개월: DAU 1000명 → 월 $790
