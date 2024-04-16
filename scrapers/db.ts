// db.js
import postgres from "postgres";

const sql = postgres({
  host: "localhost",
  port: 5432,
  password: "amine",
  user: "amine",
  database: "news"
}); 


export default sql;
