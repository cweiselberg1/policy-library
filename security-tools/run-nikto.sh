#!/bin/bash
# OGC - Nikto Web Server Vulnerability Scanner
# Usage: ./run-nikto.sh <target_host>
# Output: results/nikto-{target}-{date}.json

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target_host>"
    echo "  target: hostname or IP of web server"
    echo "  Example: $0 example.com"
    echo "  Example: $0 192.168.1.100"
    exit 1
fi

TARGET="$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
SAFE_TARGET=$(echo "$TARGET" | tr '/' '_' | tr ':' '_')
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/nikto-${SAFE_TARGET}-${DATE}.json"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC Nikto Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Run Nikto with JSON output
nikto -h "$TARGET" -Format json -output "$OUTPUT_FILE"

echo ""
echo "[✓] Scan complete: $OUTPUT_FILE"
echo "[*] Import this JSON file into the OGC Portal at /assessment/vuln"
