# Deploying Prompt Code on DigitalOcean

This guide covers two deployment methods for Prompt Code on DigitalOcean:
1. **DigitalOcean App Platform** (Recommended — Fully managed PaaS, zero-ops, automatic SSL)
2. **DigitalOcean Droplet** (Virtual Machine — Docker & Docker Compose)

---

## Prerequisites

1. A [DigitalOcean Account](https://cloud.digitalocean.com).
2. Push your latest code to your GitHub repository:
   ```bash
   cd prompt-code
   git push origin main
   ```

---

## Method 1: DigitalOcean App Platform (Recommended)

Prompt Code already includes the App Platform configuration specification in [`.do/app.yaml`](.do/app.yaml) and a production multi-stage [`Dockerfile`](Dockerfile).

### Option A: Using the DigitalOcean Web Console (Simplest)

1. Log into your **DigitalOcean Cloud Console**.
2. Click **Create** (top right) $\rightarrow$ **Apps** (or go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)).
3. Under **Service Provider**, choose **GitHub**.
   - If prompted, authorize DigitalOcean to access your GitHub repositories.
4. Select repository: `Ishwarpatra/prompt-code` and branch `main`.
5. Check **Autodeploy code changes** so future pushes to `main` deploy automatically.
6. DigitalOcean App Platform will automatically detect the **Dockerfile** and `.do/app.yaml`.
7. **Environment Variables**:
   In the App settings or Environment configuration, verify or add:
   - `PORT`: `8080` (or DigitalOcean default)
   - `HOST`: `0.0.0.0`
   - `STATIC_DIR`: `/app/static`
   - `GEMMA_API_BASE`: `https://api.gemma.google/v1`
   - `GEMMA_API_KEY`: *(Optional)* Add your Gemma / Google AI Studio API key if using live inference. (Mark as **Secret** / `RUN_TIME`).
8. Select the **Basic Plan** (the `basic-xxs` $5/mo tier with 512MB RAM is ideal for the lightweight Rust binary).
9. Choose your region (e.g., `London (lon)` or `Frankfurt (fra)`).
10. Click **Create Resources** to build and launch your application.
11. Once built, DigitalOcean gives you an HTTPS URL (e.g., `https://prompt-code-xxxxx.ondigitalocean.app`).

### Option B: Using the `doctl` CLI

If you have the DigitalOcean CLI (`doctl`) installed and authenticated:
```bash
# 1. Authenticate doctl with your DigitalOcean API token
doctl auth init

# 2. Deploy directly using the spec file
cd prompt-code
doctl apps create --spec .do/app.yaml
```

To view deployment status:
```bash
doctl apps list
```

---

## Method 2: DigitalOcean Droplet (Docker & Docker Compose)

If you prefer deploying on a dedicated virtual machine ($4–$6/month Droplet):

### 1. Create Droplet
1. In DigitalOcean Console, click **Create** $\rightarrow$ **Droplets**.
2. Choose **Ubuntu 24.04 LTS** (or choose **Docker on Ubuntu** from the Marketplace tab).
3. Plan: Basic (Regular or Premium AMD/Intel, $4 - $6/month).
4. Select your datacenter region.
5. Add your SSH Key.
6. Click **Create Droplet**.

### 2. Connect and Setup Docker
SSH into your droplet:
```bash
ssh root@<YOUR_DROPLET_IP>
```

If Docker and Docker Compose are not yet installed:
```bash
apt update && apt install -y docker.io docker-compose-v2 git
systemctl enable --now docker
```

### 3. Clone Repository and Launch
```bash
# Clone the project
git clone https://github.com/Ishwarpatra/prompt-code.git
cd prompt-code

# Optional: configure secrets
cp .env.example .env
nano .env   # Enter your GEMMA_API_KEY if desired

# Build and start container in the background
docker compose up -d --build
```

### 4. Verify Application
```bash
curl http://localhost/api/health
```

You should see:
```json
{"status":"ok","models":["gemma-4-31b-it","gemma-4-26b-a4b-it"]}
```

Visit `http://<YOUR_DROPLET_IP>` in your browser.

---

## Post-Deployment Verification Checklist

- [ ] `GET /api/health` returns `{"status":"ok", ...}`
- [ ] UI loads correctly at `/`
- [ ] Form submission generates a recommended prompt template
- [ ] HTTPS is active (App Platform handles this automatically)
