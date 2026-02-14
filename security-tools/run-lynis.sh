#!/bin/bash
# OGC - Lynis System Hardening Auditor
# Usage: ./run-lynis.sh
# Output: results/lynis-{date}.json (converted from report)

set -e

DATE=$(date +%Y-%m-%d_%H%M%S)
OUTPUT_DIR="$(dirname "$0")/results"
LYNIS_REPORT="/tmp/lynis-report-${DATE}.dat"
OUTPUT_FILE="${OUTPUT_DIR}/lynis-${DATE}.json"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC Lynis System Auditor"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Run Lynis audit
sudo lynis audit system --no-colors --report-file "$LYNIS_REPORT" || true

# Convert Lynis report to JSON
echo "[*] Converting report to JSON..."
python3 -c "
import json, sys

findings = []
with open('$LYNIS_REPORT', 'r') as f:
    for line in f:
        line = line.strip()
        if '=' not in line or line.startswith('#'):
            continue
        key, _, value = line.partition('=')
        key = key.strip()
        value = value.strip()

        if key == 'warning[]':
            parts = value.split('|')
            findings.append({
                'type': 'warning',
                'id': parts[0] if len(parts) > 0 else '',
                'description': parts[1] if len(parts) > 1 else value,
                'severity': parts[2] if len(parts) > 2 else 'medium',
                'details': parts[3] if len(parts) > 3 else ''
            })
        elif key == 'suggestion[]':
            parts = value.split('|')
            findings.append({
                'type': 'suggestion',
                'id': parts[0] if len(parts) > 0 else '',
                'description': parts[1] if len(parts) > 1 else value,
                'severity': 'low',
                'details': parts[2] if len(parts) > 2 else ''
            })

report = {
    'tool': 'lynis',
    'scanDate': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'target': '$(hostname)',
    'findings': findings
}

with open('$OUTPUT_FILE', 'w') as f:
    json.dump(report, f, indent=2)

print(f'Converted {len(findings)} findings')
" 2>/dev/null || {
    # Fallback: just copy the raw report
    cp "$LYNIS_REPORT" "${OUTPUT_DIR}/lynis-${DATE}.dat"
    echo "[!] JSON conversion failed. Raw report saved as .dat file"
    echo "[*] The portal can also parse raw Lynis .dat reports"
}

# Cleanup
rm -f "$LYNIS_REPORT" 2>/dev/null

echo ""
echo "[✓] Audit complete: $OUTPUT_FILE"
echo "[*] Import this file into the OGC Portal at /assessment/vuln"
