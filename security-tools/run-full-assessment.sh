#!/bin/bash
# OGC - Full Security Assessment Runner
# Runs all applicable scan tools sequentially against a target
# Usage: ./run-full-assessment.sh <target>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target>"
    echo "  target: IP address, hostname, or URL"
    echo "  Example: $0 192.168.1.100"
    echo "  Example: $0 https://example.com"
    exit 1
fi

TARGET="$1"
SCRIPT_DIR="$(dirname "$0")"
DATE=$(date +%Y-%m-%d_%H%M%S)

echo "========================================="
echo " OGC Full Security Assessment"
echo " Target: $TARGET"
echo " Date: $(date)"
echo "========================================="
echo ""

RESULTS=()
FAILED=()

# Helper function
run_scan() {
    local name="$1"
    local script="$2"
    shift 2
    echo ""
    echo "─────────────────────────────────────────"
    echo "[*] Running $name..."
    echo "─────────────────────────────────────────"
    if "$SCRIPT_DIR/$script" "$@"; then
        RESULTS+=("$name: SUCCESS")
    else
        FAILED+=("$name")
        RESULTS+=("$name: FAILED (see errors above)")
    fi
}

# 1. Nmap - Network/Port scan (works on IP/hostname)
run_scan "Nmap" "run-nmap.sh" "$TARGET"

# 2. Nuclei - Template vuln scan (works on URLs)
if [[ "$TARGET" == http* ]]; then
    run_scan "Nuclei" "run-nuclei.sh" "$TARGET"
else
    run_scan "Nuclei" "run-nuclei.sh" "http://$TARGET"
fi

# 3. Nikto - Web server scan
NIKTO_TARGET=$(echo "$TARGET" | sed 's|https\?://||')
run_scan "Nikto" "run-nikto.sh" "$NIKTO_TARGET"

# 4. ZAP - Web app scan
if [[ "$TARGET" == http* ]]; then
    run_scan "OWASP ZAP" "run-zap.sh" "$TARGET"
else
    run_scan "OWASP ZAP" "run-zap.sh" "http://$TARGET"
fi

# 5. Trivy - Local filesystem scan
run_scan "Trivy (local)" "run-trivy.sh" "."

# 6. Lynis - System hardening
run_scan "Lynis" "run-lynis.sh"

echo ""
echo "========================================="
echo " Assessment Complete"
echo "========================================="
echo ""
echo "Results:"
for r in "${RESULTS[@]}"; do
    echo "  $r"
done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo "Failed scans (${#FAILED[@]}):"
    for f in "${FAILED[@]}"; do
        echo "  ✗ $f"
    done
fi

echo ""
echo "All scan results are in: $SCRIPT_DIR/results/"
echo "Import them into the OGC Portal at /assessment/vuln"
