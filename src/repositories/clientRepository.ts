import { prisma } from "../utils/prismaClient"
import { clients } from "../generated/prisma/client"

@param clientData
@returns
export const create(data: {
    client_key: string,
    algorithm: string,
    rate: number,
    burst: number

}) => {
    const client = await prisma.clients.create({
        data: {
            client_key: data.client_key,
            algorithm: data.algorithm,
            rate: data.rate,
            burst: data.burst,
            created_at: new Date(),
            updated_at: new Date()
        }
    })
    return client
}