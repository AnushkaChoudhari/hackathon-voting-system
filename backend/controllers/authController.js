const User = require('../models/User');

const jwt = require('jsonwebtoken');

exports.studentLogin = async (req, res) => {
  const { prn } = req.body;
  if (!prn) return res.status(400).json({ message: 'PRN is required' });

  try {
    let user = await User.findOne({ prn });
    if (!user) {
      // Automatic registration for new students as per request
      user = new User({ prn });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, prn: user.prn, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user, message: 'Student Login Successful' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


