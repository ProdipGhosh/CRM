import pool from '../config/db.js';

export async function getEmployees(request, reply) {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
    return reply.send({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get employees error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function createEmployee(request, reply) {
  const { name, email, department, designation, status } = request.body;

  if (!name || !email) {
    return reply.status(400).send({ success: false, message: 'Name and email are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO employees (name, email, department, designation, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, department || null, designation || null, status || 'Active']
    );
    return reply.status(201).send({
      success: true,
      data: result.rows[0],
      message: 'Employee created successfully',
    });
  } catch (err) {
    if (err.code === '23505') {
      return reply.status(400).send({ success: false, message: 'Email already exists' });
    }
    console.error('Create employee error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function updateEmployee(request, reply) {
  const { id } = request.params;
  const { name, email, department, designation, status } = request.body;

  try {
    const existing = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      return reply.status(404).send({ success: false, message: 'Employee not found' });
    }

    const result = await pool.query(
      `UPDATE employees SET name=$1, email=$2, department=$3, designation=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [
        name || existing.rows[0].name,
        email || existing.rows[0].email,
        department ?? existing.rows[0].department,
        designation ?? existing.rows[0].designation,
        status || existing.rows[0].status,
        id,
      ]
    );
    return reply.send({
      success: true,
      data: result.rows[0],
      message: 'Employee updated successfully',
    });
  } catch (err) {
    console.error('Update employee error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}
