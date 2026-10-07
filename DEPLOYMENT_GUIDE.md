# 🌐 StyleHub: Free Online Cloud Deployment Guide

This guide walks you through hosting your **StyleHub Luxury Atelier** website online so anyone in the world can visit it from their phone or computer.

---

## Architecture Overview
- **Frontend (HTML/CSS/JS)**: Hosted on **Vercel** or **Netlify** or **GitHub Pages** (Free)
- **Backend (Python Flask)**: Hosted on **Render.com** (Free)
- **Database (MySQL)**: Hosted on **Aiven** or **Railway** or **TiDB Cloud** (Free MySQL Cloud Database)

---

## Part 1: Free Online MySQL Database (Aiven or TiDB Cloud)

1. Go to [aiven.io](https://aiven.io/) or [tidbcloud.com](https://tidbcloud.com/) and create a free account.
2. Create a free **MySQL** database cluster named `stylehub`.
3. Note your connection details:
   - `Host` (e.g. `mysql-xyz.aivencloud.com`)
   - `Port` (e.g. `12345`)
   - `User` (e.g. `avnadmin`)
   - `Password` (e.g. `your_secret_password`)
   - `Database` (`stylehub`)

---

## Part 2: Deploy the Flask Backend to Render (Free)

1. Push your project or the `Backend/` folder to **GitHub**.
2. Go to [render.com](https://render.com/) and sign in with GitHub.
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Set the following settings:
   - **Name**: `stylehub-api`
   - **Root Directory**: `Backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Under **Environment Variables**, add the database credentials from Part 1:
   - `DB_HOST`: your cloud MySQL host
   - `DB_PORT`: your cloud MySQL port
   - `DB_USER`: your cloud MySQL user
   - `DB_PASSWORD`: your cloud MySQL password
   - `DB_NAME`: `stylehub`
7. Click **Deploy Web Service**.
8. Render will give you a public URL, for example:
   `https://stylehub-api.onrender.com`

---

## Part 3: Deploy Frontend to Vercel or Netlify (Free)

1. In `front end/js/main.js`, update the `API_URL`:
   ```javascript
   const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
       ? "http://127.0.0.1:5000"
       : "https://stylehub-api.onrender.com"; // Your live Render backend URL
   ```
2. Go to [vercel.com](https://vercel.com/) or [netlify.com](https://netlify.com/).
3. Drag & drop the `front end` folder (or connect your GitHub repo with Root Directory set to `front end`).
4. Click **Deploy**!
5. You will get your live custom URL (e.g., `https://stylehub-atelier.vercel.app`) that works on any phone, tablet, or PC worldwide!

---

## Part 4: Linux Server Firewall & Security Hardening (VPS / Cloud VM)

If running on a dedicated Linux VPS (Ubuntu/Debian on AWS EC2, DigitalOcean, Linode):
1. Audit active ports and apply zero-lockout firewall policies using the included automated script:
   ```bash
   chmod +x setup_firewall_security.sh
   sudo ./setup_firewall_security.sh
   ```
2. Refer to the complete security specification in [`SERVER_SECURITY.md`](SERVER_SECURITY.md) for loopback bindings (MySQL `127.0.0.1:3306`, Gunicorn `127.0.0.1:5000`), anti-abuse SSH rate-limiting, and cloud security group rules.
