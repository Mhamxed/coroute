import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Axios from "axios";
import { useContext, useState } from "react";
import { NotificationContext, UserContext } from '../App';
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser, setrRefreshUser, setUser, setToken } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.post(`${API}/api/auth/login`, { email, password });
      const userData = res.data;
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      setUser(userData);
      setToken(userData.token);
      setrRefreshUser(!refreshUser);
      navigate(userData.role === "DRIVER" ? "/driver/dashboard" : "/dashboard");
      console.log("API response:", res.data);
      console.log("Stored user:", JSON.parse(localStorage.getItem("user")));
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || "Invalid credentials",
        type: "error",
        onClose: closeNotification,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-lime-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black" style={{ fontFamily: "'Syne', sans-serif" }}>C</span>
            </div>
            <span className="text-white font-black text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Coroute</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Welcome back.<br />
            <span className="text-lime-400">Your ride awaits.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Sign in to view your bookings, manage your trips, and connect with drivers across Morocco.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-sm">
            <p className="text-gray-300 text-sm italic leading-relaxed">"I travel Casablanca to Rabat every week. Coroute saves me 60% compared to the train."</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">YB</div>
              <div>
                <p className="text-white text-xs font-semibold">Youssef B.</p>
                <p className="text-gray-500 text-xs">Regular rider</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative text-gray-600 text-xs">© {new Date().getFullYear()} Coroute</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-lime-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>C</span>
            </div>
            <span className="font-black text-gray-900 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Coroute</span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">Don't have an account? <Link to="/signup" className="text-lime-600 font-semibold hover:text-lime-700">Sign up</Link></p>

          <form onSubmit={handleLogIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-lime-200 hover:shadow-lime-300 disabled:opacity-60 mt-2 cursor-pointer">
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}