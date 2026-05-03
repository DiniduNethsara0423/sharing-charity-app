const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, phone, location } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      phone,
      location,
    });

    // Generate token
    const token = generateToken(user.user_id);

    const response = user.toJSON();
    delete response.password_hash;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: response,
    });
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.user_id);

    const response = user.toJSON();
    delete response.password_hash;

    res.json({
      message: 'Sign in successful',
      token,
      user: response,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
