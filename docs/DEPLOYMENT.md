# 🚀 Deployment Guide - Vercel Frontend + Railway/Render Backend

## Overview

This guide will help you deploy:
- **Frontend** → Vercel (from Ash-Technologia/PCB-Inventrory-Management)
- **Backend** → Railway or Render
- **Database** → Railway PostgreSQL or Render PostgreSQL

---

## 📋 Prerequisites

- GitHub account with access to `Ash-Technologia/PCB-Inventrory-Management`
- Vercel account (free tier works)
- Railway or Render account (free tier works)
- PostgreSQL database (Railway/Render provides free tier)

---

## 🗄️ STEP 1: Deploy Database (Railway/Render)

### Option A: Railway PostgreSQL

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the connection details:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
4. Or use the `DATABASE_URL` (full connection string)

### Option B: Render PostgreSQL

1. Go to [Render.com](https://render.com)
2. Click "New" → "PostgreSQL"
3. Choose free tier
4. Copy the "Internal Database URL" or individual credentials

---

## 🖥️ STEP 2: Deploy Backend (Railway/Render)

### Option A: Railway Backend

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Ash-Technologia/PCB-Inventrory-Management`
4. Railway will auto-detect Node.js

**Configure Environment Variables:**
```env
# Database (use Railway PostgreSQL credentials)
DB_HOST=your-railway-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password

# Or use DATABASE_URL
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=production

# Port (Railway auto-assigns)
PORT=5000
```

**Configure Build & Start:**
- Root Directory: `/backend`
- Build Command: `npm install`
- Start Command: `npm start`

**Run Database Migration:**
After deployment, go to Railway dashboard → Your service → "Deploy" tab → Add custom start command:
```bash
npm run migrate && npm start
```

Or run migration manually via Railway CLI:
```bash
railway run npm run migrate
```

5. Copy the deployed backend URL (e.g., `https://your-app.railway.app`)

### Option B: Render Backend

1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect `Ash-Technologia/PCB-Inventrory-Management`
4. Configure:
   - **Name**: pcb-inventory-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

**Environment Variables:** (Same as Railway above)

**Run Migration:**
Add a "Build Command":
```bash
npm install && npm run migrate
```

5. Copy the deployed backend URL (e.g., `https://your-app.onrender.com`)

---

## 🌐 STEP 3: Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import `Ash-Technologia/PCB-Inventrory-Management`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app/api` (your Railway/Render backend URL + `/api`)

6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd c:\Users\user\OneDrive\Desktop\Hackathon

# Login to Vercel
vercel login

# Deploy
vercel --prod

# When prompted:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: pcb-inventory-management
# - Directory: ./frontend
# - Override settings: Yes
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.railway.app/api
```

---

## ✅ STEP 4: Verify Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Test login
curl -X POST https://your-backend-url.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@electrolyte.com","password":"admin123"}'
```

### Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to login with default credentials:
   - Email: `admin@electrolyte.com`
   - Password: `admin123`
3. Check browser console for any API errors

---

## 🔧 Configuration Files Created

### `vercel.json` (Root directory)
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "vite"
}
```

### `frontend/.env.production`
```env
VITE_API_URL=https://your-backend-url.com
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem: "Failed to fetch" or CORS errors**
- **Solution**: Ensure `VITE_API_URL` environment variable is set correctly in Vercel
- Check: Vercel Dashboard → Project → Settings → Environment Variables
- Format: `https://your-backend.railway.app/api` (must include `/api`)

**Problem: White screen or 404 errors**
- **Solution**: Check Vercel build logs
- Ensure build command is `npm run build` and output directory is `dist`

**Problem: API calls going to localhost**
- **Solution**: Rebuild the project in Vercel after adding `VITE_API_URL`
- Vercel Dashboard → Deployments → Click "..." → Redeploy

### Backend Issues

**Problem: Database connection failed**
- **Solution**: Verify database credentials in Railway/Render environment variables
- Check if database is running
- Ensure `DATABASE_URL` format is correct

**Problem: "Table does not exist" errors**
- **Solution**: Run database migration
- Railway: `railway run npm run migrate`
- Render: Add migration to build command

**Problem: 500 Internal Server Error**
- **Solution**: Check backend logs in Railway/Render dashboard
- Verify all environment variables are set
- Check JWT_SECRET is set

---

## 🔐 Security Checklist

- [ ] Change default admin password after first login
- [ ] Set strong `JWT_SECRET` (not the default)
- [ ] Enable HTTPS (Vercel and Railway/Render do this automatically)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Review and restrict CORS settings in backend if needed
- [ ] Don't commit `.env` files to GitHub

---

## 📊 Post-Deployment Setup

### 1. Create Admin User
If seed data wasn't run, create an admin user:
```bash
# Via Railway/Render console or API
curl -X POST https://your-backend-url.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@electrolyte.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### 2. Import Sample Data
- Login to the deployed frontend
- Go to Inventory page
- Download the Excel template
- Fill with sample data
- Import to populate the database

### 3. Test All Features
- [ ] Login/Logout
- [ ] Add/Edit/Delete Components
- [ ] Create PCB with BOM
- [ ] Create Production Entry
- [ ] Check Procurement Triggers
- [ ] View Analytics Dashboard
- [ ] Import/Export Excel

---

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:

- **Push to GitHub** → Automatic deployment
- **Main branch** → Production deployment
- **Other branches** → Preview deployments (Vercel)

To disable auto-deploy:
- **Vercel**: Project Settings → Git → Disable "Production Branch"
- **Railway**: Project Settings → Disable "Auto Deploy"

---

## 📝 Environment Variables Summary

### Backend (Railway/Render)
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=5000
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

---

## 🎉 Success!

Your PCB Inventory Management System is now live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Database**: Managed by Railway/Render

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Vercel/Railway/Render dashboards
3. Verify all environment variables are set correctly
4. Check browser console for frontend errors
5. Check backend logs for API errors

---

## 🚀 Next Steps

- Set up custom domain (Vercel supports this in free tier)
- Configure email notifications for procurement triggers
- Set up monitoring and analytics
- Create backup strategy for database
- Implement rate limiting for API endpoints
