import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { dishes } from "./schema";

// Load env from web app
dotenv.config({ path: "../../apps/web/.env" });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const db = drizzle({ client });

const testDishes = [
  {
    name: "Butter Chicken",
    flavor_tags: ["savory", "creamy", "mild_spice"],
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
  },
  {
    name: "Chicken Tikka Masala",
    flavor_tags: ["spicy", "savory", "tomato"],
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  },
  {
    name: "Paneer Butter Masala",
    flavor_tags: ["creamy", "mild", "savory"],
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
  },
  {
    name: "Lamb Rogan Josh",
    flavor_tags: ["spicy", "aromatic", "rich"],
    image_url: "https://images.unsplash.com/photo-1545247181-516773cae754?w=400&h=300&fit=crop",
  },
  {
    name: "Dal Makhani",
    flavor_tags: ["creamy", "savory", "comfort"],
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  },
  {
    name: "Biryani",
    flavor_tags: ["aromatic", "spicy", "layered"],
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
  },
  {
    name: "Tandoori Chicken",
    flavor_tags: ["smoky", "spicy", "charred"],
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
  },
  {
    name: "Palak Paneer",
    flavor_tags: ["earthy", "mild", "creamy"],
    image_url: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=300&fit=crop",
  },
  {
    name: "Gulab Jamun",
    flavor_tags: ["sweet", "cardamom", "syrupy"],
    image_url: "https://images.unsplash.com/photo-1666190094762-2a10f012c5c9?w=400&h=300&fit=crop",
  },
  {
    name: "Rasmalai",
    flavor_tags: ["sweet", "milky", "saffron"],
    image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&h=300&fit=crop",
  },
  {
    name: "Mango Lassi",
    flavor_tags: ["sweet", "creamy", "fruity"],
    image_url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop",
  },
  {
    name: "Samosa",
    flavor_tags: ["savory", "spiced", "crispy"],
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  },
];

async function seed() {
  console.log("Seeding dishes...");

  for (const dish of testDishes) {
    await db.insert(dishes).values(dish).onConflictDoNothing();
    console.log(`  ✓ ${dish.name}`);
  }

  console.log("\nDone! Seeded", testDishes.length, "dishes.");

  // Show current dish count
  const allDishes = await db.select().from(dishes);
  console.log("\nTotal dishes in database:", allDishes.length);
}

seed().catch(console.error);
