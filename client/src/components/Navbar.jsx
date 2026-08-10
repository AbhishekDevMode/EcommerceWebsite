import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Navbar = ({
  onSelectCategory,
  onSearch,
  onOpenAuth,
  onOpenCart,
  onOpenProfile,
  onOpenWishlist,
  onProductClick,
  theme,
  onToggleTheme,
  categories = [],
}) => {
  const { user, logout } = useContext(AuthContext);
  const { activeItems } = useContext(CartContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products/autocomplete?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = (product) => {
    onProductClick(product);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    onSearch(query);
    setShowSuggestions(false);
  };

  const cartCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar navbar-dark">
      <div className="container">
        {/* Brand Logo */}
        <a
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-gradient fs-4"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory(null);
          }}
        >
          <i className="bi bi-bag-heart-fill fs-3 text-primary"></i>
          <span>QuicKart</span>
        </a>

        {/* Navbar Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Category Dropdown */}
          <div className="dropdown me-lg-3 my-2 my-lg-0">
            <button
              className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-1"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-grid-fill me-1"></i> Categories
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow-lg">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onSelectCategory(null)}
                >
                  All Categories
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className="dropdown-item"
                    onClick={() => onSelectCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Autocomplete Search Bar */}
          <form
            className="flex-grow-1 position-relative me-lg-3 my-2 my-lg-0"
            ref={searchRef}
            onSubmit={submitSearch}
          >
            <div className="input-group">
              <span className="input-group-text bg-dark-subtle border-secondary text-light">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark-subtle text-light border-secondary shadow-none search-input"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.trim().length >= 2 && setShowSuggestions(true)
                }
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
              <button className="btn btn-primary" type="submit" title="Search">
                <i className="bi bi-search"></i>
              </button>
            </div>

            {/* Autocomplete Suggestions Menu */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="autocomplete-menu shadow-lg rounded mt-1 bg-dark border border-secondary text-light">
                <div className="p-2 small text-muted text-uppercase fw-semibold border-bottom border-secondary">
                  Product Autocomplete Suggestions
                </div>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    className="autocomplete-item p-2 d-flex align-items-center gap-3 cursor-pointer border-bottom border-secondary-subtle"
                    onClick={() => handleSuggestionClick(p)}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="rounded object-fit-cover"
                      width="45"
                      height="45"
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-semibold text-truncate text-light">
                        {p.name}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-2">
                        <span className="badge bg-secondary">
                          {p.category?.name}
                        </span>
                        {p.brand && <span>{p.brand}</span>}
                      </div>
                    </div>
                    <div className="fw-bold text-success">
                      ${p.price?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Right Action Icons: Cart & Profile */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            <button
              className="btn btn-outline-light d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '42px', height: '42px' }}
              title={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
              onClick={onToggleTheme}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'} fs-5`}></i>
            </button>
            <button
              className="btn btn-outline-light position-relative d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '42px', height: '42px' }}
              title="Wishlist"
              onClick={() => user ? onOpenWishlist() : onOpenAuth('login')}
            >
              <i className="bi bi-heart fs-5"></i>
            </button>
            {/* Cart Button */}
            <button
              className="btn btn-outline-light position-relative d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              onClick={onOpenCart}
            >
              <i className="bi bi-cart3 fs-5"></i>
              <span className="d-none d-md-inline fw-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="dropdown position-relative">
                <button
                  className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: "40px", height: "40px" }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>
                {showUserDropdown && (
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-dark show shadow-lg mt-2 border-secondary position-absolute">
                    <div className="px-3 py-2 border-bottom border-secondary">
                      <div className="fw-bold text-light">{user.name}</div>
                      <div className="small text-muted">{user.email}</div>
                    </div>
                    <button
                      className="dropdown-item py-2 d-flex align-items-center gap-2"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile("info");
                      }}
                    >
                      <i className="bi bi-person-circle"></i> Profile Dashboard
                    </button>
                    <button
                      className="dropdown-item py-2 d-flex align-items-center gap-2"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile("orders");
                      }}
                    >
                      <i className="bi bi-box-seam"></i> Order History
                    </button>
                    <button
                      className="dropdown-item py-2 d-flex align-items-center gap-2"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile("addresses");
                      }}
                    >
                      <i className="bi bi-geo-alt"></i> Saved Addresses
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item py-2 text-danger d-flex align-items-center gap-2"
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-gradient-primary rounded-pill px-4 py-2 fw-semibold"
                onClick={() => onOpenAuth("login")}
              >
                <i className="bi bi-person me-1"></i> Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
