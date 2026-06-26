import * as clientRepository from "../repositories/clientRepository.js"

// Helper function to format response
const formatClient = (client) => ({
    clientKey: client.client_key,
    algorithm: client.algorithm,
    rate: client.rate,
    burst: client.burst
});

export const createClient = async (req, res) => {
    try {
        const { clientKey, algorithm, rate, burst } = req.body
        if (!clientKey || !algorithm || rate == undefined || burst == undefined) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const client = await clientRepository.create({ clientKey, algorithm, rate, burst })
        return res.status(201).json({
            message: "Client created successfully",
            client: formatClient(client)
        })
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Client key already exists" })
        }
        return res.status(500).json({ error: error.message })
    }
}

export const getClient = async (req, res) => {
    try {
        const { clientKey } = req.params
        const client = await clientRepository.findByKey(clientKey) // Fix: findByKey
        if (!client) {
            return res.status(404).json({ error: "Client not found" }) // Fix: static message
        }
        return res.status(200).json(formatClient(client)) // Fix: format before returning
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const updateClient = async (req, res) => {
    try {
        const { clientKey } = req.params;
        const { rate, burst } = req.body;
        if (rate === undefined || burst === undefined) {
            return res.status(400).json({ error: "Rate and burst are required for update" })
        }
        const client = await clientRepository.update(clientKey, { rate, burst }) // Fix: update
        return res.status(200).json({
            message: "Client updated",
            client: formatClient(client)
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
