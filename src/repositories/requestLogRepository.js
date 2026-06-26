import { prisma } from "../utils/prismaClient.js";

//add a log 
export const add = async (client_key, tx = prisma) => {
    return await tx.request_logs.create({ data: { client_key } })
}
//count in window (I will use in Sliding Window)
export const countInWindow = (client_key, since, tx = prisma) => {
    return tx.request_logs.count({ where: { client_key, request_time: { gte: since } } })//gte means greater than or equal to
}
//clear old logs (I will use in Sliding Window)
export const clearOldLogs = (client_key, before, tx = prisma) => {
    return tx.request_logs.deleteMany({ where: { client_key, request_time: { lt: before } } })//tl means lesser than

}