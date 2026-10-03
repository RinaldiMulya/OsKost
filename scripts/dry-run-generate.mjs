import pg from "pg";
const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
const clean = url.split("?")[0];
const pool = new pg.Pool({ connectionString: clean, ssl: { rejectUnauthorized: false } });
const toPeriod = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const addMonths = (d,m) => { const nd=new Date(d); nd.setMonth(nd.getMonth()+m); return nd; };
const now = new Date("2026-09-08T00:00:00Z");
try {
  const leases = await pool.query(`SELECT l.id, l."startDate", l."endDate", l."isActive", r.price, u.email, tp."fullName", r.number as room FROM "Lease" l JOIN "Room" r ON r.id=l."roomId" JOIN "User" u ON u.id=l."userId" LEFT JOIN "TenantProfile" tp ON tp."userId"=u.id WHERE l."isActive"=true ORDER BY l."startDate"`);
  const invoices = await pool.query(`SELECT "leaseId", id, "externalId", "dueDate", amount FROM "Invoice" ORDER BY "dueDate"`);
  const byLease = new Map();
  for (const inv of invoices.rows) {
    if (!byLease.has(inv.leaseId)) byLease.set(inv.leaseId, []);
    byLease.get(inv.leaseId).push(inv);
  }
  let totalCreate=0, totalBackfill=0;
  for (const lease of leases.rows) {
    const invs = byLease.get(lease.id) || [];
    const existingIds = new Set(invs.map(i=>i.externalId).filter(Boolean));
    const periodMap = new Map(invs.map(i=>[toPeriod(new Date(i.dueDate)), i]));
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : now;
    const effectiveEnd = end < now ? end : now;
    let idx=0, cur=new Date(start);
    const actions=[];
    while (cur <= effectiveEnd) {
      const period=toPeriod(cur);
      const ext=`INV-${lease.id}-${period}`;
      const byPeriod=periodMap.get(period);
      if (byPeriod && !byPeriod.externalId) actions.push(`backfill ${period} -> ${ext} (existing ${byPeriod.id} due ${byPeriod.dueDate.toISOString().slice(0,10)})`);
      else if (!existingIds.has(ext) && !byPeriod) actions.push(`create ${period} due ${cur.toISOString().slice(0,10)} -> ${ext}`);
      idx++; cur=addMonths(start, idx); if(idx>36) break;
    }
    if (actions.length) {
      console.log(`\nLease ${lease.id} ${lease.fullName} Room ${lease.room} ${start.toISOString().slice(0,10)}..${lease.endDate?new Date(lease.endDate).toISOString().slice(0,10):"open"} (${invs.length} existing):`);
      actions.forEach(a=>console.log("  -",a));
      totalCreate += actions.filter(a=>a.startsWith("create")).length;
      totalBackfill += actions.filter(a=>a.startsWith("backfill")).length;
    }
  }
  console.log(`\nTOTAL would create: ${totalCreate}, backfill: ${totalBackfill}`);
} catch(e){ console.error(e); } finally { await pool.end(); }
