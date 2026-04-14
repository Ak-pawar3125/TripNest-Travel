require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const Booking = require('./models/Booking');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'tripnest_secret_key';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Middleware: Auth Verification
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
        req.userId = decoded.id;
        next();
    });
};

// --- AUTH ENDPOINTS ---

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

        console.log('New Signup Request:', req.body.email);
        const user = new User({ fullName, email, phone, password });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ success: true, user: { fullName, email, id: user._id } });
    } catch (err) {
        console.error('SERVER SIGNUP ERROR:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: { fullName: user.fullName, email: user.email, id: user._id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/auth/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.json({ success: false });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// --- BOOKING ENDPOINTS ---

app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/bookings/:id/cancel', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, userId: req.userId });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        booking.bookingStatus = 'Cancelled';
        await booking.save();
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Endpoint: Create Order
app.post('/api/payment/create-order', verifyToken, async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const options = {
            amount: amount * 100, // Amount in paise
            currency: currency || 'USD',
            receipt: `rcpt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});

// Endpoint: Verify Payment
app.post('/api/payment/verify', verifyToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingData
        } = req.body;

        // For real validation, check signature here if using real keys
        // sign = razorpay_order_id + "|" + razorpay_payment_id
        // ... verifySign logic ...

        const newBooking = new Booking({
            ...bookingData,
            userId: req.userId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentStatus: 'Paid',
            bookingStatus: 'Confirmed'
        });

        await newBooking.save();

        res.json({
            success: true,
            message: 'Payment verified and booking confirmed',
            booking: newBooking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
    }
});

// Send index.html for any request (SPA-like or just direct)
app.get('/*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
