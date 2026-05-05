import { useEffect, useState } from "react";
import Axios from "axios";
import { MapPin, ArrowRight, Ban } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;
const token = () => localStorage.getItem("adminToken");

const STATUS_STYLE = {
  SCHEDULED:  "bg-lime-500/10 text-lime-400 border border-lime-500/20",
  COMPLETED:  "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
  CANCELLED:  "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Axios.get(`${API}/api/admin/trips`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setTrips(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await Axios.patch(`${API}/api/admin/trips/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setTrips(prev => prev.map(t => t.id === id ? { ...t, status: "CANCELLED" } : t));
      setConfirm(null);
    } finally {
      setCancelling(null);
    }
  };

  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const filtered = trips.filter(t => filter === "all" ? true : t.status === filter.toUpperCase());

  return (
    <div style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trips</h1>
          <p className="text-zinc-500 text-sm mt-1">{trips.length} total</p>
        </div>
        <div className="flex gap-2">
          {["all", "scheduled", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize
                ${filter === f ? "bg-lime-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_100px_100px_120px_80px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
          <span>Route</span>
          <span>Driver</span>
          <span>Seats</span>
          <span>Price</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {loading && [...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-[1.5fr_1fr_100px_100px_120px_80px] gap-4 px-5 py-4 border-b border-zinc-800/50 animate-pulse">
            {[...Array(6)].map((_, j) => <div key={j} className="h-4 bg-zinc-800 rounded" />)}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <MapPin size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No trips found</p>
          </div>
        )}

        {!loading && filtered.map((t, i) => (
          <motion.div key={t.id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[1.5fr_1fr_100px_100px_120px_80px] gap-4 px-5 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-white text-sm font-medium">{t.origin_city}</span>
                <ArrowRight size={11} className="text-lime-500 flex-shrink-0" />
                <span className="text-white text-sm font-medium">{t.destination_city}</span>
              </div>
              <p className="text-zinc-600 text-xs">{fmtDate(t.departure_time)}</p>
            </div>

            <div className="min-w-0">
              <p className="text-zinc-300 text-sm truncate">{t.first_name} {t.last_name}</p>
              <p className="text-zinc-600 text-xs truncate">{t.email}</p>
            </div>

            <p className="text-zinc-400 text-sm">{t.available_seats}/{t.total_seats}</p>
            <p className="text-zinc-400 text-sm">{t.price_per_seat} MAD</p>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${STATUS_STYLE[t.status] || STATUS_STYLE.SCHEDULED}`}>
              {t.status}
            </span>

            <div>
              {t.status === "SCHEDULED" && (
                confirm === t.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => handleCancel(t.id)} disabled={cancelling === t.id}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                      {cancelling === t.id ? "..." : "Yes"}
                    </button>
                    <button onClick={() => setConfirm(null)}
                      className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded-lg cursor-pointer transition-colors">
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(t.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-500/10">
                    <Ban size={15} />
                  </button>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}