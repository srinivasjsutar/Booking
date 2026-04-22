// backend/routes/kyc.js
// Aadhaar OTP + PAN verification via Sandbox (sandbox.co.in)

const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const User    = require('../models/User');
const protect = require('../middleware/auth');

const BASE = 'https://api.sandbox.co.in';

// Get a short-lived JWT access token from Sandbox
const getToken = async () => {
  const res = await axios.post(
    `${BASE}/authenticate`,
    {},
    {
      headers: {
        'x-api-key':     process.env.SANDBOX_API_KEY,
        'x-api-secret':  process.env.SANDBOX_API_SECRET,
        'x-api-version': '1.0.0',
        'Content-Type':  'application/json',
      },
    }
  );
  return res.data.data.access_token;
};

const headers = (token) => ({
  'Content-Type':  'application/json',
  'x-api-key':     process.env.SANDBOX_API_KEY,
  'Authorization': token,
  'x-api-version': '1.0.0',
});

// ── POST /api/kyc/aadhaar/generate-otp ───────────────────────────────────────
// Body: { aadhaarNumber }
router.post('/aadhaar/generate-otp', protect, async (req, res) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 12-digit Aadhaar number' });
  }

  try {
    const token = await getToken();
    const response = await axios.post(
      `${BASE}/kyc/aadhaar/okyc/otp`,
      {
        '@entity':      'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
        aadhaar_number: aadhaarNumber,
        consent:        'y',
        reason:         'KYC verification for hotel booking',
      },
      { headers: headers(token) }
    );

    const referenceId = response.data?.data?.reference_id;
    if (!referenceId) {
      return res.status(502).json({ success: false, message: 'Failed to send OTP. Try again.' });
    }

    res.json({ success: true, referenceId: String(referenceId), message: 'OTP sent to Aadhaar-linked mobile' });
  } catch (err) {
    console.error('Aadhaar OTP error:', err.response?.data || err.message);
    res.status(502).json({ success: false, message: err.response?.data?.message || 'Could not send OTP' });
  }
});

// ── POST /api/kyc/aadhaar/verify-otp ─────────────────────────────────────────
// Body: { referenceId, otp }
router.post('/aadhaar/verify-otp', protect, async (req, res) => {
  const { referenceId, otp } = req.body;

  if (!referenceId || !otp) {
    return res.status(400).json({ success: false, message: 'referenceId and OTP are required' });
  }

  try {
    const token = await getToken();
    const response = await axios.post(
      `${BASE}/kyc/aadhaar/okyc/otp/verify`,
      {
        '@entity':    'in.co.sandbox.kyc.aadhaar.okyc.request',
        reference_id: referenceId,
        otp,
      },
      { headers: headers(token) }
    );

    const data = response.data?.data;

    if (data?.status === 'VALID') {
      const addr = data.address;
      const fullAddress = addr
        ? [addr.house, addr.street, addr.vtc, addr.district, addr.state, addr.pincode]
            .filter(Boolean).join(', ')
        : data.full_address || '';

      await User.findByIdAndUpdate(req.user._id, {
        'kyc.aadhaar.verified':   true,
        'kyc.aadhaar.name':       data.name        || '',
        'kyc.aadhaar.dob':        data.date_of_birth || '',
        'kyc.aadhaar.gender':     data.gender       || '',
        'kyc.aadhaar.address':    fullAddress,
        'kyc.aadhaar.verifiedAt': new Date(),
        'kyc.status':             'aadhaar_done',
      });

      return res.json({ success: true, message: 'Aadhaar verified', name: data.name, dob: data.date_of_birth });
    }

    res.status(422).json({ success: false, message: 'OTP verification failed. Please retry.' });
  } catch (err) {
    console.error('Aadhaar verify error:', err.response?.data || err.message);
    res.status(502).json({ success: false, message: err.response?.data?.message || 'Verification failed' });
  }
});

// ── POST /api/kyc/pan/verify ──────────────────────────────────────────────────
// Body: { panNumber, nameAsPerPan, dateOfBirth }  dateOfBirth: DD/MM/YYYY
router.post('/pan/verify', protect, async (req, res) => {
  const { panNumber, nameAsPerPan, dateOfBirth } = req.body;

  if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber.toUpperCase())) {
    return res.status(400).json({ success: false, message: 'Enter a valid PAN (e.g. ABCDE1234F)' });
  }
  if (!nameAsPerPan || nameAsPerPan.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!dateOfBirth || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
    return res.status(400).json({ success: false, message: 'Date of birth required as DD/MM/YYYY' });
  }

  try {
    const token = await getToken();
    const response = await axios.post(
      `${BASE}/kyc/pan/verify`,
      {
        '@entity':       'in.co.sandbox.kyc.pan_verification.request',
        pan:             panNumber.toUpperCase(),
        name_as_per_pan: nameAsPerPan.trim().toUpperCase(),
        date_of_birth:   dateOfBirth,
        consent:         'Y',
        reason:          'KYC verification for hotel booking',
      },
      { headers: headers(token) }
    );

    const data = response.data?.data;

    if (data?.status === 'valid') {
      await User.findByIdAndUpdate(req.user._id, {
        'kyc.pan.verified':   true,
        'kyc.pan.name':       nameAsPerPan.trim().toUpperCase(),
        'kyc.pan.number':     panNumber.toUpperCase(),
        'kyc.pan.verifiedAt': new Date(),
        'kyc.status':         'verified',
      });

      return res.json({ success: true, message: 'PAN verified successfully' });
    }

    res.status(422).json({ success: false, message: 'PAN verification failed. Check your details and retry.' });
  } catch (err) {
    console.error('PAN verify error:', err.response?.data || err.message);
    res.status(502).json({ success: false, message: err.response?.data?.message || 'PAN verification failed' });
  }
});

// ── GET /api/kyc/status ───────────────────────────────────────────────────────
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kyc');
    res.json({ success: true, kyc: user.kyc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;