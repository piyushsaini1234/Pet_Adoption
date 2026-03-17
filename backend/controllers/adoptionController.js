const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper — create a notification without blocking the main request flow
const notify = async ({ userId, title, message, type, adoptionId, petId, applicantId }) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      adoption: adoptionId,
      pet: petId,
      applicant: applicantId || null,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// Helper — notify every admin in the system
const notifyAllAdmins = async ({ title, message, type, adoptionId, petId, applicantId }) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title,
      message,
      type,
      adoption: adoptionId,
      pet: petId,
      applicant: applicantId,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err.message);
  }
};

// @desc    Apply for adoption
// @route   POST /api/adoption/:petId
// @access  Private (user)
const applyForAdoption = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { message } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (pet.status === 'adopted') {
      return res.status(400).json({ message: 'This pet has already been adopted' });
    }

    // Check for duplicate application — unique index handles this too, but a
    // friendly message is better than a Mongo duplicate key error
    const existing = await Adoption.findOne({ user: req.user.id, pet: petId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this pet' });
    }

    const adoption = await Adoption.create({
      user: req.user.id,
      pet: petId,
      message,
    });

    // Mark the pet as "pending" so others know it's under review
    pet.status = 'pending';
    await pet.save();

    await adoption.populate(['user', 'pet']);

    // Notify the applicant that their request was received
    await notify({
      userId: req.user.id,
      title: 'Application Submitted',
      message: `Your adoption request for ${pet.name} has been received and is under review.`,
      type: 'adoption_pending',
      adoptionId: adoption._id,
      petId: pet._id,
    });

    // Notify all admins about the new adoption request
    await notifyAllAdmins({
      title: 'New Adoption Request',
      message: `${req.user.name} (${req.user.email}) has applied to adopt ${pet.name} (${pet.species} · ${pet.breed}).`,
      type: 'new_adoption_request',
      adoptionId: adoption._id,
      petId: pet._id,
      applicantId: req.user.id,
    });

    res.status(201).json(adoption);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this pet' });
    }
    next(err);
  }
};

// @desc    Get logged-in user's adoption applications
// @route   GET /api/adoption
// @access  Private (user)
const getMyAdoptions = async (req, res, next) => {
  try {
    const adoptions = await Adoption.find({ user: req.user.id })
      .populate('pet')
      .sort({ createdAt: -1 });

    res.json(adoptions);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all adoption requests (admin view)
// @route   GET /api/adoption/admin
// @access  Private (admin)
const getAllAdoptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const adoptions = await Adoption.find(filter)
      .populate('user', 'name email')
      .populate('pet')
      .sort({ createdAt: -1 });

    res.json(adoptions);
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject an adoption request
// @route   PUT /api/adoption/:id
// @access  Private (admin)
const updateAdoptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const adoption = await Adoption.findById(req.params.id).populate('pet');
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }

    const pet = adoption.pet;
    adoption.status = status;
    await adoption.save();

    if (status === 'approved') {
      // Mark the pet as officially adopted
      await Pet.findByIdAndUpdate(pet._id, { status: 'adopted' });

      // Notify the approved applicant
      await notify({
        userId: adoption.user,
        title: '🎉 Adoption Approved!',
        message: `Congratulations! Your adoption request for ${pet.name} has been approved. Please contact the shelter to proceed.`,
        type: 'adoption_approved',
        adoptionId: adoption._id,
        petId: pet._id,
      });

      // Find and reject all other pending requests for this pet, then notify each applicant
      const otherPending = await Adoption.find({
        pet: pet._id,
        _id: { $ne: adoption._id },
        status: 'pending',
      });

      await Adoption.updateMany(
        { pet: pet._id, _id: { $ne: adoption._id }, status: 'pending' },
        { status: 'rejected' }
      );

      // Send rejection notification to each displaced applicant
      for (const other of otherPending) {
        await notify({
          userId: other.user,
          title: 'Application Unsuccessful',
          message: `Unfortunately, ${pet.name} has been adopted by someone else. Keep looking — there are plenty of pets waiting for a home!`,
          type: 'adoption_rejected',
          adoptionId: other._id,
          petId: pet._id,
        });
      }
    }

    if (status === 'rejected') {
      // Notify the rejected applicant
      await notify({
        userId: adoption.user,
        title: 'Application Not Approved',
        message: `Your adoption request for ${pet.name} was not approved this time. Don't give up — browse other available pets!`,
        type: 'adoption_rejected',
        adoptionId: adoption._id,
        petId: pet._id,
      });

      // If no other pending requests remain, free up the pet
      const pendingCount = await Adoption.countDocuments({
        pet: pet._id,
        status: 'pending',
      });
      if (pendingCount === 0) {
        await Pet.findByIdAndUpdate(pet._id, { status: 'available' });
      }
    }

    await adoption.populate('user');

    res.json(adoption);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyForAdoption,
  getMyAdoptions,
  getAllAdoptions,
  updateAdoptionStatus,
};
