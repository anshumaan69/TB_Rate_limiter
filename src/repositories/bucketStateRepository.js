import { prisma } from "../utils/prismaClient.js";

export const getForUpdate = async (client_key, tx = prisma) => {
    const [state] = await tx.$queryRaw`select * from bucket_state where client_key=${client_key} for update`
    return state || null;

}

export const upsert = async (client_key, tokens, last_refill, tx = prisma) => {
    await tx.bucket_state.upsert({
        where: { client_key },
        create: { client_key, tokens, last_refill },
        update: { tokens, last_refill }
    })
}

