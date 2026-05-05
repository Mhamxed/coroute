import { useState, useContext } from “react”;
import { useNavigate } from “react-router-dom”;
import Axios from “axios”;
import { CheckCircle, Users } from “lucide-react”;
import { NotificationContext, UserContext } from “../App”;

const API = import.meta.env.VITE_SERVER_URL;

function ReserverTrajet({ trajetId }) {
const { user, token } = useContext(UserContext);
const { setNotification, closeNotification } = useContext(NotificationContext);
const [places, setPlaces] = useState(1);
const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleReserver = async (e) => {
    e.preventDefault();
    if (!token) {
        navigate(`/login?redirect=/trips/${trajetId}`);
        return;
    }
    setLoading(true);
    try {
        await Axios.post(`${API}/api/reservations`, {
            trajetId,
            passagerId: user.id,
            placesReservees: places,
            statut: "EN_ATTENTE"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setNotification({ message: "Demande envoyée ! En attente de confirmation.", type: "success", onClose: closeNotification });
        navigate("/mes-reservations");
    } catch (err) {
        setNotification({ message: err.response?.data?.message || "Erreur lors de la réservation", type: "error", onClose: closeNotification });
    } finally {
        setLoading(false);
    }
};

return (
    <form onSubmit={handleReserver} className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="font-bold text-gray-800 text-base mb-4">Réserver une place</h3>

        <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre de places
            </label>
            <div className="relative">
                <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                <input
                    type="number"
                    min="1"
                    value={places}
                    onChange={(e) => setPlaces(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50"
                />
            </div>
        </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md">
            <CheckCircle size={16} />
            {loading ? "Envoi en cours..." : "Demander une réservation"}
        </button>
    </form>
);

}

export default ReserverTrajet;