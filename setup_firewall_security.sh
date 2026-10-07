#!/usr/bin/env bash
# ==============================================================================
# StyleHub Production Server - Firewall & Network Security Hardening Script
# Role: Senior Linux Systems Administrator & Cloud Security Engineer
# Scope: Host Firewall (UFW), Port Audit, Localhost Binding, Anti-Abuse
# ==============================================================================

set -euo pipefail

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
    echo "[-] Error: This script must be run as root (use sudo)." >&2
    exit 1
fi

echo "================================================================="
echo "   StyleHub Linux Cloud Server - Security & Firewall Hardening   "
echo "================================================================="

# ------------------------------------------------------------------------------
# STEP 1: PORT & INTERFACE AUDIT (Zero-Lockout Pre-Flight Check)
# ------------------------------------------------------------------------------
echo ""
echo "[*] Step 1: Auditing active listening network sockets..."
echo "-----------------------------------------------------------------"
if command -v ss >/dev/null 2>&1; then
    ss -tulpn
elif command -v netstat >/dev/null 2>&1; then
    netstat -tulpn
else
    echo "[!] Warning: Neither 'ss' nor 'netstat' found. Install iproute2 or net-tools."
fi

# Detect SSH Port dynamically
echo ""
echo "[*] Identifying active SSH port for Zero-Lockout Safety..."
SSH_PORT=$(ss -tulpn 2>/dev/null | grep -E 'sshd|ssh' | awk '{print $5}' | awk -F':' '{print $NF}' | sort -u | head -n 1)

if [ -z "$SSH_PORT" ]; then
    # Fallback to sshd_config
    if [ -f /etc/ssh/sshd_config ]; then
        SSH_PORT=$(grep -E "^Port " /etc/ssh/sshd_config | awk '{print $2}' | head -n 1)
    fi
fi

SSH_PORT=${SSH_PORT:-22}
echo "[+] Detected active SSH port: ${SSH_PORT}/tcp"

# ------------------------------------------------------------------------------
# STEP 2: VERIFY INTERNAL SERVICE BINDINGS (Principle of Least Privilege)
# ------------------------------------------------------------------------------
echo ""
echo "[*] Step 2: Verifying internal service loopback bindings (127.0.0.1)..."

# Audit MySQL (3306)
if ss -tulpn 2>/dev/null | grep -E ':3306\s' | grep -q '0.0.0.0'; then
    echo "[!] CRITICAL WARNING: MySQL (3306) is bound to 0.0.0.0 (exposed to public internet)!"
    echo "    Fix immediately in /etc/mysql/mysql.conf.d/mysqld.cnf:"
    echo "    bind-address = 127.0.0.1"
else
    echo "[✓] MySQL (3306) is properly bound to 127.0.0.1 or not running on public interface."
fi

# Audit Gunicorn / Backend (5000/8000)
if ss -tulpn 2>/dev/null | grep -E ':(5000|8000)\s' | grep -q '0.0.0.0'; then
    echo "[!] WARNING: Upstream Gunicorn is listening on 0.0.0.0."
    echo "    Bind Gunicorn to 127.0.0.1:5000 so it is only reachable via Nginx reverse proxy."
else
    echo "[✓] Gunicorn upstream is isolated to localhost or not publicly exposed."
fi

# ------------------------------------------------------------------------------
# STEP 3: FIREWALL POLICY DEFINITION (UFW)
# ------------------------------------------------------------------------------
echo ""
echo "[*] Step 3: Preparing UFW Firewall Rules..."

if ! command -v ufw >/dev/null 2>&1; then
    echo "[+] Installing ufw (Uncomplicated Firewall)..."
    apt-get update -y && apt-get install -y ufw
fi

# Reset UFW rules to clean slate (without prompt)
echo "[*] Setting default policies: DENY incoming, ALLOW outgoing..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# RULE #1: Zero-Lockout SSH Rule with Rate-Limiting (Anti-Abuse)
echo "[*] Rule #1 [ZERO-LOCKOUT]: Permitting & rate-limiting SSH on port ${SSH_PORT}/tcp..."
ufw limit "${SSH_PORT}/tcp" comment "SSH rate-limited zero-lockout protection"

# RULE #2 & #3: Public Web Ingress (HTTP / HTTPS)
echo "[*] Rule #2: Allowing HTTP (port 80/tcp)..."
ufw allow 80/tcp comment "Public HTTP Web Traffic"

echo "[*] Rule #3: Allowing HTTPS (port 443/tcp)..."
ufw allow 443/tcp comment "Public HTTPS Secure Traffic (SSL/TLS)"

# Output planned rules
echo ""
echo "-----------------------------------------------------------------"
echo "PROPOSED FIREWALL RULES SUMMARY:"
echo "-----------------------------------------------------------------"
ufw show added
echo "-----------------------------------------------------------------"

# ------------------------------------------------------------------------------
# STEP 4: EXPLICIT USER CONFIRMATION BEFORE ACTIVATION
# ------------------------------------------------------------------------------
echo ""
echo "[!] ============================================================="
echo "    SAFETY CHECK: You are about to enable the host firewall."
echo "    - Default Policy: DROP all incoming traffic"
echo "    - Allowed Inbound: Port ${SSH_PORT} (SSH, rate-limited), 80 (HTTP), 443 (HTTPS)"
echo "    - Blocked Inbound: MySQL (3306), Redis (6379), Gunicorn (5000)"
echo "================================================================="
read -r -p "Do you want to permanently activate the firewall now? [y/N]: " CONFIRMATION

case "$CONFIRMATION" in
    [yY][eE][sS]|[yY])
        echo "[*] Activating UFW..."
        ufw --force enable
        echo ""
        echo "[✓] UFW is now active and enforcing rules."
        ufw status verbose
        ;;
    *)
        echo "[-] Activation aborted by user. Rules staged but firewall NOT enabled."
        exit 0
        ;;
esac
