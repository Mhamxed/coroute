import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowRight, Clock, Users, X, ChevronRight, Search, Calendar, MapPin, Ticket } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const STATUS = {
  WAITING:   { label: "Pending",   dot: "bg-amber-400",  pill: "bg-amber-50 text-amber-700 border border-amber-100" },
  SCHEDULED: { label: "Confirmed", dot: "bg-lime-500",   pill: "bg-lime-50 text-lime-700 border border-lime-200" },
  DECLINED:  { label: "Declined",  dot: "bg-red-400",    pill: "bg-red-50 text-red-600 border border-red-100" },
};

const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";

function BookingCard({ booking, onCancel, cancelling }) {
  const navigate = useNavigate();
  const s = STATUS[booking.status] || STATUS.WAITING;
  const isCancelling = cancelling === booking.id;
  const canCancel = booking.status === "WAITING" || booking.status === "SCHEDULED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {booking && <div className="p-5">
        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-black text-gray-900 text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.originCity}
          </span>
          <ArrowRight size={14} className="text-lime-500 flex-shrink-0" />
          <span className="font-black text-gray-900 text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.destinationCity}
          </span>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${s.pill}`}>{s.label}</span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={11} className="text-lime-500" />
            {fmtDate(booking.departureTime)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-lime-500" />
            {fmtTime(booking.departureTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} className="text-lime-500" />
            {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <button onClick={() => navigate(`/trips/${booking.tripId}`)}
            className="flex items-center gap-1 text-xs font-semibold text-lime-600 hover:text-lime-700 cursor-pointer transition-colors">
            View trip <ChevronRight size={13} />
          </button>
          {canCancel && (
            <button onClick={() => onCancel(booking.id)} disabled={isCancelling}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer transition-colors disabled:opacity-50">
              <X size={12} />
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>}
    </motion.div>
  );
}

export default function PassengerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await Axios.get(`${API}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch {
      setNotification({ message: "Failed to load bookings", type: "error", onClose: closeNotification });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBookings();
  }, [token]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await Axios.patch(`${API}/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ message: "Booking cancelled", type: "normal", onClose: closeNotification });
      fetchBookings();
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Cancellation failed", type: "error", onClose: closeNotification });
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = bookings.filter(b => b.status === "WAITING" || b.status === "SCHEDULED");
  const declined = bookings.filter(b => b.status === "DECLINED");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 pt-10 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-1">Welcome back</p>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName || "Passenger"}
              </h1>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-900/30">
              <span className="text-white font-black text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName?.[0]?.toUpperCase() || "P"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total trips", value: bookings.length },
              { label: "Upcoming", value: upcoming.length },
              { label: "Confirmed", value: bookings.filter(b => b.status === "SCHEDULED").length },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-16 space-y-5">
        {/* Search CTA */}
        <button onClick={() => navigate("/search")}
          className="w-full bg-lime-500 hover:bg-lime-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-lime-200 transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Search size={18} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Find a new trip</p>
            <p className="text-lime-200 text-xs">Search available rides</p>
          </div>
          <ArrowRight size={16} className="text-lime-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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

        {/* Empty */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket size={28} className="text-lime-500" />
            </div>
            <p className="font-bold text-gray-800 mb-1">No bookings yet</p>
            <p className="text-gray-400 text-sm mb-5">Search for a trip to get started.</p>
            <button onClick={() => navigate("/search")}
              className="bg-lime-500 hover:bg-lime-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
              Find a trip
            </button>
          </div>
        )}

        {/* Upcoming bookings */}
        {!loading && upcoming.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">My Bookings</p>
            <div className="space-y-3">
              {upcoming.map(b => (
                <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />
              ))}
            </div>
          </div>
        )}

        {/* Declined */}
        {!loading && declined.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Declined</p>
            <div className="space-y-3">
              {declined.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 opacity-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-700 text-sm">{b.trip?.originCity}</span>
                    <ArrowRight size={12} className="text-gray-300" />
                    <span className="font-bold text-gray-700 text-sm">{b.trip?.destinationCity}</span>
                    <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">Declined</span>
                  </div>
                  <p className="text-xs text-gray-400">{fmtDate(b.trip?.departureTime)} · {b.seatsBooked} seat{b.seatsBooked !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}