import pool from '../config/db.js';

export async function getManufacturingOrders(request, reply) {
  try {
    const result = await pool.query(
      `SELECT mo.*, o.customer_name, o.estimated_value
       FROM manufacturing_orders mo
       LEFT JOIN opportunities o ON mo.opportunity_id = o.id
       ORDER BY mo.created_at DESC`
    );
    return reply.send({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get manufacturing orders error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function getManufacturingOrderById(request, reply) {
  const { id } = request.params;
  try {
    const result = await pool.query(
      `SELECT mo.*, o.customer_name, o.estimated_value
       FROM manufacturing_orders mo
       LEFT JOIN opportunities o ON mo.opportunity_id = o.id
       WHERE mo.id = $1`,
      [id]
    );
    if (!result.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Manufacturing order not found' });
    }
    return reply.send({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get manufacturing order by id error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function updateManufacturingOrderStatus(request, reply) {
  const { id } = request.params;
  const { status } = request.body;

  const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return reply.status(400).send({
      success: false,
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const moResult = await client.query(
      'SELECT * FROM manufacturing_orders WHERE id = $1',
      [id]
    );

    if (!moResult.rows[0]) {
      await client.query('ROLLBACK');
      return reply.status(404).send({ success: false, message: 'Manufacturing order not found' });
    }

    const mo = moResult.rows[0];
    let inventoryDeductionLog = [];

    // Auto-deduct inventory when status becomes Completed
    if (status === 'Completed' && !mo.inventory_deducted) {
      const materials = mo.required_materials || [];

      for (const material of materials) {
        const { sku, required_qty, material: materialName } = material;

        // Check current stock
        const invResult = await client.query(
          'SELECT * FROM inventory WHERE sku = $1',
          [sku]
        );

        if (invResult.rows[0]) {
          const currentQty = invResult.rows[0].quantity;
          const newQty = Math.max(0, currentQty - required_qty);

          await client.query(
            `UPDATE inventory SET quantity = $1, last_updated = NOW() WHERE sku = $2`,
            [newQty, sku]
          );

          inventoryDeductionLog.push({
            material: materialName,
            sku,
            deducted: Math.min(currentQty, required_qty),
            remaining: newQty,
          });
        }
      }

      // Mark inventory as deducted to prevent double deduction
      await client.query(
        `UPDATE manufacturing_orders SET status = $1, inventory_deducted = true WHERE id = $2`,
        [status, id]
      );
    } else {
      await client.query(
        `UPDATE manufacturing_orders SET status = $1 WHERE id = $2`,
        [status, id]
      );
    }

    const updatedResult = await client.query(
      'SELECT * FROM manufacturing_orders WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    return reply.send({
      success: true,
      data: updatedResult.rows[0],
      inventoryDeducted: status === 'Completed' && !mo.inventory_deducted,
      inventoryDeductionLog,
      message:
        status === 'Completed' && !mo.inventory_deducted
          ? 'Manufacturing order completed and inventory automatically deducted'
          : `Manufacturing order status updated to ${status}`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update manufacturing order status error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
}
