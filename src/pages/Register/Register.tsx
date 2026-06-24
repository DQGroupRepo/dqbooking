import { useState } from "react";
import { Link } from "react-router-dom";

import "./Register.css";

const Register = () => {

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  const requestOTP = () => {

    if (!email || !phone) {

      alert(
        "Please enter Email and Phone Number"
      );

      return;
    }

    alert(
      "OTP sent successfully (Demo Mode)"
    );
  };


  const verifyOTP = () => {

    if (otp === "123456") {

      setOtpVerified(true);

      alert(
        "OTP Verified Successfully"
      );

    } else {

      alert(
        "Invalid OTP"
      );

    }

  };


  const handleRegister = () => {

    if (password.length < 8) {

      alert(
        "Password must be minimum 8 characters"
      );

      return;
    }

    if (password !== confirmPassword) {

      alert(
        "Passwords do not match"
      );

      return;
    }

    alert(
      "Registration Successful (Demo)"
    );

  };


  return (

    <section className="register-wrapper">

      <div className="register-image">

        <div className="image-overlay">

          <h1>
            Join EventNest
          </h1>

          <p>
            Book venues, photographers,
            makeup artists and more.
          </p>

        </div>

      </div>


      <div className="register-container">

        <div className="register-card">

          <h2>
            Create Account
          </h2>

          <p>
            Start planning your special event
          </p>


          <div className="form-group">

            <label>
              Email Address *
            </label>

            <input
              type="email"
              value={email}
              onChange={(e)=>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
            />

          </div>


          <div className="form-group">

            <label>
              Phone Number *
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e)=>
                setPhone(e.target.value)
              }
              placeholder="10 digit mobile number"
            />

          </div>


          <button
            className="primary-register"
            type="button"
            onClick={requestOTP}
          >
            Request OTP
          </button>


          <div
            className="form-group otp-group"
          >

            <label>
              OTP *
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e)=>
                setOtp(e.target.value)
              }
              placeholder="Enter OTP"
            />

          </div>


          <button
            className="secondary-register"
            type="button"
            onClick={verifyOTP}
          >
            Verify OTP
          </button>


          <hr />


          <div className="form-group">

            <label>
              Password *
            </label>

            <input
              type="password"
              value={password}
              disabled={!otpVerified}
              onChange={(e)=>
                setPassword(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Confirm Password *
            </label>

            <input
              type="password"
              value={confirmPassword}
              disabled={!otpVerified}
              onChange={(e)=>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

          </div>


          <button
            className="primary-register"
            disabled={!otpVerified}
            onClick={handleRegister}
          >
            Register
          </button>


          <p className="login-link">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </div>

      </div>

    </section>

  );

};

export default Register;