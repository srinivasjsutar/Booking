// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },

    // ── KYC ──────────────────────────────────────────────────────────────────
    kyc: {
      status: {
        type: String,
        enum: ['not_started', 'aadhaar_done', 'verified'],
        default: 'not_started',
      },
      aadhaar: {
        verified:   { type: Boolean, default: false },
        name:       { type: String,  default: '' },
        dob:        { type: String,  default: '' },
        gender:     { type: String,  default: '' },
        address:    { type: String,  default: '' },
        verifiedAt: { type: Date },
      },
      pan: {
        verified:   { type: Boolean, default: false },
        name:       { type: String,  default: '' },
        number:     { type: String,  default: '' },
        verifiedAt: { type: Date },
      },
    },
    // ─────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);