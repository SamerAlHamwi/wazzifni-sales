const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().sort({ fullName: 1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login for admins
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Static super admin check
    if (username === 'hasan' && password === 'password') {
        let superAdmin = await Admin.findOne({ username: 'hasan' });
        if (!superAdmin) {
            superAdmin = new Admin({
                username: 'hasan',
                password: 'password',
                fullName: 'حسن (المدير العام)',
                canEdit: true,
                isSuperAdmin: true
            });
            await superAdmin.save();
        }
        return res.json(superAdmin);
    }

    const admin = await Admin.findOne({ username, password });
    if (!admin) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an admin
router.post('/', async (req, res) => {
  try {
    const { username, password, fullName, canEdit } = req.body;
    const admin = new Admin({ username, password, fullName, canEdit });
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (admin.isSuperAdmin) {
        return res.status(403).json({ error: 'لا يمكن حذف المدير العام' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
