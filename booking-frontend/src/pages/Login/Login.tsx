import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import AuthService from "../../services/AuthService";
import { useAuth, type AuthUser } from "../../context/AuthContext";

import "./Login.css";


const Login = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    login
  } = useAuth();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  /*
   * If the user was redirected to login
   * from another page, remember that page.
   *
   * Example:
   *
   * /vendor/dashboard
   *
   * Otherwise default to Home.
   */

  const returnUrl =
    location.state?.from?.pathname
      ? location.state.from.pathname
      : "/";


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


      const loginData = response.data;


      /*
       * Create the authenticated user
       * expected by AuthContext.
       */

      const user: AuthUser = {

        userId: loginData.userId,

        role: loginData.role as AuthUser["role"],

        name: loginData.name ?? ""

      };


      /*
       * Update AuthContext.
       *
       * This also stores:
       *
       * eventnest_token
       * eventnest_user
       */

      login(
        loginData.token,
        user
      );


      /*
       * ============================
       * ROLE BASED REDIRECTION
       * ============================
       */


      if (
        loginData.role === "VENDOR_ADMIN" ||
        loginData.role === "VENDOR_USER"
      ) {

        navigate(
          "/vendor/dashboard",
          {
            replace: true
          }
        );

        return;

      }


      if (loginData.role === "ADMIN") {

        navigate(
          "/admin/dashboard",
          {
            replace: true
          }
        );

        return;

      }


      if (loginData.role === "CUSTOMER") {

        /*
         * Customer returns to the
         * previous page if available.
         *
         * Otherwise goes Home.
         */

        navigate(
          returnUrl,
          {
            replace: true
          }
        );

        return;

      }


      setError(
        "Invalid user role. Please contact support."
      );

    }

    catch (err: any) {

      console.error(
        "Login error:",
        err
      );


      setError(

        err.response?.data?.message ||

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


          <form onSubmit={handleLogin}>


            <div className="form-group">

              <label>
                Email Address
              </label>


              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
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
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            <div className="login-options">

              <label>

                <input
                  type="checkbox"
                />

                Remember me

              </label>


              <Link to="#">
                Forgot Password?
              </Link>

            </div>


            {error && (

              <p
                style={{
                  color: "red",
                  marginBottom: "15px"
                }}
              >
                {error}
              </p>

            )}


            <button
              className="primary-login"
              type="submit"
              disabled={loading}
            >

              {loading
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