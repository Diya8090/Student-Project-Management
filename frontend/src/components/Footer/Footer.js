import "./Footer.css";

function Footer({ role }) {
  return (
    <footer className={`footer footer-${role}`}>
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-brand">Student Project Management</span>
          <span className="footer-copy">© 2026 All rights reserved.</span>
        </div>

        <div className="footer-links">
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
