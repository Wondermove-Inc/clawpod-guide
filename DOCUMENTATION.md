# ClawPod 문서 운영 가이드

이 저장소는 공개 GitHub 저장소 `Wondermove-Inc/clawpod-guide`에서 관리하는 ClawPod 소비자·Agent용 제품 문서입니다.

## 문서 원칙

- ClawPod를 하나의 제품으로 설명합니다. 구현 저장소, 내부 서비스, 배포 구조는 소비자 문서에 노출하지 않습니다.
- 사용자의 목표부터 씁니다. 기능 설명보다 “무엇을 완료할 수 있는가”를 먼저 보여 줍니다.
- 모든 작업 가이드는 준비물, Portal 단계, 정상 결과, 문제 해결과 되돌리기 경로를 포함합니다.
- 권한, 요금제, 기능 지원 범위가 결과에 영향을 주면 해당 조건을 명시합니다.
- Secret, access token, 내부 URL, 고객 데이터, 미출시 기능은 문서와 예시에 넣지 않습니다.
- 확인하지 않은 동작은 추측해 작성하지 않습니다. 제품 화면과 지원되는 Agent release를 확인한 뒤 공개합니다.

## 독자

| 독자 | 문서가 해결할 질문 |
| --- | --- |
| 팀 구성원 | Agent와 대화하고 결과물을 받으려면 어떻게 하나요? |
| 조직 관리자 | Agent, credential, 사용자, 권한을 어떻게 관리하나요? |
| Agent | 현재 사용자의 역할과 환경에서 어떤 작업을 안내할 수 있나요? |

## Agent 문서 해석 원칙

문서의 기능 제공 상태는 공식 Portal consumer lifecycle을 설명하는 기준입니다. Agent runtime에 실제로 존재하는 tool·권한·연결 상태를 완전하게 부정하는 기준이 아닙니다. Agent는 현재 session에서 안전하게 확인할 수 있는 capability와 사용자 승인·조직 policy를 문서보다 우선해 판단하되, 권한 우회나 secret·내부 API·설정 변경으로 기능을 만들어내면 안 됩니다.

이 원칙의 사용자용 상세 문서는 [Agent가 문서를 읽고 판단하는 방법](guides/agent-document-reading.mdx), machine-readable 진입점은 `AGENTS.md`와 `llms.txt`입니다.

## 문서 구조

- `index.mdx`: 제품 소개와 시작 경로
- `start/`: 첫 사용 경험
- `concepts/`: Agent, 조직, credential처럼 이해가 필요한 개념
- `capabilities/`: Agent가 할 수 있는 모든 사용자 노출 기능과 활성화 조건
- `guides/`: 반복 업무를 끝내는 방법
- `help/`: 오류, 제한, 복구와 지원 요청
- `_templates/`: 새 페이지 작성 템플릿

## 검증과 게시

이 저장소가 ClawPod 소비자·Agent용 문서의 공개 source of truth입니다. Mintlify 배포와 사람·Agent의 Markdown 탐색은 이 저장소의 `docs.json`과 문서를 기준으로 합니다.

새 문서는 [작업 가이드 템플릿](_templates/task-guide.mdx)에서 시작합니다.

## Portal UI 문구 동기화

클릭 경로에서 Portal의 실제 화면 문구를 인용할 때는 다음 표식을 씁니다. 표식은 Mintlify에 표시되지 않고, 그 사이의 문구만 독자에게 표시됩니다.

```mdx
**<!-- ui-label: nav.agents -->에이전트<!-- /ui-label -->**
```

Portal 저장소에서 한국어 i18n을 바꾼 뒤에는 Portal 저장소 루트에서 아래 순서로 실행합니다.

```bash
node scripts/export-ui-labels.mjs
node scripts/sync-ui-labels.mjs
node scripts/export-ui-labels.mjs --check
node scripts/sync-ui-labels.mjs --check
```

- 첫 명령은 문서에서 실제로 참조하는 키만 `ui-labels.ko.json`에 생성합니다. 키가 사라졌거나 문자열이 아니면 실패합니다.
- 두 번째 명령은 표식 내부의 문구를 현재 i18n 값으로 갱신합니다. 문서 본문은 정적 Markdown으로 남으므로, 동기화 전에라도 읽을 수 있습니다.
- `ui-labels.ko.json`과 `sync-ui-labels.mjs`는 문서 저장소에도 유지합니다. Portal 변경 저장소에서는 export·sync 검사를 실행해 생성 사전을 갱신한 뒤, 바뀐 문서를 이 저장소로 반영합니다.

## README 목차 자동 생성

`README.md`는 직접 고치지 않습니다. `docs.json`의 navigation과 각 문서의 frontmatter title을 읽어 생성합니다.

```bash
node scripts/generate-readme.mjs
node scripts/generate-readme.mjs --check
```

새 페이지를 navigation에 넣거나 제목을 바꾼 뒤에는 첫 명령으로 README를 갱신합니다. CI는 두 번째 명령으로 생성 결과가 최신인지 확인합니다.

## Capability catalog 원칙

Agent의 기능은 Portal에 처음부터 보이는 메뉴만을 뜻하지 않습니다. Skill, tool, channel, automation, memory, browser, device, media, model provider처럼 설치·연결·권한 부여 뒤에 사용할 수 있는 기능도 모두 catalog에 기록합니다.

각 capability 페이지에는 반드시 다음을 적습니다.

1. 사용자에게 주는 결과와 제한
2. 필요한 Agent release, 조직 권한, 요금제 또는 운영자 설정
3. 설치·연결·활성화 방법과 정상 동작 확인법
4. Agent가 할 수 있는 일과 사용자 확인이 필요한 일
5. 중지·제거·권한 회수 방법

코드에만 존재하는 test, 개발, 운영 복구 경로는 소비자 기능으로 단정하지 않습니다. 공개 여부가 확정되지 않은 항목은 공개 문서에 노출하지 않고, 지원 정책을 먼저 결정합니다.

전수 작성 진행과 완료 기준은 [capability coverage](/CAPABILITY-COVERAGE)에서 관리합니다.
