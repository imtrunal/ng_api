const ImageFiles = require("../Model/imageFiles");
const PdfFiles = require("../Model/pdfFiles");
const Products = require("../Model/product");
const VideoFiles = require("../Model/videoFiles");
const getPdfPageCountFromUrl = require("../utils/getPdfPages");
const { getCloudinaryPublicId, destroyImage, getPdfPages } = require("../utils/upload");

const createProduct = async ({ productData, imageFiles, pdfFile, videoFile }) => {
    try {
        const imageDocs = [];
        let pdfDoc = null;
        let videoDoc = null;

        const tasks = [];

        if (imageFiles && imageFiles.length > 0) {
            for (const img of imageFiles) {
                if (img) {
                    const image = new ImageFiles({
                        filename: img.originalname,
                        url: img.path,
                    });
                    tasks.push(
                        image.save().then(saved => {
                            imageDocs.push(saved._id);
                        })
                    );
                }
            }
        }

        if (pdfFile) {
            const publicId = getCloudinaryPublicId(pdfFile.path);
            let totalPages = 1;
            if (publicId) {
                totalPages = await getPdfPageCountFromUrl(pdfFile.path);
                console.log('Total Pages:', totalPages);
            }
            const pdf = new PdfFiles({
                filename: pdfFile.originalname,
                url: pdfFile.path,
                short: productData.title,
                totalPages: totalPages,
            });
            tasks.push(
                pdf.save().then(saved => {
                    pdfDoc = saved._id;
                })
            );
        }

        if (videoFile) {
            const video = new VideoFiles({
                filename: videoFile.originalname,
                url: videoFile.path,
            });
            tasks.push(
                video.save().then(saved => {
                    videoDoc = saved._id;
                })
            );
        }

        await Promise.all(tasks);

        // Create the product with references to all files
        const product = new Products({
            ...productData,
            image: imageDocs,
            pdf: pdfDoc,
            video: videoDoc,
        });

        await product.save();
        return product;
    } catch (error) {
        console.error("Error in createProduct:", error);
        throw new Error(error.message || "Failed to create product");
    }
};

const updateProduct = async ({
    productId,
    productData,
    imageFiles,
    pdfFile,
    videoFile
}) => {
    try {
        const existingProduct = await Products.findById(productId);
        if (!existingProduct) {
            throw new Error("Product not found");
        }

        const tasks = [];
        const cloudinaryDeletions = [];
        let newImageIds = [...existingProduct.image];
        let newPdfId = existingProduct.pdf;
        let newVideoId = existingProduct.video;

        // Helper function to add Cloudinary deletion tasks
        const addCloudinaryDeletion = async (file, resourceType = 'image') => {
            if (file && file.url) {
                const publicId = getCloudinaryPublicId(file.url);
                if (publicId) {
                    cloudinaryDeletions.push(destroyImage(publicId, resourceType));
                }
            }
        };

        if (imageFiles && imageFiles.length > 0) {
            if (productData.imagesToDelete && productData.imagesToDelete.length > 0) {
                // Find the images to be deleted
                const imagesToDelete = await ImageFiles.find({
                    _id: { $in: productData.imagesToDelete }
                });

                // Add Cloudinary deletion tasks
                for (const img of imagesToDelete) {
                    await addCloudinaryDeletion(img);
                }

                // Add database deletion task
                tasks.push(
                    ImageFiles.deleteMany({ _id: { $in: productData.imagesToDelete } })
                );

                newImageIds = newImageIds.filter(
                    imgId => !productData.imagesToDelete.includes(imgId.toString())
                );
            }

            // Add new images
            for (const img of imageFiles) {
                if (img) {
                    const image = new ImageFiles({
                        filename: img.originalname,
                        url: img.path,
                    });
                    tasks.push(
                        image.save().then(saved => {
                            newImageIds.push(saved._id);
                        })
                    );
                }
            }
        } else if (productData.imagesToDelete && productData.imagesToDelete.length > 0) {
            // Find the images to be deleted
            const imagesToDelete = await ImageFiles.find({
                _id: { $in: productData.imagesToDelete }
            });

            // Add Cloudinary deletion tasks
            for (const img of imagesToDelete) {
                await addCloudinaryDeletion(img);
            }

            // Add database deletion task
            tasks.push(
                ImageFiles.deleteMany({ _id: { $in: productData.imagesToDelete } })
            );

            newImageIds = newImageIds.filter(
                imgId => !productData.imagesToDelete.includes(imgId.toString())
            );
        }

        if (pdfFile) {
            // Delete existing PDF from Cloudinary and DB if exists
            if (existingProduct.pdf) {
                const existingPdf = await PdfFiles.findById(existingProduct.pdf);
                if (existingPdf) {
                    await addCloudinaryDeletion(existingPdf, 'raw');
                }
                tasks.push(PdfFiles.findByIdAndDelete(existingProduct.pdf));
            }

            // Add new PDF
            const pdf = new PdfFiles({
                filename: pdfFile.originalname,
                url: pdfFile.path,
                short: productData.title
            });
            tasks.push(
                pdf.save().then(saved => {
                    newPdfId = saved._id;
                })
            );
        } else if (productData.removePdf && existingProduct.pdf) {
            const existingPdf = await PdfFiles.findById(existingProduct.pdf);
            if (existingPdf) {
                await addCloudinaryDeletion(existingPdf, 'raw');
            }
            tasks.push(PdfFiles.findByIdAndDelete(existingProduct.pdf));
            newPdfId = null;
        }

        if (videoFile) {
            // Delete existing video from Cloudinary and DB if exists
            if (existingProduct.video) {
                const existingVideo = await VideoFiles.findById(existingProduct.video);
                if (existingVideo) {
                    await addCloudinaryDeletion(existingVideo, 'video');
                }
                tasks.push(VideoFiles.findByIdAndDelete(existingProduct.video));
            }

            // Add new video
            const video = new VideoFiles({
                filename: videoFile.originalname,
                url: videoFile.path,
            });
            tasks.push(
                video.save().then(saved => {
                    newVideoId = saved._id;
                })
            );
        } else if (productData.removeVideo && existingProduct.video) {
            const existingVideo = await VideoFiles.findById(existingProduct.video);
            if (existingVideo) {
                await addCloudinaryDeletion(existingVideo, 'video');
            }
            tasks.push(VideoFiles.findByIdAndDelete(existingProduct.video));
            newVideoId = null;
        }

        // Execute all database and Cloudinary operations
        await Promise.all([...tasks, ...cloudinaryDeletions]);

        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            {
                ...productData,
                image: newImageIds,
                pdf: newPdfId,
                video: newVideoId,
            },
            { new: true }
        );

        return updatedProduct;
    } catch (error) {
        console.error("Error in updateProduct:", error);
        throw new Error(error.message || "Failed to update product");
    }
};

const findAll = async (filters = {}) => {
    try {
        const {
            category,
            subCategory,
            material,
            shape,
            color,
            moq,
            format,
            minPrice,
            maxPrice,
            sort,
            search
        } = filters;

        // Base query
        let query = Products.find();

        // Category filter
        if (category) {
            query = query.where('category').equals(category);
        }

        // Subcategory filter
        if (subCategory) {
            query = query.where('subCategory').equals(subCategory);
        }

        // Material filter
        if (material && material !== 'all') {
            query = query.where('material').regex(new RegExp(material, 'i'));
        }

        // Shape filter
        if (shape && shape !== 'all') {
            query = query.where('shape').equals(shape);
        }

        // Color filter
        if (color && color !== 'all') {
            query = query.where('color').equals(color);
        }

        // MOQ filter
        if (moq && moq !== 'all') {
            if (moq.includes('+')) {
                const minMoq = parseInt(moq);
                query = query.where('moq').gte(minMoq);
            } else {
                const [min, max] = moq.split('-').map(Number);
                query = query.where('moq').gte(min).lte(max);
            }
        }

        // Format filter (PDF/Video)
        if (format && format !== 'all') {
            if (format === 'pdf') {
                query = query.where('pdf').ne(null);
            } else if (format === 'video') {
                query = query.where('video').ne(null);
            }
        }


        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter = {};
            if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
            if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
            query = query.where('price', priceFilter);
        }

        // Search filter
        if (search) {
            query = query.where('title').regex(new RegExp(search, 'i'));
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default sort
        if (sort) {
            if (sort === 'price-low') {
                sortOption = { price: 1 };
            } else if (sort === 'price-high') {
                sortOption = { price: -1 };
            }
        }

        // Execute query with population
        const products = await query
            .populate("category", "name")
            .populate("subCategory")
            .populate("image")
            .populate("pdf")
            .populate("video")
            .sort(sortOption)
            .lean();

        return products;
    } catch (error) {
        throw new Error(error);
    }
};

const findOne = async (id) => {
    try {
        const product = await Products.findById(id).populate("category", "name").populate("subCategory").populate("image").populate("pdf").populate("video").sort({ createdAt: -1 }).lean();
        return product;
    } catch (error) {
        throw new Error(error);
    }
}

const deleteOne = async (id) => {
    try {
        const product = await Products.findByIdAndDelete(id);
        if (product.image) {
            await ImageFiles.deleteMany({ _id: { $in: product.image } });
        }
        if (product.pdf) {
            await PdfFiles.findByIdAndDelete(product.pdf);
        }
        if (product.video) {
            await VideoFiles.findByIdAndDelete(product.video);
        }
        return product;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    createProduct,
    updateProduct,
    findAll,
    findOne,
    deleteOne
}