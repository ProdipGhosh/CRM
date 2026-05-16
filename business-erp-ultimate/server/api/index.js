import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify();

await app.register(cors, {
  origin: true,
});

app.get("/", async () => {
  return {
    success: true,
    message: "Backend Working",
  };
});

app.post("/api/auth/login", async () => {
  return {
    success: true,
    token: "test-token",
  };
});

await app.ready();

export default async function handler(req, res) {
  app.server.emit("request", req, res);
}