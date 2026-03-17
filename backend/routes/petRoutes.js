const express = require('express');
const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getPets);
router.get('/:id', getPetById);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), createPet);
router.put('/:id', protect, restrictTo('admin'), updatePet);
router.delete('/:id', protect, restrictTo('admin'), deletePet);

module.exports = router;
