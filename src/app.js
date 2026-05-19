require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const configurePassport = require('./config/passport');

const authRouter = require('./routes/auth.route');
const menuRouter = require('./routes/menu.route');
const cartRouter = require('./routes/cart.route');
const orderRouter = require('./routes/order.route');
const outletRouter = require('./routes/outlet.route');
const adminRouter = require('./routes/admin.route');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Initialize Passport for OAuth (MUST be before routes)
configurePassport();
app.use(passport.initialize());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/outlets', outletRouter);
app.use('/api/admin', adminRouter);

const User = require('./models/user.model');

// ── Auth middleware ──────────────────────────────────────────────
function getUser(req) {
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch { return null; }
}

// Async version: enriches user with name and pfp from DB (used for views that need display info)
async function getUserFull(req) {
  try {
    const decoded = getUser(req);
    if (!decoded) return null;
    const dbUser = await User.findById(decoded.id).select('name email role pfp isBlocked').lean();
    if (!dbUser || dbUser.isBlocked) return null;
    return { id: dbUser._id, name: dbUser.name, email: dbUser.email, role: dbUser.role, pfp: dbUser.pfp || '' };
  } catch { return null; }
}

// ── Auth form routes ────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
      res.cookie('token', data.token, { httpOnly: true, maxAge: 86400000, path: '/' });
      const role = data.user?.role;
      if (role === 'superadmin') return res.redirect('/superadmin');
      if (role === 'admin') return res.redirect('/admin');
      return res.redirect('/outlets');
    }
    return res.render('pages/login', { user: null, error: data.message || 'Login failed' });
  } catch (err) {
    return res.render('pages/login', { user: null, error: 'Server error. Please try again.' });
  }
});

app.post('/auth/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('pages/signup', { user: null, error: 'Passwords do not match', formData: { name, email } });
  }
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (data.success) {
      return res.redirect('/login?registered=1');
    }
    return res.render('pages/signup', { user: null, error: data.message || 'Signup failed', formData: { name, email } });
  } catch {
    return res.render('pages/signup', { user: null, error: 'Server error. Please try again.', formData: { name, email } });
  }
});

// ── Page routes ─────────────────────────────────────────────────
app.get('/', async (req, res) => {
  const user = await getUserFull(req);
  res.render('pages/landing', { user });
});

app.get('/login', (req, res) => {
  const user = getUser(req);
  if (user) return res.redirect('/outlets');
  const msg = req.query.registered ? 'Account created! Please log in.' : null;
  res.render('pages/login', { user: null, error: null, success: msg });
});

app.get('/signup', (req, res) => {
  const user = getUser(req);
  if (user) return res.redirect('/outlets');
  res.render('pages/signup', { user: null, error: null, formData: {} });
});

app.get('/outlets', async (req, res) => {
  const user = await getUserFull(req);
  res.render('pages/outlets', { user, searchQuery: req.query.q || '' });
});

app.get('/outlet/:id', async (req, res) => {
  const user = await getUserFull(req);
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/outlets/${req.params.id}`);
    const data = await response.json();
    const outlet = data.data || data.outlet || data || null;
    res.render('pages/outlet', { user, outlet });
  } catch {
    res.render('pages/outlet', { user, outlet: null });
  }
});

app.get('/search', async (req, res) => {
  const user = await getUserFull(req);
  res.render('pages/search', { user, searchQuery: req.query.q || '' });
});

app.get('/orders', async (req, res) => {
  const user = await getUserFull(req);
  if (!user) return res.redirect('/login');
  res.render('pages/orders', { user });
});

app.get('/order/:id', async (req, res) => {
  const user = await getUserFull(req);
  if (!user) return res.redirect('/login');
  res.render('pages/order-tracking', { user, orderId: req.params.id });
});

app.get('/checkout', async (req, res) => {
  const user = await getUserFull(req);
  if (!user) return res.redirect('/login');
  res.render('pages/checkout', { user });
});

app.get('/profile', async (req, res) => {
  const user = await getUserFull(req);
  if (!user) return res.redirect('/login');
  res.render('pages/profile', { user });
});

app.get('/admin', async (req, res) => {
  const user = await getUserFull(req);
  if (!user || user.role !== 'admin') return res.redirect('/login');
  res.render('pages/admin', { user });
});

app.get('/superadmin', async (req, res) => {
  const user = await getUserFull(req);
  if (!user || user.role !== 'superadmin') return res.redirect('/login');
  res.render('pages/superadmin', { user });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// ── Error handler (must be before 404) ──────────────────────────
app.use(errorHandler);

// 404
app.use(async (req, res) => {
  const user = await getUserFull(req);
  res.status(404).render('pages/404', { user });
});

module.exports = app;
