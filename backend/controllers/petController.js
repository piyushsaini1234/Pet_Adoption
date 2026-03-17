const Pet = require('../models/Pet');

// @desc    Get all pets with search, filter, and pagination
// @route   GET /api/pets
// @access  Public
const getPets = async (req, res, next) => {
  try {
    const { search, species, breed, minAge, maxAge, status, page = 1, limit = 9 } = req.query;

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (species) filter.species = species.toLowerCase();
    if (breed) filter.breed = { $regex: breed, $options: 'i' };
    if (status) filter.status = status;

    if (minAge !== undefined || maxAge !== undefined) {
      filter.age = {};
      if (minAge !== undefined) filter.age.$gte = Number(minAge);
      if (maxAge !== undefined) filter.age.$lte = Number(maxAge);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Pet.countDocuments(filter);
    const pets = await Pet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      pets,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single pet by ID
// @route   GET /api/pets/:id
// @access  Public
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Admin only
const createPet = async (req, res, next) => {
  try {
    const pet = await Pet.create(req.body);
    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Admin only
const updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Admin only
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json({ message: 'Pet removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
