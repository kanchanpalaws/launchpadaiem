import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image, Sparkles, Type, Share2, Download, Loader2, RefreshCw, Film } from "lucide-react";
import { projectsAPI, mediaAPI, aiAPI } from "@/lib/api";

export default function MediaGen({ user }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("logo");
  const [generating, setGenerating] = useState(false);
  const [logos, setLogos] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [taglines, setTaglines] = useState([]);
  const [socialCreatives, setSocialCreatives] = useState([]);

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

  const handleGenerateLogos = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const { data } = await mediaAPI.generateLogo(project.name, "modern minimalist professional");
      if (data.images?.length > 0) {
        setLogos(data.images.map((img) => ({
          data: img.full_data || img.data,
          mime_type: img.mime_type,
        })));
      }
    } catch (e) {
      console.error("Logo generation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateProductImages = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const desc = project.content?.about?.description || project.name;
      const { data } = await mediaAPI.generateImage(
        `Professional product showcase photo for ${project.name}. ${desc}. Clean white background, studio lighting, high quality product photography.`
      );
      if (data.images?.length > 0) {
        setProductImages(data.images);
      }
    } catch (e) {
      console.error("Image generation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateTaglines = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const { data } = await aiAPI.generateTagline(
        project.name,
        project.content?.about?.description || ""
      );
      setTaglines(data.taglines || []);
    } catch (e) {
      console.error("Tagline generation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSocialCreatives = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const { data } = await mediaAPI.generateImage(
        `Social media post creative for ${project.name}. Modern, eye-catching, Instagram-ready design with bold typography and brand colors. Include a call to action.`
      );
      if (data.images?.length > 0) {
        setSocialCreatives(data.images);
      }
    } catch (e) {
      console.error("Social creative generation failed:", e);
    } finally {
      setGenerating(false);
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

  const sections = [
    { id: "logo", label: "Logo", icon: Sparkles },
    { id: "product", label: "Product Images", icon: Image },
    { id: "tagline", label: "Taglines", icon: Type },
    { id: "social", label: "Social Posts", icon: Share2 },
    { id: "video", label: "Promo Video", icon: Film },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="media-page">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 md:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/preview/${projectId}`)} className="p-2 hover:bg-gray-100" data-testid="media-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
                Media Generation — {project.name}
              </h1>
              <p className="text-xs text-[#6B7280]">Generate logos, images, taglines, and social creatives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === sec.id
                  ? "bg-[#0033FF] text-white"
                  : "bg-white text-[#0A0A0A] border border-[#E5E7EB] hover:bg-gray-50"
              }`}
              data-testid={`media-tab-${sec.id}`}
            >
              <sec.icon className="w-4 h-4" /> {sec.label}
            </button>
          ))}
        </div>

        {/* Logo Section */}
        {activeSection === "logo" && (
          <div data-testid="media-logo-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>Logo Variants</h2>
                <p className="text-sm text-[#6B7280]">AI-generated logos for {project.name}</p>
              </div>
              <button
                onClick={handleGenerateLogos}
                disabled={generating}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="generate-logo-btn"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {logos.length > 0 ? "Regenerate" : "Generate Logos"}
              </button>
            </div>
            {logos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {logos.map((logo, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] p-4 text-center">
                    <img
                      src={`data:${logo.mime_type};base64,${logo.data}`}
                      alt={`Logo variant ${i + 1}`}
                      className="w-full h-48 object-contain mb-3"
                    />
                    <button className="text-xs text-[#0033FF] font-medium flex items-center gap-1 mx-auto">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#E5E7EB] p-12 text-center">
                <Sparkles className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Click "Generate Logos" to create AI-powered logo variants</p>
              </div>
            )}
          </div>
        )}

        {/* Product Images Section */}
        {activeSection === "product" && (
          <div data-testid="media-product-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>Product Images</h2>
                <p className="text-sm text-[#6B7280]">Professional product mockups and photos</p>
              </div>
              <button
                onClick={handleGenerateProductImages}
                disabled={generating}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="generate-product-btn"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                Generate Images
              </button>
            </div>
            {productImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productImages.map((img, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] p-4">
                    <img
                      src={`data:${img.mime_type};base64,${img.data}`}
                      alt={`Product ${i + 1}`}
                      className="w-full h-64 object-contain"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#E5E7EB] p-12 text-center">
                <Image className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Generate professional product photos and mockups</p>
              </div>
            )}
          </div>
        )}

        {/* Taglines Section */}
        {activeSection === "tagline" && (
          <div data-testid="media-tagline-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>Tagline Generator</h2>
                <p className="text-sm text-[#6B7280]">Catchy taglines for your brand</p>
              </div>
              <button
                onClick={handleGenerateTaglines}
                disabled={generating}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="generate-tagline-btn"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Generate Taglines
              </button>
            </div>
            {taglines.length > 0 ? (
              <div className="space-y-3">
                {taglines.map((t, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] p-5 flex items-center justify-between">
                    <p className="text-base text-[#0A0A0A] font-medium" style={{ fontFamily: "Outfit" }}>"{t}"</p>
                    <button className="text-xs text-[#0033FF] font-medium shrink-0 ml-4">Copy</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#E5E7EB] p-12 text-center">
                <Type className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Generate catchy taglines for your brand</p>
              </div>
            )}
          </div>
        )}

        {/* Social Creatives */}
        {activeSection === "social" && (
          <div data-testid="media-social-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>Social Post Creatives</h2>
                <p className="text-sm text-[#6B7280]">Ready-to-post social media graphics</p>
              </div>
              <button
                onClick={handleGenerateSocialCreatives}
                disabled={generating}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
                data-testid="generate-social-btn"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Generate Creatives
              </button>
            </div>
            {socialCreatives.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialCreatives.map((img, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] p-4">
                    <img
                      src={`data:${img.mime_type};base64,${img.data}`}
                      alt={`Social creative ${i + 1}`}
                      className="w-full h-64 object-contain"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-[#E5E7EB] p-12 text-center">
                <Share2 className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
                <p className="text-sm text-[#6B7280]">Create social media post creatives</p>
              </div>
            )}
          </div>
        )}

        {/* Video Section (Placeholder) */}
        {activeSection === "video" && (
          <div data-testid="media-video-section">
            <h2 className="text-2xl font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>Promo Video</h2>
            <p className="text-sm text-[#6B7280] mb-6">AI-generated promotional video for your business</p>
            <div className="bg-white border border-dashed border-[#E5E7EB] p-16 text-center">
              <Film className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
              <p className="text-base font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>Video Generation</p>
              <p className="text-sm text-[#6B7280] mb-4">Coming Soon — AI promo video generation is in development.</p>
              <span className="bg-[#F3F4F6] text-[#6B7280] text-xs px-3 py-1 font-medium">COMING SOON</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
