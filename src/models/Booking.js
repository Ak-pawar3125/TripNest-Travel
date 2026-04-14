const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    travelerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    destination: { type: String, required: true },
    dateOfBirth: { type: String },
    travelDate: { type: String, required: true },
    returnDate: { type: String }, 
    address: { type: String },
    travelersCount: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    razorpayOrderId: { type: String, required: true }, // Keeping for compatibility with previous plan
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, enum: ['Created', 'Paid', 'Failed'], default: 'Created' },
    bookingStatus: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
