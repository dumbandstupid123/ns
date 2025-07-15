# 🚀 NextStep App Deployment Guide

This guide covers multiple deployment options for your NextStep application with full functionality.

## 📋 Prerequisites

- OpenAI API Key (for Resource Matcher) - **REQUIRED**
- Domain name (for production deployment)
- SSL certificates (for HTTPS)
- LiveKit credentials (for Voice Assistant) - **COMING SOON**

## 🎯 Quick Start

1. **Setup Environment Variables:**
   ```bash
   cp env.example .env
   # Edit .env with your OpenAI API key (only required variable)
   ```

2. **Run Deployment Script:**
   ```bash
   ./deploy.sh
   ```

## 🌐 Deployment Options

### Option 1: Cloud Platform (Recommended)

#### A. Vercel + Railway
**Best for: Easy deployment with minimal configuration**

**Frontend (Vercel):**
1. Push your code to GitHub
2. Connect GitHub to Vercel
3. Deploy from `clean-repo/frontend/` directory
4. Update `vercel.json` with your backend URL

**Backend (Railway):**
1. Connect GitHub to Railway
2. Deploy from `clean-repo/backend/` directory
3. Add environment variables in Railway dashboard:
   - `OPENAI_API_KEY` (required)
   - LiveKit variables (coming soon)

**Cost:** ~$5-20/month

#### B. AWS/GCP/Azure
**Best for: Scalable production deployment**

**AWS Setup:**
- Frontend: S3 + CloudFront
- Backend: ECS/Lambda + RDS
- Load Balancer: Application Load Balancer

**GCP Setup:**
- Frontend: Cloud Storage + CDN
- Backend: Cloud Run + Cloud SQL
- Load Balancer: Google Cloud Load Balancer

**Cost:** ~$20-100/month

### Option 2: VPS Deployment

#### A. Docker Compose (Recommended)
**Best for: Full control and cost-effective**

```bash
# On your VPS
git clone your-repo
cd clean-repo
cp env.example .env
# Edit .env with your OpenAI API key
./deploy.sh
# Choose option 1 (Docker Compose)
```

**Popular VPS Providers:**
- DigitalOcean Droplets ($5-20/month)
- Linode ($5-20/month)
- Vultr ($5-20/month)
- AWS EC2 ($10-50/month)

#### B. Manual Installation
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 5001

# Frontend
cd frontend
npm install
npm run build
# Serve with nginx/apache
```

### Option 3: Self-Hosted

#### A. Home Server/Raspberry Pi
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Deploy
./deploy.sh
```

**Requirements:**
- Raspberry Pi 4 (4GB RAM minimum)
- Port forwarding (80, 443, 5001)
- Dynamic DNS service

## 🔧 Configuration

### Environment Variables

Create `.env` file with:
```env
# Required
OPENAI_API_KEY=sk-proj-your-key-here

# Optional
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Coming Soon (Voice Assistant)
# LIVEKIT_API_KEY=your-livekit-key
# LIVEKIT_API_SECRET=your-livekit-secret
# LIVEKIT_URL=wss://your-livekit-server.com
```

### SSL/HTTPS Setup

**Option 1: Let's Encrypt (Free)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

**Option 2: Cloudflare (Free)**
1. Add domain to Cloudflare
2. Enable "Full (strict)" SSL
3. Use Cloudflare nameservers

### Database Setup (Optional)

For production, consider replacing JSON files with a database:

**PostgreSQL:**
```bash
# Add to docker-compose.yml
postgres:
  image: postgres:13
  environment:
    POSTGRES_DB: nextstep
    POSTGRES_USER: nextstep
    POSTGRES_PASSWORD: your-password
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

## 🔍 Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend.com/health`
- Frontend: `https://your-frontend.com/`

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs
journalctl -u your-service -f
```

### Backup Strategy
```bash
# Backup resources and client data
tar -czf backup-$(date +%Y%m%d).tar.gz backend/resources backend/clients.json
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Resource Matcher not working:**
   - Check OPENAI_API_KEY is set
   - Verify API key is valid
   - Check backend logs for errors

2. **Voice Assistant not working:**
   - Feature coming soon! Currently not implemented

3. **CORS errors:**
   - Update frontend API URLs
   - Check backend CORS settings
   - Verify domain configuration

4. **Performance issues:**
   - Increase server resources
   - Enable caching
   - Use CDN for static assets

### Debug Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Test API
curl https://your-backend.com/health
curl https://your-backend.com/api/clients

# Check SSL
curl -I https://your-domain.com
```

## 📊 Cost Estimates

| Option | Monthly Cost | Pros | Cons |
|--------|-------------|------|------|
| Vercel + Railway | $5-20 | Easy setup, auto-scaling | Limited customization |
| AWS/GCP | $20-100 | Enterprise features | Complex setup |
| VPS | $5-20 | Full control, cost-effective | Manual maintenance |
| Self-hosted | $0-10 | Complete control | Requires technical skills |

## 🛡️ Security Checklist

- [ ] HTTPS enabled
- [ ] API keys secured
- [ ] Firewall configured
- [ ] Regular backups
- [ ] Update dependencies
- [ ] Monitor logs
- [ ] Rate limiting enabled
- [ ] Input validation

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test API endpoints
4. Check network connectivity
5. Review security settings

---

**Next Steps:**
1. Choose deployment option
2. Set up environment variables (only OpenAI API key required)
3. Run deployment script
4. Configure domain/SSL
5. Test all functionality
6. Set up monitoring

Good luck with your deployment! 🎉 