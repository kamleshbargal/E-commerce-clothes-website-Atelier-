# 🛡️ StyleHub Production Server: Linux Security, Network Port Audit & Firewall Hardening

**Role**: Senior Linux Systems Administrator & Cloud Security Engineer  
**Objective**: Complete host-level network audit, zero-lockout ingress/egress policy design, and automated UFW / iptables configuration for the StyleHub Atelier production environment.

---

## 1. Network Architecture & Ingress/Egress Security Matrix

| Service | Port / Protocol | Target Interface | Direction | Action | Security Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SSH** | `22/tcp` (or custom) | `0.0.0.0/0` (or Admin IP) | Inbound | **LIMIT** | Remote administration with automated brute-force rate-limiting. |
| **HTTP** | `80/tcp` | `0.0.0.0/0` | Inbound | **ALLOW** | Public web ingress (redirected to HTTPS via Nginx). |
| **HTTPS** | `443/tcp` | `0.0.0.0/0` | Inbound | **ALLOW** | Secure TLS/SSL e-commerce traffic, checkout & payment processing. |
| **MySQL** | `3306/tcp` | `127.0.0.1` (**Loopback only**) | Inbound | **DENY / DROP** | Internal database. Must NEVER be bound to `0.0.0.0` or open to the internet. |
| **Gunicorn (Flask)** | `5000/tcp` | `127.0.0.1` (**Loopback only**) | Inbound | **DENY / DROP** | Internal WSGI upstream. Only reachable locally by Nginx reverse proxy. |
| **All Other Ports** | Any | All interfaces | Inbound | **DROP (Default)** | Principle of Least Privilege: all unapproved incoming packets dropped. |
| **All Outbound** | Any | Any | Outbound | **ALLOW (Default)** | Permitted for package updates (`apt`), payment gateway APIs, SMS/WhatsApp webhooks. |

---

## 2. Step 1: Network Socket & Port Audit (Pre-Flight Safety Check)

Before modifying any firewall rule, audit listening sockets and verify the active SSH port to prevent zero-lockout incidents:

```bash
# 1. Audit all active TCP/UDP listening ports and processes
sudo ss -tulpn

# 2. Identify the active SSH port (Default: 22)
sudo ss -tulpn | grep -E 'sshd|ssh'
# Alternatively, check sshd configuration:
sudo grep -i "^Port " /etc/ssh/sshd_config || echo "SSH running on default port 22"

# 3. Check current firewall status
sudo ufw status verbose
# Or low-level kernel packet filtering:
sudo iptables -L -n -v
```

---

## 3. Step 2: Internal Service Binding Hardening (Loopback Isolation)

Internal services must never listen on public interfaces (`0.0.0.0`).

### A. MySQL Database Loopback Binding (`/etc/mysql/mysql.conf.d/mysqld.cnf`)
Ensure the MySQL configuration contains:
```ini
[mysqld]
bind-address = 127.0.0.1
mysqlx-bind-address = 127.0.0.1
```
Restart MySQL:
```bash
sudo systemctl restart mysql
# Verify it is only listening on 127.0.0.1:3306:
sudo ss -tulpn | grep 3306
```

### B. Gunicorn Backend Upstream Binding
When launching Gunicorn for StyleHub, bind exclusively to `127.0.0.1`:
```bash
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```
*Nginx will terminate SSL on 443 and proxy requests to `http://127.0.0.1:5000`.*

---

## 4. Step 3: Exact Shell Commands to Configure Host Firewall (UFW)

Run these commands in order. **Rule #1 ensures Zero-Lockout Safety:**

```bash
# 1. Install UFW if not present
sudo apt-get update && sudo apt-get install -y ufw

# 2. Reset existing rules to a known clean state
sudo ufw --force reset

# 3. Set strict default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 4. RULE #1 (ZERO-LOCKOUT & ANTI-ABUSE): Limit SSH
# Rate-limits connections (blocks IPs attempting >6 connections in 30 seconds)
sudo ufw limit 22/tcp comment "SSH rate-limited zero-lockout protection"

# 5. Allow Public Web Traffic
sudo ufw allow 80/tcp comment "Public HTTP Web Traffic"
sudo ufw allow 443/tcp comment "Public HTTPS Secure Traffic"

# 6. Verify staged rules BEFORE enabling
sudo ufw show added
```

---

## 5. Step 4: Activating Firewall & Verification

> [!CAUTION]
> **Safety Rule**: Keep your current SSH session open in one terminal while testing the firewall in another terminal.

```bash
# Enable the firewall
sudo ufw enable

# Verify final active status
sudo ufw status verbose
```

Expected output:
```text
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     LIMIT IN    Anywhere                   # SSH rate-limited zero-lockout protection
80/tcp                     ALLOW IN    Anywhere                   # Public HTTP Web Traffic
443/tcp                    ALLOW IN    Anywhere                   # Public HTTPS Secure Traffic
22/tcp (v6)                LIMIT IN    Anywhere (v6)              # SSH rate-limited zero-lockout protection
80/tcp (v6)                ALLOW IN    Anywhere (v6)              # Public HTTP Web Traffic
443/tcp (v6)               ALLOW IN    Anywhere (v6)              # Public HTTPS Secure Traffic
```

---

## 6. Alternative: Low-Level `iptables` Rule Suite

If your environment does not use UFW (e.g., bare minimal Alpine/Debian or custom kernel):

```bash
# 1. Flush existing rules
sudo iptables -F
sudo iptables -X

# 2. Default policies: DROP incoming, FORWARD drop, ALLOW outgoing
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 3. Allow loopback interface (essential for local MySQL and Gunicorn communication)
sudo iptables -A INPUT -i lo -j ACCEPT

# 4. Allow established and related connections
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# 5. Allow SSH with rate-limiting (Anti-Abuse)
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name SSH
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 6. Allow HTTP and HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 7. Persist rules
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

---

## 7. Cloud Firewall Equivalents (AWS / GCP / DigitalOcean)

If hosting on a public cloud provider, mirror these host rules into your **Cloud Security Groups**:

- **Inbound Rules**:
  - `SSH` (`22/tcp`) -> Source: `Your_Admin_IP/32` (best practice) or `0.0.0.0/0` with rate-limiting.
  - `HTTP` (`80/tcp`) -> Source: `0.0.0.0/0`
  - `HTTPS` (`443/tcp`) -> Source: `0.0.0.0/0`
  - **All other inbound traffic: Blocked by default.**
- **Outbound Rules**:
  - `All traffic` -> Destination: `0.0.0.0/0`

---

## 8. Automated Script

To apply these rules automatically with built-in safety prompts, run the included script:
```bash
chmod +x setup_firewall_security.sh
sudo ./setup_firewall_security.sh
```
