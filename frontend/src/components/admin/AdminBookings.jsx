import { useEffect, useState } from "react";
import Axios from "axios";
import { Ticket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;
const token = () => localStorage.getItem("adminToken");

const STATUS_STYLE = {
  WAITING:   "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  SCHEDULED: "bg-lime-500/10 text-lime-400 border border-lime-500/20",
  DECLINED:  "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Axios.get(`${API}/api/admin/bookings`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const filtered = bookings.filter(b => filter === "all" ? true : b.status === filter.toUpperCase());

  return (
    <div style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {bookings.filter(b => b.status === "WAITING").length} pending · {bookings.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "waiting", "scheduled", "declined"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize
                ${filter === f ? "bg-lime-500 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_80px_120px_120px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
          <span>Route</span>
          <span>Passenger</span>
          <span>Seats</span>
          <span>Booked at</span>
          <span>Status</span>
        </div>

        {loading && [...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-[1.5fr_1fr_80px_120px_120px] gap-4 px-5 py-4 border-b border-zinc-800/50 animate-pulse">
            {[...Array(5)].map((_, j) => <div key={j} className="h-4 bg-zinc-800 rounded" />)}
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center">
            <Ticket size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No bookings found</p>
          </div>
        )}

        {!loading && filtered.map((b, i) => (
          <motion.div key={b.id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[1.5fr_1fr_80px_120px_120px] gap-4 px-5 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-white text-sm font-medium">{b.origin_city}</span>
                <ArrowRight size={11} className="text-lime-500 flex-shrink-0" />
                <span className="text-white text-sm font-medium">{b.destination_city}</span>
              </div>
              <p className="text-zinc-600 text-xs">{fmtDate(b.departure_time)}</p>
            </div>

            <div className="min-w-0">
              <p className="text-zinc-300 text-sm truncate">{b.passenger_first} {b.passenger_last}</p>
              <p className="text-zinc-600 text-xs truncate">{b.passenger_email}</p>
            </div>

            <p className="text-zinc-400 text-sm">{b.seats_booked}</p>
            <p className="text-zinc-500 text-xs">{fmtDate(b.booked_at)}</p>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg w-fit ${STATUS_STYLE[b.status] || STATUS_STYLE.WAITING}`}>
              {b.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}