import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {

return (

<>

  <div className="top-bar">

    <div className="container top-container">

      <div>
        🇮🇳 India ▼ &nbsp;&nbsp; ₹ INR ▼
      </div>

      <div className="header-actions">

        <Link to="/help">
          Help
        </Link>

        <Link to="/login">
          <button className="login-btn">
            Login
          </button>
        </Link>

        <Link to="/register">
          <button className="register-btn">
            Register
          </button>
        </Link>

      </div>

    </div>

  </div>


  <header className="main-header">

    <div className="container header-container">

      <div className="logo">
        🎉 EventNest
      </div>


      <nav className="desktop-menu">

        <Link to="/">
          Home
        </Link>

        <Link to="/categories?category=HALL">
          Halls
        </Link>

        <Link to="/categories?category=PHOTOGRAPHY">
          Photography
        </Link>

        <Link to="/categories?category=MAKEUP">
          Makeup
        </Link>

        <Link to="/bookings">
          My Bookings
        </Link>

      </nav>

    </div>

  </header>

</>


);

};

export default Header;
