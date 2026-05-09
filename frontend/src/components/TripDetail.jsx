import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";
import {
    ArrowRight, Clock, Users, CheckCircle, ChevronLeft,
    Shield, MapPin, Calendar, Minus, Plus, Lock, CreditCard, X
} from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const API = import.meta.env.VITE_SERVER_URL;

const fmtDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";
const fmtTime = (dt) =>
    dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const STATUS_CONFIG = {
    SCHEDULED: { label: "Available", bg: "bg-lime-500", dot: "bg-lime-400" },
    CANCELLED:  { label: "Cancelled", bg: "bg-red-500",  dot: "bg-red-400"  },
    COMPLETED:  { label: "Completed", bg: "bg-gray-400", dot: "bg-gray-300" },
};

const originIcon = new L.DivIcon({
    className: "",
    html: `<div style="width:12px;height:12px;background:#84cc16;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(132,204,22,0.25)"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
});
const destIcon = new L.DivIcon({
    className: "",
    html: `<div style="width:12px;height:12px;background:#111827;border:2.5px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(0,0,0,0.12)"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
});

function FitBounds({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords?.length === 2) map.fitBounds(L.latLngBounds(coords), { padding: [48, 48] });
    }, [coords, map]);
    return null;
}

function RouteMap({ originCity, destinationCity }) {
    const [originCoords, setOriginCoords] = useState(null);
    const [destCoords,   setDestCoords]   = useState(null);
    const [routePoints,  setRoutePoints]  = useState([]);
    const [routeInfo,    setRouteInfo]    = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(false);

    const geocode = async (city) => {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", Morocco")}&format=json&limit=1`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (!data.length) throw new Error(`Not found: ${city}`);
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    };

    const fetchRoute = async (from, to) => {
        const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data.code !== "Ok") throw new Error("No route");
        const coords   = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distance = (data.routes[0].distance / 1000).toFixed(0);
        const duration = Math.round(data.routes[0].duration / 60);
        return { coords, distance, duration };
    };

    useEffect(() => {
        if (!originCity || !destinationCity) return;
        setLoading(true); setError(false);
        (async () => {
            try {
                const [from, to] = await Promise.all([geocode(originCity), geocode(destinationCity)]);
                setOriginCoords(from); setDestCoords(to);
                const route = await fetchRoute(from, to);
                setRoutePoints(route.coords);
                setRouteInfo({ distance: route.distance, duration: route.duration });
            } catch { setError(true); }
            finally   { setLoading(false); }
        })();
    }, [originCity, destinationCity]);

    if (error) return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
            <MapPin size={24} className="text-gray-300" />
            <p className="text-gray-400 text-xs">Map unavailable</p>
        </div>
    );

    if (loading) return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-xs tracking-wide">Loading route…</p>
        </div>
    );

    return (
        <div className="relative w-full h-full">
            {originCoords && destCoords && (
                <>
                    <MapContainer
                        center={originCoords} zoom={7}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false} attributionControl={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <Marker position={originCoords} icon={originIcon}><Popup>{originCity}</Popup></Marker>
                        <Marker position={destCoords}   icon={destIcon}  ><Popup>{destinationCity}</Popup></Marker>
                        {routePoints.length > 0 && (
                            <Polyline positions={routePoints} pathOptions={{ color: "#84cc16", weight: 4, opacity: 0.95 }} />
                        )}
                        <FitBounds coords={[originCoords, destCoords]} />
                    </MapContainer>

                    {routeInfo && (
                        <div className="absolute top-4 right-4 z-[1000]">
                            <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-black text-gray-900 leading-none">{routeInfo.distance}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">km</p>
                                </div>
                                <div className="w-px h-7 bg-gray-100" />
                                <div className="text-center">
                                    <p className="text-xl font-black text-gray-900 leading-none">
                                        {routeInfo.duration >= 60
                                            ? `${Math.floor(routeInfo.duration / 60)}h${routeInfo.duration % 60 > 0 ? routeInfo.duration % 60 + "m" : ""}`
                                            : `${routeInfo.duration}m`}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">drive</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 bg-white/95 rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 w-fit">
                            <span className="w-2 h-2 rounded-full bg-lime-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-700">{originCity}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/95 rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 w-fit">
                            <span className="w-2 h-2 rounded-full bg-gray-800 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-700">{destinationCity}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function CheckoutForm({ clientSecret, tripId, seats, total, token, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState(null);
    const { setNotification, closeNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setPaying(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setPaying(false);
            return;
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: { return_url: window.location.href },
            redirect: "if_required",
        });

        if (confirmError) {
            setError(confirmError.message);
            setPaying(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                await Axios.post(`${API}/api/bookings`, {
                    tripId,
                    seatsBooked: seats,
                    paymentIntentId: paymentIntent.id,
                }, { headers: { Authorization: `Bearer ${token}` } });
                setNotification({ message: "Payment successful! Booking request sent.", type: "normal", onClose: closeNotification });
                navigate("/dashboard");
            } catch (err) {
                const data = err.response?.data;
                const msg = data?.error || data?.message || "Booking failed after payment. Contact support.";
                setNotification({ message: msg, type: "error", onClose: closeNotification });
            }
        } else {
            setError("Payment was not completed. Please try again.");
        }
        setPaying(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-lime-600" />
                    <p className="text-sm font-bold text-gray-900">Payment</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={16} />
                </button>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{seats} × {(total / seats).toFixed(2)} MAD</span>
                <span className="text-xl font-black text-gray-900">{parseFloat(total).toFixed(2)} MAD</span>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
                <div className="rounded-2xl border border-gray-200 overflow-hidden p-4 bg-white">
                    <PaymentElement options={{ layout: "tabs" }} />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        <p className="text-red-600 text-xs font-medium">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!stripe || paying}
                    className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-lime-200/60 cursor-pointer"
                >
                    <Lock size={14} />
                    {paying ? "Processing payment…" : `Pay ${parseFloat(total).toFixed(2)} MAD`}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-gray-400">
                    <Lock size={11} />
                    <p className="text-[11px]">Secured by Stripe. Your card info is never stored.</p>
                </div>
            </form>
        </motion.div>
    );
}

export default function TripDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const location   = useLocation();
    const [trip,    setTrip]    = useState(null);
    const [driver,  setDriver]  = useState(null);
    const [loading, setLoading] = useState(true);
    const [seats,   setSeats]   = useState(1);
    const [alreadyBooked, setAlreadyBooked] = useState(false);

    const [showPayment,   setShowPayment]   = useState(false);
    const [clientSecret,  setClientSecret]  = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const [loadingIntent, setLoadingIntent] = useState(false);

    const { setNotification, closeNotification } = useContext(NotificationContext);
    const { user, token } = useContext(UserContext);

    useEffect(() => {
        setTrip(null);
        setDriver(null);
        setLoading(true);
        setSeats(1);
        setShowPayment(false);
        setClientSecret(null);

        Axios.get(`${API}/api/trips/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                setTrip(res.data);
                if (res.data.driverId) {
                    Axios.get(`${API}/api/users/${res.data.driverId}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    })
                        .then(r => setDriver(r.data))
                        .catch(() => {});
                }
                if (token) {
                    Axios.get(`${API}/api/bookings/my`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .then(r => {
                            const bookings = Array.isArray(r.data) ? r.data : r.data.content ?? [];
                            const match = bookings.find(b => b.tripId === res.data.id || b.trip?.id === res.data.id);
                            setAlreadyBooked(match ? match.status : false);
                        })
                        .catch(() => {});
                }
            })
            .catch(() => {
                setNotification({ message: "Trip not found", type: "error", onClose: closeNotification });
                navigate("/search");
            })
            .finally(() => setLoading(false));
    }, [id, location.key]);

    const handleRequestBooking = async () => {
        if (!user || !token) { navigate("/login"); return; }
        setLoadingIntent(true);
        try {
            const res = await Axios.post(`${API}/api/payments/create-intent`, {
                tripId: trip.id,
                seatsBooked: seats,
            }, { headers: { Authorization: `Bearer ${token}` } });
            const sp = await loadStripe(res.data.publishableKey);
            setStripePromise(sp);
            setClientSecret(res.data.clientSecret);
            setShowPayment(true);
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.message || data?.error || "Could not initiate payment. Please try again.";
            setNotification({ message: msg, type: "error", onClose: closeNotification });
        } finally {
            setLoadingIntent(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400 text-sm">Loading trip…</p>
            </div>
        </div>
    );

    if (!trip) return null;

    const statusCfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.COMPLETED;
    const canBook   = trip.status === "SCHEDULED" && trip.availableSeats > 0 && user?.role === "PASSENGER";
    const total     = (seats * trip.pricePerSeat).toFixed(2);
    const driverInitial  = driver?.firstName?.[0] ?? "?";
    const driverName     = driver ? `${driver.firstName} ${driver.lastName}` : "Loading…";
    const driverVerified = driver?.verified ?? driver?.isVerified ?? false;

    const stripeAppearance = {
        theme: "stripe",
        variables: {
            colorPrimary: "#84cc16",
            colorBackground: "#ffffff",
            colorText: "#111827",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
        },
    };

    const bookingSection = () => {
        if (canBook && !alreadyBooked && !showPayment) {
            return (
                <motion.div key="seats-selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Book seats</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSeats(s => Math.max(1, s - 1))}
                            className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-lime-400 hover:text-lime-600 active:scale-95 transition-all cursor-pointer">
                            <Minus size={15} />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-3xl font-black text-gray-900">{seats}</span>
                            <p className="text-xs text-gray-400 -mt-0.5">{seats === 1 ? "seat" : "seats"}</p>
                        </div>
                        <button onClick={() => setSeats(s => Math.min(trip.availableSeats, s + 1))}
                            className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-lime-400 hover:text-lime-600 active:scale-95 transition-all cursor-pointer">
                            <Plus size={15} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                        <span className="text-sm text-gray-500">{seats} × {trip.pricePerSeat} MAD</span>
                        <span className="text-xl font-black text-gray-900">{total} MAD</span>
                    </div>
                    <button onClick={handleRequestBooking} disabled={loadingIntent}
                        className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-lime-200/60 cursor-pointer">
                        <CreditCard size={15} />
                        {loadingIntent ? "Preparing payment…" : "Continue to Payment"}
                    </button>
                </motion.div>
            );
        }

        if (canBook && !alreadyBooked && showPayment && clientSecret && stripePromise) {
            return (
                <motion.div key="payment-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            tripId={trip.id}
                            seats={seats}
                            total={total}
                            token={token}
                            onCancel={() => { setShowPayment(false); setClientSecret(null); }}
                        />
                    </Elements>
                </motion.div>
            );
        }

        if (alreadyBooked) {
            const s = alreadyBooked;

            if (s === "CANCELLED") return null;

            if (s === "CANCELLED_BY_DRIVER") return (
                <motion.div key="cancelled-by-driver" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border border-red-100 bg-red-50 p-4 space-y-2">
                    <p className="text-sm font-bold text-red-700">Trip cancelled by driver</p>
                    <p className="text-xs text-red-500 leading-relaxed">
                        The driver cancelled this trip. Your payment has been refunded and will appear in your account within 5–10 business days.
                    </p>
                </motion.div>
            );

            if (s === "DECLINED") return (
                <motion.div key="declined" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                    <p className="text-sm font-bold text-gray-700">Request declined</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        The driver declined your request. Your payment has been refunded.
                    </p>
                </motion.div>
            );

            const isConfirmed = s === "SCHEDULED";
            return (
                <motion.div key="already-booked" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`rounded-2xl border p-4 space-y-2 ${isConfirmed ? "bg-lime-50 border-lime-100" : "bg-amber-50 border-amber-100"}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={15} className={`flex-shrink-0 ${isConfirmed ? "text-lime-600" : "text-amber-500"}`} />
                        <p className={`text-sm font-bold ${isConfirmed ? "text-lime-800" : "text-amber-800"}`}>
                            {isConfirmed ? "Your seat is confirmed!" : "Booking request sent"}
                        </p>
                    </div>
                    <p className={`text-xs leading-relaxed ${isConfirmed ? "text-lime-600" : "text-amber-600"}`}>
                        {isConfirmed
                            ? "The driver has confirmed your booking. You're all set for this trip."
                            : "Your request is pending driver confirmation. You'll be notified once the driver responds."}
                    </p>
                    <button onClick={() => navigate("/dashboard")}
                        className={`mt-1 text-xs font-semibold underline underline-offset-2 cursor-pointer transition-colors ${isConfirmed ? "text-lime-700 hover:text-lime-900" : "text-amber-700 hover:text-amber-900"}`}>
                        View in dashboard →
                    </button>
                </motion.div>
            );
        }

        if (trip.status === "SCHEDULED" && !user) return (
            <motion.div key="sign-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-gray-900 rounded-2xl p-5 text-center space-y-3">
                <p className="text-white font-bold text-sm">Want to join this trip?</p>
                <p className="text-gray-400 text-xs">Sign in to book your seat.</p>
                <button onClick={() => navigate("/login")}
                    className="bg-lime-500 hover:bg-lime-400 text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-colors">
                    Sign in
                </button>
            </motion.div>
        );

        if (user?.role === "DRIVER") return (
            <motion.div key="driver-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Drivers cannot book trips.</p>
            </motion.div>
        );

        if (trip.status !== "SCHEDULED") return (
            <motion.div key="unavailable" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">This trip is no longer available.</p>
            </motion.div>
        );

        return null;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-3 flex-shrink-0 z-10">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-900 text-sm font-medium transition-colors group cursor-pointer">
                    <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>
                <div className="w-px h-4 bg-gray-200" />
                <span className={`flex items-center gap-1.5 text-xs font-bold text-white px-2.5 py-1 rounded-full ${statusCfg.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                </span>
                <div className="ml-auto flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900">{trip.originCity}</span>
                    <ArrowRight size={12} className="text-lime-500" />
                    <span className="font-bold text-gray-900">{trip.destinationCity}</span>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                <aside className="w-[360px] xl:w-[400px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
                    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>

                        <section className="px-7 pt-7 pb-6">
                            <div className="flex items-start gap-2 flex-wrap">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">From</p>
                                    <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tight">{trip.originCity}</h1>
                                </div>
                                <ArrowRight size={16} className="text-lime-500 mt-5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">To</p>
                                    <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tight">{trip.destinationCity}</h1>
                                </div>
                            </div>
                        </section>

                        <section className="px-7 pb-6">
                            <div className="grid grid-cols-3 gap-2.5">
                                {[
                                    { icon: Calendar, label: "Date",  value: fmtDate(trip.departureTime) },
                                    { icon: Clock,    label: "Time",  value: fmtTime(trip.departureTime) },
                                    { icon: Users,    label: "Seats", value: `${trip.availableSeats} left` },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                                        <Icon size={13} className="text-lime-500 mb-2" />
                                        <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">{label}</p>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="mx-7 border-t border-gray-100" />

                        <section className="px-7 py-5 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">Per seat</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-black text-gray-900 tracking-tight">{trip.pricePerSeat}</span>
                                    <span className="text-base text-gray-400 font-semibold">MAD</span>
                                </div>
                            </div>
                            {trip.description && (
                                <p className="text-xs text-gray-400 leading-relaxed max-w-[130px] text-right italic">"{trip.description}"</p>
                            )}
                        </section>

                        <div className="mx-7 border-t border-gray-100" />

                        <section className="px-7 py-5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Your driver</p>
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-lime-100">
                                    <span className="text-white font-black text-lg leading-none">{driverInitial}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{driverName}</p>
                                    {driverVerified && (
                                        <span className="inline-flex items-center gap-1 mt-1 text-lime-700 text-[11px] font-semibold bg-lime-50 border border-lime-100 px-2 py-0.5 rounded-lg">
                                            <Shield size={9} /> Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="mx-7 border-t border-gray-100" />

                        <section className="px-7 py-5">
                            <AnimatePresence mode="wait">
                                {bookingSection()}
                            </AnimatePresence>
                        </section>

                    </motion.div>
                </aside>

                <main className="flex-1 min-w-0">
                    <RouteMap originCity={trip.originCity} destinationCity={trip.destinationCity} />
                </main>
            </div>
        </div>
    );
}