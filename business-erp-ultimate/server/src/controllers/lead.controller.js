import pool from '../config/db.js';

export async function getLeads(request, reply) {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    return reply.send({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get leads error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function getLeadById(request, reply) {
  const { id } = request.params;
  try {
    const leadResult = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (!leadResult.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Lead not found' });
    }

    // Check if this lead has an associated opportunity
    const oppResult = await pool.query('SELECT * FROM opportunities WHERE lead_id = $1', [id]);

    return reply.send({
      success: true,
      data: {
        ...leadResult.rows[0],
        opportunity: oppResult.rows[0] || null,
      },
    });
  } catch (err) {
    console.error('Get lead by id error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function createLead(request, reply) {
  const { customer_name, company_name, email, phone, requirement, status } = request.body;

  if (!customer_name) {
    return reply.status(400).send({ success: false, message: 'Customer name is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (customer_name, company_name, email, phone, requirement, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_name, company_name || null, email || null, phone || null, requirement || null, status || 'New']
    );
    return reply.status(201).send({ success: true, data: result.rows[0], message: 'Lead created successfully' });
  } catch (err) {
    console.error('Create lead error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function updateLead(request, reply) {
  const { id } = request.params;
  const { customer_name, company_name, email, phone, requirement, status } = request.body;

  try {
    const existing = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Lead not found' });
    }

    const result = await pool.query(
      `UPDATE leads SET customer_name=$1, company_name=$2, email=$3, phone=$4, requirement=$5, status=$6
       WHERE id=$7 RETURNING *`,
      [
        customer_name || existing.rows[0].customer_name,
        company_name ?? existing.rows[0].company_name,
        email ?? existing.rows[0].email,
        phone ?? existing.rows[0].phone,
        requirement ?? existing.rows[0].requirement,
        status || existing.rows[0].status,
        id,
      ]
    );
    return reply.send({ success: true, data: result.rows[0], message: 'Lead updated successfully' });
  } catch (err) {
    console.error('Update lead error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function convertLeadToOpportunity(request, reply) {
  const { id } = request.params;
  const { product_name, quantity, estimated_value } = request.body;

  if (!product_name || !quantity) {
    return reply.status(400).send({ success: false, message: 'Product name and quantity are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const leadResult = await client.query('SELECT * FROM leads WHERE id = $1', [id]);
    if (!leadResult.rows[0]) {
      await client.query('ROLLBACK');
      return reply.status(404).send({ success: false, message: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    if (lead.status === 'Converted') {
      await client.query('ROLLBACK');
      return reply.status(400).send({ success: false, message: 'Lead has already been converted' });
    }

    const oppResult = await client.query(
      `INSERT INTO opportunities (lead_id, customer_name, product_name, quantity, estimated_value, status)
       VALUES ($1, $2, $3, $4, $5, 'Open') RETURNING *`,
      [id, lead.customer_name, product_name, quantity, estimated_value || 0]
    );

    await client.query(`UPDATE leads SET status = 'Converted' WHERE id = $1`, [id]);

    await client.query('COMMIT');

    return reply.status(201).send({
      success: true,
      data: oppResult.rows[0],
      message: 'Lead converted to opportunity successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Convert lead error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
}
