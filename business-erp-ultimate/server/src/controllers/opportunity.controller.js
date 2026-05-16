import pool from '../config/db.js';

export async function getOpportunities(request, reply) {
  try {
    const result = await pool.query(
      `SELECT o.*, l.company_name FROM opportunities o
       LEFT JOIN leads l ON o.lead_id = l.id
       ORDER BY o.created_at DESC`
    );
    return reply.send({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get opportunities error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function getOpportunityById(request, reply) {
  const { id } = request.params;
  try {
    const result = await pool.query(
      `SELECT o.*, l.company_name FROM opportunities o
       LEFT JOIN leads l ON o.lead_id = l.id
       WHERE o.id = $1`,
      [id]
    );
    if (!result.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Opportunity not found' });
    }

    const moResult = await pool.query(
      'SELECT * FROM manufacturing_orders WHERE opportunity_id = $1',
      [id]
    );

    return reply.send({
      success: true,
      data: { ...result.rows[0], manufacturing_order: moResult.rows[0] || null },
    });
  } catch (err) {
    console.error('Get opportunity by id error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function convertOpportunityToManufacturing(request, reply) {
  const { id } = request.params;
  const { required_materials } = request.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const oppResult = await client.query('SELECT * FROM opportunities WHERE id = $1', [id]);
    if (!oppResult.rows[0]) {
      await client.query('ROLLBACK');
      return reply.status(404).send({ success: false, message: 'Opportunity not found' });
    }

    const opp = oppResult.rows[0];

    if (opp.status === 'Converted') {
      await client.query('ROLLBACK');
      return reply.status(400).send({ success: false, message: 'Opportunity has already been converted to a manufacturing order' });
    }

    const materials = required_materials || [];

    const moResult = await client.query(
      `INSERT INTO manufacturing_orders (opportunity_id, product_name, quantity, required_materials, status, inventory_deducted)
       VALUES ($1, $2, $3, $4, 'Pending', false) RETURNING *`,
      [id, opp.product_name, opp.quantity, JSON.stringify(materials)]
    );

    await client.query(`UPDATE opportunities SET status = 'Converted' WHERE id = $1`, [id]);

    await client.query('COMMIT');

    return reply.status(201).send({
      success: true,
      data: moResult.rows[0],
      message: 'Opportunity converted to manufacturing order successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Convert opportunity error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
}
