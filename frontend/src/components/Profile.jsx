import { useState, useContext, useEffect } from "react";
import Axios from "axios";
import { User, Phone, Mail, FileText, Camera, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_SERVER_URL;

function Profile() {
    const { user, token, setrRefreshUser, refreshUser } = useContext(UserContext);
    const { setNotification, closeNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState({
        firstName: "", lastName: "", phone: "", bio: "", avatarUrl: ""
    });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        if (user) {
            setProfileForm({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                bio: user.bio || "",
                avatarUrl: user.avatarUrl || ""
            });
        }
    }, [user, token]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await Axios.put(`${API}/api/users/me`, profileForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = { ...user, ...profileForm };
            localStorage.setItem("user", JSON.stringify(updated));
            setrRefreshUser(!refreshUser);
            setNotification({ message: "Profile updated successfully", type: "success", onClose: closeNotification });
        } catch (err) {
            setNotification({ message: err.response?.data?.message || "Update failed", type: "error", onClose: closeNotification });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setNotification({ message: "New passwords do not match", type: "error", onClose: closeNotification });
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            setNotification({ message: "Password must be at least 8 characters", type: "error", onClose: closeNotification });
            return;
        }
        setSavingPassword(true);
        try {
            await Axios.patch(`${API}/api/users/me/password`, {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            }, { headers: { Authorization: `Bearer ${token}` } });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setNotification({ message: "Password changed successfully", type: "success", onClose: closeNotification });
        } catch (err) {
            setNotification({ message: err.response?.data?.message || "Password change failed", type: "error", onClose: closeNotification });
        } finally {
            setSavingPassword(false);
        }
    };

    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-lime-600 via-lime-700 to-lime-900 pt-10 pb-20 px-4">
                <div className="max-w-xl mx-auto text-center">
                    <div className="relative inline-block mb-4">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar"
                                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-xl" />
                        ) : (
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
                                <span className="text-white font-bold text-2xl">{initials}</span>
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-lime-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Camera size={13} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-lime-300 text-sm mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 text-xs font-semibold bg-white/20 text-white px-3 py-0.5 rounded-full">
                        {user?.role}
                    </span>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 -mt-8 pb-12">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
                    <div className="flex border-b border-gray-100">
                        <button onClick={() => setActiveTab("profile")}
                            className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === "profile" ? "text-lime-600 border-b-2 border-lime-600" : "text-gray-400 hover:text-gray-600"}`}>
                            Profile Info
                        </button>
                        <button onClick={() => setActiveTab("password")}
                            className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${activeTab === "password" ? "text-lime-600 border-b-2 border-lime-600" : "text-gray-400 hover:text-gray-600"}`}>
                            Password
                        </button>
                    </div>

                    {activeTab === "profile" && (
                        <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                        <input type="text" name="firstName" value={profileForm.firstName} onChange={handleProfileChange}
                                            className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last name</label>
                                    <input type="text" name="lastName" value={profileForm.lastName} onChange={handleProfileChange}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                    <input type="tel" name="phone" value={profileForm.phone} onChange={handleProfileChange}
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Avatar URL</label>
                                <div className="relative">
                                    <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                    <input type="url" name="avatarUrl" value={profileForm.avatarUrl} onChange={handleProfileChange} placeholder="https://..."
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 top-3.5 text-lime-500" />
                                    <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={3} placeholder="Tell others about yourself..."
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50 resize-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={savingProfile}
                                className="w-full bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md">
                                <CheckCircle size={16} />
                                {savingProfile ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    )}

                    {activeTab === "password" && (
                        <form onSubmit={handleSavePassword} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Current password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                    <input type={showOld ? "text" : "password"} name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required
                                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                    <button type="button" onClick={() => setShowOld(!showOld)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                    <input type={showNew ? "text" : "password"} name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required
                                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                    <button type="button" onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm new password</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                                    <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent bg-gray-50" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Password must be at least 8 characters long.</p>
                            <button type="submit" disabled={savingPassword}
                                className="w-full bg-lime-600 hover:bg-lime-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md">
                                <CheckCircle size={16} />
                                {savingPassword ? "Saving..." : "Change Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;