import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowRight, Plus, Clock, Users, ChevronRight, Car, Calendar, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const STATUS = {
  SCHEDULED:  { label: "Scheduled",  pill: "bg-lime-50 text-lime-700 border border-lime-200" },
  COMPLETED:  { label: "Completed",  pill: "bg-gray-100 text-gray-500 border border-gray-200" },
  CANCELLED:  { label: "Cancelled",  pill: "bg-red-50 text-red-500 border border-red-100" },
};

const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";

function TripCard({ trip }) {
  const navigate = useNavigate();
  const s = STATUS[trip.status] || STATUS.SCHEDULED;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-black text-gray-900 text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
          {trip.originCity}
        </span>
        <ArrowRight size={14} className="text-lime-500 flex-shrink-0" />
        <span className="font-black text-gray-900 text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
          {trip.destinationCity}
        </span>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${s.pill}`}>{s.label}</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1"><Calendar size={11} className="text-lime-500" />{fmtDate(trip.departureTime)}</span>
        <span className="flex items-center gap-1"><Clock size={11} className="text-lime-500" />{fmtTime(trip.departureTime)}</span>
        <span className="flex items-center gap-1"><Users size={11} className="text-lime-500" />{trip.availableSeats}/{trip.totalSeats} seats left</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-lime-600 font-bold text-sm">{trip.pricePerSeat} MAD/seat</span>
        <button onClick={() => navigate(`/driver/trips/${trip.id}`)}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer transition-colors">
          Manage <ChevronRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}

export default function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    Axios.get(`${API}/api/trips/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTrips(res.data))
      .catch(() => setNotification({ message: "Failed to load trips", type: "error", onClose: closeNotification }))
      .finally(() => setLoading(false));
  }, [token]);

  const active = trips.filter(t => t.status === "SCHEDULED");
  const past   = trips.filter(t => t.status !== "SCHEDULED");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 pt-10 pb-10 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-1">Driver Dashboard</p>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName || "Driver"}
              </h1>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName?.[0]?.toUpperCase() || "D"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total trips",  value: trips.length },
              { label: "Active",       value: active.length },
              { label: "Completed",    value: trips.filter(t => t.status === "COMPLETED").length },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-16 space-y-5">
        {/* Post trip CTA */}
        <button onClick={() => navigate("/driver/trips/new")}
          className="w-full bg-lime-500 hover:bg-lime-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-lime-200 transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Post a new trip</p>
            <p className="text-lime-200 text-xs">Offer seats to passengers</p>
          </div>
          <ArrowRight size={16} className="text-lime-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-100 rounded-lg w-36" />
                  <div className="h-4 bg-gray-100 rounded-lg w-16" />
                </div>
                <div className="h-3 bg-gray-50 rounded-lg w-48 mt-2" />
              </div>
            ))}
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car size={28} className="text-lime-500" />
            </div>
            <p className="font-bold text-gray-800 mb-1">No trips yet</p>
            <p className="text-gray-400 text-sm mb-5">Post your first trip to start earning.</p>
            <button onClick={() => navigate("/driver/trips/new")}
              className="bg-lime-500 hover:bg-lime-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
              Post a trip
            </button>
          </div>
        )}

        {!loading && active.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Active Trips</p>
            <div className="space-y-3">{active.map(t => <TripCard key={t.id} trip={t} />)}</div>
          </div>
        )}

        {!loading && past.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Past Trips</p>
            <div className="space-y-3">{past.map(t => <TripCard key={t.id} trip={t} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}