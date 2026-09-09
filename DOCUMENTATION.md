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

이 원칙의 사용자용 상세 문서는 [Agent가 문서를 읽고 판단하는 방법](./guides/agent-document-reading.mdx), machine-readable 진입점은 `AGENTS.md`와 `llms.txt`입니다.

## 문서 구조

- `index.mdx`: 제품 소개와 시작 경로
- `start/`: 첫 사용 경험
- `concepts/`: Agent, 조직, credential처럼 이해가 필요한 개념
- `capabilities/`: 사용자 기능과 준비 조건
- `guides/`: 반복 업무를 끝내는 방법
- `help/`: 오류, 제한, 복구와 지원 요청
- `_templates/`: 새 페이지 작성 템플릿

## 검증과 게시

이 저장소가 ClawPod 소비자·Agent용 문서의 공개 source of truth입니다. Docusaurus 배포와 사람·Agent의 Markdown 탐색은 이 저장소의 `docs.json`과 문서를 기준으로 합니다.

새 문서는 [작업 가이드 템플릿](./_templates/task-guide.mdx)에서 시작합니다.

## Portal UI 문구 동기화

클릭 경로에서 Portal의 실제 화면 문구를 인용할 때는 다음 표식을 씁니다. `span`의 속성은 화면에 표시되지 않고, 내부의 문구만 GitHub와 Docusaurus에서 표시됩니다.

```mdx
<strong><span data-ui-label="nav.agents">에이전트</span></strong>
```

Portal의 한국어 i18n을 바꾼 뒤에는 이 문서 저장소 루트에서 Portal 저장소 경로를 지정해 실행합니다.

```bash
node scripts/export-ui-labels.mjs --portal-root /path/to/portal-repository
node scripts/sync-ui-labels.mjs
node scripts/export-ui-labels.mjs --portal-root /path/to/portal-repository --check
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

공개 catalog에는 사용자 가이드로 설명할 수 있는 기능과 필요한 연결·권한·준비 조건을 기록합니다. 내부 구현 목록이나 제공 여부가 미확인인 기능은 공개 catalog에 추가하지 않습니다.

각 capability 페이지에는 반드시 다음을 적습니다.

1. 사용자에게 주는 결과와 제한
2. 필요한 Agent release, 조직 권한, 요금제 또는 운영자 설정
3. 설치·연결·활성화 방법과 정상 동작 확인법
4. Agent가 할 수 있는 일과 사용자 확인이 필요한 일
5. 중지·제거·권한 회수 방법

코드에만 존재하는 test, 개발, 운영 복구 경로는 소비자 기능으로 단정하지 않습니다. 공개 여부가 확정되지 않은 항목은 공개 문서에 노출하지 않고, 지원 정책을 먼저 결정합니다.

## 공개 범위와 기존 주소

플랫폼 전체 운영 절차, 내부 서비스·배포 구성, 실행 정책 기본값, 미확인 연동 목록은 공개 사용자 가이드에서 제외합니다. 고객에게 영향을 주는 제한은 숨기지 않고, 사용자에게 필요한 조건과 실제 확인 방법으로 설명합니다. 코드에 있다는 사실만으로 현재 배포 기능을 보장하지 않습니다.

기존 문서 주소는 짧은 안내 페이지로 유지할 수 있습니다. 해당 페이지는 `scripts/public-compatibility-pages.json`에 기록하고 navigation과 Agent 검색 인덱스에 포함하지 않습니다. 공개 레포의 파일과 Git 이력은 누구나 볼 수 있으므로 이 목록은 접근 통제 수단이 아닙니다. 내부 운영 내용을 다른 공개 폴더로 옮기지 않습니다.

## 링크 규칙과 검사

본문의 내부 링크는 `./` 또는 `../`로 시작하는 현재 파일 기준 상대 경로에 실제 확장자를 붙입니다. 예: `../guides/manage-agent.mdx`. GitHub에서 파일을 열 수 있고 Docusaurus는 문서 경로로 해석합니다. 안내문은 `:::note` 또는 `:::warning` 구문을 사용합니다. `docs.json`의 페이지 식별자에는 확장자를 붙이지 않습니다.

```bash
node scripts/check-links.mjs
node scripts/check-links.mjs --external
```

기본 검사는 파일·앵커·navigation·공개 검색 범위를 확인하며 CI에서 실행합니다. 외부 검사에서 확인 불가 항목이 있으면 종료 코드 2, 끊긴 링크는 종료 코드 1을 반환합니다. 외부 검사는 수동으로 실행합니다. 404·410은 실패로 처리하고 로그인·접근 차단(401·403)·요청 제한(429)·통신 오류는 확인 필요로 구분합니다. 응답을 확인하지 못한 링크를 삭제하거나 임의 주소로 바꾸지 않습니다.

## 로컬 사이트 확인

Node.js 22에서 다음 순서로 실행합니다.

```bash
npm ci
npm run check
npm run build
npm run serve
```

`npm run start`는 개발 중 미리보기입니다. `npm run build`는 Docusaurus 문서 빌드 후 전체 생성 페이지의 링크·앵커·정적 파일과 GitHub Pages 하위 경로를 검사합니다. 문서 내용은 기존 위치에 유지하며 `docs.json`은 도구에 독립적인 목차 데이터입니다. sidebar·README·Agent 검색은 모두 이 목차를 사용합니다.

## GitHub Pages 배포

레포 Settings → Pages → Build and deployment에서 Source를 **GitHub Actions**로 설정합니다. 조직에서 Pages가 제한되면 조직 소유자에게 허용을 요청하세요. 외부 앱 연결이나 개인 토큰을 레포에 넣을 필요가 없습니다.

PR에서는 검증과 빌드만 실행합니다. `main`에 병합하면 같은 검증이 통과한 결과물을 GitHub Pages에 배포합니다. Actions의 **Documentation checks and Pages**를 `main`에서 수동 실행해 다시 배포할 수도 있습니다. 배포 작업은 GitHub가 제공하는 일회성 인증을 사용하며 `github-pages` 환경 정책을 따릅니다.

기본 사이트 주소는 `https://wondermove-inc.github.io/clawpod-guide/`입니다. 이 주소는 설정상 배포 대상이며 최초 배포 성공 여부는 Actions의 deploy 결과로 확인합니다. 도메인을 변경하면 `docusaurus.config.js`의 `url`과 `baseUrl`, GitHub Pages의 도메인·DNS 설정을 함께 변경하고 링크를 재검증합니다.

Agent MCP가 읽는 공개 `guide-index.json`과 원본 문서 경로는 유지합니다. 사이트에는 같은 검색 인덱스로 동작하는 로컬 검색을 제공하며 외부 검색 서비스 계정이 필요하지 않습니다. `llms.txt`와 여기서 링크하는 원본 문서도 사이트 빌드에 포함합니다.
