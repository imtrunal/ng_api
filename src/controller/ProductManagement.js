const productService = require('../Service/productService');
const status = require('http-status');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getCloudinaryPublicId, destroyImage } = require('../utils/upload');
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

const getAllProduct = async (req, res) => {
  try {
    const products = await productService.findAll();

    const catalogData = {};
    products.forEach(product => {
      const categoryId = product.category?._id.toString() || "unknownCategoryId";
      const subCategoryId = product.subCategory?._id.toString() || "unknownSubCategoryId";

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

    return successResponse(
      req,
      res,
      status.OK,
      "Product catalog fetched successfully",
      { catalogData }
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
