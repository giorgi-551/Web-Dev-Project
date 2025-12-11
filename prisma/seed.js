import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(" Seeding database...");

  // Create categories
  const techCategory = await prisma.category.create({
    data: { name: "Technology", slug: "technology", color: "#3B82F6" }
  });

  const marketingCategory = await prisma.category.create({
    data: { name: "Marketing", slug: "marketing", color: "#EC4899" }
  });

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "user"
    }
  });

  const organizer = await prisma.user.create({
    data: {
      email: "organizer@example.com",
      password: hashedPassword,
      name: "Event Organizer",
      role: "organizer"
    }
  });

  // Create event
  const event = await prisma.event.create({
    data: {
      title: "Web Development Workshop",
      description: "Learn React and Node.js",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      startTime: new Date("2024-12-20T10:00:00"),
      endTime: new Date("2024-12-20T16:00:00"),
      capacity: 100,
      organizerId: organizer.id,
      categoryId: techCategory.id,
      status: "published",
      isFeatured: true,
      tickets: {
        create: [
          {
            ticketType: "free",
            name: "Free Ticket",
            price: 0,
            quantity: 50,
            sold: 0
          },
          {
            ticketType: "paid",
            name: "Premium Ticket",
            price: 49.99,
            quantity: 50,
            sold: 0
          }
        ]
      }
    }
  });

  console.log(" Seeding complete!");
  console.log(" Test accounts:");
  console.log("   User: user@example.com / password123");
  console.log("   Organizer: organizer@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });