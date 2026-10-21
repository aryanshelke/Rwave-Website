import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['ECG Machines', 'Patient Monitors', 'BP Monitors', 'DVT Pumps', 'Fluid Warmers'],
    },
    description: {
      type: String,
      required: true,
    },
    specs: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

