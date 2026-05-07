import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { ArrowLeft, MapPin, Calendar, Clock, Users, DollarSign, FileText, CheckCircle } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

const MOROCCO_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès",
  "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia", "El Jadida", "Beni Mellal",
  "Nador", "Taza", "Settat", "Berrechid", "Khémisset", "Inezgane", "Khouribga",
  "Taroudant", "Essaouira", "Ouarzazate", "Laâyoune", "Dakhla",
  "Ifrane", "Azrou", "Errachidia", "Guelmim", "Tiznit", "Tinghir", "Chefchaouen", "Al Hoceïma",
];

function CityInput({ label, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.length > 0) {
      const matches = MOROCCO_CITIES.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase())
      );
      setFiltered(matches);
      setOpen(matches.length > 0);
    } else {
      setOpen(false);
      setFiltered([]);
    }
  };

  const handleSelect = (city) => {
    onChange(city);
    setOpen(false);
    setFiltered([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500 z-10" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => {
            if (value.length > 0 && filtered.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          required
          className={`${inputClass} pl-9`}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 overflow-hidden max-h-48 overflow-y-auto"
          >
            {filtered.map((city) => (
              <li
                key={city}
                onMouseDown={() => handleSelect(city)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-700 cursor-pointer transition-colors"
              >
                <MapPin size={12} className="text-lime-400 flex-shrink-0" />
                {city}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateTrip() {
  const { token } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    originCity: "",
    destinationCity: "",
    departureDate: "",
    departureTime: "",
    totalSeats: 1,
    pricePerSeat: "",
    description: "",
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const setCity = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const departureTime = `${form.departureDate}T${form.departureTime}:00`;
      await Axios.post(`${API}/api/trips`, {
        originCity: form.originCity,
        destinationCity: form.destinationCity,
        departureTime,
        totalSeats: Number(form.totalSeats),
        availableSeats: Number(form.totalSeats),
        pricePerSeat: Number(form.pricePerSeat),
        description: form.description,
        status: "SCHEDULED",
      }, { headers: { Authorization: `Bearer ${token}` } });

      setNotification({ message: "Trip posted successfully!", type: "normal", onClose: closeNotification });
      navigate("/driver/dashboard");
    } catch (err) {
      setNotification({ message: err.response?.data?.message || "Failed to create trip", type: "error", onClose: closeNotification });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 pt-10 pb-10 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto">
          <button onClick={() => navigate("/driver/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Post a Trip
          </h1>
          <p className="text-gray-400 text-sm mt-1">Fill in the details and start accepting passengers</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Route — city autocomplete */}
            <div className="grid grid-cols-2 gap-4">
              <CityInput
                label="From"
                value={form.originCity}
                onChange={setCity("originCity")}
                placeholder="Casablanca"
              />
              <CityInput
                label="To"
                value={form.destinationCity}
                onChange={setCity("destinationCity")}
                placeholder="Marrakech"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="date" value={form.departureDate} onChange={set("departureDate")}
                    className={`${inputClass} pl-9`} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="time" value={form.departureTime} onChange={set("departureTime")}
                    className={`${inputClass} pl-9`} required />
                </div>
              </div>
            </div>

            {/* Seats & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Available seats</label>
                <div className="relative">
                  <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="number" min={1} max={20} value={form.totalSeats} onChange={set("totalSeats")}
                    className={`${inputClass} pl-9`} required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Price per seat (MAD)</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="number" min={0} step="0.01" value={form.pricePerSeat} onChange={set("pricePerSeat")}
                    placeholder="0.00" className={`${inputClass} pl-9`} required />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description (optional)</label>
              <div className="relative">
                <FileText size={13} className="absolute left-3 top-3.5 text-lime-500" />
                <textarea value={form.description} onChange={set("description")} rows={3}
                  placeholder="Any info for passengers (luggage, stops, etc.)"
                  className={`${inputClass} pl-9 resize-none`} />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-lime-100">
              <CheckCircle size={15} />
              {saving ? "Posting..." : "Post Trip"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}