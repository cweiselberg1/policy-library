#!/bin/bash
# OGC - Trivy Filesystem/Dependency Vulnerability Scanner
# Usage: ./run-trivy.sh [path]
# Output: results/trivy-{date}.json

set -e

TARGET="${1:-.}"
DATE=$(date +%Y-%m-%d_%H%M%S)
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/trivy-${DATE}.json"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC Trivy Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Run Trivy filesystem scan with JSON output
trivy fs --format json --output "$OUTPUT_FILE" "$TARGET"

echo ""
echo "[✓] Scan complete: $OUTPUT_FILE"
echo "[*] Import this JSON file into the OGC Portal at /assessment/vuln"
