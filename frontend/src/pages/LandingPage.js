import { useNavigate } from "react-router-dom";
import { Zap, Globe, ShoppingBag, Mic, ArrowRight, Check, ChevronDown, Star, Layout, Palette, Rocket, Shield, Code, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

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

/* Scroll reveal hook */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E5E7EB]" data-testid="faq-item">
      <button
        className="w-full flex items-center justify-between py-6 text-left group"
        onClick={() => setOpen(!open)}
        data-testid={`faq-toggle-${q.slice(0, 10).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span className="text-base font-medium text-[#1D1D1F] pr-4 group-hover:text-[#0033FF] transition-colors">{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#86868B] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-6" : "max-h-0"}`}>
        <p className="text-sm text-[#86868B] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* 3D Floating Orbs for Hero */
function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large blue orb */}
      <div
        className="absolute top-16 right-[10%] w-72 h-72 rounded-full animate-float-slow opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #0033FF, transparent 70%)" }}
      />
      {/* Gold accent orb */}
      <div
        className="absolute top-40 right-[25%] w-40 h-40 rounded-full animate-float opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #C4A265, transparent 70%)", animationDelay: "1s" }}
      />
      {/* Small accent */}
      <div
        className="absolute bottom-20 right-[15%] w-24 h-24 rounded-full animate-float opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #FF4500, transparent 70%)", animationDelay: "2s" }}
      />
      {/* 3D floating card mockup */}
      <div className="absolute top-24 right-[8%] hidden lg:block animate-float-3d">
        <div className="w-80 h-52 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl p-5" style={{ transform: "perspective(800px) rotateY(-8deg) rotateX(4deg)" }}>
          <div className="w-full h-3 bg-[#F5F5F7] rounded-full mb-3" />
          <div className="w-3/4 h-3 bg-[#F5F5F7] rounded-full mb-5" />
          <div className="flex gap-3">
            <div className="flex-1 h-20 bg-gradient-to-br from-[#0033FF]/10 to-[#0033FF]/5 border border-[#0033FF]/10" />
            <div className="flex-1 h-20 bg-gradient-to-br from-[#C4A265]/10 to-[#C4A265]/5 border border-[#C4A265]/10" />
          </div>
          <div className="mt-4 w-24 h-7 bg-[#0033FF] opacity-80" />
        </div>
      </div>
      {/* Floating badge */}
      <div className="absolute bottom-32 right-[30%] hidden lg:block animate-float" style={{ animationDelay: "0.5s" }}>
        <div className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-[#1D1D1F]">Site Published</span>
        </div>
      </div>
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
      <section className="relative px-6 md:px-12 lg:px-24 pt-24 pb-28 md:pt-36 md:pb-44 overflow-hidden" data-testid="hero-section">
        <HeroOrbs />
        <div className="relative max-w-3xl z-10">
          <div className="inline-flex items-center gap-2 bg-[#F5F5F7] px-4 py-1.5 mb-6 animate-fade-in-up">
            <div className="w-1.5 h-1.5 bg-[#0033FF] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#86868B] tracking-wide uppercase">AI-Powered Website Builder</span>
          </div>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl tracking-[-0.04em] font-semibold text-[#1D1D1F] leading-[1.05] animate-fade-in-up delay-100"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Turn Your Idea Into a{" "}
            <span className="gradient-text">Live Website</span>
            <br />in 2 Minutes
          </h1>
          <p className="mt-7 text-lg md:text-xl text-[#86868B] max-w-xl leading-relaxed animate-fade-in-up delay-200">
            LaunchPad AI helps founders, freelancers, and businesses create professional websites instantly. No code. No design skills. Just your idea.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
            <button
              onClick={handleGetStarted}
              className="btn-primary px-10 py-4 text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#0033FF]/20"
              data-testid="hero-cta-btn"
            >
              Start Building Free <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="btn-secondary px-10 py-4 text-base text-center no-underline"
              data-testid="hero-features-link"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-14 flex items-center gap-8 text-sm text-[#86868B] animate-fade-in-up delay-400">
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0033FF]" /> Free to start</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0033FF]" /> No credit card</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0033FF]" /> Publish to GitHub</span>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className="border-y border-[#F5F5F7] px-6 md:px-12 lg:px-24 py-8 bg-[#FAFAFA]">
        <div className="flex items-center justify-between gap-10 overflow-x-auto">
          <span className="text-[10px] text-[#86868B] shrink-0 uppercase tracking-[0.2em] font-bold">Trusted by</span>
          {["ACME Corp", "NovaTech", "BrightPath", "CloudNine", "ZenithLabs"].map((n) => (
            <span key={n} className="text-2xl font-black text-[#E5E5EA] shrink-0 tracking-tight" style={{ fontFamily: "Outfit" }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ── 3 PATHS ── */}
      <section id="features" className="px-6 md:px-12 lg:px-24 py-24 md:py-32" data-testid="features-section">
        <RevealSection>
          <p className="overline mb-4 text-[#0033FF]">Three Paths to Launch</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-[#1D1D1F] mb-4" style={{ fontFamily: "Outfit" }}>
            Choose Your Starting Point
          </h2>
          <p className="text-lg text-[#86868B] max-w-lg mb-14">
            Whether you have a napkin sketch or a full product line, we meet you where you are.
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "Idea to Website", desc: "Describe your business idea and watch our AI craft a complete website with copy, layout, and SEO.", gradient: "from-[#0033FF] to-[#4F6AFF]" },
            { icon: ShoppingBag, title: "Product to Storefront", desc: "Upload your product images and details. Get a catalog-ready storefront with pricing and payment pages.", gradient: "from-[#C4A265] to-[#DFC08A]" },
            { icon: Mic, title: "Voice to Business Launch", desc: "Record a voice note about your business. Our AI transcribes, analyzes, and builds your site from speech.", gradient: "from-[#1D1D1F] to-[#3A3A3C]" },
          ].map((item, i) => (
            <RevealSection key={item.title} delay={i * 120}>
              <div
                className="card-premium bg-white p-8 md:p-10 group cursor-pointer border border-[#F5F5F7] tilt-hover"
                onClick={handleGetStarted}
                data-testid={`feature-card-${i}`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-8 shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-3" style={{ fontFamily: "Outfit" }}>{item.title}</h3>
                <p className="text-sm text-[#86868B] leading-relaxed mb-6">{item.desc}</p>
                <span className="text-sm font-semibold text-[#0033FF] flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="bg-[#FAFAFA] px-6 md:px-12 lg:px-24 py-24 md:py-32 noise-overlay">
        <RevealSection>
          <p className="overline mb-4 text-[#0033FF] relative z-10">Everything You Need</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-[#1D1D1F] mb-14 relative z-10" style={{ fontFamily: "Outfit" }}>
            Built for Speed, Designed for Impact
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {[
            { icon: Layout, title: "AI Website Generation", desc: "Full multi-page website generated from your business description in seconds." },
            { icon: Palette, title: "Brand Identity", desc: "Logos, color palettes, and taglines created to match your brand personality." },
            { icon: Rocket, title: "One-Click Publish", desc: "Deploy directly to GitHub Pages with a single click. Your site goes live instantly." },
            { icon: Shield, title: "SEO Optimized", desc: "Every generated page includes meta tags, structured data, and performance optimization." },
            { icon: Code, title: "Clean Code Export", desc: "Download or fork your generated website code. Fully customizable HTML/CSS." },
            { icon: BarChart3, title: "Smart Analytics", desc: "Built-in tracking placeholders for Google Analytics and conversion monitoring." },
          ].map((f, i) => (
            <RevealSection key={f.title} delay={i * 80}>
              <div className="bg-white border border-[#F5F5F7] p-7 hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-300 group">
                <div className="w-10 h-10 bg-[#F5F5F7] flex items-center justify-center mb-5 group-hover:bg-[#0033FF]/10 transition-colors">
                  <f.icon className="w-5 h-5 text-[#0033FF]" />
                </div>
                <h3 className="text-base font-semibold text-[#1D1D1F] mb-2" style={{ fontFamily: "Outfit" }}>{f.title}</h3>
                <p className="text-sm text-[#86868B] leading-relaxed">{f.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 md:px-12 lg:px-24 py-24 md:py-32" data-testid="pricing-section">
        <RevealSection className="text-center mb-14">
          <p className="overline mb-4 text-[#0033FF]">Simple Pricing</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-[#1D1D1F]" style={{ fontFamily: "Outfit" }}>
            Start Free, Scale When Ready
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-6">
          {/* Free */}
          <RevealSection delay={0}>
            <div className="border border-[#F5F5F7] p-8 md:p-10 bg-white h-full" data-testid="pricing-free">
              <p className="overline mb-3">Free</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-semibold text-[#1D1D1F]" style={{ fontFamily: "Outfit" }}>&#8377;0</span>
                <span className="text-sm text-[#86868B]">/forever</span>
              </div>
              <p className="text-sm text-[#86868B] mb-8">Perfect for exploring and prototyping.</p>
              <ul className="space-y-3.5 mb-10">
                {["Unlimited drafts", "AI content generation", "Website preview", "Watermark on preview", "Community support"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#1D1D1F]">
                    <Check className="w-4 h-4 text-[#86868B] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} className="btn-secondary w-full py-3.5 text-sm font-medium" data-testid="pricing-free-btn">
                Get Started Free
              </button>
            </div>
          </RevealSection>

          {/* Premium One-time */}
          <RevealSection delay={120}>
            <div className="border-2 border-[#0033FF] p-8 md:p-10 relative bg-white animate-glow-pulse h-full" data-testid="pricing-premium">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0033FF] text-white text-[10px] px-4 py-1.5 font-bold tracking-widest uppercase">
                Most Popular
              </div>
              <p className="overline mb-3 text-[#0033FF]">Premium</p>
              <div className="mb-1">
                <span className="text-sm text-[#86868B] line-through">&#8377;23,999</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-semibold text-[#1D1D1F]" style={{ fontFamily: "Outfit" }}>&#8377;9,999</span>
                <span className="text-sm text-[#86868B]">/one-time</span>
              </div>
              <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 mt-1 mb-6">
                SAVE 58%
              </div>
              <ul className="space-y-3.5 mb-10">
                {["Everything in Free", "No watermark", "GitHub Pages publishing", "Custom domain support", "Logo & media generation", "Priority AI generation", "Export source code", "Content protection"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#1D1D1F]">
                    <Check className="w-4 h-4 text-[#0033FF] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} className="btn-primary w-full py-3.5 text-sm font-medium shadow-lg shadow-[#0033FF]/20" data-testid="pricing-premium-btn">
                Get Premium Access
              </button>
            </div>
          </RevealSection>

          {/* Monthly */}
          <RevealSection delay={240}>
            <div className="border border-[#F5F5F7] p-8 md:p-10 bg-white h-full" data-testid="pricing-monthly">
              <p className="overline mb-3">Monthly</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-semibold text-[#1D1D1F]" style={{ fontFamily: "Outfit" }}>&#8377;2,499</span>
                <span className="text-sm text-[#86868B]">/month</span>
              </div>
              <p className="text-sm text-[#86868B] mb-8">Flexible monthly billing.</p>
              <ul className="space-y-3.5 mb-10">
                {["Everything in Premium", "Cancel anytime", "Monthly AI credits refresh", "Priority support", "Early access to new features"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#1D1D1F]">
                    <Check className="w-4 h-4 text-[#C4A265] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} className="btn-premium w-full py-3.5 text-sm" data-testid="pricing-monthly-btn">
                Subscribe Monthly
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#1D1D1F] px-6 md:px-12 lg:px-24 py-24 md:py-32 noise-overlay" data-testid="testimonials-section">
        <RevealSection className="relative z-10">
          <p className="overline mb-4 text-[#86868B]">What Founders Say</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-white mb-14" style={{ fontFamily: "Outfit" }}>
            Built by Founders, for Founders
          </h2>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {testimonials.map((t, i) => (
            <RevealSection key={t.name} delay={i * 120}>
              <div className="border border-[#3A3A3C] bg-[#2C2C2E]/50 backdrop-blur-sm p-7 hover:border-[#48484A] transition-colors">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-[#C4A265] text-[#C4A265]" />
                  ))}
                </div>
                <p className="text-sm text-[#AEAEB2] leading-relaxed mb-7">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-[#86868B]">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-6 md:px-12 lg:px-24 py-24 md:py-32" data-testid="faq-section">
        <RevealSection className="max-w-2xl mx-auto">
          <p className="overline mb-4 text-[#0033FF]">FAQ</p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-semibold text-[#1D1D1F] mb-10" style={{ fontFamily: "Outfit" }}>
            Common Questions
          </h2>
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </RevealSection>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-[#0033FF] relative overflow-hidden">
        {/* Subtle orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #4F6AFF, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #C4A265, transparent)" }} />
        <div className="relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight font-semibold text-white mb-5" style={{ fontFamily: "Outfit" }}>
            Ready to Launch?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-md mx-auto">
            Join thousands of founders who built their online presence in minutes.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-[#0033FF] px-10 py-4 text-base font-semibold hover:bg-blue-50 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
            data-testid="cta-bottom-btn"
          >
            Start Building Now
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#F5F5F7] px-6 md:px-12 lg:px-24 py-14 bg-[#FAFAFA]" data-testid="footer">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0033FF] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold text-[#1D1D1F]" style={{ fontFamily: "Outfit" }}>LaunchPad AI</span>
          </div>
          <div className="flex gap-8 text-sm text-[#86868B]">
            <a href="#features" className="hover:text-[#1D1D1F] transition-colors no-underline">Features</a>
            <a href="#pricing" className="hover:text-[#1D1D1F] transition-colors no-underline">Pricing</a>
            <a href="#faq" className="hover:text-[#1D1D1F] transition-colors no-underline">FAQ</a>
          </div>
          <p className="text-xs text-[#AEAEB2]">&copy; 2026 LaunchPad AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
