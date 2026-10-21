const express = require('express');
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const { verifyAdmin } = require('../middleware/auth');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// GET /api/products (Public) - supports optional ?category=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
      error: error.message,
    });
  }
});

// GET /api/products/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product.',
      error: error.message,
    });
  }
});

// POST /api/products (Protected)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, specs, imageUrl, inStock, displayOrder } = req.body;

    let finalImageUrl = imageUrl;
    let finalCloudinaryId = null;

    // Handle file upload to Cloudinary
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      finalImageUrl = uploadResult.secure_url;
      finalCloudinaryId = uploadResult.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product image is required (either upload a file or provide imageUrl).',
      });
    }

    let parsedSpecs = [];
    if (specs) {
      if (Array.isArray(specs)) {
        parsedSpecs = specs;
      } else if (typeof specs === 'string') {
        parsedSpecs = specs
          .split(/•|,|\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const product = new Product({
      name: name ? name.trim() : '',
      category,
      description: description ? description.trim() : '',
      specs: parsedSpecs,
      imageUrl: finalImageUrl,
      cloudinaryPublicId: finalCloudinaryId,
      inStock: inStock !== undefined ? inStock === true || inStock === 'true' : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: savedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create product.',
      error: error.message,
    });
  }
});

// PUT /api/products/:id (Protected)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const { name, category, description, specs, imageUrl, inStock, displayOrder } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description.trim();

    if (specs !== undefined) {
      if (Array.isArray(specs)) {
        product.specs = specs;
      } else if (typeof specs === 'string') {
        product.specs = specs
          .split(/•|,|\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Case 1: A new file is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it existed
      if (product.cloudinaryPublicId) {
        await deleteFromCloudinary(product.cloudinaryPublicId);
      }
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      product.imageUrl = uploadResult.secure_url;
      product.cloudinaryPublicId = uploadResult.public_id;
    }
    // Case 2: No file uploaded, but an imageUrl string was provided
    else if (imageUrl !== undefined && imageUrl.trim() && imageUrl.trim() !== product.imageUrl) {
      // If product previously had a Cloudinary image, remove it to avoid orphaned assets
      if (product.cloudinaryPublicId) {
        await deleteFromCloudinary(product.cloudinaryPublicId);
        product.cloudinaryPublicId = null;
      }
      product.imageUrl = imageUrl.trim();
    }

    if (inStock !== undefined) {
      product.inStock = inStock === true || inStock === 'true';
    }

    if (displayOrder !== undefined) {
      product.displayOrder = Number(displayOrder);
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product.',
      error: error.message,
    });
  }
});

// DELETE /api/products/:id (Protected)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Delete image from Cloudinary if public ID exists
    if (product.cloudinaryPublicId) {
      await deleteFromCloudinary(product.cloudinaryPublicId);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      error: error.message,
    });
  }
});

module.exports = router;
