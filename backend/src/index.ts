import cors from "cors";
import express, { type Request, type Response } from "express";
import prisma from "./lib/prisma";
import vehiclesRouter from "./routes/vehicles.router.js";
import refuelingsRouter from "./routes/refuelings.router.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/vehicles", vehiclesRouter);
app.use("/api/refuelings", refuelingsRouter);

const server = app.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.debug('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.debug('HTTP server closed');
		prisma.$disconnect();
  });
});

export default app;

