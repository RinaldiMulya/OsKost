import pg from "pg";
const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) { console.error("No DATABASE_URL"); process.exit(1); }
const clean = url.split("?")[0];
const pool = new pg.Pool({ connectionString: clean, ssl: { rejectUnauthorized: false } });
try {
  const q = `
    SELECT u."email", u."phoneNumber", tp."fullName", r.number as room, l."startDate", l."endDate", l."isActive", l.id as leaseId,
           i.id as invoiceId, i."dueDate", i.amount, i.status, i."rentAmount", i."utilityAmount"
    FROM "User" u
    LEFT JOIN "TenantProfile" tp ON tp."userId" = u.id
    LEFT JOIN "Lease" l ON l."userId" = u.id
    LEFT JOIN "Room" r ON r.id = l."roomId"
    LEFT JOIN "Invoice" i ON i."leaseId" = l.id
    WHERE u.email IN ('rinaldimulyatam@gmail.com','luvianuraini04@gmail.com')
       OR u."phoneNumber" IN ('083871564637','088712368127')
    ORDER BY u.email, i."dueDate"
  `;
  const res = await pool.query(q);
  console.log(JSON.stringify(res.rows, null, 2));
  console.log("rows:", res.rows.length);
  // also count invoices per lease
  const q2 = `SELECT l.id, count(i.id) as cnt FROM "Lease" l LEFT JOIN "Invoice" i ON i."leaseId"=l.id GROUP BY l.id ORDER BY cnt DESC LIMIT 10`;
  const r2 = await pool.query(q2);
  console.log("lease invoice counts:", r2.rows);
} catch(e){ console.error(e); } finally { await pool.end(); }
