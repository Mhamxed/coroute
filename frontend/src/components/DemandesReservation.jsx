import { useState, useEffect, useContext } from “react”;
import { useNavigate } from “react-router-dom”;
import Axios from “axios”;
import { ArrowRight, CheckCircle, XCircle, Hourglass, User } from “lucide-react”;
import { NotificationContext, UserContext } from “../App”;

const API = import.meta.env.VITE_SERVER_URL;

function DemandesReservation({ trajetId }) {
const { token } = useContext(UserContext);
const { setNotification, closeNotification } = useContext(NotificationContext);
const [reservations, setReservations] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();


useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchDemandes();
}, [token, trajetId]);

const fetchDemandes = async () => {
    setLoading(true);
    try {
        const res = await Axios.get(`${API}/api/reservations/trajet/${trajetId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(res.data);
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur lors du chargement", type: "error", onClose: closeNotification });
    } finally {
        setLoading(false);
    }
};

const handleConfirmer = async (id) => {
    try {
        await Axios.patch(`${API}/api/reservations/${id}/confirmer`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotification({ message: "Réservation confirmée", type: "success", onClose: closeNotification });
        fetchDemandes();
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur confirmation", type: "error", onClose: closeNotification });
    }
};

const handleRefuser = async (id) => {
    try {
        await Axios.patch(`${API}/api/reservations/${id}/refuser`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotification({ message: "Réservation refusée", type: "success", onClose: closeNotification });
        fetchDemandes();
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur refus", type: "error", onClose: closeNotification });
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

if (loading) return (
    <div className="space-y-3">
        {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-md p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
        ))}
    </div>
);

if (reservations.length === 0) return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="font-semibold text-gray-700">Aucune demande</p>
        <p className="text-gray-400 text-sm mt-1">Pas encore de demandes pour ce trajet.</p>
    </div>
);

return (
    <div className="space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider pb-1">
            {reservations.length} demande{reservations.length !== 1 ? "s" : ""}
        </p>
        {reservations.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-md border border-transparent hover:border-lime-200 transition-all duration-200 overflow-hidden">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-lime-100 rounded-full flex items-center justify-center">
                                <User size={16} className="text-lime-700" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{r.passagerNom || `Passager #${r.passagerId}`}</p>
                                <p className="text-xs text-gray-400">{r.placesReservees} place{r.placesReservees > 1 ? "s" : ""} demandée{r.placesReservees > 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        {statutBadge(r.statut)}
                    </div>

                    {r.statut === "EN_ATTENTE" && (
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button onClick={() => handleConfirmer(r.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-2 rounded-xl text-sm cursor-pointer transition-all">
                                <CheckCircle size={14} /> Accepter
                            </button>
                            <button onClick={() => handleRefuser(r.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl text-sm cursor-pointer transition-all border border-red-200">
                                <XCircle size={14} /> Refuser
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
);

}

export default DemandesReservation;