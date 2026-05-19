const express = require('express');
const router = express.Router();
const {
  createMenuItem,
  getMenuItemsByOutlet,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems
} = require('../controllers/menu.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// PUBLIC ROUTES
router.get('/outlet/:outletId', getMenuItemsByOutlet);
router.get('/search', searchMenuItems);

// ADMIN ROUTES
router.post('/add', authenticateToken, createMenuItem);
router.put('/update/:id', authenticateToken, updateMenuItem);
router.delete('/delete/:id', authenticateToken, deleteMenuItem);

module.exports = router;