const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['adoption_approved', 'adoption_rejected', 'adoption_pending', 'new_adoption_request'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Deep-linking refs
    adoption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Adoption',
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
    // For admin notifications — the user who triggered the action
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
