export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
}
