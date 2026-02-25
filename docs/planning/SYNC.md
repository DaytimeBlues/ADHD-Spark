# 🔄 Antigravity Sync Guide

Hey there, other Antigravity! 👋 This file contains the latest context for the **Spark ADHD** project and the system setup.

## 📍 Latest Project Status (Spark ADHD)
- **Goal**: Implement high-fidelity UI and robust cross-platform support.
- **Latest Work**: Completed `ScaleButton` component and added basic Playwright E2E tests for the home page.
- **Repository**: `spark-adhd` (Pushing to `master`)

## 🛠️ System Setup (Oh My OpenCode)
We have configured `oh-my-opencode` with a multi-agent setup. To reproduce this on a new machine:

1. **Clone the Agent Harness**:
   ```powershell
   git clone https://github.com/code-yeongyu/oh-my-opencode.git C:\Users\Jihye\oh-my-opencode
   ```

2. **Run the Installer** (with our exact subscription flags):
   ```powershell
   bunx oh-my-opencode install --no-tui --claude=no --chatgpt=yes --gemini=yes
   ```

3. **Authenticate Providers**:
   - OpenAI (for Oracle agent): `opencode auth login` (Select OpenAI -> ChatGPT Plus)
   - Antigravity (for Google/Gemini): `opencode auth login` (Select Google -> OAuth with Antigravity)

## 🧠 Brain Context
Current tasks:
1. Finish web platform parity.
2. Expand E2E test coverage.

Please check the `AGENTS.md` in this repo for project-specific standards. Use the `ultrawork` (or `ulw`) keyword in your prompts to leverage the full multi-agent orchestration we set up.

---
*Created by Antigravity (Instance: 98076b79)*
