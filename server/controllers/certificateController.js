const Certificate = require('../models/Certificate');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'qr');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Compute next serial like C-YYYY-XXXX by scanning existing certificates
async function generateSerial() {
  const year = new Date().getFullYear();
  const yearStr = String(year);

  // Normalize by stripping non-digits and extracting year+seq, supports legacy formats
  const latest = await Certificate.aggregate([
    {
      $addFields: {
        _digits: { $regexReplace: { input: "$serialNumber", regex: /\D/g, replacement: "" } }
      }
    },
    {
      $addFields: {
        _year: { $substr: ["$_digits", 0, 4] },
        _seqStr: { $substr: ["$_digits", 4, 4] }
      }
    },
    { $match: { _year: yearStr } },
    {
      $addFields: {
        _seq: {
          $convert: { input: "$_seqStr", to: "int", onError: 0, onNull: 0 }
        }
      }
    },
    { $sort: { _seq: -1 } },
    { $limit: 1 },
    { $project: { _seq: 1 } }
  ]);

  const nextSeq = (latest && latest[0] && latest[0]._seq) ? latest[0]._seq + 1 : 1;
  const serial = `SN-${year}-${String(nextSeq).padStart(4, '0')}`;
  return serial;
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
    if (err && (err.code === 11000 || err.name === 'MongoServerError') && err.keyPattern && err.keyPattern.serialNumber) {
      return res.status(409).json({ message: 'serialNumber already exists' });
    }
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

// Admin: compute next serial (no reservation)
exports.nextSerial = async (req, res) => {
  try {
    const serialNumber = await generateSerial();

    // Prevent caching of the generated serial response
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({ serial: serialNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
