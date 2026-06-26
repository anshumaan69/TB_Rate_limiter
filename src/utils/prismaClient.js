import { PrismaClient } from "@prisma/client";

class PrismaClientSingleton {
  static instance;

  constructor() {
    throw new Error("Cannot instantiate singleton class directly.");
  }

  static getInstance() {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
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
  PrismaClientSingleton.instance = null;
};
