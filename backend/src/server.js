require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
// Railway uses GET /health to determine whether the service is live.
app.get("/health", async (req, res) => {
  try {
    // Verify the database connection is reachable.
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (err) {
    console.error("Health check DB error:", err.message);
    // Return 200 so the process stays up even if the DB is temporarily
    // unavailable (e.g. during a cold start), but surface the error.
    res.status(200).json({ status: "ok", db: "unavailable", error: err.message });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "NutriApp API is running 🥗" });
});

// Users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });
  try {
    const user = await prisma.user.create({ data: { email, name } });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Food items
app.get("/food-items", async (req, res) => {
  try {
    const items = await prisma.foodItem.findMany();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

app.post("/food-items", async (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body;
  if (!name || calories == null)
    return res.status(400).json({ error: "name and calories are required" });
  try {
    const item = await prisma.foodItem.create({
      data: { name, calories, protein, carbs, fat },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create food item" });
  }
});

// Food logs
app.get("/logs/:userId", async (req, res) => {
  try {
    const logs = await prisma.foodLog.findMany({
      where: { userId: Number(req.params.userId) },
      include: { foodItem: true },
      orderBy: { loggedAt: "desc" },
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.post("/logs", async (req, res) => {
  const { userId, foodItemId, quantity } = req.body;
  if (!userId || !foodItemId)
    return res.status(400).json({ error: "userId and foodItemId are required" });
  try {
    const log = await prisma.foodLog.create({
      data: { userId: Number(userId), foodItemId: Number(foodItemId), quantity: quantity ?? 1 },
      include: { foodItem: true },
    });
    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create log entry" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("⚠️  Could not connect to database:", err.message);
    // Don't exit — Railway will restart on failure; let the health check
    // surface the DB state instead.
  }

  app.listen(PORT, () => {
    console.log(`🚀 NutriApp server listening on port ${PORT}`);
  });
}

main();
