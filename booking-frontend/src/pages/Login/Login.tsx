import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthService from "../../services/AuthService";
import { Link } from "react-router-dom";

import "./Login.css";

const Login = () => {

  const [userType, setUserType] =
    useState<"customer" | "vendor">("customer");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (
      e: React.FormEvent
  ) => {

      e.preventDefault();

      setLoading(true);

      setError("");

      try {

          const response =
              await AuthService.login({

                  email,

                  password

              });

          localStorage.setItem(

              "token",

              response.data.token

          );

          localStorage.setItem(

              "userId",

              response.data.userId

          );

          localStorage.setItem(

              "role",

              response.data.role

          );

          localStorage.setItem(

              "name",

              response.data.name

          );

         switch (response.data.role) {

             case "ADMIN":

                 navigate("/admin/dashboard");

                 break;

             case "CUSTOMER":

                 navigate("/");

                 break;

             default:

                 navigate("/vendor/dashboard");

         }

      }

      catch (err: any) {

          setError(

              err.response?.data ||

              "Invalid Email or Password"

          );

      }

      finally {

          setLoading(false);

      }

  };

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


          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />

            </div>


            <div className="form-group">

              <label>
                Password
              </label>

              <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {
                error &&

                <p
                    style={{

                        color: "red",

                        marginBottom: "15px"

                    }}
                >
                    {error}
                </p>
            }

            <button
                className="primary-login"
                type="submit"
                disabled={loading}
            >
              {
                  loading

                      ? "Logging in..."

                      : "Login"
              }
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