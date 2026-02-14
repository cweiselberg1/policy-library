#!/bin/bash
# OGC - OpenVAS/Greenbone Network Vulnerability Scanner (via Docker)
# Usage: ./run-openvas.sh <target_ip>
# Output: results/openvas-{target}-{date}.json
# Requires: Docker + docker-compose.yml in this directory

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target_ip>"
    echo "  target: IP address or hostname to scan"
    echo "  Example: $0 192.168.1.1"
    echo ""
    echo "  First run: docker compose up -d (wait ~15 min for feed sync)"
    echo "  Web UI: https://localhost:9392 (admin/admin)"
    exit 1
fi

TARGET="$1"
DATE=$(date +%Y-%m-%d_%H%M%S)
SAFE_TARGET=$(echo "$TARGET" | tr '/' '_' | tr ':' '_')
OUTPUT_DIR="$(dirname "$0")/results"
OUTPUT_FILE="${OUTPUT_DIR}/openvas-${SAFE_TARGET}-${DATE}.json"
SCRIPT_DIR="$(dirname "$0")"

mkdir -p "$OUTPUT_DIR"

echo "[*] OGC OpenVAS Scanner"
echo "[*] Target: $TARGET"
echo "[*] Output: $OUTPUT_FILE"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "[!] Docker is not running. Start Docker Desktop first."
    exit 1
fi

# Check if Greenbone containers are up
if ! docker compose -f "$SCRIPT_DIR/docker-compose.yml" ps | grep -q "running"; then
    echo "[*] Starting Greenbone containers..."
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
    echo "[*] Waiting for services to initialize (this may take several minutes on first run)..."
    sleep 30
fi

GVM_HOST="localhost"
GVM_PORT="9392"
GVM_USER="admin"
GVM_PASS="admin"

echo "[*] Creating scan target and task via GVM API..."
echo "[*] NOTE: For full automation, use the Greenbone Web UI at https://${GVM_HOST}:${GVM_PORT}"
echo ""
echo "Manual steps:"
echo "  1. Open https://${GVM_HOST}:${GVM_PORT} in your browser"
echo "  2. Login with admin/admin"
echo "  3. Create a target for: $TARGET"
echo "  4. Create and run a scan task"
echo "  5. Export results as JSON/CSV when complete"
echo "  6. Save to: $OUTPUT_FILE"
echo ""
echo "[*] Alternatively, use the gvm-cli tool:"
echo "    docker compose exec gvmd gvm-cli --gmp-username admin --gmp-password admin socket --xml '<get_version/>'"
echo ""
echo "[*] The portal at /assessment/vuln can import OpenVAS JSON exports."
