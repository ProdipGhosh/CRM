import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function login(request, reply) {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.status(400).send({ success: false, message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return reply.status(401).send({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ success: false, message: 'Invalid email or password' });
    }

    const token = request.server.jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      { expiresIn: '24h' }
    );

    return reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return reply.status(500).send({ success: false, message: 'Internal server error' });
  }
}
