const { default: status } = require("http-status");
const clientService = require("../Service/ClientService");
const { errorResponse, successResponse } = require("../utils/apiResponse");
const { destroyFile } = require("../utils/upload");

const addNewClient = async (req, res) => {
    try {
        const logos = req.files?.clientLogo;
        logos.forEach(file => {
            file.path =`${req.protocol}://${req.get("host")}/uploads/clients/${file.filename}`;
        });
        const createdClients = await clientService.addClients(logos);
        return successResponse(req, res, status.OK, "New Client Added Successfully!!", createdClients);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await clientService.findAllClients();
        return successResponse(req, res, status.OK, "Clients Fetched Successfully", clients);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const deleteClient = async (req, res) => {
    try {
        const deleted = await clientService.deleteClientById(req.params.id);
        if (!deleted) {
            return errorResponse(req, res, status.NOT_FOUND, "Client Not Found");
        }
        await destroyFile(deleted.link);
        return successResponse(req, res, status.OK, "Client Deleted Successfully!!");
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    addNewClient,
    getAllClients,
    deleteClient
};
