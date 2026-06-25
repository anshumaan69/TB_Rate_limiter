// src/utils/prismaClient.ts
// Singleton pattern to prevent multiple connections
class PrismaClientSingleton {
  private static instance: any;

  private constructor() {}

  public static getInstance(): any {
    if (!PrismaClientSingleton.instance) {
      const { PrismaClient } = require('@prisma/client');
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

// For testing: allow resetting the instance
export const resetPrismaInstance = (): void => {
  // @ts-ignore - resetting singleton for testing
  PrismaClientSingleton.instance = null;
};