const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed
const { z } = require('zod');

// Validation Schemas
const registerSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = registerSchema.parse(req.body);

        // Check if user exists (email or username)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            res.status(400);
            throw new Error(userExists.email === email ? 'Email already registered' : 'Username already taken');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        next(error); // Properly pass to error middleware
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        next(error);
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
    try {
        const { email, username, googleId } = req.body; // In prod, verify token instead

        if (!email) {
            res.status(400);
            throw new Error('Email is required');
        }

        let user = await User.findOne({ email });

        if (user) {
            // User exists, return token
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            // Register new user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                googleId // Optional: store googleId if you added field to schema, else ignore
            });

            if (user) {
                res.status(201).json({
                    _id: user.id,
                    username: user.username,
                    email: user.email,
                    token: generateToken(user.id),
                });
            } else {
                res.status(400);
                throw new Error('Invalid user data');
            }
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    googleLogin
};
