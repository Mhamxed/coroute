import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Car, Ticket, MapPin,
  LogOut, Shield, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users",     icon: Users,           label: "Users" },
  { to: "/admin/drivers",   icon: Car,             label: "Drivers" },
  { to: "/admin/trips",     icon: MapPin,          label: "Trips" },
  { to: "/admin/bookings",  icon: Ticket,          label: "Bookings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ fontFamily: "'DM Mono', monospace" }}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-zinc-800 ${collapsed ? "justify-center px-3" : ""}`}>
        <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={15} className="text-zinc-900" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm tracking-tight">COROUTE</p>
            <p className="text-zinc-500 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer group
               ${isActive
                 ? "bg-lime-500 text-zinc-900 font-bold shadow-lg shadow-lime-500/20"
                 : "text-zinc-400 hover:text-white hover:bg-zinc-800"
               }
               ${collapsed ? "justify-center" : ""}
              `
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && (
              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`px-3 py-4 border-t border-zinc-800 space-y-2`}>
        {!collapsed && (
          <div className="px-3 py-2 bg-zinc-800/50 rounded-xl">
            <p className="text-white text-xs font-bold truncate">Admin</p>
            <p className="text-zinc-500 text-xs truncate">{adminUser?.userId ? `ID #${adminUser.userId}` : ""}</p>
          </div>
        )}
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer
            ${collapsed ? "justify-center" : ""}
          `}>
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 ml-[calc(var(--sidebar-w)-12px)] w-6 h-6 bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 rounded-full flex items-center justify-center cursor-pointer transition-all z-10"
          style={{ marginLeft: collapsed ? "52px" : "212px" }}>
          <ChevronRight size={12} className={`text-zinc-400 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-zinc-900 border-r border-zinc-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
            <span className="text-zinc-400 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
              LIVE
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}