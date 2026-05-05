import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { Search, MapPin, Calendar, Users, ArrowRight, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : "";

export default function SearchTrips() {
  const [form, setForm] = useState({ from: "", to: "", date: "", seats: 1 });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const { token } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e, pageNum = 0) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await Axios.get(`${API}/api/trips/search`, {
        params: { origin: form.from, destination: form.to },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setResults(data);
      setTotalPages(res.data.totalPages || 1);
      setPage(pageNum);
      setSearched(true);
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Search failed", type: "error", onClose: closeNotification });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero search */}
      <div className="bg-gray-900 pt-14 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-white mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Find Your Ride
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm"
          >
            Search shared trips across Morocco
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="relative max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl shadow-black/20 p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">From</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                <input type="text" name="from" value={form.from} onChange={handleChange} placeholder="Departure city" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                <input type="text" name="to" value={form.to} onChange={handleChange} placeholder="Destination city" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seats needed</label>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                <input type="number" name="seats" value={form.seats} onChange={handleChange} min="1"
                  className={inputClass} />
              </div>
            </div>
          </div>
          <button type="submit"
            className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-lime-200">
            <Search size={16} />
            Search Trips
          </button>
        </motion.form>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-16 space-y-4">
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

        {!loading && searched && results.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center mt-2">
            <div className="text-5xl mb-4">🛣️</div>
            <p className="font-bold text-gray-800">No trips found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different route or date.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {results.length} trip{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-white rounded-2xl border border-gray-100 hover:border-lime-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.originCity}</p>
                      <p className="text-xs text-gray-400">{fmtTime(trip.departureTime)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                      <div className="w-8 h-px bg-lime-200" />
                      <ArrowRight size={12} className="text-lime-500" />
                      <div className="w-8 h-px bg-lime-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.destinationCity}</p>
                      <p className="text-xs text-gray-400">{fmtDate(trip.departureTime)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-black text-lime-600 text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>{trip.pricePerSeat}</p>
                    <p className="text-xs text-gray-400">MAD/seat</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-lime-100 rounded-lg flex items-center justify-center">
                      <User size={10} className="text-lime-700" />
                    </div>
                    <span>{trip.driverFirstName || "Driver"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={11} className="text-gray-300" />
                    <span>{trip.availableSeats} left</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-gray-300" />
                    <span>{fmtTime(trip.departureTime)}</span>
                  </div>
                  <ArrowRight size={13} className="text-gray-200 group-hover:text-lime-400 transition-colors" />
                </div>
              </motion.div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => handleSearch(null, page - 1)} disabled={page === 0}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                <button onClick={() => handleSearch(null, page + 1)} disabled={page + 1 >= totalPages}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all">
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