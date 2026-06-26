import { prisma } from "../utils/prismaClient.js";
import * as clientRepository from "../repositories/clientRepository.js";
import * as tokenBucketService from "./tokenBucket/tokenBucketService.js";
import * as slidingWindowService from "./slidingWindow/slidingWindowService.js";

export const checkRequest = async (clientKey) => {
    return prisma.$transaction(async (tx) => {
        // 1. Client settings retrieve karein
        const client = await clientRepository.findByKey(clientKey, tx);
        if (!client) {
            throw new Error(`Client not configured: ${clientKey}`);
        }

        // 2. Algorithm ke basis par route karein
        if (client.algorithm === "token_bucket") {
            return tokenBucketService.checkLimit(client.client_key, client.rate, client.burst, tx);
        } else if (client.algorithm === "sliding_window") {
            return slidingWindowService.checkLimit(client.client_key, client.rate, client.burst, tx);
        } else {
            throw new Error(`Invalid rate limiting algorithm: ${client.algorithm}`);
        }
    }, {
        maxWait: 5000,
        timeout: 15000
    });
};
