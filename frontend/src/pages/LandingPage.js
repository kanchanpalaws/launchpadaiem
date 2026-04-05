import { useNavigate } from "react-router-dom";
import { Zap, Globe, ShoppingBag, Mic, ArrowRight, Check, ChevronDown, Star, Layout, Palette, Rocket, Shield, Code, BarChart3 } from "lucide-react";
import { useState } from "react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/6b4554a3-35e2-4ff7-8886-8cfcbc0e1ff2/images/86d103f3a69d30713f6b58f2703f73d04bed75b0555f595c780dc2f4add8660c.png";

const testimonials = [
  { name: "Priya Sharma", role: "Founder, NutriGlow D2C", text: "Launched our entire product catalog in under 3 minutes. The AI understood our brand voice perfectly.", img: "https://images.unsplash.com/photo-1769071166862-8cc3a6f2ac5c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwZm91bmRlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NTM3MzM4NHww&ixlib=rb-4.1.0&q=85&w=200" },
  { name: "Arjun Mehta", role: "CEO, TechBridge Solutions", text: "We replaced a 3-week design sprint with a 2-minute wizard. Published to GitHub Pages instantly.", img: "https://images.unsplash.com/photo-1765438869321-d60141efd813?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwyfHxzdGFydHVwJTIwZm91bmRlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NTM3MzM4NHww&ixlib=rb-4.1.0&q=85&w=200" },
  { name: "Sara Chen", role: "Freelance Designer", text: "My clients love it. I use LaunchPad AI to prototype landing pages before the first meeting.", img: "https://images.unsplash.com/photo-1758691737644-ef8be18256c3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwzfHxzdGFydHVwJTIwZm91bmRlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NTM3MzM4NHww&ixlib=rb-4.1.0&q=85&w=200" },
];

const faqs = [
  { q: "How fast can I launch a website?", a: "Most users go from idea to a live website in under 2 minutes. Our AI handles copywriting, layout, and deployment automatically." },
  { q: "Do I need any coding knowledge?", a: "Absolutely not. LaunchPad AI is designed for founders, freelancers, and business owners with zero technical background." },
  { q: "Can I connect my own domain?", a: "Yes. After publishing to GitHub Pages, you can connect any custom domain through your DNS settings." },
  { q: "What AI models power the platform?", a: "We use OpenAI GPT for content generation and Google Gemini for logo and image creation, ensuring professional-quality output." },
  { q: "Is there a free plan?", a: "Yes. The free plan lets you create unlimited drafts with a preview watermark. Upgrade to Premium to publish and remove the watermark." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]" data-testid="faq-item">
      <button
        className="w-full flex items-center justify-between py-5 text-left hover:text-[#0033FF] transition-colors"
        onClick={() => setOpen(!open)}
        data-testid={`faq-toggle-${q.slice(0, 10).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span className="text-base font-medium text-[#0A0A0A] pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#6B7280] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5 text-sm text-[#6B7280] leading-relaxed animate-fade-in">{a}</div>
      )}
    </div>
  );
}

export default function LandingPage({ user }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUrl = window.location.origin + "/dashboard";
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO ── */}
      <section className="relative px-6 md:px-12 lg:px-24 pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden grid-pattern" data-testid="hero-section">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.07] pointer-events-none hidden lg:block">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-3xl">
          <p className="overline mb-4 animate-fade-in-up">AI-Powered Website Builder</p>
          <h1 className="text-5xl sm:text-6xl tracking-tighter font-medium text-[#0A0A0A] leading-[1.05] animate-fade-in-up delay-100" style={{ fontFamily: "Outfit, sans-serif" }}>
            Turn Your Idea Into a<br />
            <span className="text-[#0033FF]">Live Website</span> in 2 Minutes
          </h1>
          <p className="mt-6 text-base md:text-lg text-[#6B7280] max-w-xl leading-relaxed animate-fade-in-up delay-200">
            LaunchPad AI helps founders, freelancers, and businesses create professional websites instantly. No code. No design skills. Just your idea.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
            <button
              onClick={handleGetStarted}
              className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2"
              data-testid="hero-cta-btn"
            >
              Start Building Free <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="btn-secondary px-8 py-3.5 text-base text-center no-underline"
              data-testid="hero-features-link"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-12 flex items-center gap-6 text-xs text-[#9CA3AF] animate-fade-in-up delay-400">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#0033FF]" /> Free to start</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#0033FF]" /> No credit card</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#0033FF]" /> Publish to GitHub</span>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="border-y border-[#E5E7EB] px-6 md:px-12 lg:px-24 py-8">
        <div className="flex items-center justify-between gap-8 overflow-x-auto">
          <span className="text-xs text-[#9CA3AF] shrink-0 uppercase tracking-widest">Trusted by</span>
          {["ACME Corp", "NovaTech", "BrightPath", "CloudNine", "ZenithLabs"].map((n) => (
            <span key={n} className="text-xl font-black text-gray-200 shrink-0 tracking-tight" style={{ fontFamily: "Outfit" }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ── 3 PATHS ── */}
      <section id="features" className="px-6 md:px-12 lg:px-24 py-20 md:py-28" data-testid="features-section">
        <p className="overline mb-3">Three Paths to Launch</p>
        <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A] mb-4" style={{ fontFamily: "Outfit" }}>
          Choose Your Starting Point
        </h2>
        <p className="text-base text-[#6B7280] max-w-lg mb-12">
          Whether you have a napkin sketch or a full product line, we meet you where you are.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "Idea to Website", desc: "Describe your business idea and watch our AI craft a complete website with copy, layout, and SEO.", color: "#0033FF" },
            { icon: ShoppingBag, title: "Product to Storefront", desc: "Upload your product images and details. Get a catalog-ready storefront with pricing and payment pages.", color: "#FF4500" },
            { icon: Mic, title: "Voice to Business Launch", desc: "Record a voice note about your business. Our AI transcribes, analyzes, and builds your site from speech.", color: "#0A0A0A" },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-hover bg-white p-8 group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={handleGetStarted}
              data-testid={`feature-card-${i}`}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-6" style={{ background: item.color }}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>{item.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{item.desc}</p>
              <span className="text-sm font-medium text-[#0033FF] flex items-center gap-1 group-hover:gap-2 transition-all">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="bg-[#F9FAFB] px-6 md:px-12 lg:px-24 py-20 md:py-28">
        <p className="overline mb-3">Everything You Need</p>
        <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A] mb-12" style={{ fontFamily: "Outfit" }}>
          Built for Speed, Designed for Impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Layout, title: "AI Website Generation", desc: "Full multi-page website generated from your business description in seconds." },
            { icon: Palette, title: "Brand Identity", desc: "Logos, color palettes, and taglines created to match your brand personality." },
            { icon: Rocket, title: "One-Click Publish", desc: "Deploy directly to GitHub Pages with a single click. Your site goes live instantly." },
            { icon: Shield, title: "SEO Optimized", desc: "Every generated page includes meta tags, structured data, and performance optimization." },
            { icon: Code, title: "Clean Code Export", desc: "Download or fork your generated website code. Fully customizable HTML/CSS." },
            { icon: BarChart3, title: "Smart Analytics", desc: "Built-in tracking placeholders for Google Analytics and conversion monitoring." },
          ].map((f, i) => (
            <div key={f.title} className="bg-white border border-[#E5E7EB] p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <f.icon className="w-5 h-5 text-[#0033FF] mb-4" />
              <h3 className="text-base font-medium text-[#0A0A0A] mb-1" style={{ fontFamily: "Outfit" }}>{f.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 md:px-12 lg:px-24 py-20 md:py-28" data-testid="pricing-section">
        <div className="text-center mb-12">
          <p className="overline mb-3">Simple Pricing</p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
            Start Free, Scale When Ready
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-6">
          {/* Free */}
          <div className="border border-[#E5E7EB] p-8" data-testid="pricing-free">
            <p className="overline mb-2">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>$0</span>
              <span className="text-sm text-[#6B7280]">/forever</span>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">Perfect for exploring and prototyping.</p>
            <ul className="space-y-3 mb-8">
              {["Unlimited drafts", "AI content generation", "Website preview", "Watermark on preview", "Community support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
                  <Check className="w-4 h-4 text-[#0033FF] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={handleGetStarted} className="btn-secondary w-full py-3 text-sm" data-testid="pricing-free-btn">
              Get Started Free
            </button>
          </div>
          {/* Premium */}
          <div className="border-2 border-[#0033FF] p-8 relative" data-testid="pricing-premium">
            <div className="absolute -top-3 left-8 bg-[#0033FF] text-white text-xs px-3 py-1 font-medium tracking-wide uppercase">Popular</div>
            <p className="overline mb-2 text-[#0033FF]">Premium</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>$49</span>
              <span className="text-sm text-[#6B7280]">/one-time</span>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">Launch and publish with full features.</p>
            <ul className="space-y-3 mb-8">
              {["Everything in Free", "No watermark", "GitHub Pages publishing", "Custom domain support", "Logo & media generation", "Priority AI generation", "Export source code"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
                  <Check className="w-4 h-4 text-[#0033FF] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={handleGetStarted} className="btn-primary w-full py-3 text-sm" data-testid="pricing-premium-btn">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#0A0A0A] px-6 md:px-12 lg:px-24 py-20 md:py-28" data-testid="testimonials-section">
        <p className="overline mb-3 text-gray-500">What Founders Say</p>
        <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-white mb-12" style={{ fontFamily: "Outfit" }}>
          Built by Founders, for Founders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className="border border-gray-800 p-6 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-[#FF4500] text-[#FF4500]" />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-6 md:px-12 lg:px-24 py-20 md:py-28" data-testid="faq-section">
        <div className="max-w-2xl mx-auto">
          <p className="overline mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A] mb-8" style={{ fontFamily: "Outfit" }}>
            Common Questions
          </h2>
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 lg:px-24 py-20 md:py-28 bg-[#0033FF] text-center">
        <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-white mb-4" style={{ fontFamily: "Outfit" }}>
          Ready to Launch?
        </h2>
        <p className="text-base text-blue-100 mb-8 max-w-md mx-auto">
          Join thousands of founders who built their online presence in minutes.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-white text-[#0033FF] px-8 py-3.5 text-base font-medium hover:bg-blue-50 transition-colors"
          data-testid="cta-bottom-btn"
        >
          Start Building Now
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#E5E7EB] px-6 md:px-12 lg:px-24 py-12" data-testid="footer">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0033FF] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>LaunchPad AI</span>
          </div>
          <div className="flex gap-6 text-sm text-[#6B7280]">
            <a href="#features" className="hover:text-[#0A0A0A] transition-colors no-underline">Features</a>
            <a href="#pricing" className="hover:text-[#0A0A0A] transition-colors no-underline">Pricing</a>
            <a href="#faq" className="hover:text-[#0A0A0A] transition-colors no-underline">FAQ</a>
          </div>
          <p className="text-xs text-[#9CA3AF]">&copy; 2026 LaunchPad AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
