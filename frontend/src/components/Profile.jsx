import { useState, useContext, useEffect } from "react";
import Axios from "axios";
import { User, Phone, FileText, Camera, Lock, CheckCircle, Eye, EyeOff, Mail, LogOut } from "lucide-react";
import { NotificationContext, UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Password" },
];

export default function Profile() {
  const { user, token, setrRefreshUser, refreshUser } = useContext(UserContext);
  const { setNotification, closeNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "", bio: "", avatarUrl: "" });
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
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, token]);

  const setProfile = (field) => (e) => setProfileForm(prev => ({ ...prev, [field]: e.target.value }));
  const setPass = (field) => (e) => setPasswordForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await Axios.put(`${API}/api/users/me`, profileForm, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("user", JSON.stringify({ ...user, ...profileForm }));
      setrRefreshUser(!refreshUser);
      setNotification({ message: "Profile updated", type: "normal", onClose: closeNotification });
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Update failed", type: "error", onClose: closeNotification });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({ message: "Passwords don't match", type: "error", onClose: closeNotification });
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
        newPassword: passwordForm.newPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setNotification({ message: "Password changed", type: "normal", onClose: closeNotification });
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Password change failed", type: "error", onClose: closeNotification });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setrRefreshUser(!refreshUser);
    navigate("/");
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 pt-10 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="relative inline-block mb-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/10 shadow-xl" />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-xl">
                <span className="text-white font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-lime-500 rounded-xl flex items-center justify-center border-2 border-gray-900">
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
          <span className="inline-block mt-2 text-xs font-bold bg-white/10 text-gray-300 px-3 py-1 rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-10 pb-16 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "text-lime-600 border-b-2 border-lime-500 -mb-px"
                    : "text-gray-400 hover:text-gray-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type="text" value={profileForm.firstName} onChange={setProfile("firstName")}
                      className={`${inputClass} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input type="text" value={profileForm.lastName} onChange={setProfile("lastName")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="tel" value={profileForm.phone} onChange={setProfile("phone")}
                    className={`${inputClass} pl-8`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Avatar URL</label>
                <div className="relative">
                  <Camera size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="url" value={profileForm.avatarUrl} onChange={setProfile("avatarUrl")} placeholder="https://..."
                    className={`${inputClass} pl-8`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Bio</label>
                <div className="relative">
                  <FileText size={13} className="absolute left-3 top-3.5 text-lime-500" />
                  <textarea value={profileForm.bio} onChange={setProfile("bio")} rows={3}
                    placeholder="Tell others about yourself..."
                    className={`${inputClass} pl-8 resize-none`} />
                </div>
              </div>
              <button type="submit" disabled={savingProfile}
                className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-lime-100">
                <CheckCircle size={15} />
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* Password tab */}
          {activeTab === "password" && (
            <form onSubmit={handleSavePassword} className="p-6 space-y-4">
              {[
                { label: "Current password", field: "oldPassword", show: showOld, toggle: () => setShowOld(!showOld), val: passwordForm.oldPassword, setter: setPass("oldPassword") },
                { label: "New password", field: "newPassword", show: showNew, toggle: () => setShowNew(!showNew), val: passwordForm.newPassword, setter: setPass("newPassword") },
              ].map(({ label, show, toggle, val, setter }) => (
                <div key={label}>
                  <label className={labelClass}>{label}</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                    <input type={show ? "text" : "password"} value={val} onChange={setter} required
                      className={`${inputClass} pl-8 pr-10`} />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className={labelClass}>Confirm new password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500" />
                  <input type="password" value={passwordForm.confirmPassword} onChange={setPass("confirmPassword")} required
                    className={`${inputClass} pl-8`} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Minimum 8 characters.</p>
              <button type="submit" disabled={savingPassword}
                className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold py-3 rounded-2xl text-sm transition-all cursor-pointer disabled:opacity-60 shadow-md shadow-lime-100">
                <CheckCircle size={15} />
                {savingPassword ? "Saving..." : "Change Password"}
              </button>
            </form>
          )}
        </motion.div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-2xl text-sm transition-all cursor-pointer">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
}