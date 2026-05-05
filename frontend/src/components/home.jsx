import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Shield, Leaf, Users, Star, ChevronRight, Car, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const STEPS = [
  { icon: MapPin, title: "Enter your route", desc: "Type your departure and destination city. We'll find all available shared trips instantly." },
  { icon: Users, title: "Choose a driver", desc: "Browse verified drivers, read reviews, and pick the trip that fits your schedule and budget." },
  { icon: Car, title: "Ride together", desc: "Meet your driver, share the road, and split the cost. Arrive greener and cheaper." },
];

const STATS = [
  { value: "12K+", label: "Trips posted" },
  { value: "8K+", label: "Happy riders" },
  { value: "40+", label: "Moroccan cities" },
  { value: "4.8★", label: "Average rating" },
];

const FAQS = [
  { q: "How do I book a trip?", a: "Search your route, pick a trip that suits you, and send a booking request. The driver confirms and you're all set." },
  { q: "Is it safe?", a: "Every driver is verified by our team before posting trips. Ratings and reviews are visible on every profile." },
  { q: "How do payments work?", a: "You pay the driver directly on the day of the trip. No hidden fees — the price shown is what you pay." },
  { q: "Can I cancel a booking?", a: "Yes, you can cancel from your dashboard before the trip departs." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 cursor-pointer group"
      >
        <span className="font-semibold text-gray-800 group-hover:text-lime-600 transition-colors text-sm sm:text-base">{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center transition-all duration-300 ${open ? "bg-lime-500 border-lime-500 rotate-45" : "group-hover:border-lime-400"}`}>
          <span className={`text-lg leading-none ${open ? "text-white" : "text-gray-400"}`}>+</span>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-16 pb-24 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-lime-50 via-white to-white rounded-full blur-3xl opacity-80" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-lime-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-10 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
          {/* Road dots */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime-200 to-transparent" />
        </div>

        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-lime-50 border border-lime-200 text-lime-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <Zap size={12} className="fill-lime-500 text-lime-500" />
          Morocco's smartest ride-sharing platform
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} className="text-center font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gray-900 tracking-tight leading-[1.05] max-w-4xl mb-6"
          style={{ fontFamily: "'Syne', sans-serif" }}>
          Share the road.<br />
          <span className="text-lime-500">Split the cost.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-center text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Coroute connects drivers with empty seats to passengers heading the same way.
          Cheaper than a bus, greener than going alone.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/search"
            className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-lime-200 hover:shadow-lime-300 hover:-translate-y-0.5">
            Find a trip
            <ArrowRight size={16} />
          </Link>
          <Link to="/signup"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-8 py-4 rounded-2xl text-sm transition-all duration-200 border-2 border-gray-100 hover:border-gray-200">
            Offer a ride
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-lg mx-auto"
        >
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {["🧑‍💼","👩‍🦱","🧔"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-200 to-emerald-300 border-2 border-white flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Casablanca → Rabat</p>
                <p className="text-xs text-gray-400">3 seats left · Departs 8:00 AM</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-black text-lime-600">50</p>
                <p className="text-xs text-gray-400">MAD/seat</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3">
              <div className="w-2 h-2 rounded-full bg-lime-500" />
              <div className="flex-1 h-px bg-gradient-to-r from-lime-200 to-gray-200" />
              <Car size={14} className="text-lime-500" />
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-lime-200" />
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400">
              <span className="font-semibold text-gray-700">Casablanca</span>
              <span>~2h drive</span>
              <span className="font-semibold text-gray-700">Rabat</span>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-lime-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-lime-200 flex items-center gap-1">
              <Shield size={11} />
              Verified driver
            </div>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="bg-gray-900 py-14 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-lime-400" style={{ fontFamily: "'Syne', sans-serif" }}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Simple process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              How Coroute works
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)}
                className="relative bg-gray-50 hover:bg-lime-50 rounded-3xl p-7 transition-all duration-300 group border border-transparent hover:border-lime-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-5 group-hover:bg-lime-500 transition-colors duration-300">
                  <step.icon size={20} className="text-lime-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute top-7 right-7 text-6xl font-black text-gray-100 group-hover:text-lime-100 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY COROUTE */}
      <section className="py-24 px-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">Why choose us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Built different
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Verified drivers", desc: "Every driver is manually verified before they can post a trip. Your safety is non-negotiable.", color: "lime" },
              { icon: Leaf, title: "Greener travel", desc: "Fewer cars on the road means less emissions. Every shared seat is a step toward a cleaner Morocco.", color: "emerald" },
              { icon: Clock, title: "Flexible scheduling", desc: "No fixed timetables. Drivers post their own trips and passengers choose what works for them.", color: "teal" },
              { icon: Star, title: "Rated community", desc: "After every trip, both drivers and passengers rate each other. Quality is maintained by the community.", color: "lime" },
              { icon: Users, title: "Social travel", desc: "Meet people heading the same way. Many Coroute riders become regular travel companions.", color: "emerald" },
              { icon: Zap, title: "Instant booking", desc: "Send a request in seconds. Drivers confirm quickly so you can plan your day with confidence.", color: "teal" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-500/30 rounded-2xl p-6 transition-all duration-300 group">
                <div className="w-10 h-10 bg-lime-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors duration-300">
                  <item.icon size={18} className="text-lime-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Top routes</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Popular destinations
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: "Casablanca", to: "Rabat", price: "50", time: "~1h45", trips: "24" },
              { from: "Casablanca", to: "Marrakech", price: "80", time: "~2h30", trips: "18" },
              { from: "Rabat", to: "Fès", price: "90", time: "~3h", trips: "12" },
              { from: "Marrakech", to: "Agadir", price: "70", time: "~2h45", trips: "9" },
              { from: "Casablanca", to: "Tangier", price: "110", time: "~4h", trips: "15" },
              { from: "Fès", to: "Meknès", price: "30", time: "~1h", trips: "20" },
            ].map((route, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}>
                <Link to={`/search?from=${route.from}&to=${route.to}`}
                  className="flex items-center gap-4 bg-gray-50 hover:bg-lime-50 border border-transparent hover:border-lime-200 rounded-2xl p-4 transition-all duration-200 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm truncate">{route.from}</span>
                      <ArrowRight size={12} className="text-lime-500 flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-sm truncate">{route.to}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{route.time}</span>
                      <span>·</span>
                      <span>{route.trips} trips today</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lime-600 text-lg">{route.price}</p>
                    <p className="text-xs text-gray-400">MAD</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-lime-500 transition-colors flex-shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 px-4 bg-lime-500 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-lime-400/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-400/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h2 {...fadeUp()} className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Are you a driver?<br />Turn your empty seats into cash.
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="text-lime-100 mb-8 text-sm sm:text-base max-w-xl mx-auto">
            Post your route, set your price, and let passengers come to you.
            It takes less than 2 minutes.
          </motion.p>
          <motion.div {...fadeUp(0.2)}>
            <Link to="/signup"
              className="inline-flex items-center gap-2 bg-white text-lime-700 font-bold px-8 py-4 rounded-2xl text-sm hover:bg-lime-50 transition-all duration-200 shadow-lg shadow-lime-600/20">
              Start offering rides
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <span className="text-xs font-bold text-lime-600 uppercase tracking-widest">Questions</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              FAQ
            </h2>
          </motion.div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6">
            {FAQS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}