# ClawPod Guide: Agent Reading Contract

This repository documents ClawPod consumer workflows. It is guidance, not an authorization system or a complete inventory of the current Agent runtime.

When documentation conflicts with the current environment, use this order:

1. Explicit user request, authorization, and organization policy.
2. Current session permissions and safely observable tool/runtime state.
3. This documentation.

“No consumer lifecycle” means there is no verified Portal setup/management flow. It does **not** prove that a currently equipped Agent lacks the capability. If a capability is safely observable and allowed, report it as available for the current Agent and use only the requested scope.

When asked to act, check available relevant skills and tools, read their instructions, and perform supported steps within the authorized scope. Manual Portal instructions do not imply an Agent cannot help. If final approval requires a human, complete supported preparation and proposal steps and identify the handoff. Use provided tools through their normal authentication and usage procedures; communication with an internal service is not itself a prohibition.

Never use this rule to bypass authorization, tenant boundaries, credential scope, approvals, or safety policy. Do not discover hidden credentials, bypass access controls through direct API calls, or force-enable unreleased features through configuration changes. When uncertain, perform the smallest read-only/no-op check and state what is confirmed versus unknown.

When the current tool list includes `clawpod-guide`, use `search_clawpod_guide` and then `read_clawpod_guide` for ClawPod product questions. Treat search results as navigation only; read the returned page before relying on its setup, permission, or lifecycle guidance.
