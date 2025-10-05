import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function App() {
  // Logout on home page visit
  useEffect(() => {
    try { localStorage.removeItem('token'); } catch {}
  }, []);
  return (
    <div>
      <nav className="navbar">
        <div className="brand">
          <div className="logo" />
          <span>Certificate Verification</span>
        </div>
        <div className="navlinks">
          <Link className="btn" to="/">Home</Link>
          <Link className="btn" to="/verify">Verify</Link>
          <Link className="btn" to="/admin">Admin</Link>
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <div className="hero-card">
            <h1>Verify Certificates with Confidence</h1>
            <p>
              Scan the QR on your printed certificate and open the verify page. For privacy, enter your unique serial number to fetch authentic details from the backend.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to="/verify">Go to Verify</Link>
              <Link className="btn" to="/admin">Open Admin</Link>
            </div>
          </div>

          <div className="card">
            <h2>How it works</h2>
            <ol className="list" style={{ counterReset: "step" }}>
              <li className="list-item">
                <div>
                  <b>Step 1:</b> Admin creates a certificate and generates a QR image.
                  <div className="helper">The QR points to <code className="mono">/verify</code>.</div>
                </div>
              </li>
              <li className="list-item">
                <div>
                  <b>Step 2:</b> Student visits the Verify page from the QR.
                  <div className="helper">They enter the serial number printed on the certificate.</div>
                </div>
              </li>
              <li className="list-item">
                <div>
                  <b>Step 3:</b> Certificate details are fetched from the server.
                  <div className="helper">Authentic, tamper-resistant verification.</div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <p className="footer">© {new Date().getFullYear()} Certificate Verification</p>
      </main>
    </div>
  );
}
