-- Demo Data Script: Create Low Stock and Critical Stock Components
-- This script updates existing components to demonstrate procurement triggers

-- Set some components to CRITICAL stock (< 10% of monthly requirement)
UPDATE components 
SET current_stock = FLOOR(monthly_required_quantity * 0.05)
WHERE id IN (
    SELECT id FROM components 
    ORDER BY RANDOM() 
    LIMIT 5
);

-- Set some components to LOW stock (10-20% of monthly requirement)
UPDATE components 
SET current_stock = FLOOR(monthly_required_quantity * 0.15)
WHERE id IN (
    SELECT id FROM components 
    WHERE current_stock > (monthly_required_quantity * 0.2)
    ORDER BY RANDOM() 
    LIMIT 8
);

-- Set some components to ADEQUATE stock (20-50% of monthly requirement)
UPDATE components 
SET current_stock = FLOOR(monthly_required_quantity * 0.35)
WHERE id IN (
    SELECT id FROM components 
    WHERE current_stock > (monthly_required_quantity * 0.5)
    ORDER BY RANDOM() 
    LIMIT 10
);

-- Verify the changes
SELECT 
    CASE 
        WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
        WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
        WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
        ELSE 'NORMAL'
    END as stock_status,
    COUNT(*) as count
FROM components
GROUP BY stock_status
ORDER BY 
    CASE stock_status
        WHEN 'CRITICAL' THEN 1
        WHEN 'LOW' THEN 2
        WHEN 'ADEQUATE' THEN 3
        WHEN 'NORMAL' THEN 4
    END;

-- Show sample components in each category
SELECT 
    component_name,
    current_stock,
    monthly_required_quantity,
    ROUND((current_stock::numeric / monthly_required_quantity::numeric * 100), 1) as stock_percentage,
    CASE 
        WHEN current_stock < (monthly_required_quantity * 0.1) THEN 'CRITICAL'
        WHEN current_stock < (monthly_required_quantity * 0.2) THEN 'LOW'
        WHEN current_stock < (monthly_required_quantity * 0.5) THEN 'ADEQUATE'
        ELSE 'NORMAL'
    END as stock_status
FROM components
ORDER BY stock_percentage ASC
LIMIT 20;
