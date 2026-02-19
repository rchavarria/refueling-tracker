import cors from "cors";
import express, { type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;

