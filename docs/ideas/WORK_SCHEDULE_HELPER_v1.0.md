# 업무 스케줄 도우미 기획서 v1.0

> 태스크 블록, 집중 시간대, 회의 관리, 마감 기반 우선순위 스케줄링 도우미
> 작성일: 2026-02-19 | 버전: 1.0

---

## 개요

사용자의 업무 환경(근무 시간, 회의 패턴, 집중 시간대 등)을 파악하여 하루 업무 스케줄을 자동으로 설계하는 도우미. 타임블록킹 기법과 집중/휴식 리듬을 활용하여 생산성을 극대화한다.

**핵심 가치**
- 생산성 극대화 — 집중 시간대에 핵심 업무 배치, 저에너지 시간에 정리 업무 배치
- 마감 관리 — 데드라인 역산으로 태스크 분배, 긴급도/중요도 기반 우선순위
- 번아웃 방지 — 포모도로 기반 집중/휴식 리듬, 점심 후 회복 시간 자동 확보

---

## 도우미 ID

| ID | 도우미 | 설명 | 우선순위 |
|----|--------|------|----------|
| H04 | 업무 스케줄 도우미 | 태스크 블록, 집중 시간대, 마감 관리 | Phase 2 확장 도우미 |

> SCHEDULE_HELPER_PLAN_v1.0.md의 도우미 체계에 H04로 편입

---

## 도우미 유형

**유형 A: 채팅 기반 도우미**

```
채팅 입력 → 트리거 감지 → 온보딩 Q&A → GPT 호출 → 배치 카드 → Firestore 저장
```

일상 도우미(H01)와 동일한 채팅 기반 온보딩 + GPT 생성 플로우를 따른다.
추가로 HelperSelector에서도 진입 가능하며, 전용 탭 뷰로 태스크 관리 기능을 제공한다.

---

## 테마 색상

| 속성 | 값 | 비고 |
|------|-----|------|
| 테마 색상 | **indigo** | 전문적/생산성 이미지 |
| 카드 border | `border-indigo-300` / `dark:border-indigo-600` | |
| 등록 버튼 | `bg-indigo-600` | |
| HelperSelector 아이콘 | `text-indigo-500` (Briefcase) | lucide-react |

> 기존 green(H01), teal(H11), red(H12) 와 충돌 없음

---

## 카테고리 정의

| 카테고리 | 한글 | 색상 | 아이콘 | 설명 |
|----------|------|------|--------|------|
| `deepwork` | 딥워크 | indigo | | 핵심 업무 집중 블록 |
| `meeting` | 회의 | violet | | 회의/미팅/콜 |
| `admin` | 정리 | gray | | 이메일, 문서 정리, 보고서 |
| `planning` | 기획 | blue | | 기획, 브레인스토밍, 전략 |
| `communication` | 소통 | cyan | | 1:1, 팀 소통, 피드백 |
| `break` | 휴식 | green | | 점심, 커피, 산책 |
| `commute` | 출퇴근 | slate | | 출근/퇴근 이동 |
| `deadline` | 마감 | red | | 마감 임박 긴급 태스크 |

### 카테고리 뱃지 스타일

```javascript
const WORK_CATEGORY_STYLES = {
 deepwork: {
 bg: 'bg-indigo-50 dark:bg-indigo-900/20',
 text: 'text-indigo-600 dark:text-indigo-400',
 badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
 icon: '',
 },
 meeting: {
 bg: 'bg-violet-50 dark:bg-violet-900/20',
 text: 'text-violet-600 dark:text-violet-400',
 badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
 icon: '',
 },
 admin: {
 bg: 'bg-gray-50 dark:bg-gray-900/20',
 text: 'text-gray-600 dark:text-gray-400',
 badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
 icon: '',
 },
 planning: {
 bg: 'bg-blue-50 dark:bg-blue-900/20',
 text: 'text-blue-600 dark:text-blue-400',
 badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
 icon: '',
 },
 communication: {
 bg: 'bg-cyan-50 dark:bg-cyan-900/20',
 text: 'text-cyan-600 dark:text-cyan-400',
 badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
 icon: '',
 },
 break: {
 bg: 'bg-green-50 dark:bg-green-900/20',
 text: 'text-green-600 dark:text-green-400',
 badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
 icon: '',
 },
 commute: {
 bg: 'bg-slate-50 dark:bg-slate-900/20',
 text: 'text-slate-600 dark:text-slate-400',
 badge: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
 icon: '',
 },
 deadline: {
 bg: 'bg-red-50 dark:bg-red-900/20',
 text: 'text-red-600 dark:text-red-400',
 badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
 icon: '',
 },
}
```

---

## 사용자 플로우

### 최초 온보딩

```
1. 채팅에서 "업무 스케줄 짜줘" 입력
 └─ 또는 도우미 선택 UI에서 "업무 도우미" 클릭

2. 온보딩 질문 (5~7개)
 ├─ "근무 형태가 어떻게 되세요?"
 │ → 사무직 / 재택근무 / 하이브리드 / 프리랜서 / 교대근무
 ├─ "출근 시간과 퇴근 시간은?"
 │ → 예: 9시 ~ 18시
 ├─ "오전/오후 중 더 집중이 잘 되는 시간대는?"
 │ → 오전 집중형 / 오후 집중형 / 차이 없음
 ├─ "오늘(또는 이번 주) 해야 할 주요 태스크를 알려주세요"
 │ → 예: "보고서 작성, 기획안 검토, 팀 미팅 2건, 이메일 정리"
 ├─ "마감이 급한 업무가 있나요?"
 │ → 예: "보고서 내일까지" / 없음
 ├─ "고정 회의가 있나요?"
 │ → 예: "오전 10시 팀미팅, 오후 3시 1:1" / 없음
 └─ "점심 시간은 몇 시에 드세요?"
 → 예: 12시 ~ 13시

3. AI가 하루 업무 스케줄 생성 (카드 목록)
 ├─ 09:00 출근 + 하루 계획 정리 (15분, admin)
 ├─ 09:15 이메일/메신저 확인 (30분, communication)
 ├─ 09:45 보고서 작성 — 딥워크 블록 1 (90분, deepwork)
 ├─ 10:00 팀 미팅 (60분, meeting) ← 고정 회의
 ├─ 11:00 보고서 작성 — 딥워크 블록 2 (60분, deepwork)
 ├─ 12:00 점심 식사 + 산책 (60분, break)
 ├─ 13:00 이메일 답신 + 메신저 정리 (30분, admin)
 ├─ 13:30 기획안 검토 (60분, planning)
 ├─ 14:30 커피 브레이크 (15분, break)
 ├─ 14:45 보고서 마무리 — 딥워크 블록 3 (75분, deadline)
 ├─ 15:00 1:1 미팅 (30분, meeting) ← 고정 회의
 ├─ 15:30 미팅 후속 정리 (15분, admin)
 ├─ 15:45 기획안 피드백 작성 (45분, planning)
 ├─ 16:30 팀 소통 + 협업 (30분, communication)
 ├─ 17:00 하루 마무리 + 내일 계획 (30분, admin)
 ├─ 17:30 남은 이메일 처리 (30분, admin)
 └─ 18:00 퇴근

4. 사용자 확인/수정
 ├─ "전체 등록" → 일괄 Firestore 저장
 ├─ 개별 카드 수정 → "회의 30분 뒤로"
 ├─ 개별 카드 제거 → [−] 버튼
 └─ "다시 짜줘" → 재생성
```

### 후속 사용 (매일 반복)

```
1. 매일 아침 빠른 재생성
 └─ "오늘 업무 스케줄 짜줘" → 이전 프로필 유지, 태스크만 새로 입력

2. 프로필 수정
 ├─ "퇴근 시간 19시로 바꿔줘"
 ├─ "내일부터 재택이야"
 └─ "집중 시간대를 오후로 바꿔줘"

3. 태스크 추가
 └─ "오후에 긴급 미팅 하나 추가해줘"

4. 주간 모드 (멀티데이)
 └─ "이번 주 업무 스케줄 짜줘" → 월~금 5일치 생성
```

---

## 온보딩 데이터 구조

### 프로필 스키마

```javascript
// Firestore: helperProfiles/{userId}_H04
const workProfile = {
 helperId: 'H04',
 userId: 'uid',
 preferences: {
 // 근무 환경
 workType: 'office', // 'office' | 'remote' | 'hybrid' | 'freelance' | 'shift'
 workStart: '09:00', // 근무 시작
 workEnd: '18:00', // 근무 종료
 lunchStart: '12:00', // 점심 시작
 lunchDuration: 60, // 점심 시간 (분)

 // 집중 패턴
 focusPeak: 'morning', // 'morning' | 'afternoon' | 'none'
 deepWorkDuration: 90, // 딥워크 블록 길이 (분) — 기본 90분
 breakInterval: 90, // 집중 후 휴식 간격 (분)
 breakDuration: 15, // 휴식 시간 (분) — 기본 15분

 // 고정 일정
 fixedMeetings: [
 { day: 'weekday', time: '10:00', duration: 60, title: '팀 미팅' },
 { day: 'mon,wed', time: '15:00', duration: 30, title: '1:1 미팅' },
 ],

 // 출퇴근
 hasCommute: true,
 commuteTime: 30, // 편도 소요 시간 (분)

 // 업무 스타일
 emailCheckTimes: ['morning', 'afterlunch'], // 이메일 확인 타이밍
 planningTime: 'morning', // 하루 계획 시간 'morning' | 'evening' | 'both'
 },
 updatedAt: Timestamp
}
```

### 일일 태스크 입력 구조

```javascript
// 온보딩 시 매번 새로 입력받는 데이터
const dailyTasks = {
 tasks: [
 {
 title: '보고서 작성',
 estimatedMinutes: 180, // 예상 소요 시간
 priority: 'high', // 'high' | 'medium' | 'low'
 deadline: '2026-02-20', // 마감일 (null이면 없음)
 category: 'deepwork', // 자동 분류 또는 사용자 선택
 },
 {
 title: '기획안 검토',
 estimatedMinutes: 60,
 priority: 'medium',
 deadline: null,
 category: 'planning',
 },
 ],
 fixedEvents: [
 { time: '10:00', duration: 60, title: '팀 미팅' },
 { time: '15:00', duration: 30, title: '1:1 미팅' },
 ],
}
```

---

## GPT 프롬프트 설계

### 시스템 프롬프트

```
[시스템 프롬프트]
너는 업무 생산성 전문 스케줄 설계사야.
사용자의 근무 환경과 태스크 목록을 바탕으로 최적의 하루 업무 스케줄을 JSON 배열로 생성해.

규칙:
- 타임블록킹 원칙 적용: 같은 종류의 작업을 묶어 컨텍스트 스위칭 최소화
- 딥워크(집중 업무)는 사용자의 최고 집중 시간대에 우선 배치
- 딥워크 블록은 최소 60분, 최대 120분 단위로 설계
- 딥워크 블록 사이에 반드시 15분 이상 휴식 삽입
- 고정 회의는 움직이지 말고, 회의 전후 15분 버퍼 확보
- 회의 직후에는 후속 정리(admin) 15분 배치
- 마감 임박(deadline) 태스크는 최우선 배치, category를 "deadline"으로 표시
- 점심 직후 30분은 저강도 업무(admin, communication) 배치 (식곤증 대응)
- 하루 시작과 끝에 계획/마무리 시간 15~30분 확보
- 이메일/메신저 확인은 하루 2~3회로 묶어서 배치 (반응형 업무 최소화)
- 근무 시간 내 모든 시간이 채워지도록 배분 (공백 없이)

[사용자 프롬프트]
근무 형태: {workType}
근무 시간: {workStart} ~ {workEnd}
점심: {lunchStart}부터 {lunchDuration}분
집중 시간대: {focusPeak}
딥워크 블록: {deepWorkDuration}분
고정 회의: {fixedMeetings}
오늘 태스크: {tasks}
마감 급한 업무: {deadlineTasks}

[응답 형식]
{
 "action": "create_batch",
 "events": [
 {
 "title": "하루 계획 정리",
 "time": "09:00",
 "duration": 15,
 "category": "admin"
 },
 {
 "title": " 보고서 작성 — 딥워크 블록 1",
 "time": "09:15",
 "duration": 90,
 "category": "deepwork"
 },
 ...
 ]
}
```

### 주간 모드 프롬프트 추가 규칙

```
추가 규칙 (주간 모드):
- 월~금 5일치 스케줄 생성
- 고정 회의 요일 반영 (day 필드)
- 큰 태스크(>2시간)는 여러 날에 분산 배치
- 마감일 역산하여 작업 일정 자동 배분
- 금요일 오후는 다음 주 계획 + 주간 정리 시간 확보
- 각 날짜별로 events 배열에 date 필드 포함
```

---

## 스케줄링 로직 (프론트엔드 보조)

### 우선순위 알고리즘

```javascript
// GPT에게 전달하기 전, 태스크 정렬 도우미
function calculateTaskPriority(task) {
 let score = 0

 // 마감 긴급도 (0~40점)
 if (task.deadline) {
 const daysLeft = daysDifference(task.deadline, today)
 if (daysLeft <= 0) score += 40 // 오늘 마감
 else if (daysLeft === 1) score += 30 // 내일 마감
 else if (daysLeft <= 3) score += 20 // 3일 내
 else if (daysLeft <= 7) score += 10 // 1주 내
 }

 // 사용자 지정 우선순위 (0~30점)
 if (task.priority === 'high') score += 30
 else if (task.priority === 'medium') score += 15
 else score += 5

 // 예상 소요 시간 가중 (0~20점) — 큰 작업일수록 먼저 배치
 if (task.estimatedMinutes >= 180) score += 20
 else if (task.estimatedMinutes >= 120) score += 15
 else if (task.estimatedMinutes >= 60) score += 10
 else score += 5

 // 카테고리 가중 (0~10점)
 if (task.category === 'deepwork') score += 10
 else if (task.category === 'deadline') score += 10
 else if (task.category === 'planning') score += 5

 return score
}
```

### 집중 시간대 매핑

```javascript
const FOCUS_TIME_MAP = {
 morning: {
 peak: ['09:00', '12:00'], // 핵심 집중 시간
 secondary: ['14:00', '16:00'], // 보조 집중 시간
 lowEnergy: ['13:00', '14:00'], // 저에너지 시간 (점심 후)
 },
 afternoon: {
 peak: ['14:00', '17:00'],
 secondary: ['09:30', '11:30'],
 lowEnergy: ['13:00', '14:00'],
 },
 none: {
 peak: ['09:30', '11:30'],
 secondary: ['14:00', '16:00'],
 lowEnergy: ['13:00', '14:00'],
 },
}
```

### 타임블록 배치 원칙

```
┌────────────────── 하루 타임라인 ──────────────────┐
│ │
│ 09:00 ┬─ 하루 계획 정리 (admin, 15분) │
│ │ │
│ 09:15 ┬─ 이메일/메신저 1차 확인 (communication) │
│ │ │
│ 09:45 ┬─ 딥워크 블록 1 (90분) │ ← 오전 피크
│ │ · 최고 우선순위 태스크 배치 │
│ 11:15 ┬─ 휴식 (15분) │
│ │ │
│ 11:30 ┬─ 딥워크 블록 2 (60~90분) │
│ │ · 차순위 집중 태스크 │
│ 12:30 │ │
│ │ │
│ 12:00 ┬─ 점심 (60분) │
│ │ │
│ 13:00 ┬─ 저강도 업무 (admin/communication, 30분) │ ← 식곤증 구간
│ │ · 이메일, 메신저, 문서 정리 │
│ 13:30 ┬─ 회의 또는 기획 업무 (60~90분) │
│ │ │
│ 15:00 ┬─ 커피 브레이크 (15분) │
│ │ │
│ 15:15 ┬─ 딥워크 블록 3 (60~90분) │ ← 오후 피크
│ │ · 마감 임박 또는 남은 핵심 태스크 │
│ 16:45 ┬─ 팀 소통 + 협업 (30분) │
│ │ │
│ 17:15 ┬─ 하루 마무리 + 내일 계획 (30분, admin) │
│ │ · 오늘 진행 상황 정리 │
│ │ · 내일 태스크 목록 준비 │
│ 17:45 ┬─ 남은 이메일 처리 (15분) │
│ │ │
│ 18:00 └─ 퇴근 │
└────────────────────────────────────────────────────┘
```

---

## UI 설계

### 확인 카드 레이아웃

```
┌──────────────────────────────────────────────┐
│ 업무 스케줄 12개 일정 │ ← 헤더
│ ┌──────────────────────────────────────────┐ │
│ │ 09:00 하루 계획 정리 15분 정리 [−]│ │
│ │ 09:15 이메일 확인 30분 소통 [−]│ │
│ │ 09:45 보고서 작성 블록1 90분 딥워크[−]│ │ ← 딥워크 강조
│ │ 11:15 휴식 15분 휴식 [−]│ │
│ │ 11:30 팀 미팅 60분 회의 [−]│ │ ← 고정 회의
│ │ 12:30 점심 식사 60분 휴식 [−]│ │
│ │ 13:30 이메일 정리 30분 정리 [−]│ │
│ │ 14:00 기획안 검토 60분 기획 [−]│ │
│ │ 15:00 커피 브레이크 15분 휴식 [−]│ │
│ │ 15:15 보고서 마무리 75분 마감 [−]│ │ ← 마감 강조 (빨간)
│ │ 16:30 팀 소통 30분 소통 [−]│ │
│ │ 17:00 하루 마무리 30분 정리 [−]│ │
│ └──────────────────────────────────────────┘ │
│ │
│ 딥워크 3블록 (3시간 45분) · 회의 1건 (1시간) │ ← 요약 통계
│ │
│ [ 전체 등록] [ 취소] │ ← 액션 버튼
└──────────────────────────────────────────────┘
```

### 주간 모드 카드 레이아웃 (멀티데이)

```
┌──────────────────────────────────────────────┐
│ 주간 업무 스케줄 5일 · 60개 일정 │ ← 헤더
│ 2026-02-23 (월) ~ 2026-02-27 (금) │ ← 날짜 범위
│ (12개 일정 × 5일) │
│ ── 월요일 템플릿 ── │ ← 라벨
│ ┌──────────────────────────────────────────┐ │
│ │ 1일치 이벤트 표시 │ │
│ └──────────────────────────────────────────┘ │
│ [ 전체 등록] [ 취소] │
└──────────────────────────────────────────────┘
```

### 태스크 입력 UI (온보딩 4단계)

```
┌──────────────────────────────────────────────┐
│ 오늘 할 업무를 알려주세요 │
│ │
│ ┌──────────────────────────────────────────┐│
│ │ "보고서 작성, 기획안 검토, 팀 미팅, ││
│ │ 이메일 정리" ││
│ └──────────────────────────────────────────┘│
│ │
│ 또는 태스크를 직접 추가: │
│ │
│ ┌────────────┐ ┌──────┐ ┌──────┐ │
│ │ 태스크 이름 │ │ 소요 │ │ 우선 │ │
│ │ 보고서 작성 │ │ 3시간 │ │ 높음 │ [추가] │
│ └────────────┘ └──────┘ └──────┘ │
│ │
│ 등록된 태스크: │
│ 보고서 작성 (3시간) — 내일 마감 │
│ 기획안 검토 (1시간) │
│ 이메일 정리 (30분) │
│ │
│ [스케줄 생성 →] │
└──────────────────────────────────────────────┘
```

---

## 특수 기능

### 1. 회의 충돌 감지

고정 회의와 기존 캘린더 이벤트를 확인하여 딥워크 블록과 겹치지 않도록 자동 조정.

```javascript
// 기존 이벤트 조회 → 빈 시간대 파악 → 빈 시간에 딥워크 배치
const existingEvents = await getEventsForDate(userId, date)
const busySlots = existingEvents.map(e => ({
 start: e.startTime.toDate(),
 end: e.endTime.toDate(),
}))
// busySlots를 GPT 프롬프트에 전달하여 겹침 방지
```

### 2. 에너지 레벨 기반 배치

```
에너지 높음 (오전 피크) → 딥워크, 마감 태스크
에너지 보통 (오전 후반) → 회의, 기획
에너지 낮음 (점심 직후) → 이메일, 정리, 소통
에너지 회복 (오후 피크) → 딥워크 블록 추가
에너지 감소 (오후 후반) → 마무리, 내일 계획
```

### 3. 포모도로 변형 옵션

사용자가 원할 경우 딥워크 블록을 포모도로 단위로 세분화:

```
 보고서 작성 — 딥워크 (90분)
 → 포모도로 ON 시:
 ├─ 09:45 포모도로 1 (25분)
 ├─ 10:10 미니 휴식 (5분)
 ├─ 10:15 포모도로 2 (25분)
 ├─ 10:40 미니 휴식 (5분)
 └─ 10:45 포모도로 3 (25분) + 긴 휴식 (15분)
```

### 4. 재택/사무실 모드 분기

```javascript
const WORK_TYPE_ADJUSTMENTS = {
 office: {
 commuteIncluded: true, // 출퇴근 시간 포함
 meetingBuffer: 15, // 회의실 이동 버퍼
 lunchFlexible: false, // 점심 고정
 },
 remote: {
 commuteIncluded: false, // 출퇴근 없음 → 추가 딥워크 가능
 meetingBuffer: 5, // 화상회의 전환 시간만
 lunchFlexible: true, // 점심 유연
 bonusDeepWork: 30, // 출퇴근 절약 시간 → 딥워크 추가
 },
 hybrid: {
 // 요일별 office/remote 분기
 schedule: { mon: 'office', tue: 'remote', wed: 'office', thu: 'remote', fri: 'remote' },
 },
 freelance: {
 commuteIncluded: false,
 flexibleHours: true, // 근무 시간 유연
 clientMeetings: true, // 클라이언트 미팅 고려
 },
}
```

---

## 이벤트 스키마

```javascript
// 기존 events 컬렉션에 저장
{
 userId: 'uid',
 title: ' 보고서 작성 — 딥워크 블록 1',
 startTime: Timestamp, // 시작 시간
 endTime: Timestamp, // 종료 시간
 category: 'deepwork', // 업무 카테고리
 location: null,
 attendees: [],
 createdAt: Timestamp,
 createdVia: 'helper',
 helperId: 'H04',
}
```

---

## 채팅 인식 패턴

### 트리거 감지

```javascript
// src/utils/helperParser.js에 추가
export function isWorkHelperTrigger(text) {
 if (!text) return false
 const lower = text.toLowerCase().trim()
 return /업무\s*(스케줄|일정|계획)|일\s*(스케줄|일정)|태스크\s*(관리|정리|블록)|타임\s*블록|work\s*(schedule|plan)|task\s*(block|plan)/.test(lower)
}
```

### 인식 패턴 예시

```
// 도우미 활성화 트리거
"업무 스케줄 짜줘"
"오늘 업무 일정 짜줘"
"업무 계획 세워줘"
"태스크 블록 만들어줘"
"타임블록 스케줄"
"이번 주 업무 일정"
"work schedule"

// 프로필 수정
"퇴근 시간 변경"
"재택 모드로 바꿔"
"점심 시간 바꿔줘"

// 태스크 추가
"오후에 긴급 미팅 추가"
"보고서 마감 내일까지"
```

---

## 필요한 파일 변경

### 신규 파일

| 파일 | 설명 | 난이도 |
|------|------|--------|
| `src/components/WorkScheduleCard.jsx` | 업무 확인 카드 (indigo 테마) | 보통 |
| `src/data/workDefaults.js` | 카테고리 스타일, 근무 타입 기본값, 집중 시간대 매핑 | 쉬움 |

### 수정 파일

| 파일 | 변경 내용 | 난이도 |
|------|----------|--------|
| `src/services/openai.js` | 업무 도우미 시스템 프롬프트 `generateWorkSchedule()` 추가 | 보통 |
| `src/utils/helperParser.js` | `isWorkHelperTrigger()` 트리거 함수 추가 | 쉬움 |
| `src/components/HelperSelector.jsx` | 업무 도우미 메뉴 항목 추가 | 쉬움 |
| `src/components/ChatInterface.jsx` | 업무 온보딩 플로우 + 트리거 감지 추가 | 보통 |
| `src/App.jsx` | 탭 추가 (필요 시) | 쉬움 |
| `src/locales/ko.js` | i18n 키 추가 (~15개) | 쉬움 |
| `src/locales/en.js` | i18n 키 추가 (~15개) | 쉬움 |

---

## i18n 키

```javascript
// src/locales/ko.js에 추가
helperWork: '업무 도우미',
helperWorkStart: '업무 스케줄을 만들어 드릴게요! 몇 가지 질문에 답해주세요.',
helperWorkAskWorkType: '근무 형태가 어떻게 되세요?',
helperWorkAskHours: '출근 시간과 퇴근 시간을 알려주세요.',
helperWorkAskFocus: '오전/오후 중 더 집중이 잘 되는 시간대는?',
helperWorkAskTasks: '오늘 해야 할 주요 업무를 알려주세요.',
helperWorkAskDeadline: '마감이 급한 업무가 있나요?',
helperWorkAskMeetings: '고정 회의가 있나요? (시간과 이름)',
helperWorkAskLunch: '점심 시간은 몇 시에 드세요?',
helperWorkGenerating: '최적의 업무 스케줄을 설계 중...',
helperWorkBatchSaved: '업무 스케줄이 캘린더에 등록되었습니다!',
helperWorkCancelled: '업무 스케줄 생성이 취소되었습니다.',
helperWorkError: '업무 스케줄 생성 중 오류가 발생했습니다.',
helperWorkDeepWorkBlocks: '딥워크 블록',
helperWorkMeetingCount: '회의',
helperWorkSummary: '{deepwork}블록 ({hours}) · 회의 {meetings}건',

// 카테고리 라벨
workCategoryDeepwork: '딥워크',
workCategoryMeeting: '회의',
workCategoryAdmin: '정리',
workCategoryPlanning: '기획',
workCategoryCommunication: '소통',
workCategoryBreak: '휴식',
workCategoryCommute: '출퇴근',
workCategoryDeadline: '마감',

// 근무 형태 라벨
workTypeOffice: '사무직',
workTypeRemote: '재택근무',
workTypeHybrid: '하이브리드',
workTypeFreelance: '프리랜서',
```

---

## 장기 로드맵

### Phase 1: MVP — 채팅 기반 하루 업무 스케줄 생성

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 1 | 카테고리 스타일/기본값 데이터 (`workDefaults.js`) | 쉬움 |
| 2 | 트리거 함수 추가 (`helperParser.js`) | 쉬움 |
| 3 | 온보딩 플로우 (ChatInterface 확장) | 보통 |
| 4 | GPT 프롬프트 설계 (`openai.js`) | 보통 |
| 5 | 확인 카드 (`WorkScheduleCard.jsx`) | 보통 |
| 6 | HelperSelector 메뉴 항목 추가 | 쉬움 |
| 7 | i18n 키 추가 | 쉬움 |
| 8 | 테스트 및 다듬기 | 보통 |

### Phase 2: 고도화

| 기능 | 설명 |
|------|------|
| 주간 모드 | 월~금 5일치 업무 스케줄 일괄 생성 |
| 기존 일정 충돌 감지 | 캘린더 기존 이벤트와 겹침 경고 + 자동 조정 |
| 포모도로 모드 | 딥워크 블록을 25분+5분 단위로 세분화 옵션 |
| 태스크 입력 UI | 텍스트 자유 입력 외 구조화된 태스크 추가 폼 |

### Phase 3: 스마트 기능

| 기능 | 설명 |
|------|------|
| 완료 추적 | 태스크별 체크, 일일 달성률 표시 |
| 패턴 학습 | "매주 월요일 팀미팅" 자동 감지 → 고정 회의 자동 등록 |
| 에너지 트래킹 | 시간대별 완료율 분석 → 집중 시간대 자동 보정 |
| 다른 도우미 연동 | 일상(H01) 도우미와 통합 — 출퇴근, 식사 시간 공유 |

### Phase 4: 팀 기능 (미래)

| 기능 | 설명 |
|------|------|
| 팀 캘린더 연동 | 팀원 빈 시간대 조회 → 회의 최적 시간 제안 |
| 프로젝트 뷰 | 여러 태스크를 프로젝트별 그룹화 |
| 주간 리포트 | 업무 시간 분석 — 딥워크 vs 회의 비율, 달성률 |

---

## 기술 의사결정

### 온보딩 방식: 매일 질문 vs 프로필 재사용

| 방식 | 장점 | 단점 |
|------|------|------|
| **매일 전체 질문** | 매일 정확한 스케줄 | 매일 5~7개 질문은 번거로움 |
| **프로필 저장 + 태스크만 입력 (MVP 채택)** | 프로필 1회 설정, 매일 태스크만 입력 | 프로필 변경 시 별도 수정 필요 |
| **완전 자동 (미래)** | 질문 없음, 패턴 학습 | 높은 기술 복잡도 |

**MVP 결정**: 프로필(근무 형태, 시간, 집중 패턴)은 1회 설정 후 저장, 매일 태스크 목록만 새로 입력

### GPT 프롬프트 전략

| 방식 | 장점 | 단점 |
|------|------|------|
| **완전 AI 생성** | 유연, 개인화 높음 | 비용, 응답 시간, 품질 불안정 |
| **규칙 기반 + AI 미세조정 (MVP 채택)** | 일관된 품질, 빠른 응답 | 유연성 약간 제한 |

**MVP 결정**: 타임블록 배치 규칙을 시스템 프롬프트에 상세히 명시하여 GPT의 자유도를 제한하고 일관된 품질 확보

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| 태스크 소요 시간 추정 부정확 | 사용자 입력 기반, 과대 추정 시 GPT가 자동 조정 |
| 근무 시간 내 태스크가 안 들어감 | 우선순위별 정렬 후 하위 태스크 "내일로 이월" 표시 |
| 돌발 회의로 스케줄 깨짐 | Phase 2에서 일정 재조정 기능 제공 |
| 일상 도우미(H01)와 시간대 겹침 | 기존 이벤트 조회로 충돌 감지 (Phase 2) |
| 사용자가 매일 태스크 입력을 번거로워함 | 빠른 음성/텍스트 입력 + "어제와 같은 스케줄" 옵션 |

---

## MVP 완료 기준

- [ ] 채팅에서 "업무 스케줄 짜줘" 입력 시 온보딩 질문 시작
- [ ] 근무 형태, 시간, 집중 패턴 프로필 Firestore 저장/로드
- [ ] 태스크 목록 입력 후 GPT가 최적 업무 스케줄 생성
- [ ] 딥워크 블록이 집중 시간대에 우선 배치됨 확인
- [ ] 고정 회의가 반영되고 전후 버퍼가 확보됨 확인
- [ ] 마감 임박 태스크가 deadline 카테고리로 강조 표시
- [ ] 점심 후 저강도 업무 배치 확인
- [ ] "전체 등록" 클릭 시 Firestore에 일괄 저장
- [ ] 캘린더에서 생성된 업무 스케줄 확인 가능
- [ ] 개별 카드 제거 가능
- [ ] 라이트/다크 모드 UI 정상
- [ ] 한국어/영어 전환 정상

---

## 관련 문서

- [스케줄 도우미 기획서](SCHEDULE_HELPER_PLAN_v1.0.md) — 도우미 시스템 전체 기획 (H04로 편입)
- [스케줄 도우미 제작 가이드](../guides/SCHEDULE_HELPER_DEV_GUIDE_v1.0.md) — 구현 표준 가이드
- [일상 도우미 구현 가이드](../guides/DAILY_HELPER_IMPLEMENTATION_v1.0.md) — H01 구현 참조 (동일 유형 A)
- [AI 인격 부여 기능](AI_PERSONA_FEATURE_v1.0.md) — Phase 4에서 연동 가능

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | 2026-02-19 | 최초 작성 — MVP(채팅 기반 업무 스케줄) + 장기 로드맵 |
