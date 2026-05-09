import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import {
  ArrowLeft, ArrowRight, Users, Clock, Calendar,
  CheckCircle, XCircle, Trash2,
  MapPin, FileText, Save, Edit3,
  AlertCircle, Banknote
} from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const BOOKING_STATUS = {
  WAITING:            { label: "Pending",            pill: "bg-amber-50 text-amber-700 border border-amber-200",  dot: "bg-amber-400" },
  SCHEDULED:          { label: "Confirmed",           pill: "bg-lime-50 text-lime-700 border border-lime-200",     dot: "bg-lime-500"  },
  DECLINED:           { label: "Declined",            pill: "bg-red-50 text-red-500 border border-red-200",        dot: "bg-red-400"   },
  CANCELLED:          { label: "Cancelled",           pill: "bg-gray-100 text-gray-500 border border-gray-200",    dot: "bg-gray-400"  },
  CANCELLED_BY_DRIVER:{ label: "Cancelled by driver", pill: "bg-orange-50 text-orange-600 border border-orange-200", dot: "bg-orange-400" },
};

const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const toDateInput = (dt) => dt ? new Date(dt).toISOString().split("T")[0] : "";
const toTimeInput = (dt) => dt ? new Date(dt).toTimeString().slice(0, 5) : "";

const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";
const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5";

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
    if (!confirm("Cancel this trip? All passengers will be refunded automatically.")) return;
    try {
      await Axios.patch(`${API}/api/trips/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotification({ message: "Trip cancelled. All passengers will be refunded.", type: "normal", onClose: closeNotification });
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

  if (!trip) return null;

  const activeBookings = bookings.filter(b => b.status === "WAITING" || b.status === "SCHEDULED" || b.status === "DECLINED");
  const waiting   = bookings.filter(b => b.status === "WAITING").length;
  const confirmed = bookings.filter(b => b.status === "SCHEDULED").length;
  const revenue   = bookings.filter(b => b.status === "SCHEDULED").reduce((s, b) => s + b.seatsBooked * parseFloat(trip.pricePerSeat), 0);
  const occupancy = trip.totalSeats > 0 ? Math.round(((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100) : 0;

  const statusColors = {
    SCHEDULED: "bg-lime-100 text-lime-700 border border-lime-200",
    CANCELLED:  "bg-red-100 text-red-600 border border-red-200",
    COMPLETED:  "bg-gray-100 text-gray-500 border border-gray-200",
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0 z-10">
        <button onClick={() => navigate("/driver/dashboard")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors cursor-pointer group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm">{trip.originCity}</span>
          <ArrowRight size={12} className="text-lime-500" />
          <span className="font-bold text-gray-900 text-sm">{trip.destinationCity}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[trip.status] || statusColors.COMPLETED}`}>
          {trip.status}
        </span>
        {trip.status === "SCHEDULED" && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${editMode ? "bg-gray-100 border-gray-200 text-gray-700" : "bg-white border-gray-200 text-gray-600 hover:border-lime-300 hover:text-lime-700 hover:bg-lime-50"}`}>
              <Edit3 size={12} />
              {editMode ? "Cancel edit" : "Edit trip"}
            </button>
            <button onClick={handleCancelTrip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all cursor-pointer">
              <Trash2 size={12} />
              Cancel trip
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">

        <aside className="w-[300px] xl:w-[320px] flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
          <div className="p-6 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Route</p>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-lime-500 ring-4 ring-lime-50 flex-shrink-0" />
                <div className="w-px h-8 bg-gradient-to-b from-lime-200 to-gray-200 my-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300 ring-4 ring-gray-50 flex-shrink-0" />
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">From</p>
                  <p className="font-black text-gray-900 text-xl leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.originCity}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">To</p>
                  <p className="font-black text-gray-900 text-xl leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.destinationCity}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trip Info</p>
            {[
              { icon: Calendar, label: "Date",      value: fmtDate(trip.departureTime) },
              { icon: Clock,    label: "Departure", value: fmtTime(trip.departureTime) },
              { icon: Users,    label: "Seats",     value: `${trip.availableSeats} of ${trip.totalSeats} available` },
              { icon: Banknote, label: "Price",     value: `${trip.pricePerSeat} MAD / seat` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-lime-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-lime-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
            {trip.description && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-lime-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText size={14} className="text-lime-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Note</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{trip.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Overview</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-1.5">Pending</p>
                <p className="text-3xl font-black text-amber-600 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{waiting}</p>
              </div>
              <div className="bg-lime-50 border border-lime-100 rounded-2xl p-4">
                <p className="text-[10px] text-lime-700 font-semibold uppercase tracking-wider mb-1.5">Confirmed</p>
                <p className="text-3xl font-black text-lime-600 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{confirmed}</p>
              </div>
              <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Revenue</p>
                <p className="text-3xl font-black text-gray-900 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {revenue.toFixed(0)}<span className="text-base text-gray-400 font-semibold ml-1">MAD</span>
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Occupancy</p>
                  <p className="text-sm font-black text-gray-900">{occupancy}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-lime-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${occupancy}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {editMode && trip.status === "SCHEDULED" ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="max-w-xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Edit Trip</p>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>From</label>
                        <div className="relative">
                          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                          <input type="text" value={editForm.originCity} onChange={set("originCity")} className={`${inputClass} pl-9`} required />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>To</label>
                        <div className="relative">
                          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                          <input type="text" value={editForm.destinationCity} onChange={set("destinationCity")} className={`${inputClass} pl-9`} required />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date</label>
                        <input type="date" value={editForm.departureDate} onChange={set("departureDate")} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Time</label>
                        <input type="time" value={editForm.departureTime} onChange={set("departureTime")} className={inputClass} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Total seats</label>
                        <input type="number" min={1} max={20} value={editForm.totalSeats} onChange={set("totalSeats")} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Price / seat (MAD)</label>
                        <input type="number" min={0} step="0.01" value={editForm.pricePerSeat} onChange={set("pricePerSeat")} className={inputClass} required />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea value={editForm.description} onChange={set("description")} rows={3} className={`${inputClass} resize-none`} />
                    </div>
                    <button type="submit" disabled={saving}
                      className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-lime-100">
                      <Save size={14} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="bookings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking Requests</p>
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{activeBookings.length}</span>
                  </div>
                  {waiting > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                      <AlertCircle size={12} />
                      {waiting} need{waiting === 1 ? "s" : ""} your response
                    </div>
                  )}
                </div>

                {activeBookings.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users size={22} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-800 mb-1">No bookings yet</p>
                    <p className="text-gray-400 text-sm">Passengers will appear here once they book.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {activeBookings.map((b, i) => {
                      const s = BOOKING_STATUS[b.status] || BOOKING_STATUS.WAITING;
                      const isActing = acting === b.id;
                      const initials = `${b.passengerFirstName?.[0] || ""}${b.passengerLastName?.[0] || ""}`.toUpperCase();
                      const bookingRevenue = (b.seatsBooked * parseFloat(trip.pricePerSeat)).toFixed(0);
                      return (
                        <motion.div key={b.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-200 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm shadow-lime-100">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{b.passengerFirstName} {b.passengerLastName}</p>
                                <p className="text-gray-400 text-xs">{b.passengerEmail}</p>
                              </div>
                            </div>
                            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.pill}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                              {s.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                            <div className="flex items-center gap-2">
                              <Users size={13} className="text-lime-500" />
                              <span className="text-sm text-gray-600">
                                <span className="font-bold text-gray-900">{b.seatsBooked}</span> seat{b.seatsBooked !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{bookingRevenue} MAD</span>
                          </div>

                          {b.status === "WAITING" && (
                            <div className="flex gap-2">
                              <button onClick={() => handleBookingAction(b.id, "confirm")} disabled={isActing}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-lime-500 hover:bg-lime-600 active:scale-[0.97] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-lime-100">
                                <CheckCircle size={13} />
                                {isActing ? "..." : "Accept"}
                              </button>
                              <button onClick={() => handleBookingAction(b.id, "decline")} disabled={isActing}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                                <XCircle size={13} />
                                {isActing ? "..." : "Decline"}
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}