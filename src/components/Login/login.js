import { Component } from "react";
import { Navigate } from "react-router-dom";
import "./login.css";

const API_URL = "https://svs-jewellery-works-backend.onrender.com";

class Login extends Component {
  state = {
    username: "",
    password: "",
    showPassword: false,
    loading: false,
    checkingAuth: true,
    authenticated: false,
    errorMessage: "",
  };

  componentDidMount() {
    this.checkAuthentication();
  }

  checkAuthentication = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/verify`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        this.setState({
          authenticated: true,
          checkingAuth: false,
        });
      } else {
        this.setState({
          authenticated: false,
          checkingAuth: false,
        });
      }
    } catch (error) {
      console.error("Authentication check error:", error);

      this.setState({
        authenticated: false,
        checkingAuth: false,
      });
    }
  };

  onChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
      errorMessage: "",
    });
  };

  onChangePassword = (event) => {
    this.setState({
      password: event.target.value,
      errorMessage: "",
    });
  };

  togglePassword = () => {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword,
    }));
  };

  onSubmitLogin = async (event) => {
    event.preventDefault();

    const { username, password } = this.state;

    if (username.trim() === "" || password.trim() === "") {
      this.setState({
        errorMessage: "Please enter username and password.",
      });

      return;
    }

    this.setState({
      loading: true,
      errorMessage: "",
    });

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          errorMessage:
            data.message ||
            "Invalid username or password.",
          loading: false,
        });

        return;
      }

      console.log("Login successful");

      /*
        Backend has now created the JWT
        and stored it in the HttpOnly cookie.

        React does NOT need to access the token.
      */

      this.setState({
        loading: false,
        password: "",
      });

      window.location.href = "/addJewellery";

    } catch (error) {
      console.error("Login error:", error);

      this.setState({
        loading: false,
        errorMessage:
          "Unable to connect to server. Please try again.",
      });
    }
  };

  render() {
    const {
      username,
      password,
      showPassword,
      loading,
      checkingAuth,
      authenticated,
      errorMessage,
    } = this.state;

    // Still checking the JWT cookie
    if (checkingAuth) {
      return (
        <div className="admin-login-page">
          <div className="admin-login-card">
            <div className="login-loading">
              Checking admin access...
            </div>
          </div>
        </div>
      );
    }

    // JWT exists and is valid
    if (authenticated) {
      return <Navigate to="/addJewellery" replace />;
    }

    return (
      <div className="admin-login-page">

        <div className="login-glow glow-one"></div>
        <div className="login-glow glow-two"></div>
        <div className="login-glow glow-three"></div>

        <span className="particle particle-one"></span>
        <span className="particle particle-two"></span>
        <span className="particle particle-three"></span>
        <span className="particle particle-four"></span>
        <span className="particle particle-five"></span>
        <span className="particle particle-six"></span>

        <div className="admin-login-card">

          <div className="login-logo">
            <div className="diamond-icon">

              <img
                src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787501380/SVS_Logo_khmjst.jpg"
                alt="SVS Jewellery Logo"
                className="svs-logo"
              />

            </div>
          </div>

          <div className="login-line"></div>

          <h2>Admin Login</h2>

          <p className="login-description">
            Welcome back. Sign in to manage your jewellery store.
          </p>

          <form onSubmit={this.onSubmitLogin}>

            {/* Username */}

            <div className="login-input-group">

              <label>Username</label>

              <div className="login-input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  value={username}
                  onChange={this.onChangeUsername}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={loading}
                />

              </div>

            </div>

            {/* Password */}

            <div className="login-input-group">

              <label>Password</label>

              <div className="login-input-wrapper">

                <span className="input-icon">
                  🔐
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={this.onChangePassword}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={this.togglePassword}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* Error */}

            {errorMessage !== "" && (
              <div className="login-error">
                {errorMessage}
              </div>
            )}

            {/* Login button */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <span className="loading-content">

                  <span className="loader"></span>

                  Signing in...

                </span>
              ) : (
                <>
                  <span>LOGIN</span>

                  <span className="login-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          <p className="login-footer">
            🔒 Secure Admin Access
          </p>

          <p className="copyright">
            © 2026 SVS Jewellery
          </p>

        </div>

      </div>
    );
  }
}

export default Login;