# Control map — GitHub Copilot in our organisation

Status: ✅ enforced · ⚠️ available but not set · ❓ unknown · 🔒 can't see (admin only)

| Layer | Control | Owner | Status |
|---|---|---|---|
| ① GitHub AI controls | Copilot features (chat, agents, cloud agent, code review) | PGGMNV org admin | ✅ |
| ① GitHub AI controls | Model availability + "Default availability" for new models | PGGMNV org admin | ❓ |
| ① GitHub AI controls | MCP servers in Copilot policy | PGGMNV org admin | ✅ |
| ① GitHub AI controls | Content exclusion | PGGMNV org admin | ❓ |
| ① GitHub AI controls | Audit log (agent actions) | PGGMNV org admin | 🔒 |
| ② Enterprise-managed settings | `permissions` / `sandbox` | PGGM enterprise admin (to confirm) | ⚠️ |
| ② Enterprise-managed settings | Default `model` / `fusionTier` | PGGM enterprise admin (to confirm) | ⚠️ |
| ② Enterprise-managed settings | MCP allow / deny lists | PGGM enterprise admin (to confirm) | ⚠️ |
| ③ VS Code device policies | ChatAgentMode · ChatToolsAutoApprove · ChatMCP | PGGM IT / device management (to confirm) | ⚠️ |
| Repository | preToolUse guardrail hook (`.github/hooks/`) — Step 4 | me (this lab) | |
| Repository | Branch ruleset on `main` — Step 5 | me (this lab) | |
| Repository | CI check `Test` (`.github/workflows/ci.yml`) | | ✅ |
