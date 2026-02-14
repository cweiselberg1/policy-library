#!/bin/bash
# OGC - OWASP ZAP Web Application Scanner (Headless)
# Usage: ./run-zap.sh <target_url>
# Output: results/zap-{target}-{date}.json
# Requires: OWASP ZAP installed via brew cask

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target_url>"
    echo "  target: URL of web application to scan"
    echo "  Example: $0 https://example.com"
    exit 1
fi

TARGET="$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
SAFE_TARGET=$(echo "$TARGET" | sed 's|https\?://||' | tr '/' '_' | tr ':' '_')
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/zap-${SAFE_TARGET}-${DATE}.json"
ZAP_PATH="/Applications/OWASP ZAP.app/Contents/Java"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC OWASP ZAP Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Check if ZAP is installed
if [ ! -d "$ZAP_PATH" ]; then
    # Try alternative Docker approach
    echo "[*] ZAP desktop not found, trying Docker..."
    docker run --rm -v "$(pwd)/results:/zap/wrk" \
        ghcr.io/zaproxy/zaproxy:stable \
        zap-baseline.py -t "$TARGET" -J "zap-${SAFE_TARGET}-${DATE}.json" || {
        echo "[!] ZAP not available. Install with: brew install --cask owasp-zap"
        echo "    Or use Docker: docker pull ghcr.io/zaproxy/zaproxy:stable"
        exit 1
    }
    echo ""
    echo "[✓] Scan complete: $OUTPUT_FILE"
    exit 0
fi

# Run ZAP in headless/daemon mode with API scan
"$ZAP_PATH/zap.sh" -daemon -port 8090 -config api.disablekey=true &
ZAP_PID=$!
sleep 10

# Quick scan via API
curl -s "http://localhost:8090/JSON/spider/action/scan/?url=${TARGET}" > /dev/null
echo "[*] Spidering target..."
sleep 30

curl -s "http://localhost:8090/JSON/ascan/action/scan/?url=${TARGET}" > /dev/null
echo "[*] Active scanning..."
sleep 60

# Export results
curl -s "http://localhost:8090/JSON/core/view/alerts/?baseurl=${TARGET}" > "$OUTPUT_FILE"

# Cleanup
kill $ZAP_PID 2>/dev/null || true

echo ""
echo "[✓] Scan complete: $OUTPUT_FILE"
echo "[*] Import this JSON file into the OGC Portal at /assessment/vuln"
