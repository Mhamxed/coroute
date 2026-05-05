import { useEffect, useState } from "react";
import Axios from "axios";
import { ShieldCheck, ShieldOff, Car } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;
const token = () => localStorage.getItem("adminToken");

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [filter, setFilter] = useState("all"); // all | verified | unverified

  const fetchDrivers = () => {
    setLoading(true);
    Axios.get(`${API}/api/admin/drivers`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setDrivers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleToggleVerify = async (id, isVerified) => {
    setActing(id);
    try {
      const action = isVerified ? "unverify" : "verify";
      await Axios.patch(`${API}/api/admin/drivers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setDrivers(prev => prev.map(d =>
        d.id === id ? { ...d, is_verified: !isVerified } : d
      ));
    } finally {
      setActing(null);
    }
  };

  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const filtered = drivers.filter(d => {
    if (filter === "verified")   return d.is_verified;
    if (filter === "unverified") return !d.is_verified;
    return true;
  });

  return (
    <div style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Drivers</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {drivers.filter(d => !d.is_verified).length} pending verification
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {["all", "verified", "unverified"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize
                ${filter === f ? "bg-lime-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_140px_120px_100px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
          <span>Driver</span>
          <span>Email</span>
          <span>Licence</span>
          <span>Plate</span>
          <span>Status</span>
        </div>

        {loading && [...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_140px_120px_100px] gap-4 px-5 py-4 border-b border-zinc-800/50 animate-pulse">
            {[...Array(5)].map((_, j) => <div key={j} className="h-4 bg-zinc-800 rounded" />)}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Car size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No drivers found</p>
          </div>
        )}

        {!loading && filtered.map((d, i) => {
          const verified = Boolean(d.is_verified);
          return (
            <motion.div key={d.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_1fr_140px_120px_100px] gap-4 px-5 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0 text-xs text-zinc-300 font-bold">
                  {d.first_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{d.first_name} {d.last_name}</p>
                  <p className="text-zinc-600 text-xs">{fmtDate(d.created_at)}</p>
                </div>
              </div>

              <p className="text-zinc-400 text-sm truncate">{d.email}</p>
              <p className="text-zinc-500 text-sm font-mono truncate">{d.licence_number || "—"}</p>
              <p className="text-zinc-500 text-sm font-mono truncate">{d.vehicle_plate || "—"}</p>

              <button
                onClick={() => handleToggleVerify(d.id, verified)}
                disabled={acting === d.id}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50
                  ${verified
                    ? "bg-lime-500/10 text-lime-400 border border-lime-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-lime-500/10 hover:text-lime-400 hover:border-lime-500/20"
                  }`}>
                {acting === d.id ? "..." : verified
                  ? <><ShieldCheck size={12} /> Verified</>
                  : <><ShieldOff size={12} /> Pending</>
                }
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}