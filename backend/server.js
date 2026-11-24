const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create the table on startup (retry a few times in case the DB is still warming up)
async function initDb(retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      console.log("Database ready");
      return;
    } catch (err) {
      console.log(`DB not ready (${i + 1}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Could not connect to the database");
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/todos", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM todos ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/todos", async (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) return res.status(400).json({ error: "title is required" });
  const { rows } = await pool.query(
    "INSERT INTO todos (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(rows[0]);
});

app.patch("/api/todos/:id", async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE todos SET done = NOT done WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.delete("/api/todos/:id", async (req, res) => {
  await pool.query("DELETE FROM todos WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

const port = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
