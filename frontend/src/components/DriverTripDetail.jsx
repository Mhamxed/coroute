import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import {
  ArrowLeft, ArrowRight, Users, Clock, Calendar,
  CheckCircle, XCircle, Hourglass, Trash2,
  MapPin, DollarSign, FileText, Save, Edit3
} from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const BOOKING_STATUS = {
  WAITING:   { label: "Pending",   pill: "bg-amber-50 text-amber-700 border border-amber-100" },
  SCHEDULED: { label: "Confirmed", pill: "bg-lime-50 text-lime-700 border border-lime-200" },
  DECLINED:  { label: "Declined",  pill: "bg-red-50 text-red-600 border border-red-100" },
};

const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const toDateInput = (dt) => dt ? new Date(dt).toISOString().split("T")[0] : "";
const toTimeInput = (dt) => dt ? new Date(dt).toTimeString().slice(0, 5) : "";

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

export default function DriverTripDetail() {
  const { id } = useParams();
  const { token } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    originCity: "", destinationCity: "",
    departureDate: "", departureTime: "",
    totalSeats: 1, pricePerSeat: "", description: ""
  });

  const fetchData = async () => {
    try {
      const [tripRes, bookingsRes] = await Promise.all([
        Axios.get(`${API}/api/trips/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        Axios.get(`${API}/api/trips/${id}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const t = tripRes.data;
      setTrip(t);
      setBookings(bookingsRes.data);
      setEditForm({
        originCity: t.originCity,
        destinationCity: t.destinationCity,
        departureDate: toDateInput(t.departureTime),
        departureTime: toTimeInput(t.departureTime),
        totalSeats: t.totalSeats,
        pricePerSeat: t.pricePerSeat,
        description: t.description || ""
      });
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

  const set = (field) => (e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const departureTime = `${editForm.departureDate}T${editForm.departureTime}:00`;
      await Axios.put(`${API}/api/trips/${id}`, {
        originCity: editForm.originCity,
        destinationCity: editForm.destinationCity,
        departureTime,
        totalSeats: Number(editForm.totalSeats),
        pricePerSeat: Number(editForm.pricePerSeat),
        description: editForm.description,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNotification({ message: "Trip updated", type: "normal", onClose: closeNotification });
      setEditMode(false);
      fetchData();
    } catch (err) {
      setNotification({ message: err.response?.data?.message || "Update failed", type: "error", onClose: closeNotification });
    } finally {
      setSaving(false);
    }
  };

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
      setNotification({ message: err.response?.data?.message || "Failed to cancel", type: "error", onClose: closeNotification });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.originCity}</h1>
                <ArrowRight size={20} className="text-lime-500" />
                <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.destinationCity}</h1>
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

        {trip?.status === "SCHEDULED" && (
          <div className="flex gap-3">
            <button onClick={() => setEditMode(!editMode)}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-2xl text-sm transition-all cursor-pointer">
              <Edit3 size={14} /> {editMode ? "Cancel edit" : "Edit trip"}
            </button>
            <button onClick={handleCancelTrip}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl text-sm transition-all cursor-pointer">
              <Trash2 size={14} /> Cancel trip
            </button>
          </div>
        )}

        {editMode && trip?.status === "SCHEDULED" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-6">
            <p className="text-sm font-bold text-gray-800 mb-5">Edit Trip Details</p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>From</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type="text" value={editForm.originCity} onChange={set("originCity")}
                      className={`${inputClass} pl-9`} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>To</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type="text" value={editForm.destinationCity} onChange={set("destinationCity")}
                      className={`${inputClass} pl-9`} required />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" value={editForm.departureDate} onChange={set("departureDate")}
                    className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Time</label>
                  <input type="time" value={editForm.departureTime} onChange={set("departureTime")}
                    className={inputClass} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Total seats</label>
                  <div className="relative">
                    <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type="number" min={1} max={20} value={editForm.totalSeats} onChange={set("totalSeats")}
                      className={`${inputClass} pl-9`} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Price/seat (MAD)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type="number" min={0} step="0.01" value={editForm.pricePerSeat} onChange={set("pricePerSeat")}
                      className={`${inputClass} pl-9`} required />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <div className="relative">
                  <FileText size={13} className="absolute left-3 top-3.5 text-lime-500" />
                  <textarea value={editForm.description} onChange={set("description")} rows={3}
                    className={`${inputClass} pl-9 resize-none`} />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-60">
                <Save size={14} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </motion.div>
        )}

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
                        {b.passengerFirstName} {b.passengerLastName}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{b.passengerEmail}</p>
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