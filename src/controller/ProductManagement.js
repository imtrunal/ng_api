const productService = require('../Service/productService');
const status = require('http-status');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getCloudinaryPublicId, destroyImage, getPdfPages } = require('../utils/upload');
const { incrementTotalCount, decrementTotalCount } = require('../utils/updateStatistics');

const addProduct = async (req, res) => {
  try {
    const productsData = JSON.parse(req.body.productData);
    const allImages = req.files?.productImage || [];
    const allPdfs = req.files?.productPdf || [];
    const allVideos = req.files?.productVideo || [];

    let imageIndex = 0;
    let pdfIndex = 0;
    let videoIndex = 0;

    const productPromises = productsData.map(productData => {
      const productImages = [];
      // Assign images
      for (let i = 0; i < (productData.imageCount || 0); i++) {
        if (imageIndex < allImages.length) {
          productImages.push(allImages[imageIndex++]);
        }
      }

      // Assign PDF if needed
      const productPdf = productData.hasPdf && pdfIndex < allPdfs.length
        ? allPdfs[pdfIndex++]
        : null;

      // Assign video if needed
      const productVideo = productData.hasVideo && videoIndex < allVideos.length
        ? allVideos[videoIndex++]
        : null;

      return productService.createProduct({
        productData,
        imageFiles: productImages,
        pdfFile: productPdf,
        videoFile: productVideo
      });
    });

    const createdProducts = await Promise.all(productPromises);
    await incrementTotalCount('totalProducts', createdProducts.length);

    return successResponse(
      req,
      res,
      status.OK,
      "Products added successfully",
      { products: createdProducts }
    );

  } catch (error) {
    console.error("Add Product Error:", error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = JSON.parse(req.body.productData);
    const imageFiles = req.files?.productImage || [];
    const pdfFile = req.files?.productPdf?.[0] || null;
    const videoFile = req.files?.productVideo?.[0] || null;

    const updatedProduct = await productService.updateProduct({
      productId,
      productData,
      imageFiles,
      pdfFile,
      videoFile
    });

    return successResponse(
      req,
      res,
      status.OK,
      "Product updated successfully",
      { product: updatedProduct }
    );

  } catch (error) {
    console.error("Update Product Error:", error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
};

// const getAllProduct = async (req, res) => {
//   try {
//     const products = await productService.findAll();

//     // First add totalPdfPages to each product
//     const productsWithPdfCount = await Promise.all(
//       products.map(async (product) => {
//         const productObj = product.toObject ? product.toObject() : product;
//         let totalPdfPages = 0;

//         if (product.pdf?.url) {
//           try {
//             const publicId = getCloudinaryPublicId(product.pdf.url);
//             if (publicId) {
//               totalPdfPages = await getPdfPages(publicId) || 0;
//             }
//           } catch (err) {
//             console.error(`Error getting PDF pages for ${product._id}:`, err);
//           }
//         }

//         return { 
//           ...productObj,
//           totalPdfPages 
//         };
//       })
//     );

//     // Keep your original catalog structure
//     const catalogData = {};
//     productsWithPdfCount.forEach(product => {
//       const categoryId = product.category?._id?.toString() || "unknownCategoryId";
//       const subCategoryId = product.subCategory?._id?.toString() || "unknownSubCategoryId";

//       if (!catalogData[categoryId]) {
//         catalogData[categoryId] = {};
//       }

//       if (!catalogData[categoryId][subCategoryId]) {
//         catalogData[categoryId][subCategoryId] = [];
//       }

//       catalogData[categoryId][subCategoryId].push({
//         id: product._id,
//         ...product // This now includes totalPdfPages
//       });
//     });

//     return successResponse(
//       req,
//       res,
//       status.OK,
//       "Product catalog fetched successfully", 
//       { catalogData }
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
//   }
// };

// const getAllProduct = async (req, res) => {
//   try {
//     const products = await productService.findAll();
//     console.log("Fetched products:", products);

//     const productsWithPdfData = await Promise.all(
//       products.map(async (product) => {
//         const productData = product.toObject ? product.toObject() : product;
//         let totalPages = 0; // Default to 0 pages

//         if (product.pdf?.url) {
//           try {
//             const publicId = getCloudinaryPublicId(product.pdf.url);
//             if (publicId) {
//               totalPages = await getPdfPages(publicId) || 0;
//             }
//           } catch (err) {
//             console.error(`Error processing PDF for ${product._id}:`, err);
//           }
//         }

//         // Add totalPages field instead of pdfPages array
//         return { 
//           ...productData,
//           pdfPages: totalPages 
//         };
//       })
//     );

//     const catalogData = {};
//     productsWithPdfData.forEach(product => {
//       const categoryId = product.category?._id?.toString() || "unknownCategoryId";
//       const subCategoryId = product.subCategory?._id?.toString() || "unknownSubCategoryId";

//       if (!catalogData[categoryId]) {
//         catalogData[categoryId] = {};
//       }

//       if (!catalogData[categoryId][subCategoryId]) {
//         catalogData[categoryId][subCategoryId] = [];
//       }

//       catalogData[categoryId][subCategoryId].push({
//         id: product._id,
//         ...product // Now includes pdfPages as a number
//       });
//     });

//     return successResponse(
//       req,
//       res,
//       status.OK,
//       "Product catalog fetched successfully",
//       { catalogData }
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
//   }
// };


// product.controller.js
const getAllProduct = async (req, res) => {
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
    } = req.query;

    const products = await productService.findAll({
      category,
      subCategory,
      material: material !== 'all' ? material : undefined,
      shape: shape !== 'all' ? shape : undefined,
      color: color !== 'all' ? color : undefined,
      moq: moq !== 'all' ? moq : undefined,
      format: format !== 'all' ? format : undefined,
      minPrice,
      maxPrice,
      sort,
      search
    });

    // Convert Mongoose documents to plain objects if needed
    const productsData = products.map(product =>
      product.toObject ? product.toObject() : product
    );

    // Organize by category/subcategory if no specific category requested
    let responseData;
    if (!category) {
      const catalogData = {};
      productsData.forEach(product => {
        const categoryId = product.category?._id?.toString() || "unknownCategoryId";
        const subCategoryId = product.subCategory?._id?.toString() || "unknownSubCategoryId";

        if (!catalogData[categoryId]) {
          catalogData[categoryId] = {};
        }

        if (!catalogData[categoryId][subCategoryId]) {
          catalogData[categoryId][subCategoryId] = [];
        }

        catalogData[categoryId][subCategoryId].push({
          id: product._id,
          ...product
        });
      });
      responseData = { catalogData };
    } else {
      responseData = { products: productsData };
    }

    return successResponse(
      req,
      res,
      status.OK,
      "Products fetched successfully",
      responseData
    );
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await productService.findOne(req.params.id);
    if (!product) {
      return errorResponse(req, res, status.NOT_FOUND, "Product not found");
    }
    return successResponse(req, res, status.OK, "Product fetched successfully", { product });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await productService.findOne(req.params.id);
    if (!product) {
      return errorResponse(req, res, status.NOT_FOUND, "Product not found");
    }

    const deletionPromises = [];

    if (product.image && product.image.length > 0) {
      product.image.forEach(img => {
        if (img.url) {
          const id = getCloudinaryPublicId(img.url);
          if (id) deletionPromises.push(destroyImage(id, 'image'));
        }
      });
    }

    if (product.pdf?.url) {
      const pdfId = getCloudinaryPublicId(product.pdf.url);
      if (pdfId) deletionPromises.push(destroyImage(pdfId, 'raw'));
    }

    if (product.video?.url) {
      const videoId = getCloudinaryPublicId(product.video.url);
      if (videoId) deletionPromises.push(destroyImage(videoId, 'video'));
    }

    await Promise.all(deletionPromises);

    await productService.deleteOne(product._id);
    await decrementTotalCount('totalProducts', -1);
    return successResponse(req, res, status.OK, "Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
}


module.exports = {
  addProduct,
  getAllProduct,
  deleteProduct,
  getProductById,
  updateProduct
};
