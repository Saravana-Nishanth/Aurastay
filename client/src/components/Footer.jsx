export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <span className="footer__brand">AuraStay</span> © {new Date().getFullYear()} Copyright: AuraStay
      </div>
    </footer>
  );
}
