import { useState } from "react";
import { Link } from "react-router-dom";

import "./Login.css";

const Login = () => {

  const [userType, setUserType] =
    useState<"customer" | "vendor">("customer");

  return (

    <section className="login-wrapper">

      <div className="login-image">

        <div className="image-overlay">

          <h1>
            Celebrate Your Moments
          </h1>

          <p>
            Find trusted event professionals
            for every occasion.
          </p>

        </div>

      </div>


      <div className="login-container">

        <div className="login-card">

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to manage your bookings
          </p>


          <div className="login-tabs">

            <button
              className={
                userType === "customer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setUserType("customer")
              }
              type="button"
            >
              Customer
            </button>


            <button
              className={
                userType === "vendor"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setUserType("vendor")
              }
              type="button"
            >
              Vendor
            </button>

          </div>


          <form>

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter email"
              />

            </div>


            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
              />

            </div>


            <div className="login-options">

              <label>

                <input type="checkbox" />

                Remember me

              </label>


              <Link to="#">
                Forgot Password?
              </Link>

            </div>


            <button
              className="primary-login"
              type="submit"
            >
              Login
            </button>


            <div className="divider">

              <span>
                OR
              </span>

            </div>


            <button
              type="button"
              className="google-login"
            >
              🌐 Continue with Google
            </button>


            <p className="register-text">

              New to EventNest?

              <Link to="/register">
                Create Account
              </Link>

            </p>

          </form>

        </div>

      </div>

    </section>

  );

};

export default Login;