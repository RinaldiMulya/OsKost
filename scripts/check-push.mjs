import pg from "pg";
const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
const clean = url.split("?")[0];
const pool = new pg.Pool({ connectionString: clean, ssl: { rejectUnauthorized: false } });
try {
  const r = await pool.query(`SELECT count(*) as cnt FROM "PushSubscription"`);
  console.log("PushSubscription count:", r.rows[0].cnt);
  const r2 = await pool.query(`SELECT "userId", endpoint, "createdAt" FROM "PushSubscription" ORDER BY "createdAt" DESC LIMIT 5`);
  console.log(r2.rows.map(x=>({userId:x.userId.slice(0,8), endpoint:x.endpoint.slice(0,60)+"...", createdAt:x.createdAt})));
  const r3 = await pool.query(`SELECT count(*) as cnt FROM "Notification"`);
  console.log("Notification count:", r3.rows[0].cnt);
} catch(e){ console.error(e); } finally { await pool.end(); }
