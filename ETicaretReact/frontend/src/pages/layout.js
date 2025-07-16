import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

function LayoutComponent() {
    const navigate =useNavigate();

    const logout=()=>{
        navigate("/login");
    }
    
    useEffect(()=> {
      if(!localStorage.getItem("token")){
        navigate("/login");
      }
    })
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          {/* Erişilebilirlik için <a> yerine <Link> veya href="/" kullanılmalı */}
          <a className="navbar-brand" href="/">E-Ticaret</a>

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
                <Link className="nav-link" to="/">Ana Sayfa</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">Ürünler</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/orders">Siparişlerim</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/baskets">Sepetim</Link>
              </li>
            </ul>
            <button onClick={logout} className="btn btn-outline-danger" type="submit">Çıkış Yap</button>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default LayoutComponent;
