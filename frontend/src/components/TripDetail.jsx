import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowRight, Clock, Users, User, Tag, FileText, CheckCircle, ChevronLeft, Shield } from "lucide-react";
import { NotificationContext, UserContext } from "../App";

const API = import.meta.env.VITE_SERVER_URL;

function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [seatsToBook, setSeatsToBook] = useState(1);
    const { setNotification, closeNotification } = useContext(NotificationContext);
    const { user, token } = useContext(UserContext);

    useEffect(() => {
        Axios.get(`${API}/api/trips/${id}`)
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
            setNotification({ message: "Booking request sent! Waiting for driver confirmation.", type: "success", onClose: closeNotification });
            navigate("/dashboard");
        } catch (err) {
            setNotification({ message: err.response?.data?.message || "Booking failed", type: "error", onClose: closeNotification });
        } finally {
            setBooking(false);
        }
    };

    const formatDateTime = (dt) => dt ? new Date(dt).toLocaleString([], {
        weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "";

    const statusConfig = {
        SCHEDULED: { label: "Available", className: "bg-lime-100 text-lime-700 border border-lime-200" },
        CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-600 border border-red-200" },
        COMPLETED: { label: "Completed", className: "bg-gray-100 text-gray-500 border border-gray-200" }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Loading trip...</p>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    const status = statusConfig[trip.status] || statusConfig.COMPLETED;
    const canBook = trip.status === "SCHEDULED" && trip.availableSeats > 0;
    const total = (seatsToBook * trip.pricePerSeat).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-lime-600 via-lime-700 to-lime-900 pt-8 pb-16 px-4">
                <div className="max-w-xl mx-auto">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-lime-200 hover:text-white transition-colors mb-6 text-sm cursor-pointer">
                        <ChevronLeft size={16} />
                        Back to results
                    </button>
                    <div className="flex items-center justify-between text-white">
                        <div>
                            <p className="text-lime-300 text-xs uppercase tracking-widest mb-1">From</p>
                            <p className="text-2xl font-bold">{trip.originCity}</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-lime-300" />
                                <div className="w-10 h-px bg-lime-400/50" />
                                <ArrowRight size={16} className="text-lime-300" />
                                <div className="w-10 h-px bg-lime-400/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lime-300 text-xs uppercase tracking-widest mb-1">To</p>
                            <p className="text-2xl font-bold">{trip.destinationCity}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 -mt-8 pb-12 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.className}`}>{status.label}</span>
                        <span className="text-2xl font-bold text-lime-600">{trip.pricePerSeat} <span className="text-sm font-normal text-gray-400">MAD/seat</span></span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 bg-lime-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock size={15} className="text-lime-600" />
                            </div>
                            <span>{formatDateTime(trip.departureTime)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-8 h-8 bg-lime-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users size={15} className="text-lime-600" />
                            </div>
                            <span>{trip.availableSeats} of {trip.totalSeats} seats available</span>
                        </div>
                        {trip.description && (
                            <div className="flex items-start gap-3 text-gray-600">
                                <div className="w-8 h-8 bg-lime-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FileText size={15} className="text-lime-600" />
                                </div>
                                <span className="leading-relaxed">{trip.description}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center shadow-md">
                            <User size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{trip.driverFirstName} {trip.driverLastName}</p>
                            <p className="text-xs text-gray-400">Your driver</p>
                        </div>
                        {trip.driverVerified && (
                            <div className="flex items-center gap-1 text-lime-600 text-xs font-medium bg-lime-50 px-2.5 py-1 rounded-full border border-lime-100">
                                <Shield size={11} />
                                Verified
                            </div>
                        )}
                    </div>
                </div>

                {canBook && (
                    <div className="bg-white rounded-2xl shadow-lg p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Book This Trip</h3>
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Number of seats</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSeatsToBook(s => Math.max(1, s - 1))}
                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg font-medium cursor-pointer transition-colors">−</button>
                                <span className="text-xl font-bold text-gray-900 w-8 text-center">{seatsToBook}</span>
                                <button onClick={() => setSeatsToBook(s => Math.min(trip.availableSeats, s + 1))}
                                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg font-medium cursor-pointer transition-colors">+</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-4">
                            <span className="text-sm text-gray-500">{seatsToBook} seat{seatsToBook !== 1 ? "s" : ""} × {trip.pricePerSeat} MAD</span>
                            <span className="font-bold text-gray-900 text-lg">{total} MAD</span>
                        </div>
                        <button onClick={handleBook} disabled={booking}
                            className="w-full bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md">
                            <CheckCircle size={17} />
                            {booking ? "Sending request..." : "Request Booking"}
                        </button>
                        {!user && <p className="text-xs text-center text-gray-400 mt-2">You must be logged in to book</p>}
                    </div>
                )}

                {!canBook && (
                    <div className="bg-gray-100 rounded-2xl p-5 text-center">
                        <p className="text-gray-500 text-sm font-medium">This trip is no longer available for booking.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TripDetail;