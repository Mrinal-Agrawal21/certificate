const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const exists = await AdminUser.findOne({ email });
    if (exists) return res.status(409).json({ message: 'email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({ email, passwordHash });

    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await AdminUser.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Increment sessionVersion to invalidate previous tokens
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, sv: user.sessionVersion },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    res.json({ id: req.user.id, email: req.user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

