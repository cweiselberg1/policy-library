#!/bin/bash
# OGC - Nuclei Template-Based Vulnerability Scanner
# Usage: ./run-nuclei.sh <target_url>
# Output: results/nuclei-{target}-{date}.jsonl

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target_url>"
    echo "  target: URL to scan"
    echo "  Example: $0 https://example.com"
    exit 1
fi

TARGET="$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
SAFE_TARGET=$(echo "$TARGET" | sed 's|https\?://||' | tr '/' '_' | tr ':' '_')
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/nuclei-${SAFE_TARGET}-${DATE}.jsonl"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC Nuclei Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Update templates first
nuclei -update-templates 2>/dev/null || true

# Run scan with all templates, output as JSONL
nuclei -u "$TARGET" -jsonl -o "$OUTPUT_FILE" -severity critical,high,medium,low,info

echo ""
echo "[✓] Scan complete: $OUTPUT_FILE"
echo "[*] Import this JSONL file into the OGC Portal at /assessment/vuln"
