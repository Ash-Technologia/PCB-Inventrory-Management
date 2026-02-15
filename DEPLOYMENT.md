# Deployment Guide

See the comprehensive deployment guide in the `docs/` folder or at:
https://github.com/Ash-Technologia/PCB-Inventrory-Management/blob/main/docs/DEPLOYMENT.md

## Quick Start

### Frontend (Vercel)
1. Import repository to Vercel
2. Set root directory: `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend-url/api`
4. Deploy

### Backend (Railway/Render)
1. Import repository to Railway/Render
2. Set root directory: `backend`
3. Add database credentials as environment variables
4. Run migration: `npm run migrate`
5. Deploy

For detailed instructions, see the full deployment guide.
