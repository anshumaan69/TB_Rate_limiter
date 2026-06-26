import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

class PrismaClientSingleton {
  static instance;

  constructor() {
    throw new Error("Cannot instantiate singleton class directly.");
  }

  static getInstance() {
    if (!PrismaClientSingleton.instance) {
      const connectionString = process.env.DL;
      if (!connectionString) {
        throw new Error("Database connection string (process.env.DL) is not defined");
      }
      const pool = new pg.Pool({ connectionString });
      const adapter = new PrismaPg(pool);

      PrismaClientSingleton.instance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error'] 
          : ['error']
      });
    }
    return PrismaClientSingleton.instance;
  }
}

export const prisma = PrismaClientSingleton.getInstance();

export const resetPrismaInstance = () => {
  if (PrismaClientSingleton.instance) {
    PrismaClientSingleton.instance.$disconnect();
    PrismaClientSingleton.instance = null;
  }
};
