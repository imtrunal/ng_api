const clientService = require("../Service/ClientService");

const addNewClient = async (req, res) => {
    try {
        const logos = req.files?.clientLogo;
        const createdClients = await clientService.addClients(logos);

        return res.status(201).json(createdClients);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await clientService.findAllClients();
        return res.status(200).json(clients);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteClient = async (req, res) => {
    try {
        const deleted = await clientService.deleteClientById(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Client deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addNewClient,
    getAllClients,
    deleteClient
};
