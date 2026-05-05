import Signup from “./components/signup.jsx”
import Login from “./components/login.jsx”
import { createContext, useEffect, useState } from ‘react’;
import { BrowserRouter as Router, Routes, Route } from “react-router-dom”;
import Navbar from “./components/navbar.jsx”;
import Footer from “./components/footer.jsx”;
import NotFound from “./components/404.jsx”;
import Home from “./components/home.jsx”;
import Toast from “./components/toast.jsx”;
import SearchTrips from “./components/SearchTrips.jsx”;
import TripDetail from “./components/TripDetail.jsx”;
import PassengerDashboard from “./components/PassengerDashboard.jsx”;
import Profile from “./components/Profile.jsx”;
import MesReservations from “./components/MesReservations.jsx”;

export const UserContext = createContext(undefined);
export const NotificationContext = createContext(undefined);

function App() {
const [refreshUser, setrRefreshUser] = useState(false);
const [notification, setNotification] = useState(null);

const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
});

const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken || null;
});

useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setToken(storedToken);
}, [refreshUser]);

const closeNotification = () => setNotification(null);

return (
    <NotificationContext.Provider value={{ notification, setNotification, closeNotification }}>
        <UserContext.Provider value={{ user, setUser, token, setToken, refreshUser, setrRefreshUser }}>
            <Router>
                <Navbar user={user} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login user={user} />} />
                    <Route path="/signup" element={<Signup user={user} />} />
                    <Route path="/search" element={<SearchTrips />} />
                    <Route path="/trips/:id" element={<TripDetail />} />
                    <Route path="/dashboard" element={<PassengerDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/mes-reservations" element={<MesReservations />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
                {notification && (
                    <Toast message={notification.message} type={notification.type} onClose={notification.onClose} />
                )}
            </Router>
        </UserContext.Provider>
    </NotificationContext.Provider>
);

}

export default App;