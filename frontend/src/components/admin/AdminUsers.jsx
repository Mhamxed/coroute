import { useEffect, useState } from "react";
import Axios from "axios";
import { Search, Trash2, User, Mail, Phone, Shield, Car, Users } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_SERVER_URL;
const token = () => localStorage.getItem("adminToken");

const ROLE_STYLE = {
  PASSENGER: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  DRIVER:    "bg-lime-500/10 text-lime-400 border border-lime-500/20",
  ADMIN:     "bg-violet-500/10 text-violet-400 border border-violet-500/20",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = (q = "") => {
    setLoading(true);
    const url = q ? `${API}/api/admin/users?search=${encodeURIComponent(q)}` : `${API}/api/admin/users`;
    Axios.get(url, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    const timer = setTimeout(() => fetchUsers(q), 400);
    return () => clearTimeout(timer);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await Axios.delete(`${API}/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      setUsers(prev => prev.filter(u => u.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div style={{ fontFamily: "'DM Mono', monospace" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">{users.length} total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-lime-500 transition-colors placeholder-zinc-600"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-4 px-5 py-3 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Action</span>
        </div>

        {loading && (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-4 px-5 py-4 border-b border-zinc-800/50 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
                <div className="h-4 bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="py-16 text-center">
            <Users size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No users found</p>
          </div>
        )}

        {!loading && users.map((u, i) => (
          <motion.div key={u.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[1fr_1fr_120px_120px_80px] gap-4 px-5 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors items-center">

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0 text-xs text-zinc-300 font-bold">
                {u.firstName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                <p className="text-zinc-600 text-xs">{fmtDate(u.createdAt)}</p>
              </div>
            </div>

            <p className="text-zinc-400 text-sm truncate">{u.email}</p>
            <p className="text-zinc-500 text-sm truncate">{u.phone || "—"}</p>

            <div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${ROLE_STYLE[u.role] || ROLE_STYLE.PASSENGER}`}>
                {u.role}
              </span>
            </div>

            <div>
              {confirmDelete === u.id ? (
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                    {deleting === u.id ? "..." : "Yes"}
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded-lg cursor-pointer transition-colors">
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(u.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-500/10">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}