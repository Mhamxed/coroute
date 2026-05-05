import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { MapPin, ArrowRight, Clock, Calendar, CheckCircle, XCircle, Hourglass, Trash2 } from "lucide-react";
import { NotificationContext, UserContext } from "../App";

const API = import.meta.env.VITE_SERVER_URL;

function MesReservations() {
const { user, token } = useContext(UserContext);
const { setNotification, closeNotification } = useContext(NotificationContext);
const [reservations, setReservations] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();


useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchReservations();
}, [token]);

const fetchReservations = async () => {
    setLoading(true);
    try {
        const res = await Axios.get(`${API}/api/reservations/passager/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(res.data);
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur lors du chargement", type: "error", onClose: closeNotification });
    } finally {
        setLoading(false);
    }
};

const handleAnnuler = async (id) => {
    try {
        await Axios.delete(`${API}/api/reservations/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotification({ message: "Réservation annulée", type: "success", onClose: closeNotification });
        fetchReservations();
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur annulation", type: "error", onClose: closeNotification });
    }
};

const statutBadge = (statut) => {
    if (statut === "CONFIRME") return (
        <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
            <CheckCircle size={12} /> Confirmé
        </span>
    );
    if (statut === "ANNULE") return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-100 px-2.5 py-1 rounded-full">
            <XCircle size={12} /> Annulé
        </span>
    );
    return (
        <span className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-100 px-2.5 py-1 rounded-full">
            <Hourglass size={12} /> En attente
        </span>
    );
};

const formatTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "";

return (
    <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-lime-600 via-lime-700 to-lime-900 pt-12 pb-20 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Mes Réservations</h1>
                <p className="text-lime-200 text-sm">Suivez l'état de vos réservations</p>
            </div>
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

            {!loading && reservations.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-10 text-center mt-2">
                    <div className="text-5xl mb-4">🎫</div>
                    <p className="font-semibold text-gray-700 text-lg">Aucune réservation</p>
                    <p className="text-gray-400 text-sm mt-1">Recherchez un trajet pour commencer.</p>
                    <button onClick={() => navigate("/search")}
                        className="mt-6 bg-lime-600 hover:bg-lime-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-all">
                        Trouver un trajet
                    </button>
                </div>
            )}

            {!loading && reservations.length > 0 && (
                <div className="space-y-3 pt-4">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider pb-1">
                        {reservations.length} réservation{reservations.length !== 1 ? "s" : ""}
                    </p>
                    {reservations.map((r) => (
                        <div key={r.id} className="bg-white rounded-2xl shadow-md border border-transparent hover:border-lime-200 transition-all duration-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">{r.originCity}</p>
                                            <p className="text-xs text-gray-400">{formatTime(r.departureTime)}</p>
                                        </div>
                                        <div className="flex items-center gap-1 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                                            <div className="w-6 h-px bg-lime-300" />
                                            <ArrowRight size={13} className="text-lime-500" />
                                            <div className="w-6 h-px bg-lime-300" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">{r.destinationCity}</p>
                                            <p className="text-xs text-gray-400">{formatDate(r.departureTime)}</p>
                                        </div>
                                    </div>
                                    {statutBadge(r.statut)}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span>{formatDate(r.bookedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-gray-400" />
                                        <span>{r.placesReservees} place{r.placesReservees > 1 ? "s" : ""}</span>
                                    </div>
                                    {r.statut === "EN_ATTENTE" && (
                                        <button onClick={() => handleAnnuler(r.id)}
                                            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold cursor-pointer transition-colors">
                                            <Trash2 size={13} /> Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);


}

export default MesReservations;