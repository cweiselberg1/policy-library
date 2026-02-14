#!/bin/bash
# One Guy Consulting - Security Tools Installer
# Installs all free VAPT tools for macOS

set -e
echo "========================================="
echo " OGC Security Tools Installer"
echo "========================================="
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "[!] Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "[*] Installing security tools via Homebrew..."
brew install nmap
brew install nikto
brew install nuclei
brew install trivy
brew install lynis

echo ""
echo "[*] Installing OWASP ZAP (GUI app)..."
brew install --cask owasp-zap

echo ""
echo "[*] Setting up OpenVAS via Docker..."
if command -v docker &> /dev/null; then
    echo "    Docker found. You can run OpenVAS with:"
    echo "    cd ~/security-tools && docker compose up -d"
    echo "    First run downloads vulnerability feeds (~15 min)"
else
    echo "[!] Docker not found. Install Docker Desktop for OpenVAS support."
fi

echo ""
echo "[*] Creating results directory..."
mkdir -p ~/security-tools/results

echo ""
echo "========================================="
echo " Installation Complete!"
echo "========================================="
echo ""
echo "Installed tools:"
command -v nmap &> /dev/null && echo "  ✓ Nmap $(nmap --version 2>&1 | head -1)"
command -v nikto &> /dev/null && echo "  ✓ Nikto"
command -v nuclei &> /dev/null && echo "  ✓ Nuclei $(nuclei --version 2>&1)"
command -v trivy &> /dev/null && echo "  ✓ Trivy $(trivy --version 2>&1 | head -1)"
command -v lynis &> /dev/null && echo "  ✓ Lynis $(lynis --version 2>&1)"
echo ""
echo "Usage: Run individual scan scripts or run-full-assessment.sh"
