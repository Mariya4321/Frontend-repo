import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/api/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setUser(data.username);
        } catch (err) {
          console.error(err);
        }
      }
    };

    const fetchCartCount = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:8000/api/cart/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setCartCount(data.length);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchProfile();
    fetchCartCount();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/">
          🛍️ E-Commerce
        </Link>

        <div className="collapse navbar-collapse">
          <div className="navbar-nav ms-auto d-flex align-items-center gap-3">
            {user ? (
              <>
                <Link className="nav-link" to="/">
                  Home
                </Link>

                {/* Cart with badge */}
                <Link className="nav-link position-relative" to="/cart">
                  <i className="bi bi-cart3 fs-5" style={{ color: "#fff" }} />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <span className="text-white me-2">Hi, {user}</span>
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/">
                  Home
                </Link>
                <Link className="btn btn-sm btn-outline-light" to="/login">
                  Login
                </Link>
                <Link className="btn btn-sm btn-warning ms-2" to="/signup">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
