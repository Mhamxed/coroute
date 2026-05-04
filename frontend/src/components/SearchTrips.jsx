import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { Search, MapPin, Calendar, Users, ArrowRight, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationContext } from "../App";

const API = import.meta.env.VITE_SERVER_URL;

function SearchTrips() {
    const [form, setForm] = useState({ from: "", to: "", date: "", seats: 1 });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { setNotification, closeNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e, pageNum = 0) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await Axios.get(`${API}/api/trips`, {
                params: { from: form.from, to: form.to, date: form.date, seats: form.seats, page: pageNum, size: 10 }
            });
            setResults(res.data.content || res.data);
            setTotalPages(res.data.totalPages || 1);
            setPage(pageNum);
            setSearched(true);
        } catch (err) {
            setNotification({ message: err.response?.data?.message || "Search failed", type: "error", onClose: closeNotification });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-lime-600 via-lime-700 to-lime-900 pt-12 pb-20 px-4">
                <div className="max-w-2xl mx-auto text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Find Your Ride</h1>
                    <p className="text-lime-200 text-sm">Search shared trips across Morocco</p>
                </div>
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From</label>
                            <div className="relative">
                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                <input type="text" name="from" value={form.from} onChange={handleChange} placeholder="Departure city" required
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To</label>
                            <div className="relative">
                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                <input type="text" name="to" value={form.to} onChange={handleChange} placeholder="Destination city" required
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                            <div className="relative">
                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                <input type="date" name="date" value={form.date} onChange={handleChange} required
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seats needed</label>
                            <div className="relative">
                                <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                <input type="number" name="seats" value={form.seats} onChange={handleChange} min="1"
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                            </div>
                        </div>
                    </div>
                    <button type="submit"
                        className="w-full bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md">
                        <Search size={17} />
                        Search Trips
                    </button>
                </form>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-6 pb-12">
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

                {!loading && searched && results.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-10 text-center mt-2">
                        <div className="text-5xl mb-4">🛣️</div>
                        <p className="font-semibold text-gray-700 text-lg">No trips found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your route or date.</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="space-y-3 pt-4">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider pb-1">{results.length} trip{results.length !== 1 ? "s" : ""} available</p>
                        {results.map((trip) => (
                            <div key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)}
                                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border border-transparent hover:border-lime-200 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-bold text-gray-900 text-base">{trip.originCity}</p>
                                                <p className="text-xs text-gray-400">{formatTime(trip.departureTime)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 px-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                                                <div className="w-6 h-px bg-lime-300" />
                                                <ArrowRight size={13} className="text-lime-500" />
                                                <div className="w-6 h-px bg-lime-300" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-base">{trip.destinationCity}</p>
                                                <p className="text-xs text-gray-400">{formatDate(trip.departureTime)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lime-600 text-xl">{trip.pricePerSeat}</p>
                                            <p className="text-xs text-gray-400">MAD/seat</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center">
                                                <User size={11} className="text-lime-700" />
                                            </div>
                                            <span>{trip.driverFirstName || "Driver"}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="text-gray-400" />
                                            <span>{trip.availableSeats} seat{trip.availableSeats !== 1 ? "s" : ""} left</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-gray-400" />
                                            <span>{formatTime(trip.departureTime)}</span>
                                        </div>
                                        <ArrowRight size={13} className="text-gray-300 group-hover:text-lime-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <button onClick={() => handleSearch(null, page - 1)} disabled={page === 0}
                                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition-all cursor-pointer">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                                <button onClick={() => handleSearch(null, page + 1)} disabled={page + 1 >= totalPages}
                                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition-all cursor-pointer">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchTrips;