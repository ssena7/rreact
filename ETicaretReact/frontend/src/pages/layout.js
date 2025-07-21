import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

function LayoutComponent() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Sayfa ilk yüklendiğinde token ve kullanıcı kontrolü yap
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setIsAdmin(user?.isAdmin || false);
      } catch (error) {
        console.error("User verisi okunamadı:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            E-Ticaret
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Ana Sayfa
                </Link>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <Link className="nav-link" to="/products">
                    Ürünler
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link" to="/orders">
                  Siparişlerim
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/baskets">
                  Sepetim
                </Link>
              </li>
            </ul>
            <button
              onClick={logout}
              className="btn btn-outline-danger"
              type="button"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default LayoutComponent;
