import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowRight, Clock, MapPin, Users, X, ChevronRight, Search, Calendar } from "lucide-react";
import { NotificationContext, UserContext } from "../App";

const API = import.meta.env.VITE_SERVER_URL;

const STATUS_CONFIG = {
    WAITING:   { label: "Waiting",   className: "bg-amber-100 text-amber-700 border border-amber-200" },
    SCHEDULED: { label: "Confirmed", className: "bg-lime-100 text-lime-700 border border-lime-200" },
    DECLINED:  { label: "Declined",  className: "bg-red-100 text-red-600 border border-red-200" }
};

function PassengerDashboard() {
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
        } catch (err) {
            setNotification({ message: "Failed to load bookings", type: "error", onClose: closeNotification });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        fetchBookings();
    }, [token]);

    const handleCancel = async (bookingId) => {
        setCancelling(bookingId);
        try {
            await Axios.patch(`${API}/api/bookings/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotification({ message: "Booking cancelled successfully", type: "success", onClose: closeNotification });
            fetchBookings();
        } catch (err) {
            setNotification({ message: err.response?.data?.message || "Cancellation failed", type: "error", onClose: closeNotification });
        } finally {
            setCancelling(null);
        }
    };

    const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "";

    const upcoming = bookings.filter(b => b.status === "WAITING" || b.status === "SCHEDULED");
    const past = bookings.filter(b => b.status === "DECLINED");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-lime-600 via-lime-700 to-lime-900 pt-10 pb-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lime-300 text-sm mb-0.5">Welcome back</p>
                            <h1 className="text-2xl font-bold text-white">{user?.firstName || "Passenger"}</h1>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {user?.firstName?.[0]?.toUpperCase() || "P"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-lime-200 text-xs mb-1">Total Bookings</p>
                            <p className="text-white font-bold text-2xl">{bookings.length}</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-lime-200 text-xs mb-1">Upcoming</p>
                            <p className="text-white font-bold text-2xl">{upcoming.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-6 pb-12">
                <button onClick={() => navigate("/search")}
                    className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 mb-5 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-lime-200 group">
                    <div className="w-10 h-10 bg-lime-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-lime-700 transition-colors">
                        <Search size={18} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 text-sm">Find a new trip</p>
                        <p className="text-xs text-gray-400">Search available rides</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-lime-500 transition-colors" />
                </button>

                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-md p-5 animate-pulse">
                                <div className="flex justify-between mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                    <div className="h-4 bg-gray-200 rounded w-16" />
                                </div>
                                <div className="h-3 bg-gray-100 rounded w-48 mt-2" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && bookings.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-10 text-center">
                        <div className="text-5xl mb-4">🎫</div>
                        <p className="font-semibold text-gray-700 text-lg">No bookings yet</p>
                        <p className="text-gray-400 text-sm mt-1">Search for a trip to get started.</p>
                        <button onClick={() => navigate("/search")}
                            className="mt-5 bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                            Find a trip
                        </button>
                    </div>
                )}

                {!loading && upcoming.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">My Bookings</p>
                        <div className="space-y-3">
                            {upcoming.map(booking => {
                                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.WAITING;
                                const isCancelling = cancelling === booking.id;
                                const canCancel = booking.status === "WAITING" || booking.status === "SCHEDULED";
                                return (
                                    <div key={booking.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-transparent hover:border-lime-100 transition-all">
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{booking.trip?.originCity}</span>
                                                    <ArrowRight size={13} className="text-lime-500" />
                                                    <span className="font-bold text-gray-900">{booking.trip?.destinationCity}</span>
                                                </div>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-lime-500" />
                                                    <span>{formatDate(booking.trip?.departureTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} className="text-lime-500" />
                                                    <span>{formatTime(booking.trip?.departureTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} className="text-lime-500" />
                                                    <span>{booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => navigate(`/trips/${booking.trip?.id}`)}
                                                    className="text-xs font-semibold text-lime-600 hover:text-lime-700 flex items-center gap-1 cursor-pointer transition-colors">
                                                    View trip <ChevronRight size={13} />
                                                </button>
                                                {canCancel && (
                                                    <button onClick={() => handleCancel(booking.id)} disabled={isCancelling}
                                                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors disabled:opacity-50">
                                                        <X size={13} />
                                                        {isCancelling ? "Cancelling..." : "Cancel"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!loading && past.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Declined</p>
                        <div className="space-y-3">
                            {past.map(booking => (
                                <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-5 opacity-60">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 text-sm">{booking.trip?.originCity}</span>
                                            <ArrowRight size={12} className="text-gray-400" />
                                            <span className="font-semibold text-gray-700 text-sm">{booking.trip?.destinationCity}</span>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-500 border border-red-200">Declined</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{formatDate(booking.trip?.departureTime)} · {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? "s" : ""}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PassengerDashboard;