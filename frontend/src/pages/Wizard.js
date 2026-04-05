import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Globe, ShoppingBag, Mic, ArrowRight, ArrowLeft, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { projectsAPI, aiAPI } from "@/lib/api";

const BUSINESS_TYPES = [
  { id: "idea", icon: Globe, title: "Idea to Website", desc: "Turn your business idea into a complete website", color: "#0033FF" },
  { id: "product", icon: ShoppingBag, title: "Product to Storefront", desc: "Create a storefront from your product catalog", color: "#FF4500" },
  { id: "voice", icon: Mic, title: "Voice to Business Launch", desc: "Describe your business and we build it", color: "#0A0A0A" },
];

const STEPS = ["Business Type", "Details", "AI Questions", "Generate"];

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-colors ${
              i < current ? "step-complete" : i === current ? "step-active" : "step-inactive"
            }`}
            data-testid={`step-indicator-${i}`}
          >
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:inline ${i === current ? "text-[#0A0A0A] font-medium" : "text-[#9CA3AF]"}`}>{s}</span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-[#E5E7EB]" />}
        </div>
      ))}
    </div>
  );
}

function ChatMessage({ msg, isUser }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-fade-in`}>
      <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${isUser ? "chat-user" : "chat-ai"}`}>
        {msg}
      </div>
    </div>
  );
}

export default function Wizard({ user }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState("");
  const [formData, setFormData] = useState({
    name: "", description: "", target_audience: "", services: "",
    tone: "Professional", email: "", phone: "", social_links: "",
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadProject = async () => {
    try {
      const { data } = await projectsAPI.get(projectId);
      setFormData((f) => ({ ...f, name: data.name, ...data.wizard_data }));
      setBusinessType(data.business_type);
      if (data.content?.hero) {
        setGeneratedProject(data);
        setStep(3);
      } else {
        setStep(1);
      }
    } catch { /* project not found, start fresh */ }
  };

  const handleSelectType = (typeId) => {
    setBusinessType(typeId);
    setStep(1);
  };

  const handleDetailsNext = async () => {
    setStep(2);
    setChatMessages([{ text: `Great! Let me ask you a few questions about your ${businessType} business "${formData.name}" to build the perfect website.`, isUser: false }]);

    try {
      const { data } = await aiAPI.generateQuestions(businessType, formData);
      const qs = data.questions || data;
      setQuestions(Array.isArray(qs) ? qs : []);
      if (qs.length > 0) {
        setTimeout(() => {
          setChatMessages((m) => [...m, { text: qs[0].text, isUser: false }]);
        }, 800);
      }
    } catch {
      setQuestions([
        { id: "q1", text: "What makes your business unique?", type: "text" },
        { id: "q2", text: "What is the primary action you want visitors to take?", type: "text" },
        { id: "q3", text: "Do you have a preferred color scheme?", type: "text" },
      ]);
      setTimeout(() => {
        setChatMessages((m) => [...m, { text: "What makes your business unique?", isUser: false }]);
      }, 800);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const answer = chatInput.trim();
    setChatMessages((m) => [...m, { text: answer, isUser: true }]);
    setChatInput("");

    // Store answer
    if (questions[currentQ]) {
      setFormData((f) => ({ ...f, [questions[currentQ].id]: answer }));
    }

    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
      setTimeout(() => {
        setChatMessages((m) => [...m, { text: questions[nextQ].text, isUser: false }]);
      }, 600);
    } else {
      setTimeout(() => {
        setChatMessages((m) => [...m, { text: "Perfect! I have everything I need. Let me generate your website now.", isUser: false }]);
      }, 600);
      setTimeout(() => handleGenerate(), 1500);
    }
  };

  const handleGenerate = async () => {
    setStep(3);
    setGenerating(true);

    try {
      const businessInfo = {
        name: formData.name,
        type: businessType,
        description: formData.description,
        target_audience: formData.target_audience,
        services: formData.services,
        tone: formData.tone,
        email: formData.email,
        phone: formData.phone,
      };

      const { data: aiResult } = await aiAPI.generateContent(businessInfo);
      const content = aiResult.content || {};

      // Create or update project
      let project;
      if (projectId) {
        const { data } = await projectsAPI.update(projectId, {
          content,
          wizard_data: formData,
          status: "generated",
        });
        project = data;
      } else {
        const { data } = await projectsAPI.create({
          name: formData.name || "My Website",
          business_type: businessType,
          content,
          wizard_data: formData,
        });
        // Update status
        await projectsAPI.update(data.project_id, { status: "generated" });
        project = { ...data, content, status: "generated" };
      }

      setGeneratedProject(project);
    } catch (e) {
      console.error("Generation failed:", e);
      // Create project with placeholder content
      const fallbackContent = {
        hero: { headline: formData.name || "Welcome", subheadline: formData.description || "Your business, online.", cta_text: "Get Started" },
        about: { title: "About Us", description: formData.description || "We are passionate about what we do.", mission: "Delivering excellence." },
        services: [{ name: "Consulting", description: "Expert guidance for your business needs.", price: "$99" }],
        contact: { email: formData.email || "hello@example.com", phone: formData.phone || "" },
        seo: { title: formData.name || "My Business", description: formData.description || "", keywords: [] },
      };

      let project;
      if (projectId) {
        const { data } = await projectsAPI.update(projectId, { content: fallbackContent, wizard_data: formData, status: "generated" });
        project = data;
      } else {
        const { data } = await projectsAPI.create({ name: formData.name || "My Website", business_type: businessType, content: fallbackContent, wizard_data: formData });
        await projectsAPI.update(data.project_id, { status: "generated" });
        project = { ...data, content: fallbackContent, status: "generated" };
      }
      setGeneratedProject(project);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="wizard-page">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <StepIndicator current={step} steps={STEPS} />

        {/* Step 0: Choose Type */}
        {step === 0 && (
          <div className="animate-fade-in-up" data-testid="wizard-step-0">
            <h2 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
              How do you want to start?
            </h2>
            <p className="text-base text-[#6B7280] mb-8">Choose your path and we'll guide you from there.</p>
            <div className="space-y-4">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => handleSelectType(bt.id)}
                  className="w-full flex items-center gap-6 p-6 border border-[#E5E7EB] hover:border-[#0033FF] transition-colors text-left group"
                  data-testid={`btype-${bt.id}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: bt.color }}>
                    <bt.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>{bt.title}</h3>
                    <p className="text-sm text-[#6B7280]">{bt.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#0033FF] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="animate-fade-in-up" data-testid="wizard-step-1">
            <h2 className="text-3xl tracking-tight font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
              Tell us about your business
            </h2>
            <p className="text-base text-[#6B7280] mb-8">The more details you share, the better your website will be.</p>
            <div className="space-y-5">
              {[
                { key: "name", label: "Business Name", placeholder: "e.g., NovaTech Solutions", type: "input" },
                { key: "description", label: "What does your business do?", placeholder: "We help startups build and scale their digital products...", type: "textarea" },
                { key: "target_audience", label: "Target Audience", placeholder: "e.g., Tech startups, small businesses, freelancers", type: "input" },
                { key: "services", label: "Key Services / Products", placeholder: "e.g., Web development, UI/UX design, consulting", type: "input" },
                { key: "email", label: "Contact Email", placeholder: "hello@yourbusiness.com", type: "input" },
                { key: "phone", label: "Phone (optional)", placeholder: "+1 (555) 123-4567", type: "input" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key]}
                      onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#0033FF] focus:border-transparent focus:ring-offset-1 outline-none transition-shadow"
                      data-testid={`input-${field.key}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key]}
                      onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-[#0033FF] focus:border-transparent focus:ring-offset-1 outline-none transition-shadow"
                      data-testid={`input-${field.key}`}
                    />
                  )}
                </div>
              ))}
              {/* Brand Tone Select */}
              <div>
                <label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">Brand Tone</label>
                <div className="flex flex-wrap gap-2">
                  {["Professional", "Casual", "Fun", "Luxury", "Technical"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormData((f) => ({ ...f, tone: t }))}
                      className={`px-4 py-2 text-sm border transition-colors ${formData.tone === t ? "bg-[#0033FF] text-white border-[#0033FF]" : "bg-white text-[#0A0A0A] border-[#E5E7EB] hover:bg-gray-50"}`}
                      data-testid={`tone-${t.toLowerCase()}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(0)} className="btn-secondary px-6 py-3 text-sm flex items-center gap-2" data-testid="wizard-back">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleDetailsNext}
                disabled={!formData.name}
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-40"
                data-testid="wizard-next"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: AI Questions Chat */}
        {step === 2 && (
          <div className="animate-fade-in-up" data-testid="wizard-step-2">
            <h2 className="text-3xl tracking-tight font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
              AI Interview
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">Answer a few quick questions so our AI can personalize your website.</p>

            <div className="border border-[#E5E7EB] bg-white">
              <div className="h-[380px] overflow-y-auto p-4" data-testid="chat-container">
                {chatMessages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg.text} isUser={msg.isUser} />
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-[#E5E7EB] p-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Type your answer..."
                  className="flex-1 border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0033FF] focus:border-transparent"
                  data-testid="chat-input"
                />
                <button onClick={handleChatSend} className="btn-primary px-4 py-2.5" data-testid="chat-send">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary px-6 py-3 text-sm flex items-center gap-2" data-testid="chat-back">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleGenerate} className="btn-accent px-6 py-3 text-sm flex items-center gap-2" data-testid="skip-generate">
                Skip & Generate <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <div className="animate-fade-in-up text-center py-12" data-testid="wizard-step-3">
            {generating ? (
              <div>
                <Loader2 className="w-10 h-10 text-[#0033FF] animate-spin mx-auto mb-6" />
                <h2 className="text-3xl tracking-tight font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
                  Generating Your Website
                </h2>
                <p className="text-sm text-[#6B7280] mb-8">Our AI is crafting the perfect website for {formData.name || "your business"}...</p>
                <div className="max-w-md mx-auto bg-[#F3F4F6] h-2 overflow-hidden">
                  <div className="h-full bg-[#0033FF] animate-progress" />
                </div>
              </div>
            ) : generatedProject ? (
              <div>
                <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl tracking-tight font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
                  Website Generated!
                </h2>
                <p className="text-sm text-[#6B7280] mb-8">
                  Your website for "{generatedProject.name}" is ready. Preview it or generate media assets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate(`/preview/${generatedProject.project_id}`)}
                    className="btn-primary px-8 py-3 text-sm flex items-center justify-center gap-2"
                    data-testid="go-preview"
                  >
                    Preview Website <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/media/${generatedProject.project_id}`)}
                    className="btn-secondary px-8 py-3 text-sm"
                    data-testid="go-media"
                  >
                    Generate Media
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-secondary px-8 py-3 text-sm"
                    data-testid="go-dashboard"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
