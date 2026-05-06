import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { NotificationContext, UserContext } from '../App';

const NAV_LINKS = [
  { label: "Find a trip", to: "/search" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, token, setrRefreshUser, refreshUser } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setrRefreshUser(!refreshUser);
    setDropdownOpen(false);
    setMenuOpen(false);
    setNotification({ message: "Logged out successfully", type: "normal", onClose: closeNotification });
    navigate("/");
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  const dashboardPath = user?.role === "DRIVER" ? "/driver/dashboard" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-lime-500 rounded-xl flex items-center justify-center shadow-sm shadow-lime-200 group-hover:bg-lime-600 transition-colors">
              <span className="text-white font-black text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>C</span>
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              Coroute
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname === link.to
                    ? "bg-lime-50 text-lime-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{user.firstName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                    <Link to={dashboardPath} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-lime-600 transition-colors">
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-lime-600 transition-colors">
                      <Settings size={15} />
                      Profile settings
                    </Link>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Log in
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-lime-500 hover:bg-lime-600 transition-colors shadow-sm shadow-lime-200">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {menuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mt-2">
                <div className="w-9 h-9 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
              <Link to={dashboardPath} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <LayoutDashboard size={15} className="text-gray-400" /> Dashboard
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <Settings size={15} className="text-gray-400" /> Profile settings
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 cursor-pointer">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 py-2.5 text-center rounded-xl text-sm font-semibold text-gray-700 border border-gray-200">
                Log in
              </Link>
              <Link to="/signup" className="flex-1 py-2.5 text-center rounded-xl text-sm font-bold text-white bg-lime-500">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}