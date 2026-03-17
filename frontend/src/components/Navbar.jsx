import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-gray-800 text-lg leading-tight">
              PetAdopt
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>
              Browse Pets
            </NavLink>

            {user && (
              <NavLink to="/dashboard" className={navLinkClass}>
                My Applications
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification bell — only for logged-in users */}
                <NotificationBell />
                <span className="text-sm text-gray-500">
                  Hi, <span className="font-semibold text-gray-700">{user.name}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <NavLink to="/" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>
            Browse Pets
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>
              My Applications
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}
          {user ? (
            <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 py-1">
              Logout
            </button>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-3" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
