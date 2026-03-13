const express = require('express');
const router = express.Router();
const Rep = require('../models/Rep');

// Get all reps
router.get('/', async (req, res) => {
  try {
    const reps = await Rep.find().sort({ name: 1 });
    res.json(reps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a rep
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const rep = new Rep({ name });
    await rep.save();
    res.status(201).json(rep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a rep (by name as requested by frontend flow or by ID)
// Using name for compatibility with existing frontend logic if it doesn't use IDs yet
router.delete('/:name', async (req, res) => {
  try {
    const result = await Rep.findOneAndDelete({ name: req.params.name });
    if (!result) {
      return res.status(404).json({ error: 'Rep not found' });
    }
    res.json({ message: 'Rep deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;