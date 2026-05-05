import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_SERVER_URL;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await Axios.post(`${API}/api/admin/login`, { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Mono', monospace" }}>

      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-sm">
        {/* Glow */}
        <div className="absolute -inset-1 bg-lime-500/20 rounded-3xl blur-2xl" />

        <div className="relative bg-zinc-900 border border-zinc-700/50 rounded-3xl p-8">
          {/* Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-14 h-14 bg-lime-500/10 border border-lime-500/30 rounded-2xl flex items-center justify-center">
              <Shield size={24} className="text-lime-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-white text-center mb-1 tracking-tight">
            COROUTE ADMIN
          </h1>
          <p className="text-zinc-500 text-xs text-center mb-8 tracking-widest uppercase">
            Restricted access
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-2 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-500 transition-colors placeholder-zinc-600"
                placeholder="admin@coroute.ma"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-2 tracking-wider uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-lime-500 transition-colors placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-400 text-zinc-900 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 tracking-wide mt-2">
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}