const { query, getClient } = require('../config/database');

// Get all PCBs
const getAllPCBs = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT p.*, 
        COUNT(DISTINCT pc.component_id) as component_count
       FROM pcbs p
       LEFT JOIN pcb_components pc ON p.id = pc.pcb_id
       GROUP BY p.id
       ORDER BY p.pcb_name ASC`
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

// Get single PCB with complete BOM
const getPCBById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get PCB details
        const pcbResult = await query('SELECT * FROM pcbs WHERE id = $1', [id]);

        if (pcbResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PCB not found',
            });
        }

        // Get BOM (Bill of Materials)
        const bomResult = await query(
            `SELECT 
        pc.id as mapping_id,
        pc.quantity_per_pcb,
        c.id as component_id,
        c.component_name,
        c.part_number,
        c.current_stock,
        c.category,
        c.unit_price,
        (c.unit_price * pc.quantity_per_pcb) as cost_per_pcb
       FROM pcb_components pc
       JOIN components c ON pc.component_id = c.id
       WHERE pc.pcb_id = $1
       ORDER BY c.component_name ASC`,
            [id]
        );

        // Calculate total cost per PCB
        const totalCost = bomResult.rows.reduce((sum, item) => sum + parseFloat(item.cost_per_pcb || 0), 0);

        res.json({
            success: true,
            data: {
                ...pcbResult.rows[0],
                bom: bomResult.rows,
                total_cost_per_pcb: parseFloat(totalCost.toFixed(2)),
                component_count: bomResult.rows.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create new PCB
const createPCB = async (req, res, next) => {
    try {
        const { pcb_name, pcb_code, description } = req.body;

        const result = await query(
            'INSERT INTO pcbs (pcb_name, pcb_code, description) VALUES ($1, $2, $3) RETURNING *',
            [pcb_name, pcb_code, description]
        );

        res.status(201).json({
            success: true,
            message: 'PCB created successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Update PCB
const updatePCB = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { pcb_name, pcb_code, description } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 0;

        if (pcb_name !== undefined) {
            paramCount++;
            updates.push(`pcb_name = $${paramCount}`);
            values.push(pcb_name);
        }
        if (pcb_code !== undefined) {
            paramCount++;
            updates.push(`pcb_code = $${paramCount}`);
            values.push(pcb_code);
        }
        if (description !== undefined) {
            paramCount++;
            updates.push(`description = $${paramCount}`);
            values.push(description);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update',
            });
        }

        values.push(id);
        const result = await query(
            `UPDATE pcbs SET ${updates.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PCB not found',
            });
        }

        res.json({
            success: true,
            message: 'PCB updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Delete PCB
const deletePCB = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM pcbs WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PCB not found',
            });
        }

        res.json({
            success: true,
            message: 'PCB deleted successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Add component to PCB BOM
const addComponentToBOM = async (req, res, next) => {
    try {
        const { id } = req.params; // PCB ID
        const { component_id, quantity_per_pcb } = req.body;

        // Verify PCB exists
        const pcbCheck = await query('SELECT id FROM pcbs WHERE id = $1', [id]);
        if (pcbCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PCB not found',
            });
        }

        // Verify component exists
        const compCheck = await query('SELECT id, component_name FROM components WHERE id = $1', [component_id]);
        if (compCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Component not found',
            });
        }

        const result = await query(
            'INSERT INTO pcb_components (pcb_id, component_id, quantity_per_pcb) VALUES ($1, $2, $3) RETURNING *',
            [id, component_id, quantity_per_pcb]
        );

        res.status(201).json({
            success: true,
            message: 'Component added to BOM successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Update component quantity in BOM
const updateBOMComponent = async (req, res, next) => {
    try {
        const { pcbId, componentId } = req.params;
        const { quantity_per_pcb } = req.body;

        const result = await query(
            'UPDATE pcb_components SET quantity_per_pcb = $1 WHERE pcb_id = $2 AND component_id = $3 RETURNING *',
            [quantity_per_pcb, pcbId, componentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'BOM mapping not found',
            });
        }

        res.json({
            success: true,
            message: 'BOM component updated successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// Remove component from BOM
const removeComponentFromBOM = async (req, res, next) => {
    try {
        const { pcbId, componentId } = req.params;

        const result = await query(
            'DELETE FROM pcb_components WHERE pcb_id = $1 AND component_id = $2 RETURNING *',
            [pcbId, componentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'BOM mapping not found',
            });
        }

        res.json({
            success: true,
            message: 'Component removed from BOM successfully',
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPCBs,
    getPCBById,
    createPCB,
    updatePCB,
    deletePCB,
    addComponentToBOM,
    updateBOMComponent,
    removeComponentFromBOM,
};
