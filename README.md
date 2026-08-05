# ClawPod 가이드

> 이 파일은 `docs.json`에서 자동 생성됩니다. 직접 수정하지 말고 `node scripts/generate-readme.mjs`를 실행하세요.

ClawPod의 소비자·Agent용 제품 문서입니다. 문서 작성·검증 규칙은 [DOCUMENTATION.md](DOCUMENTATION.md)를 참고하세요.
Agent라면 작업·설명 전에 [AGENTS.md](AGENTS.md)를 먼저 읽어 현재 runtime capability와 문서의 우선순위를 확인하세요.

## 목차

### 시작하기

- [ClawPod 시작하기](index.mdx)
- [가입, 로그인, 계정 복구](guides/start-account.mdx)
- [새 workspace 온보딩 완료하기](guides/complete-onboarding.mdx)
- [첫 Agent 만들기](start/first-agent.mdx)
- [Agent가 문서를 읽고 판단하는 방법](guides/agent-document-reading.mdx)

### 핵심 개념

- [Agent란 무엇인가요?](concepts/agent.mdx)

### Agent 기능

- [Agent 기능](capabilities/index.mdx)
- [기능 catalog](capabilities/catalog.mdx)
- [Portal 기능](capabilities/portal-features.mdx)
- [숨겨진 Agent 기능의 소비자 제공 상태](capabilities/consumer-availability.mdx)
- [Memory와 Agent 설정](capabilities/memory-and-configuration.mdx)
- [자동화와 Webhook](capabilities/automation-and-webhooks.mdx)
- [Dreaming과 memory 자동화 상태](capabilities/dreaming-and-memory-automation.mdx)
- [관리와 System 설정](capabilities/governance-and-settings.mdx)
- [관리형 runtime 기능](capabilities/managed-runtime.mdx)
- [Runtime capability 활성화 상태](capabilities/runtime-availability.mdx)
- [Agent image와 runtime](capabilities/agent-image-and-runtime.mdx)
- [Agent image 도구 목록](capabilities/agent-image-tool-inventory.mdx)
- [Agent 실행 capability matrix](capabilities/agent-execution-matrix.mdx)
- [연동 기능](capabilities/integrations.mdx)
- [Skills와 도구](capabilities/skills-and-tools.mdx)
- [Browser와 웹 작업](capabilities/browser-and-web.mdx)
- [Channels와 media](capabilities/channels-and-media.mdx)
- [Chat과 협업](capabilities/chat-and-collaboration.mdx)
- [Credential과 model](capabilities/credentials-and-models.mdx)
- [기능 설치와 활성화](capabilities/enablement.mdx)
- [Capability coverage](CAPABILITY-COVERAGE.mdx)

### 사용 가이드

- [Agent 상태와 설정 관리하기](guides/manage-agent.mdx)
- [Agent 생성 시 환경 변수 설정](guides/configure-agent-environment.mdx)
- [Chat Room에서 Agent와 협업하기](guides/use-chat-room.mdx)
- [Chat Archive 사용하기](guides/use-chat-archive.mdx)
- [AI Chat 사용하기](guides/use-ai-chat.mdx)
- [Skill Marketplace 사용하기](guides/manage-skills.mdx)
- [AI Key와 Credential 관리](guides/manage-credentials.mdx)
- [Secret과 민감한 값 다루기](guides/handle-secrets.mdx)
- [Provider와 model 선택](guides/select-models.mdx)
- [계정·조직·알림 설정 관리](guides/manage-account-and-organization.mdx)
- [알림 설정 관리](guides/manage-notifications.mdx)
- [IAM, Policy, Role 관리](guides/manage-iam.mdx)
- [Audit Log 확인과 내보내기](guides/use-audit-log.mdx)
- [Workspace 사용량과 System 상태 확인](guides/check-workspace-and-system.mdx)
- [Documents 화면 사용하기](guides/manage-workspace-documents.mdx)
- [파일 형식과 Agent artifact](guides/file-formats-and-artifacts.mdx)
- [Agent에게 Browser와 CLI 작업 요청하기](guides/use-browser-and-cli.mdx)
- [Tasks와 Milestone으로 작업 추적](guides/use-tasks-and-milestones.mdx)
- [회의록 만들기와 관리](guides/use-meeting-minutes.mdx)
- [Billing과 구독 관리](guides/manage-billing.mdx)
- [Agent Template 만들고 사용하기](guides/use-agent-templates.mdx)
- [Analytics로 Agent 운영 확인](guides/use-analytics.mdx)
- [Dashboard와 Costs 사용하기](guides/use-dashboard-and-costs.mdx)
- [계정 보안과 MFA 관리](guides/secure-your-account.mdx)
- [조직 만들기와 멤버·Agent 관리](guides/manage-organization.mdx)
- [조직 초대 수락하기](guides/accept-organization-invite.mdx)
- [Agent 만들기와 생성 전 검토](guides/create-agent.mdx)
- [Tenant 관리](guides/manage-tenants.mdx)
- [Agent Desktop과 대화 기록 보기](guides/use-agent-desktop.mdx)
- [Legal 문서 버전 관리](guides/manage-legal-documents.mdx)
- [SOUL.md, AGENTS.md와 Agent workspace 파일](guides/configure-agent-workspace-files.mdx)
- [HEARTBEAT.md와 주기 점검](guides/configure-heartbeat.mdx)
- [Webhook으로 Agent에게 이벤트 보내기](guides/send-webhook-to-agent.mdx)

### Agent 설정 파일

- [Agent 설정 파일 안내](workspace-files/index.mdx)
- [SOUL.md 작성하기](workspace-files/soul-md.mdx)
- [AGENTS.md 운영 지침](workspace-files/agents-md.mdx)
- [TOOLS.md tool 사용 규칙](workspace-files/tools-md.mdx)
- [MEMORY.md와 memory 폴더](workspace-files/memory-md.mdx)
- [BOOTSTRAP.md, IDENTITY.md, USER.md, HEARTBEAT.md](workspace-files/bootstrap-and-identity.mdx)

### Platform 관리자

- [가입 요청 관리](admin/registration-requests.mdx)
- [초대 코드 관리](admin/invite-codes.mdx)
- [Platform 언어 설정](admin/language-settings.mdx)
- [Portal 메뉴 노출 관리](admin/menu-visibility.mdx)
- [Model pricing 관리](admin/model-pricing.mdx)
- [Agent preset 관리](admin/agent-presets.mdx)
- [로그인 후 공지 관리](admin/announcements.mdx)
- [Platform plan 관리](admin/manage-plans.mdx)
- [Legacy Workflow route 안내](admin/workflows.mdx)

### 도움말

- [도움말](help/index.mdx)
- [Portal 기능 접근 지도](help/portal-feature-map.mdx)
