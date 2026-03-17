const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent the same user from applying to the same pet more than once
adoptionSchema.index({ user: 1, pet: 1 }, { unique: true });

module.exports = mongoose.model('Adoption', adoptionSchema);
