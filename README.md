# Certificate Verification (MERN)

## Setup
1. Clone the repo.
2. Install server dependencies:
   ```bash
   cd server
   npm install

Install client dependencies:
cd ../client
npm install

Environment
Copy .env.example to server/.env and set values.
Copy client/.env and configure VITE_API_URL and VITE_ADMIN_TOKEN.
Run locally
Start the server:
cd server
npm run dev

Start client in a separate terminal:
cd client
npm run dev

Visit http://localhost:5173 (Vite default) for frontend, server runs on port 5000.
Admin usage
Visit /admin on frontend or use Postman to POST /api/admin/certificate with header x-admin-token equal to ADMIN_TOKEN.
The endpoint returns qrFile path which you can download and add to certificate printouts.
Verification usage
Student scans QR printed on certificate (points to /verify), enters serial number, and sees the certificate info.

---

## Notes & next steps (suggestions)
- Use HTTPS in production and set `BASE_URL`  to your real domain so QR points to secure link.
- Replace `ADMIN_TOKEN`  header auth with proper JWT + user model for multi-admin support.
- To make QR tamper-evident, embed a signed payload (HMAC) inside the QR pointing to the certificate or include the serial in the QR and validate signature server-side.
- Add rate-limiting / abuse protections on verification endpoint.

---


#
