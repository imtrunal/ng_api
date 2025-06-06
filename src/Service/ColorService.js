const Color = require("../Model/color");

const addNewColor = async (colorData) => {
    const color = new Color(colorData);
    await color.save();
    return color;
};

const getAllColors = async () => {
    return await Color.find();
};

const getColorById = async (id) => {
    return await Color.findById(id);
};

const updateColor = async (id, updateData) => {
    return await Color.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

const deleteColor = async (id) => {
    return await Color.findByIdAndDelete(id);
};

module.exports = {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor,
};
