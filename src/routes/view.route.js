const express = require('express');
const authenticateToken = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const router = express.Router();

const sampleOutlets = [
  { _id: '1', name: 'Campus Grill', description: 'Quick burgers and fries', status: 'Open', timing: '10-15 min' },
  { _id: '2', name: 'Pizza Corner', description: 'Fresh slices on demand', status: 'Open', timing: '12-18 min' },
  { _id: '3', name: 'Cafe Brew', description: 'Coffee, shakes and snacks', status: 'Closed', timing: '20-25 min' },
];

// ===== PUBLIC ROUTES (no JWT required) =====
router.get('/', (req, res) => {
  res.render('landing', { title: 'CampusBites — Landing' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login | CampusBites' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Signup | CampusBites' });
});

router.get('/auth/callback', (req, res) => {
  res.render('google-callback', { title: 'Signing In | CampusBites' });
});

// ===== PROTECTED ROUTES (JWT required - Student role) =====
router.get('/outlets', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('home', { title: 'Outlets | CampusBites', outlets: sampleOutlets, user: req.user });
});

router.get('/outlet/:id', authenticateToken, requireRole(['student']), (req, res) => {
  const outlet = sampleOutlets.find(o => o._id === req.params.id) || sampleOutlets[0];
  res.render('outlet', { title: `${outlet.name} | CampusBites`, outlet, user: req.user });
});

router.get('/search', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('search', { title: 'Search | CampusBites', query: req.query.q || '', user: req.user });
});

router.get('/checkout', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('checkout', { title: 'Checkout | CampusBites', user: req.user });
});

router.get('/order-success', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('order-success', { title: 'Order Success | CampusBites', user: req.user });
});

router.get('/order/track/:id', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('order-tracking', { title: 'Track Order | CampusBites', orderId: req.params.id, user: req.user });
});

router.get('/my-orders', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('my-orders', { title: 'My Orders | CampusBites', user: req.user });
});

router.get('/profile', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('profile', { title: 'Profile | CampusBites', user: req.user });
});

router.get('/notifications', authenticateToken, requireRole(['student']), (req, res) => {
  res.render('notifications', { title: 'Notifications | CampusBites', user: req.user });
});

// ===== ADMIN ROUTES (JWT required - Admin/Superadmin role) =====
router.get('/admin', authenticateToken, requireRole(['admin', 'superadmin']), (req, res) => {
  res.render('admin-dashboard', { title: 'Admin Dashboard | CampusBites', user: req.user });
});

router.get('/superadmin', authenticateToken, requireRole(['superadmin']), (req, res) => {
  res.render('superadmin-analytics', { title: 'Super Admin | CampusBites', user: req.user });
});

module.exports = router;
