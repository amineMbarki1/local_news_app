import sql from "./db";
import express from "express";

const app = express();
const port = 3000;

app.get("/articles", async (req, res) => {
  const result = await sql`SElECT * FROM news_articles`;
  res.json(result);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
