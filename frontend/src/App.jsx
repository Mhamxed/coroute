import Signup from "./components/signup.jsx"
import Login from "./components/login.jsx"
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import NotFound from "./components/404.jsx";
import Home from "./components/home.jsx";
import { Toast } from "./components/toast.jsx";
import SearchTrips from "./components/SearchTrips.jsx";
import TripDetail from "./components/TripDetail.jsx";
import PassengerDashboard from "./components/PassengerDashboard.jsx";
import Profile from "./components/Profile.jsx";
import MesReservations from "./components/MesReservations.jsx";
import DriverDashboard from "./components/DriverDashboard.jsx";
import CreateTrip from "./components/CreateTrip.jsx";
import DriverTripDetail from "./components/DriverTripDetail.jsx";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminUsers from "./components/admin/AdminUsers.jsx";
import AdminDrivers from "./components/admin/AdminDrivers.jsx";
import AdminTrips from "./components/admin/AdminTrips.jsx";
import AdminBookings from "./components/admin/AdminBookings.jsx";

export const UserContext = createContext(undefined);
export const NotificationContext = createContext(undefined);

function RoleRoute({ element, role }) {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return element;
}

function AdminRoute({ element }) {
    const token = localStorage.getItem("adminToken");
    if (!token) return <Navigate to="/admin/login" replace />;
    return element;
}

function App() {
    const [refreshUser, setrRefreshUser] = useState(false);
    const [notification, setNotification] = useState(null);

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        setUser(storedUser ? JSON.parse(storedUser) : null);
        setToken(storedToken || null);
    }, [refreshUser]);

    const closeNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={{ notification, setNotification, closeNotification }}>
            <UserContext.Provider value={{ user, setUser, token, setToken, refreshUser, setrRefreshUser }}>
                <Router>
                    <Routes>
                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminRoute element={<AdminLayout />} />}>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users"     element={<AdminUsers />} />
                            <Route path="drivers"   element={<AdminDrivers />} />
                            <Route path="trips"     element={<AdminTrips />} />
                            <Route path="bookings"  element={<AdminBookings />} />
                        </Route>

                        {/* Public & User Routes via AppShell */}
                        <Route path="/*" element={<AppShell />} />
                    </Routes>

                    {notification && (
                        <Toast
                            message={notification.message}
                            type={notification.type}
                            onClose={notification.onClose}
                        />
                    )}
                </Router>
            </UserContext.Provider>
        </NotificationContext.Provider>
    );
}

function AppShell() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/"        element={<Home />} />
                <Route path="/login"   element={<Login />} />
                <Route path="/signup"  element={<Signup />} />
                <Route path="/search"  element={<SearchTrips />} />
                <Route path="/trips/:id" element={<TripDetail />} />

                {/* Protected Routes */}
                <Route path="/profile"          element={<RoleRoute element={<Profile />} />} />
                <Route path="/mes-reservations" element={<RoleRoute element={<MesReservations />} />} />

                {/* Role Specific Routes */}
                <Route path="/dashboard"        element={<RoleRoute element={<PassengerDashboard />} role="PASSENGER" />} />
                <Route path="/driver/dashboard" element={<RoleRoute element={<DriverDashboard />}   role="DRIVER" />} />
                <Route path="/driver/trips/new" element={<RoleRoute element={<CreateTrip />}         role="DRIVER" />} />
                <Route path="/driver/trips/:id" element={<RoleRoute element={<DriverTripDetail />}   role="DRIVER" />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;