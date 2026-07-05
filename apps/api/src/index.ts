import { buildApp } from "./server.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

try {
  const app = await buildApp({ logger: true });
  await app.listen({ port, host });
} catch (error) {
  console.error(error);
  process.exit(1);
}
