import { Link } from "react-router-dom";
import { categories } from "../../mocks/categories";
import "./Footer.css";

const supportLinks = [
  { label: "Help Center", to: "/help-center" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <h3>DQBooking.com</h3>
        <p>Your trusted event booking marketplace.</p>
      </div>

      <nav className="footer-column" aria-label="Services">
        <h4>Services</h4>
        {categories.map(category => (
          <Link
            key={category.category}
            to={`${category.link}?category=${encodeURIComponent(category.category)}`}
          >
            {category.title}
          </Link>
        ))}
      </nav>

      <nav className="footer-column" aria-label="Support">
        <h4>Support</h4>
        {supportLinks.map(item => (
          <Link key={item.to} to={item.to}>{item.label}</Link>
        ))}
      </nav>
    </div>
  </footer>
);

export default Footer;
