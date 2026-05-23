import "dotenv/config";
import Redis from "ioredis";
import { connectDatabase } from "./config/database";
import { createApp } from "./app";
import { User } from "./models/User";

async function main(): Promise<void> {
  await connectDatabase(
    process.env.MONGO_URI ??
      "mongodb://localhost:27017/db_mbintangprayogautama_betest",
  );
  await User.createIndexes();

  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
  const app = createApp(redis);
  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => {
    console.log(`User service listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start user service:", err);
  process.exit(1);
});
