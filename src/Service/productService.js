const ImageFiles = require("../Model/image");
const PdfFiles = require("../Model/pdfFiles");
const Products = require("../Model/product");

module.exports.createProduct = async ({ productData, imageFile, pdfFile }) => {
    try {
        let imageDoc = null;
        let pdfDoc = null;

        const tasks = [];

        if (imageFile) {
            const image = new ImageFiles({
                filename: imageFile.originalname,
                url: imageFile.path,
            });
            tasks.push(image.save().then((saved) => { imageDoc = saved; }));
        }

        if (pdfFile) {
            const pdf = new PdfFiles({
                url: pdfFile.path,
            });
            tasks.push(pdf.save().then((saved) => { pdfDoc = saved; }));
        }

        await Promise.all(tasks);

        const product = new Products({
            ...productData,
            image: imageDoc?._id || null,
            pdf: pdfDoc?._id || null,
        });

        await product.save();
        return product;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports.update = async ({ productId, updatedFields, imageFile, pdfFile }) => {
    try {
        let imageDoc = null;
        let pdfDoc = null;

        const tasks = [];

        if (imageFile) {
            const image = new ImageFiles({
                filename: imageFile.originalname,
                url: imageFile.path,
            });
            tasks.push(image.save().then(saved => { imageDoc = saved; }));
        }

        if (pdfFile) {
            const pdf = new PdfFiles({
                file: pdfFile.path,
            });
            tasks.push(pdf.save().then(saved => { pdfDoc = saved; }));
        }

        await Promise.all(tasks);

        if (imageDoc?._id) updatedFields.image = imageDoc._id;
        if (pdfDoc?._id) updatedFields.pdf = pdfDoc._id;

        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            { $set: updatedFields },
            { new: true }
        );

        return updatedProduct;
    } catch (error) {
        throw new Error(error);
    }
};


module.exports.findAll = async () => {
    try {
        const allProducts = await Products.find().populate("category", "name").populate("subCategory").populate("image").populate("pdf").sort({ createdAt: -1 }).lean();
        return allProducts;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports.findOne = async (id) => {
    try {
        const product = await Products.findById(id).populate("category", "name").populate("subCategory").populate("image").populate("pdf").sort({ createdAt: -1 }).lean();
        return product;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports.deleteOne = async (id) => {
    try {
        const product = await Products.findByIdAndDelete(id);
        console.log(product);
        if (product.image) {
            await ImageFiles.findByIdAndDelete(product.image);
        }
        if (product.pdf) {
            await PdfFiles.findByIdAndDelete(product.pdf);
        }
        return product;
    } catch (error) {
        throw new Error(error);
    }
}