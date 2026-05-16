import pool from '../config/db.js';

export async function getInventory(request, reply) {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY item_name ASC');
    return reply.send({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get inventory error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function createInventoryItem(request, reply) {
  const { item_name, sku, quantity, unit, reorder_level } = request.body;

  if (!item_name || !sku) {
    return reply.status(400).send({ success: false, message: 'Item name and SKU are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO inventory (item_name, sku, quantity, unit, reorder_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [item_name, sku, quantity || 0, unit || 'pcs', reorder_level || 10]
    );
    return reply.status(201).send({
      success: true,
      data: result.rows[0],
      message: 'Inventory item created successfully',
    });
  } catch (err) {
    if (err.code === '23505') {
      return reply.status(400).send({ success: false, message: 'SKU already exists' });
    }
    console.error('Create inventory item error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function updateInventoryItem(request, reply) {
  const { id } = request.params;
  const { item_name, sku, quantity, unit, reorder_level } = request.body;

  try {
    const existing = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Inventory item not found' });
    }

    const result = await pool.query(
      `UPDATE inventory SET item_name=$1, sku=$2, quantity=$3, unit=$4, reorder_level=$5, last_updated=NOW()
       WHERE id=$6 RETURNING *`,
      [
        item_name || existing.rows[0].item_name,
        sku || existing.rows[0].sku,
        quantity ?? existing.rows[0].quantity,
        unit || existing.rows[0].unit,
        reorder_level ?? existing.rows[0].reorder_level,
        id,
      ]
    );
    return reply.send({
      success: true,
      data: result.rows[0],
      message: 'Inventory item updated successfully',
    });
  } catch (err) {
    console.error('Update inventory item error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}
