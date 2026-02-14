# PCB Inventory Management System

**INVICTUS 24-Hour Hackathon** | Electrolyte Solutions

A production-ready inventory automation system for PCB manufacturing with real-time stock control, automated procurement alerts, and comprehensive analytics.

## 🏆 Project Highlights

### Core Features (MVP)
✅ **Component Inventory Management** - Complete CRUD with smart filtering  
✅ **PCB-Component Mapping** - Dynamic Bill of Materials (BOM) management  
✅ **Atomic Stock Deduction** - Transaction-safe production entries  
✅ **Procurement Triggers** - Automatic low-stock alerts with predictive analytics  
✅ **Analytics Dashboard** - Real-time consumption insights with anomaly detection  
✅ **Excel Integration** - Bidirectional import/export with fail-safe validation  
✅ **JWT Authentication** - Secure role-based access control  

### Unique Selling Propositions (USPs)

1. **Zero-Negative Guarantee System** - Database constraints + atomic transactions prevent negative inventory
2. **Smart Procurement Intelligence** - Predictive analytics calculate days until stockout
3. **Consumption Anomaly Detector** - Flags unusual consumption spikes automatically
4. **Enterprise Audit Trail** - Complete consumption history with user attribution
5. **Fail-Safe Excel Import** - Pre-validation with detailed error reporting
6. **Real-Time Dashboard** - Live updates with animated charts and counters
7. **Transaction-Safe Engine** - Bank-grade ACID compliance for all stock operations
8. **Predictive Analytics** - Recommended order quantities based on consumption patterns

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **File Handling**: Multer + xlsx
- **Validation**: express-validator

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Notifications**: React Toastify

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js v16 or higher
- PostgreSQL 14 or higher
- npm or yarn
```

### Installation

**1. Clone the repository**
```bash
cd C:\Users\user\OneDrive\Desktop\Hackathon
```

**2. Setup Backend**
```bash
cd backend
npm install

# Configure environment variables
# Edit .env file with your database credentials
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

**3. Setup Frontend**
```bash
cd ../frontend
npm install

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Default Login Credentials
```
Email: admin@electrolyte.com
Password: admin123
```

## 📊 Database Schema

The system uses 7 interconnected tables:

- **users** - Authentication and user management
- **components** - Electronic component inventory
- **pcbs** - PCB definitions
- **pcb_components** - Bill of Materials (BOM) mapping
- **production_entries** - Production logging
- **consumption_history** - Audit trail for stock changes
- **procurement_triggers** - Low-stock alerts

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
GET    /api/auth/me                - Get current user
```

### Components
```
GET    /api/components              - List all components (with pagination/search)
GET    /api/components/:id          - Get single component
POST   /api/components              - Add new component
PUT    /api/components/:id          - Update component
DELETE /api/components/:id          - Delete component
GET    /api/components/low-stock    - Get low-stock components
```

### PCBs
```
GET    /api/pcbs                    - List all PCBs
GET    /api/pcbs/:id                - Get PCB with BOM
POST   /api/pcbs                    - Create new PCB
PUT    /api/pcbs/:id                - Update PCB
DELETE /api/pcbs/:id                - Delete PCB
POST   /api/pcbs/:id/components     - Add component to BOM
PUT    /api/pcbs/:pcbId/components/:componentId  - Update BOM quantity
DELETE /api/pcbs/:pcbId/components/:componentId  - Remove from BOM
```

### Production
```
POST   /api/production              - Create production entry (atomic stock deduction)
GET    /api/production              - List production history
GET    /api/production/:id          - Get production entry details
GET    /api/production/preview      - Preview stock deduction before production
```

### Analytics
```
GET    /api/analytics/consumption-summary    - Component-wise consumption
GET    /api/analytics/top-consumed           - Top 10 consumed components
GET    /api/analytics/consumption-trends     - Time-series consumption data
GET    /api/analytics/dashboard-stats        - Overall dashboard statistics
GET    /api/analytics/category-distribution  - Category-wise distribution
```

### Procurement
```
GET    /api/procurement/triggers    - List procurement triggers
POST   /api/procurement/triggers    - Create manual trigger
PUT    /api/procurement/triggers/:id - Update trigger status
GET    /api/procurement/summary     - Procurement summary
```

### Excel
```
POST   /api/excel/import-components - Import components from Excel
GET    /api/excel/export-inventory  - Export inventory to Excel
GET    /api/excel/export-consumption - Export consumption report
GET    /api/excel/template          - Download import template
```

## 💡 Key Features Explained

### Atomic Stock Deduction
When a production entry is created, the system:
1. Validates all component stock availability
2. Begins a database transaction
3. Deducts stock for ALL components
4. Logs consumption history
5. Checks for procurement triggers
6. Commits transaction (or rolls back if any step fails)

This ensures **zero partial deductions** and maintains data integrity.

### Procurement Intelligence
The system automatically:
- Monitors stock levels against monthly requirements
- Triggers alerts when stock falls below 20%
- Calculates average daily consumption
- Predicts days until stockout
- Recommends order quantities (2 months supply)
- Prioritizes triggers (CRITICAL/HIGH/MEDIUM/LOW)

### Consumption Anomaly Detection
Uses statistical analysis to detect unusual consumption patterns:
- Calculates rolling 14-day average
- Compares today's consumption to average + 2 standard deviations
- Flags anomalies for investigation

## 📁 Project Structure

```
Hackathon/
├── backend/
│   ├── config/          - Database connection
│   ├── controllers/     - Business logic
│   ├── database/        - Schema and migrations
│   ├── middleware/      - Auth, validation, error handling
│   ├── routes/          - API endpoints
│   ├── uploads/         - Excel file uploads
│   └── server.js        - Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  - React components
│   │   ├── pages/       - Page components
│   │   ├── services/    - API calls
│   │   ├── utils/       - Helper functions
│   │   └── App.jsx      - Main app component
│   └── index.html
│
└── README.md
```

## 🎨 Frontend Features

- **Animated UI** - Framer Motion for smooth transitions
- **Real-time Charts** - Recharts for consumption visualization
- **Responsive Design** - Tailwind CSS for mobile-friendly layouts
- **Toast Notifications** - User feedback for all actions
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - Graceful error messages

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- CORS configuration

## 📈 Performance Optimizations

- Database indexing on frequently queried fields
- Connection pooling for PostgreSQL
- Pagination for large datasets
- Debounced search inputs
- Lazy loading for components

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend (Railway/Render)
```bash
# Set environment variables in platform dashboard
# Deploy from GitHub repository
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

## 👥 Team

**INVICTUS Hackathon Team**  
Electrolyte Solutions Challenge

## 📄 License

MIT License - Built for INVICTUS 24-Hour Hackathon

## 🙏 Acknowledgments

- Electrolyte Solutions for the problem statement
- ISTE-VESIT for organizing INVICTUS
- All sponsors and mentors

---

**Built with ❤️ in 24 hours for INVICTUS Hackathon**
