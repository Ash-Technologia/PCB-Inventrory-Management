-- PCB Inventory Management System - Database Schema
-- INVICTUS Hackathon - Electrolyte Solutions

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS consumption_history CASCADE;
DROP TABLE IF EXISTS procurement_triggers CASCADE;
DROP TABLE IF EXISTS production_entries CASCADE;
DROP TABLE IF EXISTS pcb_components CASCADE;
DROP TABLE IF EXISTS components CASCADE;
DROP TABLE IF EXISTS pcbs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table (Authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'ADMIN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Components Table (Inventory)
CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  component_name VARCHAR(255) NOT NULL,
  part_number VARCHAR(100) UNIQUE NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  monthly_required_quantity INTEGER NOT NULL,
  category VARCHAR(100),
  supplier VARCHAR(255),
  unit_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (current_stock >= 0),
  CHECK (monthly_required_quantity > 0)
);

-- PCBs Table
CREATE TABLE pcbs (
  id SERIAL PRIMARY KEY,
  pcb_name VARCHAR(255) NOT NULL,
  pcb_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PCB-Component Mapping Table (Bill of Materials)
CREATE TABLE pcb_components (
  id SERIAL PRIMARY KEY,
  pcb_id INTEGER REFERENCES pcbs(id) ON DELETE CASCADE,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  quantity_per_pcb INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pcb_id, component_id),
  CHECK (quantity_per_pcb > 0)
);

-- Production Entries Table
CREATE TABLE production_entries (
  id SERIAL PRIMARY KEY,
  pcb_id INTEGER REFERENCES pcbs(id),
  quantity_produced INTEGER NOT NULL,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity_produced > 0)
);

-- Consumption History Table (Audit Trail)
CREATE TABLE consumption_history (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  production_entry_id INTEGER REFERENCES production_entries(id),
  quantity_consumed INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity_consumed > 0)
);

-- Procurement Triggers Table
CREATE TABLE procurement_triggers (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES components(id),
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_stock INTEGER NOT NULL,
  monthly_required INTEGER NOT NULL,
  recommended_order_quantity INTEGER,
  status VARCHAR(50) DEFAULT 'PENDING',
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  resolved_at TIMESTAMP,
  CHECK (status IN ('PENDING', 'ORDERED', 'FULFILLED')),
  CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Indexes for Performance Optimization
CREATE INDEX idx_components_stock ON components(current_stock);
CREATE INDEX idx_components_part_number ON components(part_number);
CREATE INDEX idx_production_date ON production_entries(production_date);
CREATE INDEX idx_production_pcb ON production_entries(pcb_id);
CREATE INDEX idx_consumption_component ON consumption_history(component_id);
CREATE INDEX idx_consumption_production ON consumption_history(production_entry_id);
CREATE INDEX idx_procurement_status ON procurement_triggers(status);
CREATE INDEX idx_procurement_component ON procurement_triggers(component_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pcbs_updated_at BEFORE UPDATE ON pcbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully!' AS status;
