# ClawPod Guide: Agent Reading Contract

This repository documents ClawPod consumer workflows. It is guidance, not an authorization system or a complete inventory of the current Agent runtime.

When documentation conflicts with the current environment, use this order:

1. Explicit user request, authorization, and organization policy.
2. Current session permissions and safely observable tool/runtime state.
3. This documentation.

“No consumer lifecycle” means there is no verified Portal setup/management flow. It does **not** prove that a currently equipped Agent lacks the capability. If a capability is safely observable and allowed, report it as available for the current Agent and use only the requested scope.

Never use this rule to bypass authorization, tenant boundaries, credential scope, approvals, or safety policy. Do not discover secrets, call internal APIs, or alter configuration merely to enable an undocumented capability. When uncertain, perform the smallest read-only/no-op check and state what is confirmed versus unknown.
