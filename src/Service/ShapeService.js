const Shape = require("../Model/shape");

const addNewShape = async (shapeData) => {
    const shape = new Shape(shapeData);
    await shape.save();
    return shape;
};

const getAllShapes = async () => {
    return await Shape.find();
};

const getShapeById = async (id) => {
    return await Shape.findById(id);
};

const updateShape = async (id, updateData) => {
    return await Shape.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

const deleteShape = async (id) => {
    return await Shape.findByIdAndDelete(id);
};

module.exports = {
    addNewShape,
    getAllShapes,
    getShapeById,
    updateShape,
    deleteShape,
};
