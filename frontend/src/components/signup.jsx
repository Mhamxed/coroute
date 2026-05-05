import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Car, User } from 'lucide-react';
import Axios from "axios";
import { useContext, useState } from "react";
import { NotificationContext, UserContext } from '../App';
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

export default function Signup() {
  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "",
    phone: "", role: "PASSENGER", licenceNumber: "", vehiclePlate: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser, setrRefreshUser } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.post(`${API}/api/auth/register`, form);
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("token", res.data.token);
      setrRefreshUser(!refreshUser);
      navigate("/");
    } catch (err) {
      setNotification({
        message: err.response?.data?.error || "Registration failed",
        type: "error",
        onClose: closeNotification,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-lime-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black" style={{ fontFamily: "'Syne', sans-serif" }}>C</span>
          </div>
          <span className="font-black text-gray-900 text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Coroute</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Already have one? <Link to="/login" className="text-lime-600 font-semibold hover:text-lime-700">Sign in</Link></p>

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "PASSENGER", label: "I'm a passenger", icon: User, desc: "Find and book trips" },
              { value: "DRIVER", label: "I'm a driver", icon: Car, desc: "Offer seats in my car" },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, role: value }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  form.role === value
                    ? "border-lime-500 bg-lime-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${form.role === value ? "bg-lime-500" : "bg-gray-200"}`}>
                  <Icon size={15} className={form.role === value ? "text-white" : "text-gray-500"} />
                </div>
                <p className={`text-xs font-bold ${form.role === value ? "text-lime-700" : "text-gray-700"}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First name</label>
                <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="Youssef" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Alami" required className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="06 00 00 00 00" required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  className={`${inputClass} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Driver-only fields */}
            {form.role === "DRIVER" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2 border-t border-gray-100"
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Driver details</p>
                <div>
                  <label className={labelClass}>Licence number</label>
                  <input type="text" value={form.licenceNumber} onChange={set("licenceNumber")} placeholder="LIC-000000" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vehicle plate</label>
                  <input type="text" value={form.vehiclePlate} onChange={set("vehiclePlate")} placeholder="AB-123-CD" required className={inputClass} />
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-lime-200 disabled:opacity-60 mt-2 cursor-pointer">
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}