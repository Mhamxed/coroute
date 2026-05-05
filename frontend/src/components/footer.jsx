import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Find a trip", to: "/search" },
    { label: "Offer a ride", to: "/signup" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  Company: [
    { label: "About", to: "/" },
    { label: "Contact", to: "/" },
    { label: "Blog", to: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/" },
    { label: "Terms of Service", to: "/" },
    { label: "Cookie Policy", to: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-lime-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>C</span>
              </div>
              <span className="font-black text-white text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Coroute</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Morocco's smart ride-sharing platform. Share the road, split the cost, travel better.
            </p>
            <Link to="/search"
              className="inline-flex items-center gap-2 mt-6 text-lime-400 text-sm font-semibold hover:text-lime-300 transition-colors">
              Find your next trip <ArrowRight size={14} />
            </Link>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Coroute. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Made with</span>
            <span className="text-lime-500 text-xs">♥</span>
            <span className="text-xs text-gray-500">in Morocco</span>
          </div>
        </div>
      </div>
    </footer>
  );
}