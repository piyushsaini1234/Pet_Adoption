const express = require('express');
const {
  applyForAdoption,
  getMyAdoptions,
  getAllAdoptions,
  updateAdoptionStatus,
} = require('../controllers/adoptionController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

const router = express.Router();

// IMPORTANT: /admin must be declared before /:id to avoid route conflict
router.get('/admin', protect, restrictTo('admin'), getAllAdoptions);

router.post('/:petId', protect, applyForAdoption);
router.get('/', protect, getMyAdoptions);
router.put('/:id', protect, restrictTo('admin'), updateAdoptionStatus);

module.exports = router;
