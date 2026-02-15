# Feature-to-Code Mapping Reference

**Quick reference for locating MVP and USP features in the codebase**

---

## 📦 MVP FEATURES

### MVP #1: Component Inventory Management
**Complete CRUD operations with smart filtering**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/componentController.js` | Full file | All CRUD operations, pagination, search, filtering |
| Frontend Page | `frontend/src/pages/Inventory.jsx` | Full file | Component list, add/edit forms, filters, search |
| Database Table | `backend/database/schema.sql` | 24-38 | Components table definition |
| API Routes | `backend/routes/component.routes.js` | Full file | REST API endpoints |

**Key Logic:**
- Pagination and search: `componentController.js` lines 1-100
- Low stock filtering: Query with `current_stock < (monthly_required_quantity * 0.2)`
- Validation: express-validator middleware

---

### MVP #2: PCB-Component Mapping (Bill of Materials)
**Dynamic BOM management linking PCBs to required components**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/pcbController.js` | Full file | PCB CRUD, BOM management |
| Frontend Page | `frontend/src/pages/PCBManagement.jsx` | Full file | PCB list, BOM editor |
| Database Tables | `backend/database/schema.sql` | 40-59 | PCBs and pcb_components tables |
| API Routes | `backend/routes/pcb.routes.js` | Full file | PCB and BOM endpoints |

**Key Logic:**
- Add component to BOM: `pcbController.js` lines 150-200
- Many-to-many relationship via `pcb_components` junction table
- Composite unique constraint prevents duplicate entries

---

### MVP #3: Atomic Stock Deduction (Production Entry)
**Transaction-safe production logging with automatic stock deduction**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/productionController.js` | 1-161 | Main production entry function |
| Frontend Page | `frontend/src/pages/Production.jsx` | Full file | Production form, preview, history |
| Database Table | `backend/database/schema.sql` | 61-71 | Production entries table |
| API Routes | `backend/routes/production.routes.js` | Full file | Production endpoints |

**Key Logic:**
- **Transaction BEGIN**: `productionController.js` line 13
- **Stock validation**: Lines 32-59
- **Atomic deduction**: Lines 70-96
- **Procurement triggers**: Lines 107-139
- **Transaction COMMIT**: Line 143
- **Transaction ROLLBACK**: Line 156

---

### MVP #4: Procurement Triggers (Automated Alerts)
**Automatic low-stock alerts with predictive analytics**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/procurementController.js` | Full file | Trigger management, predictions |
| Frontend Page | `frontend/src/pages/Procurement.jsx` | Full file | Trigger list, status updates |
| Database Table | `backend/database/schema.sql` | 85-98 | Procurement triggers table |
| Auto-creation | `backend/controllers/productionController.js` | 107-139 | Automatic trigger creation |

**Key Logic:**
- **Trigger creation**: When `stock < (monthly_required * 0.2)`
- **Priority calculation**: Lines 123-128
  - CRITICAL: < 10%
  - HIGH: < 15%
  - MEDIUM: < 20%
- **Recommended order**: `monthly_required * 2 - current_stock`
- **Days until stockout**: Lines 44-70

---

### MVP #5: Analytics Dashboard
**Real-time consumption insights with anomaly detection**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/analyticsController.js` | Full file | Dashboard stats, trends, anomalies |
| Frontend Page | `frontend/src/pages/Dashboard.jsx` | Full file | Dashboard UI with charts |
| Frontend Page | `frontend/src/pages/Analytics.jsx` | Full file | Detailed analytics page |
| Database Table | `backend/database/schema.sql` | 73-83 | Consumption history table |

**Key Logic:**
- **Dashboard stats**: `analyticsController.js` lines 4-101
- **Anomaly detection**: Lines 58-82
  - Today's consumption vs 30-day average
  - Flags if > 1.5x average
- **Charts**: Bar chart (top consumed), Doughnut chart (categories)
- **Parallel data fetching**: `Dashboard.jsx` lines 54-59

---

### MVP #6: Excel Integration
**Bidirectional import/export with fail-safe validation**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/excelController.js` | Full file | Import/export logic |
| Frontend Integration | `frontend/src/pages/Inventory.jsx` | Import/export buttons | UI for Excel operations |
| API Routes | `backend/routes/excel.routes.js` | Full file | Excel endpoints |

**Key Logic:**
- **Import validation**: `excelController.js` lines 30-91
  - Required fields check
  - Data type validation
  - Duplicate detection
- **Atomic import**: Lines 106-158
- **Export inventory**: Lines 170-227
- **Export consumption**: Lines 230-307
- **Template download**: Lines 310-357

---

### MVP #7: JWT Authentication
**Secure role-based access control**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Controller | `backend/controllers/authController.js` | Full file | Login, register, user management |
| Backend Middleware | `backend/middleware/auth.js` | Full file | JWT verification |
| Frontend Context | `frontend/src/context/AuthContext.jsx` | Full file | Auth state management |
| Frontend Pages | `frontend/src/pages/Login.jsx` | Full file | Login UI |
| Frontend Pages | `frontend/src/pages/Signup.jsx` | Full file | Signup UI |

**Key Logic:**
- **JWT generation**: `authController.js` using jsonwebtoken
- **Token verification**: `middleware/auth.js`
- **Protected routes**: All API routes use auth middleware
- **Role-based access**: Admin can delete production entries

---

## 🏆 USP FEATURES

### USP #1: Zero-Negative Guarantee System
**Database constraints + atomic transactions prevent negative inventory**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Database Constraint | `backend/database/schema.sql` | 36 | `CHECK (current_stock >= 0)` |
| Pre-validation | `backend/controllers/productionController.js` | 32-59 | Stock availability check |
| Atomic Transaction | `backend/controllers/productionController.js` | 13, 143, 156 | BEGIN/COMMIT/ROLLBACK |

---

### USP #2: Smart Procurement Intelligence
**Predictive analytics calculate days until stockout**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Auto-trigger Creation | `backend/controllers/productionController.js` | 107-139 | Creates triggers when stock < 20% |
| Priority Calculation | `backend/controllers/procurementController.js` | 123-128 | CRITICAL/HIGH/MEDIUM/LOW |
| Predictive Analytics | `backend/controllers/procurementController.js` | 44-70 | Days until stockout |
| Recommended Order | `backend/controllers/procurementController.js` | 146 | 2 months supply calculation |

---

### USP #3: Consumption Anomaly Detector
**Flags unusual consumption spikes automatically**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Anomaly Detection | `backend/controllers/analyticsController.js` | 58-82 | Statistical analysis |
| Dashboard Alert | `frontend/src/pages/Dashboard.jsx` | 196-217 | Visual anomaly alert |

**Algorithm:**
1. Get today's total consumption (lines 59-64)
2. Calculate 30-day rolling average (lines 66-76)
3. Flag anomaly if `today > (average * 1.5)` (line 81)

---

### USP #4: Enterprise Audit Trail
**Complete consumption history with user attribution**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Consumption Logging | `backend/controllers/productionController.js` | 90-96 | Logs every stock change |
| Database Table | `backend/database/schema.sql` | 73-83 | Consumption history table |
| History View | `frontend/src/pages/Analytics.jsx` | Full file | View consumption history |

**Tracked Data:**
- component_id, production_entry_id
- quantity_consumed
- stock_before, stock_after
- consumed_at timestamp

---

### USP #5: Fail-Safe Excel Import Validator
**Pre-validation with detailed error reporting**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Validation Logic | `backend/controllers/excelController.js` | 30-91 | Pre-validation before import |
| Error Reporting | `backend/controllers/excelController.js` | 82-90 | Detailed error response |
| Duplicate Check | `backend/controllers/excelController.js` | 93-104 | Checks for duplicate part numbers |

**Validation Steps:**
1. Required fields check (lines 38-47)
2. Data type validation (lines 49-61)
3. Collect all errors (lines 62-79)
4. Return errors WITHOUT importing (lines 82-90)
5. Check duplicates in file (lines 93-104)
6. Atomic import (lines 106-158)

---

### USP #6: Real-Time Dashboard
**Live updates with animated charts and counters**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Dashboard Page | `frontend/src/pages/Dashboard.jsx` | Full file | Real-time stats and charts |
| Stat Counter | `frontend/src/components/common/StatCounter.jsx` | Full file | Animated number counter |
| Parallel Fetching | `frontend/src/pages/Dashboard.jsx` | 54-59 | Fetch multiple endpoints |
| Animations | `frontend/src/pages/Dashboard.jsx` | 141-157 | Framer Motion animations |

**Features:**
- Animated stat counters
- Bar chart (top consumed components)
- Doughnut chart (category distribution)
- Smooth transitions with Framer Motion

---

### USP #7: Transaction-Safe Engine
**Bank-grade ACID compliance for all stock operations**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Production Entry | `backend/controllers/productionController.js` | 13, 143, 156 | BEGIN/COMMIT/ROLLBACK |
| Production Reversal | `backend/controllers/productionController.js` | 336-392 | Atomic stock restoration |
| Excel Import | `backend/controllers/excelController.js` | 112, 137, 154 | Atomic import transaction |

**Transaction Flow:**
1. `BEGIN` transaction
2. Validate all operations
3. Execute all operations
4. `COMMIT` if all succeed
5. `ROLLBACK` if any fail

---

### USP #8: Predictive Analytics
**Recommended order quantities based on consumption patterns**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Consumption Analysis | `backend/controllers/procurementController.js` | 46-57 | 30-day consumption history |
| Daily Average | `backend/controllers/procurementController.js` | 57 | total_consumed / days_active |
| Stockout Prediction | `backend/controllers/procurementController.js` | 58-60 | current_stock / avg_daily |
| Order Recommendation | `backend/controllers/procurementController.js` | 146 | 2 months supply - current |

---

## 🎯 ADVANCED FEATURES

### Production Reversal (Admin Only)
**Revert production entries and restore stock atomically**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Function | `backend/controllers/productionController.js` | 336-392 | deleteProductionEntry |
| Frontend UI | `frontend/src/pages/Production.jsx` | 90-100, 320-330 | Revert button (admin only) |

**Logic:**
1. Get consumption history (lines 345-349)
2. Revert stock for each component (lines 364-370)
3. Delete consumption history (line 373)
4. Delete production entry (line 376)
5. All in atomic transaction (lines 343, 378)

---

### Production Preview
**Preview stock impact before committing**

| Component | File Path | Lines | Description |
|-----------|-----------|-------|-------------|
| Backend Function | `backend/controllers/productionController.js` | 278-334 | getProductionPreview |
| Frontend UI | `frontend/src/pages/Production.jsx` | 49-64, 186-273 | Preview panel |

**Shows:**
- Component-by-component breakdown
- Current stock vs required
- Stock after production
- Insufficient stock warnings

---

## 📊 DATABASE SCHEMA REFERENCE

| Table | File | Lines | Purpose |
|-------|------|-------|---------|
| users | `backend/database/schema.sql` | 13-22 | Authentication and user management |
| components | `backend/database/schema.sql` | 24-38 | Electronic component inventory |
| pcbs | `backend/database/schema.sql` | 40-48 | PCB product definitions |
| pcb_components | `backend/database/schema.sql` | 50-59 | Bill of Materials (BOM) mapping |
| production_entries | `backend/database/schema.sql` | 61-71 | Production logging |
| consumption_history | `backend/database/schema.sql` | 73-83 | Audit trail for stock changes |
| procurement_triggers | `backend/database/schema.sql` | 85-98 | Low-stock alerts |

**Indexes:** Lines 100-108
**Triggers:** Lines 119-127
**Functions:** Lines 111-117

---

## 🔧 UTILITY FILES

### Database Setup
- **Migration**: `backend/database/migrate.js` - Creates all tables
- **Seed Data**: `backend/database/seed.js` - Sample data for testing
- **Schema**: `backend/database/schema.sql` - Complete database structure

### API Routes
- **Auth**: `backend/routes/auth.routes.js`
- **Components**: `backend/routes/component.routes.js`
- **PCBs**: `backend/routes/pcb.routes.js`
- **Production**: `backend/routes/production.routes.js`
- **Procurement**: `backend/routes/procurement.routes.js`
- **Analytics**: `backend/routes/analytics.routes.js`
- **Excel**: `backend/routes/excel.routes.js`

### Frontend Services
- **API Client**: `frontend/src/services/api.js` - Axios configuration
- **Component Service**: `frontend/src/services/componentService.js`
- **PCB Service**: `frontend/src/services/pcbService.js`
- **Production Service**: `frontend/src/services/productionService.js`
- **Procurement Service**: `frontend/src/services/procurementService.js`
- **Analytics Service**: `frontend/src/services/analyticsService.js`

---

## 🎨 FRONTEND COMPONENTS

### Common Components
- **GlassCard**: `frontend/src/components/common/GlassCard.jsx` - Glassmorphism card
- **AnimatedButton**: `frontend/src/components/common/AnimatedButton.jsx` - Button with animations
- **StatCounter**: `frontend/src/components/common/StatCounter.jsx` - Animated number counter
- **Badge**: `frontend/src/components/common/Badge.jsx` - Status badges
- **Skeleton**: `frontend/src/components/common/Skeleton.jsx` - Loading skeleton

### Pages
- **Dashboard**: `frontend/src/pages/Dashboard.jsx` - Main dashboard
- **Inventory**: `frontend/src/pages/Inventory.jsx` - Component management
- **PCB Management**: `frontend/src/pages/PCBManagement.jsx` - PCB and BOM management
- **Production**: `frontend/src/pages/Production.jsx` - Production entry
- **Procurement**: `frontend/src/pages/Procurement.jsx` - Procurement triggers
- **Analytics**: `frontend/src/pages/Analytics.jsx` - Detailed analytics
- **Login**: `frontend/src/pages/Login.jsx` - Login page
- **Signup**: `frontend/src/pages/Signup.jsx` - Signup page

---

## 🔍 QUICK SEARCH TIPS

**To find a specific feature:**
1. Check this document for the file path and line numbers
2. Open the file in your editor
3. Navigate to the specified lines
4. Read the comments for detailed explanation

**To understand the flow:**
1. Start with the frontend page (user interaction)
2. Follow to the API service call
3. Check the backend route
4. Read the controller function
5. Review the database schema

**Example: Understanding Production Entry**
1. Frontend: `Production.jsx` lines 66-88 (handleSubmit)
2. Service: `productionService.js` (create function)
3. Route: `production.routes.js` (POST /api/production)
4. Controller: `productionController.js` lines 6-161 (createProductionEntry)
5. Database: `schema.sql` lines 61-71 (production_entries table)
