import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import { ArrowLeft, ArrowRight, Users, Clock, Calendar, CheckCircle, XCircle, Hourglass, Trash2 } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const BOOKING_STATUS = {
  WAITING:   { label: "Pending",   pill: "bg-amber-50 text-amber-700 border border-amber-100", Icon: Hourglass },
  SCHEDULED: { label: "Confirmed", pill: "bg-lime-50 text-lime-700 border border-lime-200",   Icon: CheckCircle },
  DECLINED:  { label: "Declined",  pill: "bg-red-50 text-red-600 border border-red-100",      Icon: XCircle },
};

const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export default function DriverTripDetail() {
  const { id } = useParams();
  const { token } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchData = async () => {
    try {
      const [tripRes, bookingsRes] = await Promise.all([
        Axios.get(`${API}/api/trips/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        Axios.get(`${API}/api/trips/${id}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTrip(tripRes.data);
      setBookings(bookingsRes.data);
    } catch {
      setNotification({ message: "Failed to load trip", type: "error", onClose: closeNotification });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, [id, token]);

  const handleBookingAction = async (bookingId, action) => {
    setActing(bookingId);
    try {
      await Axios.patch(`${API}/api/bookings/${bookingId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ message: `Booking ${action}ed`, type: "normal", onClose: closeNotification });
      fetchData();
    } catch (err) {
      setNotification({ message: err.response?.data?.message || "Action failed", type: "error", onClose: closeNotification });
    } finally {
      setActing(null);
    }
  };

  const handleCancelTrip = async () => {
    if (!confirm("Cancel this trip? All bookings will be affected.")) return;
    try {
      await Axios.patch(`${API}/api/trips/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ message: "Trip cancelled", type: "normal", onClose: closeNotification });
      navigate("/driver/dashboard");
    } catch (err) {
      setNotification({ message: err.response?.data?.message || "Failed to cancel trip", type: "error", onClose: closeNotification });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 pt-10 pb-10 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <button onClick={() => navigate("/driver/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          {trip && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {trip.originCity}
                </h1>
                <ArrowRight size={20} className="text-lime-500" />
                <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {trip.destinationCity}
                </h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                <span className="flex items-center gap-1"><Calendar size={13} className="text-lime-500" />{fmtDate(trip.departureTime)}</span>
                <span className="flex items-center gap-1"><Clock size={13} className="text-lime-500" />{fmtTime(trip.departureTime)}</span>
                <span className="flex items-center gap-1"><Users size={13} className="text-lime-500" />{trip.availableSeats}/{trip.totalSeats} seats left</span>
                <span className="font-bold text-lime-400">{trip.pricePerSeat} MAD/seat</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-16 space-y-5">
        {/* Cancel trip */}
        {trip?.status === "SCHEDULED" && (
          <button onClick={handleCancelTrip}
            className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl text-sm transition-all cursor-pointer">
            <Trash2 size={14} /> Cancel this trip
          </button>
        )}

        {/* Bookings */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Booking Requests ({bookings.length})
          </p>

          {bookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <p className="font-bold text-gray-800 mb-1">No bookings yet</p>
              <p className="text-gray-400 text-sm">Passengers will appear here once they book.</p>
            </div>
          )}

          <div className="space-y-3">
            {bookings.map(b => {
              const s = BOOKING_STATUS[b.status] || BOOKING_STATUS.WAITING;
              const isActing = acting === b.id;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {b.passenger?.firstName} {b.passenger?.lastName}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{b.passenger?.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.pill}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Requested <span className="font-bold text-gray-700">{b.seatsBooked} seat{b.seatsBooked !== 1 ? "s" : ""}</span>
                  </p>

                  {b.status === "WAITING" && (
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button onClick={() => handleBookingAction(b.id, "confirm")} disabled={isActing}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-lime-500 hover:bg-lime-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                        <CheckCircle size={13} />
                        {isActing ? "..." : "Accept"}
                      </button>
                      <button onClick={() => handleBookingAction(b.id, "decline")} disabled={isActing}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                        <XCircle size={13} />
                        {isActing ? "..." : "Decline"}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}