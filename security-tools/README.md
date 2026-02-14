# OGC Security Tools Suite

One Guy Consulting's complete VAPT (Vulnerability Assessment and Penetration Testing) toolkit for macOS.

## Quick Start

1. **Install all tools:**
   ```bash
   cd ~/security-tools
   ./install.sh
   ```

2. **Run a full assessment:**
   ```bash
   ./run-full-assessment.sh <target>
   ```

## Directory Structure

```
~/security-tools/
├── install.sh                  # One-command installer for all tools
├── run-full-assessment.sh      # Run all scans against a target
├── run-nmap.sh                 # Network/port scanner
├── run-nuclei.sh               # Template-based vulnerability scanner
├── run-nikto.sh                # Web server vulnerability scanner
├── run-zap.sh                  # OWASP ZAP web application scanner
├── run-trivy.sh                # Filesystem/dependency scanner
├── run-lynis.sh                # System hardening auditor
├── run-openvas.sh              # OpenVAS/Greenbone scanner (via Docker)
├── docker-compose.yml          # OpenVAS Docker configuration
└── results/                    # All scan outputs saved here
```

## Individual Tools

### 1. Nmap - Network & Port Scanner
```bash
./run-nmap.sh 192.168.1.0/24
./run-nmap.sh scanme.nmap.org
```
- **Output:** `results/nmap-{target}-{date}.xml`
- **Features:** Version detection, vulnerability scripts, service enumeration

### 2. Nuclei - Template-Based Vulnerability Scanner
```bash
./run-nuclei.sh https://example.com
```
- **Output:** `results/nuclei-{target}-{date}.jsonl`
- **Features:** 5000+ templates, CVE detection, misconfigurations

### 3. Nikto - Web Server Scanner
```bash
./run-nikto.sh example.com
./run-nikto.sh 192.168.1.100
```
- **Output:** `results/nikto-{target}-{date}.json`
- **Features:** 6700+ dangerous files/programs, outdated server detection

### 4. OWASP ZAP - Web Application Scanner
```bash
./run-zap.sh https://example.com
```
- **Output:** `results/zap-{target}-{date}.json`
- **Features:** Spidering, active scanning, OWASP Top 10 detection
- **Note:** Falls back to Docker if desktop app not installed

### 5. Trivy - Filesystem & Dependency Scanner
```bash
./run-trivy.sh                  # Scan current directory
./run-trivy.sh /path/to/project # Scan specific path
```
- **Output:** `results/trivy-{date}.json`
- **Features:** OS packages, language dependencies, IaC misconfigurations

### 6. Lynis - System Hardening Auditor
```bash
./run-lynis.sh
```
- **Output:** `results/lynis-{date}.json`
- **Features:** 300+ security checks, compliance scanning, hardening tips
- **Note:** Requires sudo

### 7. OpenVAS - Enterprise Vulnerability Scanner
```bash
# First time: Start Docker containers (takes ~15 min for feed sync)
docker compose up -d

# Then run scans via web UI or script
./run-openvas.sh 192.168.1.1
```
- **Web UI:** https://localhost:9392 (admin/admin)
- **Output:** Manual export to `results/openvas-{target}-{date}.json`
- **Features:** 50,000+ vulnerability tests, network scanning, authenticated scanning

### 8. Full Assessment - Run All Tools
```bash
./run-full-assessment.sh 192.168.1.100
./run-full-assessment.sh https://example.com
```
Runs Nmap, Nuclei, Nikto, ZAP, Trivy, and Lynis sequentially with a summary report.

## Tool Comparison

| Tool | Target Type | Strength | Speed |
|------|-------------|----------|-------|
| **Nmap** | Network/Hosts | Port scanning, service detection | Fast |
| **Nuclei** | Web Apps | CVE detection, misconfigurations | Fast |
| **Nikto** | Web Servers | Server-specific vulnerabilities | Medium |
| **ZAP** | Web Apps | Deep crawling, OWASP Top 10 | Slow |
| **Trivy** | Filesystems | Dependencies, container images | Fast |
| **Lynis** | Local System | Hardening, compliance | Medium |
| **OpenVAS** | Network | Comprehensive enterprise scanning | Very Slow |

## Integration with OGC Portal

All scan outputs are formatted for direct import into the OGC Portal:

1. Navigate to `/assessment/vuln` in your portal
2. Click "Import Scan Results"
3. Upload files from `~/security-tools/results/`

Supported formats:
- Nmap XML
- Nuclei JSONL
- Nikto JSON
- ZAP JSON
- Trivy JSON
- Lynis JSON/DAT
- OpenVAS JSON/CSV

## Best Practices

### External Target Scanning
⚠️ **ONLY scan systems you own or have explicit permission to test!**

Unauthorized scanning is illegal in most jurisdictions.

### Internal Network Scanning
1. Start with **Nmap** for discovery
2. Use **Nuclei** for quick vulnerability checks
3. Run **OpenVAS** for comprehensive analysis
4. Use **Lynis** on all systems for hardening

### Web Application Testing
1. **Nuclei** - Quick template-based scan
2. **Nikto** - Server-specific checks
3. **ZAP** - Deep application analysis

### Development/CI/CD Integration
- **Trivy** - Scan containers and dependencies before deployment
- **Nuclei** - Automated security testing in pipelines

## Installed Tools Versions

After running `./install.sh`, verify installation:

```bash
nmap --version
nuclei -version
nikto -Version
trivy --version
lynis --version
```

## Requirements

- **macOS** (10.15+)
- **Homebrew** (auto-installed by install.sh)
- **Docker Desktop** (optional, for OpenVAS)
- **Python 3** (pre-installed on macOS)
- **sudo access** (for Lynis only)

## Troubleshooting

### Nmap requires sudo for some scans
```bash
sudo ./run-nmap.sh <target>
```

### ZAP not found
Install manually:
```bash
brew install --cask owasp-zap
```
Or use Docker fallback (automatic)

### OpenVAS containers won't start
Ensure Docker Desktop is running:
```bash
open -a Docker
docker compose up -d
```

### Lynis JSON conversion fails
Falls back to .dat format - still importable to OGC Portal

## Support

For issues or questions:
- Email: support@oneguyconsulting.com
- Portal: https://ogc-portal.com/support
- Documentation: https://ogc-portal.com/docs/vapt-tools

## License

Proprietary - One Guy Consulting
For authorized OGC clients only.

---

**Last Updated:** February 2026
**Version:** 1.0.0
