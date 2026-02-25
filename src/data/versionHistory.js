/**
 * versionHistory.js - 앱 버전 이력 및 변경사항 데이터
 *
 * 배포 전에 새 버전 항목을 배열 맨 앞에 추가한다.
 * 앱은 VERSIONS[0]을 현재 버전으로 사용한다.
 */

export const VERSIONS = [
  {
    version: '1.1.0',
    date: '2026-02-25',
    major: [
      '업데이트 알림 팝업 기능 추가',
      '버전 표시 기능 추가',
    ],
    minor: [
      'UI 미세 조정',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-02-20',
    major: [
      '스마트 스케줄 정식 출시',
      'AI 채팅 일정 등록',
      '일상/펫/업무/육아/행사 카테고리',
    ],
    minor: [
      '다크 모드 지원',
      '한/영 언어 전환',
    ],
  },
]

/** 현재 버전 (배열 첫 번째 항목) */
export const CURRENT_VERSION = VERSIONS[0].version
