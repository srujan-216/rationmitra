import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/* ---------- Animated Counter ---------- */
const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-primary-600">
        {count.toLocaleString()}{suffix}
      </p>
    </div>
  );
};

/* ---------- Data ---------- */
const features = [
  { icon: '\u{1F554}', title: 'Smart Queue Management', desc: 'AI-optimized time slots eliminate long waiting lines at fair price shops' },
  { icon: '\u{1F4CA}', title: 'AI Demand Prediction', desc: 'Machine learning forecasts footfall 7 days ahead with confidence intervals' },
  { icon: '\u{1F464}', title: 'Face Recognition', desc: '128-dimensional face embeddings ensure secure identity verification' },
  { icon: '\u{1F4E6}', title: 'Real-time Inventory', desc: 'Track stock levels, consumption trends, and automated reorder alerts' },
  { icon: '\u{1F4AC}', title: 'Sentiment Analysis', desc: 'Bilingual Hindi-English NLP analyzes feedback to improve service quality' },
  { icon: '\u{1F6E1}', title: 'Fraud Detection', desc: 'Pattern-based detection catches duplicate bookings and verification abuse' },
  { icon: '\u{1F4C8}', title: 'Stock Forecasting', desc: 'Predicts depletion dates and recommends reorder quantities with urgency levels' },
  { icon: '\u{1F5A5}', title: 'Multi-role Dashboard', desc: 'Tailored views for cardholders, shop owners, admins with real-time analytics' },
];

const steps = [
  { num: 1, title: 'Register & Verify', desc: 'Create account with face enrollment for secure verification' },
  { num: 2, title: 'Book Time Slot', desc: 'Choose your preferred shop, date, and available time slot' },
  { num: 3, title: 'Visit & Get Verified', desc: 'Face recognition confirms identity at the shop counter' },
  { num: 4, title: 'Collect Rations', desc: 'Get your entitled rations with digital receipt and tracking' },
];

const techStack = ['React', 'Node.js', 'MongoDB', 'Python', 'Flask', 'Socket.io', 'TailwindCSS', 'Docker'];

/* ---------- Component ---------- */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
        .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
        .animate-fade-up-delay { animation: fade-up 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .feature-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
      `}</style>

      {/* ========= HERO ========= */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 animate-gradient"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="animate-fade-up text-5xl md:text-7xl font-extrabold text-white mb-6">
            Ration<span className="text-accent-300">Mitra</span>
          </h1>
          <p className="animate-fade-up-delay text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-Powered Smart Queue Optimization & Distribution Management for India's Public Distribution System
          </p>
          <div className="animate-fade-up-delay flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 transition transform hover:scale-105 shadow-lg text-lg">
              Get Started
            </Link>
            <a href="#features" className="px-8 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition transform hover:scale-105 text-lg">
              Learn More
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ========= STATS ========= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div><Counter target={10000} suffix="+" /><p className="text-center text-gray-500 mt-2 text-sm">Beneficiaries Served</p></div>
            <div><Counter target={500} suffix="+" /><p className="text-center text-gray-500 mt-2 text-sm">Fair Price Shops</p></div>
            <div><Counter target={95} suffix="%" /><p className="text-center text-gray-500 mt-2 text-sm">Queue Time Reduced</p></div>
            <div><Counter target={99} suffix="%" /><p className="text-center text-gray-500 mt-2 text-sm">Fraud Detection Accuracy</p></div>
          </div>
        </div>
      </section>

      {/* ========= FEATURES ========= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Powerful Features</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built with cutting-edge AI/ML technologies to transform India's ration distribution system</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 cursor-default">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= HOW IT WORKS ========= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-gray-500">Simple 4-step process for ration collection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {s.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-300"></div>
                )}
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= TECH STACK ========= */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Built With</h2>
          <p className="text-gray-500 mb-12">Modern, scalable technology stack</p>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech) => (
              <span key={tech} className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========= CTA ========= */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform PDS?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of beneficiaries enjoying hassle-free ration distribution</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-100 transition shadow-lg text-lg">
              Create Account
            </Link>
            <Link to="/login" className="px-8 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ========= FOOTER ========= */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <p>Built with care for Digital India</p>
        <p className="mt-1">RationMitra &copy; 2026 | M.V.S.R. Engineering College</p>
      </footer>
    </div>
  );
};

export default LandingPage;
