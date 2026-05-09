import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import {
  ArrowRight, Clock, Users, X, ChevronRight, Search,
  Calendar, MapPin, Ticket, CreditCard, History, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, Hourglass
} from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";
const fmtAmount = (price, seats) => price ? `${(parseFloat(price) * seats).toFixed(2)} MAD` : "—";

const STATUS_META = {
  WAITING:            { label: "Pending",            pill: "bg-amber-50 text-amber-600 border border-amber-200",   icon: Hourglass },
  SCHEDULED:          { label: "Confirmed",          pill: "bg-emerald-50 text-emerald-600 border border-emerald-200", icon: CheckCircle2 },
  DECLINED:           { label: "Declined",           pill: "bg-red-50 text-red-500 border border-red-200",         icon: XCircle },
  CANCELLED:          { label: "Cancelled",          pill: "bg-gray-100 text-gray-500 border border-gray-200",     icon: XCircle },
  CANCELLED_BY_DRIVER:{ label: "Driver cancelled",   pill: "bg-orange-50 text-orange-600 border border-orange-200", icon: AlertCircle },
};

const REFUND_META = {
  REFUNDED: { label: "Refunded",        cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  PENDING:  { label: "Refund pending",  cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  FAILED:   { label: "Refund failed",   cls: "bg-red-50 text-red-500 border border-red-200" },
  NONE:     { label: "No refund",       cls: "bg-gray-100 text-gray-400 border border-gray-200" },
};

const TABS = [
  { id: "active",   label: "My Bookings", icon: Ticket },
  { id: "history",  label: "History",     icon: History },
  { id: "payments", label: "Payments",    icon: CreditCard },
];

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.WAITING;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${m.pill}`}>
      <Icon size={10} />
      {m.label}
    </span>
  );
}

function RefundPill({ refundStatus }) {
  if (!refundStatus || refundStatus === "NONE") return null;
  const m = REFUND_META[refundStatus] || REFUND_META.NONE;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${m.cls}`}>
      <RotateCcw size={9} />
      {m.label}
    </span>
  );
}

function BookingCard({ booking, onCancel, cancelling }) {
  const navigate = useNavigate();
  const isCancelling = cancelling === booking.id;
  const canCancel = booking.status === "WAITING" || booking.status === "SCHEDULED";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-gray-900 text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.originCity}
          </span>
          <ArrowRight size={12} className="text-lime-500 flex-shrink-0" />
          <span className="font-black text-gray-900 text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.destinationCity}
          </span>
        </div>
        <StatusPill status={booking.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Calendar size={11} className="text-lime-500" />{fmtDate(booking.tripDepartureTime)}</span>
        <span className="flex items-center gap-1"><Clock size={11} className="text-lime-500" />{fmtTime(booking.tripDepartureTime)}</span>
        <span className="flex items-center gap-1"><Users size={11} className="text-lime-500" />{booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <button onClick={() => navigate(`/trips/${booking.tripId}`)}
          className="flex items-center gap-1 text-xs font-semibold text-lime-600 hover:text-lime-700 cursor-pointer transition-colors">
          View trip <ChevronRight size={12} />
        </button>
        {canCancel && (
          <button onClick={() => onCancel(booking.id)} disabled={isCancelling}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer transition-colors disabled:opacity-50">
            <X size={11} />
            {isCancelling ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function HistoryCard({ booking }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-gray-800 text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.originCity}
          </span>
          <ArrowRight size={12} className="text-gray-300 flex-shrink-0" />
          <span className="font-black text-gray-800 text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.destinationCity}
          </span>
        </div>
        <StatusPill status={booking.status} />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(booking.tripDepartureTime)}</span>
        <span className="flex items-center gap-1"><Users size={11} />{booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <RefundPill refundStatus={booking.refundStatus} />
        <button onClick={() => navigate(`/trips/${booking.tripId}`)}
          className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
          View trip <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function PaymentRow({ booking }) {
  const isCancelled = booking.status === "CANCELLED" || booking.status === "CANCELLED_BY_DRIVER";
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCancelled ? "bg-red-50" : "bg-lime-50"}`}>
          {isCancelled
            ? <RotateCcw size={15} className="text-red-400" />
            : <CreditCard size={15} className="text-lime-500" />
          }
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            {booking.originCity} → {booking.destinationCity}
          </p>
          <p className="text-xs text-gray-400">{fmtDate(booking.tripDepartureTime)} · {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}</p>
          {booking.refundStatus && booking.refundStatus !== "NONE" && (
            <RefundPill refundStatus={booking.refundStatus} />
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-black ${isCancelled ? "text-red-400 line-through" : "text-gray-900"}`}
          style={{ fontFamily: "'Syne', sans-serif" }}>
          {fmtAmount(booking.pricePerSeat, booking.seatsBooked)}
        </p>
        <StatusPill status={booking.status} />
      </div>
    </div>
  );
}

function EmptyState({ tab, onSearch }) {
  const cfg = {
    active:   { icon: Ticket,     title: "No active bookings",    sub: "Search for a trip to get started." },
    history:  { icon: History,    title: "No booking history yet", sub: "Completed and cancelled trips will show here." },
    payments: { icon: CreditCard, title: "No payments yet",        sub: "Your payment history will appear here." },
  }[tab];
  const Icon = cfg.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
      <div className="w-14 h-14 bg-lime-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-lime-500" />
      </div>
      <p className="font-bold text-gray-800 mb-1">{cfg.title}</p>
      <p className="text-gray-400 text-sm mb-5">{cfg.sub}</p>
      {tab === "active" && (
        <button onClick={onSearch}
          className="bg-lime-500 hover:bg-lime-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer">
          Find a trip
        </button>
      )}
    </div>
  );
}

export default function PassengerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
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
      setNotification({ message: "Booking cancelled — refund is being processed", type: "normal", onClose: closeNotification });
      fetchBookings();
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Cancellation failed", type: "error", onClose: closeNotification });
    } finally {
      setCancelling(null);
    }
  };

  const active   = bookings.filter(b => b.status === "WAITING" || b.status === "SCHEDULED");
  const history  = bookings.filter(b => ["CANCELLED", "CANCELLED_BY_DRIVER", "DECLINED"].includes(b.status));
  const payments = [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  const tabContent = { active, history, payments };
  const counts = { active: active.length, history: history.length, payments: payments.length };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm">Welcome back</p>
              <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName || "Passenger"}
              </h1>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-lime-100">
              <span className="text-white font-black text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user?.firstName?.[0]?.toUpperCase() || "P"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total",     value: bookings.length },
              { label: "Upcoming",  value: active.length },
              { label: "Confirmed", value: bookings.filter(b => b.status === "SCHEDULED").length },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <button onClick={() => navigate("/search")}
            className="w-full bg-lime-500 hover:bg-lime-600 text-white rounded-2xl p-3.5 flex items-center gap-3 shadow-md shadow-lime-100 transition-all cursor-pointer group">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Search size={16} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">Find a new trip</p>
              <p className="text-lime-100 text-xs">Search available rides</p>
            </div>
            <ArrowRight size={15} className="text-lime-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-5 pb-16">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-5 shadow-sm">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active ? "bg-lime-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-700"
                }`}>
                <Icon size={13} />
                {tab.label}
                {counts[tab.id] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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

        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === "active" && (
                active.length === 0
                  ? <EmptyState tab="active" onSearch={() => navigate("/search")} />
                  : <div className="space-y-3">
                      {active.map(b => (
                        <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />
                      ))}
                    </div>
              )}

              {activeTab === "history" && (
                history.length === 0
                  ? <EmptyState tab="history" />
                  : <div className="space-y-3">
                      {history.map(b => <HistoryCard key={b.id} booking={b} />)}
                    </div>
              )}

              {activeTab === "payments" && (
                payments.length === 0
                  ? <EmptyState tab="payments" />
                  : <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 divide-y divide-gray-50">
                      {payments.map(b => <PaymentRow key={b.id} booking={b} />)}
                    </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}