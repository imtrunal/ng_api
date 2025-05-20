const productService = require('../Service/productService');
const status = require('http-status');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getCloudinaryPublicId, destroyImage } = require('../utils/upload');

const addProduct = async (req, res) => {
  try {
    const rawProductData = JSON.parse(req.body.productData); // could be array or object
    const products = Array.isArray(rawProductData) ? rawProductData : [rawProductData];

    const imageFiles = req.files?.productImage || [];
    const pdfFiles = req.files?.productPdf || [];

    const createdProducts = [];

    for (let i = 0; i < products.length; i++) {
      const { title, category, subCategory, price, material, moq } = products[i];

      if (!title || !category || !subCategory || !price) {
        return errorResponse(req, res, status.BAD_REQUEST, `Missing fields in product at index ${i}`);
      }

      if (isNaN(price)) {
        return errorResponse(req, res, status.BAD_REQUEST, `Price must be a number in product at index ${i}`);
      }

      const imageFile = imageFiles[i] || null;
      const pdfFile = pdfFiles[i] || null;

      if (!imageFile && !pdfFile) {
        return errorResponse(req, res, status.BAD_REQUEST, `Upload either image or pdf for product at index ${i}`);
      }

      const productData = { title, category, subCategory, price, material, moq };
      const newProduct = await productService.createProduct({ productData, imageFile, pdfFile });

      if (!newProduct) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, `Failed to add product at index ${i}`);
      }

      createdProducts.push(newProduct);
    }

    return successResponse(req, res, status.CREATED, "Product(s) added successfully", { products: createdProducts });

  } catch (error) {
    console.error(error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, category, subCategory, price, material, moq } = JSON.parse(req.body.productData);
    const imageFile = req.files?.productImage?.[0];
    const pdfFile = req.files?.productPdf?.[0];

    if (!productId) {
      return errorResponse(req, res, status.BAD_REQUEST, "Product ID is required");
    }

    if (price && isNaN(price)) {
      return errorResponse(req, res, status.BAD_REQUEST, "Price must be a number");
    }

    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (category) updatedFields.category = category;
    if (subCategory) updatedFields.subCategory = subCategory;
    if (price) updatedFields.price = price;
    if (material) updatedFields.material = material;
    if (moq) updatedFields.moq = moq;

    const updatedProduct = await productService.update({
      productId,
      updatedFields,
      imageFile,
      pdfFile
    });

    if (!updatedProduct) {
      return errorResponse(req, res, status.NOT_FOUND, "Product not found or update failed");
    }

    return successResponse(req, res, status.OK, "Product updated successfully", { updatedProduct });
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const getAllProduct = async (req, res) => {
  try {
    const products = await productService.findAll(); // make sure category and subCategory populated

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
        title: product.title,
        price: product.price,
        material: product.material,
        moq: product.moq,
        image: product.image?.url || '',
        pdf: product.pdf || '',
        category: product.category,      // full category object here
        subCategory: product.subCategory, // full subCategory object here
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
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
    if (product.image || product.pdf) {
      const fileUrl = product.image?.url || product.pdf?.url;
      const resourceType = product.image ? 'image' : 'raw';
      const publicID = getCloudinaryPublicId(fileUrl);

      if (publicID) {
        await destroyImage(publicID, resourceType);
      }
    }
    await productService.deleteOne(product._id);
    return successResponse(req, res, status.OK, "Product deleted successfully");
  } catch (error) {
    console.log(error);
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
