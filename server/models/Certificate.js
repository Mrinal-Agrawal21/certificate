const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  course: String,
  position: String,
  issueDate: Date,
  createdAt: { type: Date, default: Date.now },
  // Soft delete flag to hide from frontend without removing from DB
  isDeleted: { type: Boolean, default: false },
  // Legacy local file path (kept for backward compatibility)
  qrPath: String,
  // Cloudinary URL of the QR image
  qrUrl: String,
  // Cloudinary public ID to enable deletion
  qrPublicId: String
});

module.exports = mongoose.model('Certificate', CertificateSchema);
