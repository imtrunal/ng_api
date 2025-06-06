const Client = require("../Model/clients");

const addClients = async (files) => {
    if (!files || files.length === 0) {
        throw new Error("At least one client logo is required");
    }

    const createdClients = await Promise.all(
        files.map(file => {
            const client = new Client({ link: file.path });
            return client.save();
        })
    );

    return createdClients;
};

const findAllClients = async () => {
    return await Client.find();
};

const deleteClientById = async (id) => {
    return await Client.findByIdAndDelete(id);
};

module.exports = {
    addClients,
    findAllClients,
    deleteClientById
};
