const Client = require("../Model/clients");

const addNewClient = async (req, res) => {
    try {
        const logos = req.files?.clientLogo;

        if (!logos || logos.length === 0) {
            return res.status(400).json({ error: "At least one client logo is required" });
        }

        const createdClients = await Promise.all(
            logos.map(file => {
                const client = new Client({ link: file.path });
                return client.save();
            })
        );

        return res.status(201).json(createdClients);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        return res.json(clients);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client not found' });
        return res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addNewClient,
    getAllClients,
    deleteClient
};
