const Certificate = require('../models/Certificate');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Counter = require('../models/Counter');
const cloudinary = require('../config/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'qr');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Generate a serial number that never resets (even if all certificates are deleted)
async function generateSerial() {
  const year = new Date().getFullYear();

  // Ensure a single persistent counter document per year
  const counter = await Counter.findOneAndUpdate(
    { name: 'serial', year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Serial format: SN2025001 (no dashes)
  const serialNumber = `SN${year}${String(counter.seq).padStart(4, '0')}`;
  return serialNumber;
}

// Admin: create certificate and generate QR
exports.createCertificate = async (req, res) => {
  try {
    let { serialNumber, studentName, course, position, issueDate } = req.body;

    if (!studentName)
      return res.status(400).json({ message: 'studentName required' });

    // Auto-generate serial if not provided
    if (!serialNumber) {
      serialNumber = await generateSerial();
    }

    const exists = await Certificate.findOne({ serialNumber });
    if (exists)
      return res.status(409).json({ message: 'serialNumber already exists' });

    const cert = new Certificate({
      serialNumber,
      studentName,
      course,
      position,
      issueDate,
    });

    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:5173'}/verify`;

    // Generate QR Code as Data URL
    const dataUrl = await QRCode.toDataURL(verifyUrl, {
      type: 'image/png',
      margin: 1,
      scale: 8,
    });

    // Upload QR to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(dataUrl, {
      folder: process.env.CLOUDINARY_FOLDER || 'certificates/qr',
      public_id: serialNumber,
      overwrite: true,
      resource_type: 'image',
    });

    cert.qrUrl = uploadRes.secure_url;
    cert.qrPublicId = uploadRes.public_id;
    cert.qrPath = undefined;

    await cert.save();

    res.status(201).json({ message: 'Certificate created', certificate: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Public: get certificate by serial
exports.getCertificateBySerial = async (req, res) => {
  try {
    const serial = req.params.serialNumber;
    const cert = await Certificate.findOne({ serialNumber: serial });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: list certificates
exports.listCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: preview next serial (no counter increment)
exports.nextSerial = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const doc = await Counter.findOne({ name: 'serial', year }).lean();
    const base = doc?.seq || 0;
    const next = base + 1;
    const candidate = `SN${year}${String(next).padStart(4, '0')}`;
    res.json({ serial: candidate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
