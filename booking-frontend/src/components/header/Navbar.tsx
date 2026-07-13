import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">

        <Link className="navbar-brand fw-bold" to="/">
          EventNest
        </Link>

        <div className="ms-auto d-flex gap-3">

          <Link
            className="nav-link"
            to="/categories"
          >
            Categories
          </Link>

          <Link
            className="nav-link"
            to="/login"
          >
            Login
          </Link>

          <Link
            className="btn btn-primary"
            to="/register"
          >
            Sign Up
          </Link>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;