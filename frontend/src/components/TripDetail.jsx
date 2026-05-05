import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowRight, Clock, Users, User, FileText, CheckCircle, ChevronLeft, Shield, MapPin } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const fmtDateTime = (dt) => dt ? new Date(dt).toLocaleString("en-GB", {
  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
}) : "";

const STATUS_MAP = {
  SCHEDULED: { label: "Available",  pill: "bg-lime-50 text-lime-700 border border-lime-200" },
  CANCELLED: { label: "Cancelled",  pill: "bg-red-50 text-red-600 border border-red-100" },
  COMPLETED: { label: "Completed",  pill: "bg-gray-100 text-gray-500 border border-gray-200" },
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const { user, token } = useContext(UserContext);

  useEffect(() => {
    Axios.get(`${API}/api/trips/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setTrip(res.data))
      .catch(() => {
        setNotification({ message: "Trip not found", type: "error", onClose: closeNotification });
        navigate("/search");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user || !token) { navigate("/login"); return; }
    setBooking(true);
    try {
      await Axios.post(`${API}/api/bookings`, { tripId: trip.id, seatsBooked: seatsToBook }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ message: "Booking request sent! Waiting for driver confirmation.", type: "normal", onClose: closeNotification });
      navigate("/dashboard");
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Booking failed", type: "error", onClose: closeNotification });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading trip...</p>
      </div>
    </div>
  );

  if (!trip) return null;

  const status = STATUS_MAP[trip.status] || STATUS_MAP.COMPLETED;
  const canBook = trip.status === "SCHEDULED" && trip.availableSeats > 0 && user?.role === "PASSENGER";
  const total = (seatsToBook * trip.pricePerSeat).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 pt-8 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm font-medium mb-8 cursor-pointer transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1.5">From</p>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.originCity}</p>
            </div>
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                <div className="w-10 h-px bg-lime-500/40" />
                <ArrowRight size={14} className="text-lime-400" />
                <div className="w-10 h-px bg-lime-500/40" />
                <div className="w-2 h-2 rounded-full bg-gray-600" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-1.5">To</p>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.destinationCity}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-10 pb-16 space-y-4">
        {/* Trip info card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${status.pill}`}>{status.label}</span>
            <div className="text-right">
              <span className="text-3xl font-black text-lime-500" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.pricePerSeat}</span>
              <span className="text-gray-400 text-sm ml-1">MAD/seat</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={15} className="text-lime-600" />
              </div>
              <span>{fmtDateTime(trip.departureTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={15} className="text-lime-600" />
              </div>
              <span>{trip.availableSeats} of {trip.totalSeats} seats available</span>
            </div>
            {trip.description && (
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText size={15} className="text-lime-600" />
                </div>
                <span className="leading-relaxed">{trip.description}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Driver card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your driver</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-lime-100">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{trip.driverFirstName} {trip.driverLastName}</p>
              <p className="text-xs text-gray-400 mt-0.5">Verified driver</p>
            </div>
            {trip.driverVerified && (
              <div className="flex items-center gap-1.5 text-lime-600 text-xs font-semibold bg-lime-50 px-3 py-1.5 rounded-xl border border-lime-100">
                <Shield size={11} />
                Verified
              </div>
            )}
          </div>
        </motion.div>

        {/* Booking card */}
        {canBook && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="font-bold text-gray-900 mb-4">Book this trip</p>
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Number of seats</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setSeatsToBook(s => Math.max(1, s - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-lime-300 text-lg font-bold text-gray-600 cursor-pointer transition-all">−</button>
                <span className="text-2xl font-black text-gray-900 w-8 text-center" style={{ fontFamily: "'Syne', sans-serif" }}>{seatsToBook}</span>
                <button onClick={() => setSeatsToBook(s => Math.min(trip.availableSeats, s + 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-100 flex items-center justify-center hover:border-lime-300 text-lg font-bold text-gray-600 cursor-pointer transition-all">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-b border-gray-50 mb-4">
              <span className="text-sm text-gray-500">{seatsToBook} × {trip.pricePerSeat} MAD</span>
              <span className="font-black text-gray-900 text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>{total} MAD</span>
            </div>
            <button onClick={handleBook} disabled={booking}
              className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-lime-200 cursor-pointer disabled:opacity-60">
              <CheckCircle size={16} />
              {booking ? "Sending request..." : "Request Booking"}
            </button>
          </motion.div>
        )}

        {!canBook && trip.status === "SCHEDULED" && !user && (
          <div className="bg-lime-50 border border-lime-100 rounded-2xl p-5 text-center">
            <p className="text-sm font-semibold text-lime-800 mb-3">Sign in to book this trip</p>
            <button onClick={() => navigate("/login")}
              className="bg-lime-500 hover:bg-lime-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-colors">
              Sign in
            </button>
          </div>
        )}

        {!canBook && trip.status !== "SCHEDULED" && (
          <div className="bg-gray-100 rounded-2xl p-5 text-center">
            <p className="text-gray-500 text-sm font-medium">This trip is no longer available for booking.</p>
          </div>
        )}
      </div>
    </div>
  );
}