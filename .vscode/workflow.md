# Sharetribe Development & Deployment Workflow

This document defines the strict dual-track development workflow for the **Lineup Bridge** marketplace application. The AI agent and developer must reference this file before making code modifications or performing deployments.

---

## 🏗️ Environment Architecture

Our architecture separates the codebase into two completely isolated tracks. Code and console data are blended dynamically at **runtime** based on Environment Variables.

| Track | Git Branch | Local Environment | Sharetribe Console | Hosting Platform (Render) | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Development** | `dev` | `localhost:3000` | **Dev Console** | `lineup-bridge-staging.onrender.com` | Safe sandbox testing and active feature development. |
| **Production** | `main` | *N/A* | **Live Console** | `lineup-bridge-live.onrender.com` | Production environment serving real users and live payments. |

---

## 🛠️ Step-by-Step Development Loop

### 1. Active Feature Development (Localhost)
* Always ensure you are on the `dev` branch before writing code:
  ```bash
  git checkout dev
  ```
* Run your local development server to test UI changes interactively:
  ```bash
  yarn run dev
  ```
* **Local Scope:** `localhost:3000` reads environmental credentials matching the **Sharetribe Dev Console**. No real user accounts or production transactions can be corrupted.

### 2. Testing on Staging (The Dress Rehearsal)
* When code changes are verified locally, push your updates to the remote `dev` branch:
  ```bash
  git add .
  git commit -m "feat: descriptive message about code changes"
  git push origin dev
  ```
* **Staging Scope:** Render automatically detects the push to `dev`, compiles the code, and rolls it out to `lineup-bridge-staging.onrender.com`. Use this link to test your modifications in a live cloud environment.

### 3. Shipping to Production (Going Live)
* Once staging is confirmed perfect, merge the development track into the master production branch:
  ```bash
  git checkout main
  git merge dev
  git push origin main
  ```
* **Production Scope:** Render immediately detects changes to the `main` branch, initiates a clean build pipeline ignoring CSS order checks (`CI=false`), and updates `lineup-bridge-live.onrender.com`.
* Always switch your local machine terminal back to the development branch right after deploying:
  ```bash
  git checkout dev
  ```

---

## 🎨 No-Code Configuration Syncing (Sharetribe Console)

Because page content, layout components, and marketplace transaction categories are built using Sharetribe's visual tools instead of code files, follow this sequence:
1. Make and build structural content pages or listing fields within your Sharetribe **Test Environment Console**.
2. Click the built-in **"Copy changes to..."** button inside the Test Console workspace.
3. Distribute those identical configurations directly down to your **Dev Console** (so your local machine can see them) and up to your **Live Console** simultaneously.

---

## 📋 Render Infrastructure Configuration Notes

To prevent server initialization crashes on the **Starter (\$7/month)** container instance, ensure these variables are maintained:
* **Build Command:** `yarn install --production=false; yarn build`
* **Start Command:** `yarn run start`
* **`CI`:** `false` (Mandatory bypass to ignore Webpack CSS extraction ordering warnings).
* **`REACT_APP_MARKETPLACE_ROOT_URL`:** Must never contain a trailing slash (e.g., use `https://lineup-bridge-live.onrender.com`).