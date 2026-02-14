#!/bin/bash
# OGC - Nmap Network/Port Scanner
# Usage: ./run-nmap.sh <target_ip_or_domain>
# Output: results/nmap-{target}-{date}.xml

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target>"
    echo "  target: IP address, hostname, or CIDR range"
    echo "  Example: $0 192.168.1.0/24"
    echo "  Example: $0 scanme.nmap.org"
    exit 1
fi

TARGET="$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
SAFE_TARGET=$(echo "$TARGET" | tr '/' '_' | tr ':' '_')
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/nmap-${SAFE_TARGET}-${DATE}.xml"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC Nmap Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Run comprehensive scan with version detection and vuln scripts
nmap -sV -sC --script=vuln -oX "$OUTPUT_FILE" "$TARGET"

echo ""
echo "[✓] Scan complete: $OUTPUT_FILE"
echo "[*] Import this XML file into the OGC Portal at /assessment/vuln"
