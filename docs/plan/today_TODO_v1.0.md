육아 놀이시간이 주간캘리더에 2개로 등록됨

월간 캘린더 일 폰트 크게 안보임

캘릭더에 직접 일정 제작

"이 컴포넌트를 분석해서, 동일한 퀄리티의 다른 컴포넌트를 만들 때 사용할 프롬프트 템플릿을 작성해줘. 구조 패턴, 스타일링 규칙, 상태 관리 방식, 네이밍 컨벤션, 반드시 지켜야 할 제약 조건을 모두 포함해줘."


#	이슈	심각도
1	helperId 미전달 — handleBatchConfirm에서 addBatchEvents에 helperId 인자를 안 넘김. 저장된 이벤트에 helperId 필드 없음. 현재는 카테고리 기반 필터로 문제 없지만, 카테고리가 겹치면 필터링 오류 가능	중
2	멀티데이 성능 — 60일 저장 시 60번 순차 addBatchEvents 호출. Promise.all 병렬화 가능	중
3	주말 구분 없음 — 출퇴근 있는 사용자도 주말에 출퇴근 이벤트 생성됨 (업무 도우미는 worksWeekends 옵션으로 스킵함)	중
4	전체 이벤트 로딩 — DailyScheduleView가 2020~2030년 범위 전체 조회. 이벤트 수천 개 시 성능 저하	낮
5	카테고리 스타일 중복 — CATEGORY_STYLES가 BatchConfirmCard와 DailyScheduleView에 각각 인라인 정의. dailyDefaults.js로 통합 가능	낮
6	messages 상태 비대화 — 60일치 배치 데이터가 messages 배열에 포함되어 대화 길어지면 메모리 증가	낮