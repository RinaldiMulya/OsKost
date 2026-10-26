import "dotenv/config";
import { prisma } from "../src/lib/db";
import bcryptjs from "bcryptjs";

async function main() {
    try {
        const rooms = await prisma.room.findMany({
            select: { id: true, number: true, name: true, status: true, propertyId: true },
            orderBy: { number: "asc" }
        });
        console.log("=== ROOMS IN DATABASE ===");
        console.log(rooms);

        // Check if Kamar 005 exists
        const room005 = rooms.find(r => r.number === "005");
        console.log("Room 005 found:", room005);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
