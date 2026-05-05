import { useEffect, useState } from "react";
import Axios from "axios";
import { Users, Car, Ticket, MapPin, Clock, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;
const token = () => localStorage.getItem("adminToken");

const card = (icon, label, value, sub, color) => ({ icon, label, value, sub, color });

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Axios.get(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    card(Users,       "Total Users",          stats.totalUsers,         `${stats.totalPassengers} passengers`,    "lime"),
    card(Car,         "Drivers",              stats.totalDrivers,       `${stats.unverifiedDrivers} unverified`,  "amber"),
    card(MapPin,      "Trips",                stats.totalTrips,         "all time",                               "sky"),
    card(Ticket,      "Bookings",             stats.totalBookings,      `${stats.pendingBookings} pending`,       "violet"),
    card(ShieldCheck, "Verified Drivers",     stats.totalDrivers - stats.unverifiedDrivers, "active",            "emerald"),
    card(AlertTriangle,"Pending Bookings",    stats.pendingBookings,    "awaiting approval",                      "orange"),
  ] : [];

  const colorMap = {
    lime:    { bg: "bg-lime-500/10",    icon: "text-lime-400",    border: "border-lime-500/20"    },
    amber:   { bg: "bg-amber-500/10",   icon: "text-amber-400",   border: "border-amber-500/20"   },
    sky:     { bg: "bg-sky-500/10",     icon: "text-sky-400",     border: "border-sky-500/20"     },
    violet:  { bg: "bg-violet-500/10",  icon: "text-violet-400",  border: "border-violet-500/20"  },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
    orange:  { bg: "bg-orange-500/10",  icon: "text-orange-400",  border: "border-orange-500/20"  },
  };

  return (
    <div style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Platform overview</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ icon: Icon, label, value, sub, color }, i) => {
            const c = colorMap[color];
            return (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-zinc-900 border ${c.border} rounded-2xl p-5 hover:bg-zinc-800/50 transition-colors`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={c.icon} />
                  </div>
                  <TrendingUp size={13} className="text-zinc-700" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-zinc-400 text-xs">{label}</p>
                <p className="text-zinc-600 text-xs mt-1">{sub}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick health bar */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Platform Health</p>
          <div className="space-y-3">
            {[
              { label: "Driver verification rate", value: stats.totalDrivers ? Math.round(((stats.totalDrivers - stats.unverifiedDrivers) / stats.totalDrivers) * 100) : 0, color: "bg-lime-500" },
              { label: "Booking approval rate", value: stats.totalBookings ? Math.round(((stats.totalBookings - stats.pendingBookings) / stats.totalBookings) * 100) : 0, color: "bg-sky-500" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-white font-bold">{value}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}