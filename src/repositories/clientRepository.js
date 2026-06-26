import { prisma } from "../utils/prismaClient.js";

// Creates a new client in the database
export const create = ({ clientKey: client_key, algorithm, rate, burst }, tx = prisma) => 
  tx.clients.create({ data: { client_key, algorithm, rate, burst } });

// Finds a client by their unique client key
export const findByKey = (client_key, tx = prisma) => 
  tx.clients.findUnique({ where: { client_key } });

// Updates an existing client's configuration
export const update = (client_key, data, tx = prisma) => 
  tx.clients.update({ where: { client_key }, data });
