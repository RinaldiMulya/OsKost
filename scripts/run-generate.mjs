import pg from "pg";
const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
const clean = url.split("?")[0];
const pool = new pg.Pool({ connectionString: clean, ssl: { rejectUnauthorized: false } });
const toPeriod = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const addMonths = (d,m) => { const nd=new Date(d); nd.setMonth(nd.getMonth()+m); return nd; };
const now = new Date();
try {
  const leases = await pool.query(`SELECT l.id, l."startDate", l."endDate", r.price FROM "Lease" l JOIN "Room" r ON r.id=l."roomId" WHERE l."isActive"=true ORDER BY l."startDate"`);
  const invoices = await pool.query(`SELECT id, "leaseId", "externalId", "dueDate", amount, "rentAmount", "utilityAmount", "otherAmount" FROM "Invoice" ORDER BY "dueDate"`);
  const byLease = new Map();
  for (const inv of invoices.rows) {
    if (!byLease.has(inv.leaseId)) byLease.set(inv.leaseId, []);
    byLease.get(inv.leaseId).push(inv);
  }
  let created=0, backfilled=0, skipped=0;
  for (const lease of leases.rows) {
    const invs = byLease.get(lease.id) || [];
    const last = invs[invs.length-1];
    const rentAmt = last?.rentAmount ?? lease.price ?? 0;
    const utilAmt = last?.utilityAmount ?? 0;
    const otherAmt = last?.otherAmount ?? 0;
    const totalAmount = last?.amount ?? rentAmt + utilAmt + otherAmt;
    const existingIds = new Set(invs.map(i=>i.externalId).filter(Boolean));
    const periodMap = new Map(invs.map(i=>[toPeriod(new Date(i.dueDate)), i]));
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : now;
    const effectiveEnd = end < now ? end : now;
    let idx=0, cur=new Date(start);
    while (cur <= effectiveEnd) {
      const period=toPeriod(cur);
      const ext=`INV-${lease.id}-${period}`;
      const byPeriod=periodMap.get(period);
      if (byPeriod && !byPeriod.externalId) {
        await pool.query(`UPDATE "Invoice" SET "externalId"=$1 WHERE id=$2`, [ext, byPeriod.id]);
        console.log(`backfill ${lease.id} ${period} -> ${ext} (id ${byPeriod.id})`);
        backfilled++; existingIds.add(ext);
      } else if (!existingIds.has(ext) && !byPeriod) {
        const due = new Date(cur);
        await pool.query(`INSERT INTO "Invoice" (id, "leaseId", "dueDate", amount, "rentAmount", "utilityAmount", "otherAmount", status, "externalId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'UNPAID', $7, now(), now())`, [lease.id, due, totalAmount, rentAmt, utilAmt, otherAmt, ext]);
        console.log(`create ${lease.id} ${period} due ${due.toISOString().slice(0,10)} -> ${ext}`);
        created++; existingIds.add(ext);
      } else skipped++;
      idx++; cur=addMonths(start, idx); if(idx>36) break;
    }
  }
  console.log(`\nDONE created=${created} backfilled=${backfilled} skipped=${skipped}`);
} catch(e){ console.error(e); process.exit(1); } finally { await pool.end(); }
