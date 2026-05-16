import pool from '../config/db.js';

export async function getStats(request, reply) {
  try {
    const [
      leadsResult,
      opportunitiesResult,
      manufacturingResult,
      inventoryResult,
      employeesResult,
      lowStockResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query("SELECT COUNT(*) FROM opportunities WHERE status != 'Converted'"),
      pool.query('SELECT COUNT(*) FROM manufacturing_orders'),
      pool.query('SELECT COUNT(*) FROM inventory'),
      pool.query("SELECT COUNT(*) FROM employees WHERE status = 'Active'"),
      pool.query('SELECT COUNT(*) FROM inventory WHERE quantity <= reorder_level'),
    ]);

    const pendingMfg = await pool.query("SELECT COUNT(*) FROM manufacturing_orders WHERE status = 'Pending'");
    const inProgressMfg = await pool.query("SELECT COUNT(*) FROM manufacturing_orders WHERE status = 'In Progress'");
    const completedMfg = await pool.query("SELECT COUNT(*) FROM manufacturing_orders WHERE status = 'Completed'");

    return reply.send({
      success: true,
      data: {
        totalLeads: parseInt(leadsResult.rows[0].count),
        activeOpportunities: parseInt(opportunitiesResult.rows[0].count),
        totalManufacturingOrders: parseInt(manufacturingResult.rows[0].count),
        pendingManufacturingOrders: parseInt(pendingMfg.rows[0].count),
        inProgressManufacturingOrders: parseInt(inProgressMfg.rows[0].count),
        completedManufacturingOrders: parseInt(completedMfg.rows[0].count),
        warehouseItems: parseInt(inventoryResult.rows[0].count),
        activeEmployees: parseInt(employeesResult.rows[0].count),
        lowStockItems: parseInt(lowStockResult.rows[0].count),
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}
