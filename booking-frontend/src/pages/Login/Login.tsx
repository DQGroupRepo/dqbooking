import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import AuthService from "../../services/AuthService";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../context/AuthContext";

import "./Login.css";


const Login = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    login
  } = useAuth();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

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

  const fromLocation = location.state?.from;
  const LAST_PAGE_BEFORE_LOGIN_KEY = "eventnest:last-page-before-login";

  // Public pages do not pass state.from through ProtectedRoute. In that case,
  // use the last in-app page recorded by ScrollManager before /login was opened.
  let savedReturnUrl = "/";
  try {
    savedReturnUrl = sessionStorage.getItem(LAST_PAGE_BEFORE_LOGIN_KEY) || "/";
  } catch {
    // Storage can be unavailable in restricted browser contexts; keep the safe fallback.
  }

  const requestedReturnUrl =
    fromLocation && typeof fromLocation.pathname === "string"
      ? `${fromLocation.pathname}${fromLocation.search ?? ""}${fromLocation.hash ?? ""}`
      : savedReturnUrl;

  // Preserve only safe internal paths and avoid redirecting back to auth pages.
  const returnUrl =
    requestedReturnUrl.startsWith("/") &&
    !requestedReturnUrl.startsWith("//") &&
    !requestedReturnUrl.startsWith("/login") &&
    !requestedReturnUrl.startsWith("/register")
      ? requestedReturnUrl
      : "/";


  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setLoading(true);

    setError("");


    try {

      let response = await AuthService.login({ email, password });
      let loginData = response.data;

      if (loginData.requiresConfirmation) {
        const confirmed = window.confirm(
          loginData.message || "This account is already signed in. Sign out the other session and continue?"
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
        response = await AuthService.login({ email, password, replaceExistingSession: true });
        loginData = response.data;
      }

      if (!loginData.token || !loginData.userId || !loginData.role) {
        throw new Error("Login could not be completed. Please try again.");
      }


      /*
       * Create the authenticated user
       * expected by AuthContext.
       */

      const user = {

        userId: loginData.userId,

        role: loginData.role as UserRole,

        name: loginData.name ?? ""

      };


      /*
       * Update AuthContext.
       *
       * This also stores:
       *
       * token
       * user
       */

      login(
        loginData.token,
        user,
        rememberMe
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
            replace: true,
            state: {
              restoreScroll: returnUrl.split(/[?#]/)[0] === "/categories"
            }
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
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
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
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
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

              New to DQBooking.com ?


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
