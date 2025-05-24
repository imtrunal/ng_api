const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Client = mongoose.model("Clients", clientSchema);
module.exports = Client;