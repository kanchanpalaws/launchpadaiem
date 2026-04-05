import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Rocket, Image, Phone, Mail, MapPin, ExternalLink, Tag, FileText, Search } from "lucide-react";
import { projectsAPI } from "@/lib/api";

const TABS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
  { id: "seo", label: "SEO" },
];

export default function Preview({ user }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const isFree = user?.plan === "free";

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data } = await projectsAPI.get(projectId);
      setProject(data);
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0033FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const c = project.content || {};
  const hero = c.hero || {};
  const about = c.about || {};
  const services = c.services || [];
  const pricing = c.pricing || {};
  const contact = c.contact || {};
  const seo = c.seo || {};
  const testimonials = c.testimonials || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="preview-page">
      {/* Header bar */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 md:px-12 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 transition-colors" data-testid="preview-back">
              <ArrowLeft className="w-5 h-5 text-[#0A0A0A]" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
                {project.name} — Preview
              </h1>
              <p className="text-xs text-[#6B7280]">
                {isFree ? "Free plan — Watermark visible" : "Premium — Ready to publish"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/media/${projectId}`)}
              className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
              data-testid="preview-media-btn"
            >
              <Palette className="w-4 h-4" /> Media
            </button>
            <button
              onClick={() => navigate(`/publish/${projectId}`)}
              className={`px-4 py-2 text-sm flex items-center gap-2 ${isFree ? "btn-secondary opacity-60 cursor-not-allowed" : "btn-primary"}`}
              disabled={isFree}
              data-testid="preview-publish-btn"
            >
              <Rocket className="w-4 h-4" /> {isFree ? "Upgrade to Publish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#0033FF] text-[#0033FF]"
                  : "border-transparent text-[#6B7280] hover:text-[#0A0A0A]"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className={`bg-white border border-[#E5E7EB] overflow-hidden ${isFree ? "watermark-overlay" : ""}`}>
          {/* Home tab */}
          {activeTab === "home" && (
            <div data-testid="preview-home">
              <div className="bg-[#0033FF] text-white px-8 py-16 text-center">
                <h1 className="text-4xl font-medium mb-4" style={{ fontFamily: "Outfit" }}>
                  {hero.headline || project.name}
                </h1>
                <p className="text-lg opacity-90 max-w-lg mx-auto mb-6">
                  {hero.subheadline || about.description || ""}
                </p>
                <button className="bg-white text-[#0033FF] px-8 py-3 font-medium text-sm hover:bg-blue-50 transition-colors">
                  {hero.cta_text || "Get Started"}
                </button>
              </div>
              {/* Quick about */}
              <div className="px-8 py-12">
                <h2 className="text-2xl font-medium text-[#0A0A0A] mb-3" style={{ fontFamily: "Outfit" }}>
                  {about.title || "About Us"}
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">{about.description || ""}</p>
                {about.mission && (
                  <p className="text-sm text-[#9CA3AF] mt-2 italic">"{about.mission}"</p>
                )}
              </div>
              {/* Services preview */}
              {services.length > 0 && (
                <div className="px-8 pb-12">
                  <h2 className="text-2xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.slice(0, 4).map((s, i) => (
                      <div key={i} className="border border-[#E5E7EB] p-5">
                        <h3 className="text-base font-medium text-[#0A0A0A] mb-1">{s.name}</h3>
                        <p className="text-sm text-[#6B7280] mb-2">{s.description}</p>
                        {s.price && <span className="text-sm font-bold text-[#0033FF]">{s.price}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Testimonials */}
              {testimonials.length > 0 && (
                <div className="bg-[#F9FAFB] px-8 py-12">
                  <h2 className="text-2xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>Testimonials</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {testimonials.slice(0, 4).map((t, i) => (
                      <div key={i} className="bg-white border border-[#E5E7EB] p-5">
                        <p className="text-sm text-[#6B7280] italic mb-3">"{t.text}"</p>
                        <p className="text-sm font-medium text-[#0A0A0A]">{t.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{t.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* WhatsApp CTA */}
              <div className="px-8 py-8 border-t border-[#E5E7EB] flex items-center justify-center">
                <a
                  href={`https://wa.me/?text=Hi, I'm interested in ${project.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white px-6 py-3 text-sm font-medium flex items-center gap-2 hover:bg-[#1DA851] transition-colors"
                  data-testid="whatsapp-btn"
                >
                  <Phone className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="px-8 py-12" data-testid="preview-about">
              <h1 className="text-3xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>
                {about.title || "About Us"}
              </h1>
              <p className="text-base text-[#6B7280] leading-relaxed mb-6">{about.description || "No description generated yet."}</p>
              {about.mission && (
                <div className="bg-[#F9FAFB] border-l-4 border-[#0033FF] p-6">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-1">Our Mission</p>
                  <p className="text-base text-[#0A0A0A]">{about.mission}</p>
                </div>
              )}
            </div>
          )}

          {/* Services tab */}
          {activeTab === "services" && (
            <div className="px-8 py-12" data-testid="preview-services">
              <h1 className="text-3xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>Our Services</h1>
              {services.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No services generated yet.</p>
              ) : (
                <div className="space-y-4">
                  {services.map((s, i) => (
                    <div key={i} className="border border-[#E5E7EB] p-6 flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#F3F4F6] flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-[#0033FF]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-[#0A0A0A]">{s.name}</h3>
                        <p className="text-sm text-[#6B7280] mt-1">{s.description}</p>
                      </div>
                      {s.price && <span className="text-lg font-bold text-[#0033FF] shrink-0">{s.price}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pricing tab */}
          {activeTab === "pricing" && (
            <div className="px-8 py-12" data-testid="preview-pricing">
              <h1 className="text-3xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>Pricing</h1>
              {pricing.plans?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricing.plans.map((plan, i) => (
                    <div key={i} className={`border p-6 ${i === 1 ? "border-[#0033FF] border-2" : "border-[#E5E7EB]"}`}>
                      <p className="text-sm font-medium text-[#6B7280] mb-1">{plan.name}</p>
                      <p className="text-3xl font-medium text-[#0A0A0A] mb-4" style={{ fontFamily: "Outfit" }}>{plan.price}</p>
                      <ul className="space-y-2">
                        {(plan.features || []).map((f, fi) => (
                          <li key={fi} className="text-sm text-[#6B7280] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#0033FF] shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button className="btn-primary w-full py-2.5 text-sm mt-6">Choose Plan</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">No pricing plans generated yet.</p>
              )}
            </div>
          )}

          {/* Contact tab */}
          {activeTab === "contact" && (
            <div className="px-8 py-12" data-testid="preview-contact">
              <h1 className="text-3xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>Contact Us</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#0033FF]" />
                      <span className="text-sm text-[#0A0A0A]">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#0033FF]" />
                      <span className="text-sm text-[#0A0A0A]">{contact.phone}</span>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#0033FF]" />
                      <span className="text-sm text-[#0A0A0A]">{contact.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full border border-[#E5E7EB] px-4 py-3 text-sm outline-none" />
                  <input type="email" placeholder="Your Email" className="w-full border border-[#E5E7EB] px-4 py-3 text-sm outline-none" />
                  <textarea placeholder="Your Message" rows={4} className="w-full border border-[#E5E7EB] px-4 py-3 text-sm outline-none" />
                  <button className="btn-primary w-full py-3 text-sm">Send Message</button>
                </div>
              </div>
            </div>
          )}

          {/* SEO tab */}
          {activeTab === "seo" && (
            <div className="px-8 py-12" data-testid="preview-seo">
              <h1 className="text-3xl font-medium text-[#0A0A0A] mb-6" style={{ fontFamily: "Outfit" }}>
                <Search className="w-6 h-6 inline mr-2 text-[#0033FF]" />
                SEO Configuration
              </h1>
              <div className="space-y-6">
                <div className="border border-[#E5E7EB] p-6">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2">Page Title</p>
                  <p className="text-base text-[#0A0A0A]">{seo.title || project.name}</p>
                </div>
                <div className="border border-[#E5E7EB] p-6">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2">Meta Description</p>
                  <p className="text-sm text-[#6B7280]">{seo.description || "No description set."}</p>
                </div>
                <div className="border border-[#E5E7EB] p-6">
                  <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(seo.keywords || []).map((k, i) => (
                      <span key={i} className="bg-[#F3F4F6] text-[#0A0A0A] text-xs px-3 py-1">{k}</span>
                    ))}
                    {(!seo.keywords || seo.keywords.length === 0) && (
                      <span className="text-sm text-[#9CA3AF]">No keywords set.</span>
                    )}
                  </div>
                </div>
                {/* Brochure placeholder */}
                <div className="border border-dashed border-[#E5E7EB] p-6 text-center">
                  <FileText className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">Brochure PDF — Coming Soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
