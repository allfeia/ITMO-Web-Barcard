import express from 'express';
import cors from 'cors';
import pg from "pg";

const app = express();
const PORT = 3000;
const {Pool} = pg;

// Настройки подключения к PostgreSQL
const pool = new Pool({
    user: "postgres",        // замени на своего пользователя
    host: "localhost",
    database: "postgres",        // замени на свою базу
    password: "",  // замени на свой пароль
    port: 5433,              // твой порт
});

// Разрешаем CORS для всех источников
app.use(cors({
    origin: "*",
}));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/api/title", async (req, res) => {
   try {
       const result = await pool.query("SELECT name from titles");
       const titles = result.rows.map(row => row.name);

       res.json(titles);
       console.log(titles);
   } catch (err) {
       console.log(err);
       res.status(500).json({error: err.message});
   }
});

app.use((req, res) => {
    res.status(404).send("Not Found");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
