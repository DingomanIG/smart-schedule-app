# docs/ 폴더 안내

이 폴더는 **개발 전용** 문서를 관리합니다. 배포 코드를 넣지 마세요.

## 폴더 구조

```
docs/
├── README.md                    # 이 파일
├── plan/                        # 기획 (인간용)
│   ├── feature-list.md          # 기능 체크리스트 + 버전 로드맵
│   ├── PLAN_IMPROVEMENT_IDEAS_v1.1.md  # 아이디어 상세 카탈로그 (61개)
│   ├── PLAN_TODO_v1.0.md        # 단기 목표 + 수익 추적
│   └── *.md                     # 개별 기능 기획서
├── prompt/                      # 구현 프롬프트 (AI용)
│   ├── component-base.md        # 컴포넌트 공통 규칙 프롬프트
│   └── *.md                     # 개별 가이드/워크플로
├── design/                      # 디자인 관련
│   ├── design-tokens.md         # 색상, 간격, 폰트 규칙
│   └── ui-patterns.md           # 반복되는 UI 패턴 정리
└── log/                         # 작업 기록
    └── changelog.md             # 주요 변경사항 기록
```

## 폴더별 용도

| 폴더 | 용도 | 대상 |
|------|------|------|
| `plan/` | 기능 기획, 로드맵, 아이디어 | 인간 |
| `prompt/` | 구현 규칙, 컴포넌트 가이드, AI 프롬프트 | AI (Claude) |
| `design/` | 디자인 토큰, UI 패턴, 스타일 규칙 | 인간 + AI |
| `log/` | 변경 이력, 작업 기록 | 인간 |

## 파일 네이밍 규칙

- 기획서: `FEATURE_NAME_v1.0.md` (대문자, 버전 접미사)
- 가이드: `GUIDE_NAME_v1.0.md`
- 기타: `kebab-case.md`
