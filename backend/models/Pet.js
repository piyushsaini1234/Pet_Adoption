const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      lowercase: true,
    },
    breed: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'adopted'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Text index for search functionality
petSchema.index({ name: 'text', breed: 'text', description: 'text' });

module.exports = mongoose.model('Pet', petSchema);
