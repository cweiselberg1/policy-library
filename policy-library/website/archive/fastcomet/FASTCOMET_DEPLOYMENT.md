# FastComet Deployment Guide for Policy Library

This guide covers deploying the Policy Library Next.js application on FastComet hosting. Choose the deployment method based on your FastComet hosting plan.

---

## Table of Contents

1. [Option 1: Full Next.js Deployment (VPS/Node.js)](#option-1-full-nextjs-deployment-vpsnodejs)
2. [Option 2: Static HTML Export (Shared Hosting)](#option-2-static-html-export-shared-hosting)
3. [Quick Start Checklist](#quick-start-checklist)
4. [Troubleshooting](#troubleshooting)

---

## Option 1: Full Next.js Deployment (VPS/Node.js)

**Use this method if:**
- You have FastComet VPS or Node.js hosting plan
- You need API routes (`/api/...` endpoints)
- You need server-side features (authentication, dynamic content)
- You want automatic caching and optimization

### Prerequisites

Before starting, verify you have:
- **Node.js 18+** installed on your FastComet server
- **SSH access** to your FastComet account (VPS or Node.js hosting)
- **SFTP/SSH credentials** from your FastComet control panel
- **Domain/subdomain** pointing to your FastComet server
- **Git** installed on the server (recommended for easier updates)
- **Environment variables** from your `.env.local` file

### Step 1: Connect to Your FastComet Server

Open your terminal and connect via SSH:

```bash
ssh username@your-fastcomet-domain.com
# Or with your FastComet IP
ssh username@your.ip.address
```

When prompted, enter your FastComet SSH password from the control panel.

### Step 2: Prepare the Server Directory

Navigate to your web root or create a project directory:

```bash
# Check current directory
pwd

# Navigate to web root (usually public_html for domains, or custom dir)
cd /home/username/public_html

# Or create a dedicated project directory
mkdir -p /home/username/policy-library
cd /home/username/policy-library
```

### Step 3: Upload Your Project Files

You have two options:

#### Option A: Using Git (Recommended)

```bash
# Clone your repository
git clone https://github.com/your-username/policy-library.git .

# Navigate to website folder
cd website

# Install dependencies
npm install --production
```

#### Option B: Using SFTP

1. On your local machine, use an SFTP client (Cyberduck, FileZilla, or WinSCP)
2. Connect with your FastComet SFTP credentials
3. Upload the entire `website` folder to your FastComet account
4. Then via SSH, navigate to that directory and run:

```bash
npm install --production
```

### Step 4: Configure Environment Variables

Create a `.env.local` file on the server:

```bash
# Create the file
nano .env.local
```

Copy this template and update with your actual values:

```
# Mixpanel Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_token_here
NEXT_PUBLIC_MIXPANEL_DEBUG=false

# Supabase Configuration (if using authentication/database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

Save with: `CTRL+X`, then `Y`, then `ENTER`

### Step 5: Build the Application

Run the Next.js build process:

```bash
npm run build
```

This creates an optimized production build in the `.next` directory. This step takes 2-5 minutes depending on your server.

**Expected output:**
```
✓ Created optimize package
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (X/X)
```

### Step 6: Configure Node.js Process Manager

FastComet requires a process manager to keep your Node.js app running. Use **PM2** (recommended):

```bash
# Install PM2 globally
npm install -g pm2

# Start your Next.js app
pm2 start npm --name "policy-library" -- start

# Save PM2 process list to restart on reboot
pm2 startup
pm2 save
```

Copy the output from `pm2 startup` and run it - it looks like:
```bash
sudo env PATH=$PATH:/home/username/.nvm/versions/node/v18.x.x/bin /home/username/.nvm/versions/node/v18.x.x/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
```

Verify PM2 is running:
```bash
pm2 list
pm2 logs policy-library
```

### Step 7: Configure FastComet's Reverse Proxy (if applicable)

If your hosting provider uses Apache/Nginx as a reverse proxy, you may need to configure it.

**For Nginx:**
Create `/etc/nginx/sites-available/policy-library` (or ask FastComet support):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/policy-library /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Point Your Domain

In your FastComet control panel (cPanel or VPS dashboard):
1. Go to **Addon Domains** or **DNS Management**
2. Point your domain to your server's IP address
3. Wait 15-30 minutes for DNS to propagate

Verify it's working:
```bash
curl http://localhost:3000
```

If you see HTML output, your app is running!

### Step 9: Enable SSL/HTTPS

FastComet usually provides free SSL certificates:

1. Go to your FastComet control panel
2. Find **AutoSSL** or **Let's Encrypt** section
3. Install certificate for your domain
4. Update your Nginx config to redirect HTTP to HTTPS

Or use Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### Updating Your Deployment

To deploy new changes:

```bash
# SSH into your server
ssh username@your-fastcomet-domain.com
cd /home/username/policy-library/website

# Pull latest code
git pull origin main

# Reinstall dependencies if changed
npm install --production

# Rebuild
npm run build

# Restart the app
pm2 restart policy-library
```

---

## Option 2: Static HTML Export (Shared Hosting)

**Use this method if:**
- You have FastComet shared hosting (not VPS)
- You don't need API routes or server-side features
- You want simple FTP-based deployment
- You want maximum compatibility

**Limitations:**
- No API routes (cannot use `/api/...` endpoints)
- No server-side authentication with Supabase
- No dynamic server-side rendering
- Cannot use features requiring Node.js

### Step 1: Enable Static Export

Edit `next.config.ts` in your project:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export
  unoptimized: true,  // Don't optimize images
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

### Step 2: Remove API Routes

Since static exports can't use API routes, you need to comment them out or remove them:

```bash
# Option 1: Rename API folder temporarily
mv app/api app/api.disabled

# Option 2: Or manually disable API calls in your components
# Remove any fetch() calls to /api/... routes
```

### Step 3: Build Static Export

Run the build command:

```bash
npm run build
```

This creates a `out/` folder with all static HTML files. Check it exists:

```bash
ls -la out/
```

You should see:
- `index.html`
- `policies/` (folder)
- `training/` (folder)
- `_next/` (folder with CSS/JS)
- Other HTML files

### Step 4: Upload via cPanel File Manager or FTP

**Using cPanel File Manager:**

1. Log into FastComet cPanel
2. Go to **File Manager**
3. Navigate to **public_html** folder
4. Delete existing content (backup first!)
5. Upload all files from your local `out/` folder
6. Make sure `index.html` is in the root of `public_html`

**Using FTP/SFTP Client (Cyberduck, FileZilla):**

```
FTP Server: ftp.your-domain.com
Username: your-cpanel-username
Password: your-cpanel-password
Port: 21 (FTP) or 22 (SFTP)

Upload destination: /public_html/
```

Drag and drop the contents of your `out/` folder into `public_html`

### Step 5: Verify Upload

In cPanel File Manager, you should see:
```
public_html/
├── index.html          ← Root homepage
├── policies/
├── training/
├── _next/
├── favicon.ico
└── [other files]
```

### Step 6: Test Your Site

Visit your domain in a browser:
```
https://your-domain.com
```

You should see your Policy Library homepage. Test navigation to make sure all links work.

### Step 7: Configure Subdomain (Optional)

If you want to deploy to a subdomain like `policies.your-domain.com`:

1. In cPanel, go to **Addon Domains** or **Subdomains**
2. Create subdomain `policies`
3. Point to a new directory: `/home/username/public_html/policies`
4. Upload your `out/` folder contents there instead

### Updating Static Deployment

When you have updates:

```bash
# On your local machine
npm run build

# Upload the out/ folder contents to public_html
# Using same FTP process as Step 4
```

---

## Quick Start Checklist

### Before You Start

- [ ] Decide which option (VPS/Node.js or Shared Hosting)
- [ ] Gather your FastComet login credentials
- [ ] Have SSH/FTP access working
- [ ] Have your domain ready to point
- [ ] Copy your `.env.local` file with real credentials

### For Option 1 (VPS/Node.js)

- [ ] SSH into FastComet server
- [ ] Navigate to project directory
- [ ] Clone/upload project files
- [ ] Create `.env.local` with credentials
- [ ] Run `npm install --production`
- [ ] Run `npm run build`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start app: `pm2 start npm --name "policy-library" -- start`
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Point domain to server IP
- [ ] Test: visit `https://your-domain.com`
- [ ] Enable SSL certificate

### For Option 2 (Shared Hosting)

- [ ] Edit `next.config.ts` to enable `output: 'export'`
- [ ] Disable or remove API routes
- [ ] Run `npm run build`
- [ ] Connect via FTP/cPanel
- [ ] Upload `out/` folder contents to `public_html`
- [ ] Test: visit `https://your-domain.com`

---

## Troubleshooting

### Option 1: VPS/Node.js Issues

#### "Command not found: node"
**Solution:** Node.js isn't installed or not in PATH
```bash
# Check Node version
node --version

# If not found, install via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### "Port 3000 already in use"
**Solution:** Another process is using port 3000
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port in PM2
pm2 start npm --name "policy-library" -- start -- -p 3001
```

#### "PM2 logs show errors about Supabase/environment variables"
**Solution:** Missing or incorrect `.env.local`
```bash
# Check if file exists
cat .env.local

# Verify all required variables are set
grep "NEXT_PUBLIC\|SUPABASE" .env.local
```

#### "502 Bad Gateway" error
**Solution:** App crashed or not responding
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs policy-library

# Restart
pm2 restart policy-library
```

#### "Connection refused on localhost:3000"
**Solution:** App didn't start successfully
```bash
# Check if Node process is running
ps aux | grep node

# Start manually to see errors
npm start

# Use PM2 with logs
pm2 start npm --name "policy-library" -- start
pm2 logs policy-library --lines 50
```

### Option 2: Shared Hosting Issues

#### "Blank page or 404 errors"
**Solution:** Files not uploaded correctly
- Verify `index.html` exists in root of `public_html`
- Check that `_next/` folder is uploaded
- Ensure all files from `out/` are uploaded, not just folders

#### "Styles not loading (page looks broken)"
**Solution:** CSS files in `_next/` folder not uploaded
```bash
# Locally, verify out/ structure
ls -la out/_next/static/css/
```
Make sure these files are in your FTP upload.

#### "404 on pages like /policies/hipaa"
**Solution:** Check that folders are uploaded with their `page.html` files
```
public_html/
├── policies/
│   ├── page.html       ← Check this exists
│   └── [other folders]
```

#### "Links don't work or go to wrong URLs"
**Solution:** Check if app was in a subdirectory
If deploying to `your-domain.com/policies/`, you may need to set `basePath`:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/policies',  // Add this if in subdirectory
  // ...
};
```

Then rebuild and redeploy.

### Both Options

#### "Certificate/SSL not working"
**Solution:** Wait for Let's Encrypt/AutoSSL to provision
- Check FastComet control panel for certificate status
- If stuck, contact FastComet support
- In browser, ignore warning temporarily (not safe for production)

#### "Domain not resolving"
**Solution:** DNS propagation takes time
```bash
# Check DNS records
dig your-domain.com

# Flush local DNS cache
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns            # Windows
```

#### "Git push/pull not working on server"
**Solution:** Set up SSH key for GitHub
```bash
# Generate SSH key on FastComet server
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub

# Add this public key to GitHub → Settings → SSH Keys
# Then clone/pull should work
```

---

## Performance Tips

### Option 1 (VPS/Node.js)
- Use PM2 with cluster mode for multiple cores: `pm2 start npm -i max --name "policy-library" -- start`
- Enable Gzip compression in Nginx
- Set up caching headers for static assets
- Monitor with: `pm2 monit`

### Option 2 (Shared Hosting)
- Use browser cache by setting headers in cPanel
- Minify CSS/JS (already done by Next.js build)
- Compress images (use image optimization before build)
- Consider CDN for assets

---

## Getting Help

- **FastComet Support:** Open ticket from control panel
- **Next.js Docs:** https://nextjs.org/docs
- **PM2 Docs:** https://pm2.keymetrics.io/docs
- **Check PM2 logs:** `pm2 logs policy-library`
- **Test Node.js:** `node --version` and `npm --version`

---

## Next Steps

After deployment:

1. **Test all features:**
   - Navigate pages
   - Download policies
   - Test authentication (if applicable)
   - Check analytics

2. **Monitor performance:**
   - Check server logs: `pm2 logs` (Option 1)
   - Monitor uptime
   - Set up error notifications

3. **Set up backups:**
   - FastComet control panel → Backups
   - Enable automatic daily backups

4. **Plan updates:**
   - Pull changes with `git pull`
   - Run build and restart
   - Test before going live
