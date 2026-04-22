// src/api/kycApi.js
import { apiRequest } from "./client";

// Step 1 — Send OTP to Aadhaar-linked mobile
export const generateAadhaarOtp = (aadhaarNumber, token) =>
  apiRequest("/kyc/aadhaar/generate-otp", {
    method: "POST",
    body: { aadhaarNumber },
    token,
  });

// Step 2 — Verify the OTP
export const verifyAadhaarOtp = (referenceId, otp, token) =>
  apiRequest("/kyc/aadhaar/verify-otp", {
    method: "POST",
    body: { referenceId, otp },
    token,
  });

// Step 3 — Verify PAN (no OTP needed)
export const verifyPan = (panNumber, nameAsPerPan, dateOfBirth, token) =>
  apiRequest("/kyc/pan/verify", {
    method: "POST",
    body: { panNumber, nameAsPerPan, dateOfBirth },
    token,
  });

// Get current KYC status
export const getKycStatus = (token) => apiRequest("/kyc/status", { token });
