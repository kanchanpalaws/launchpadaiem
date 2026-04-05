import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Github, Copy, ExternalLink, CheckCircle2, Loader2, AlertCircle, Globe, Link2, Crown } from "lucide-react";
import { projectsAPI, githubAPI } from "@/lib/api";

export default function Publish({ user }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [repoName, setRepoName] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const isFree = user?.plan === "free";

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data } = await projectsAPI.get(projectId);
      setProject(data);
      const safeName = data.name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      setRepoName(`launchpad-${safeName}`);

      if (data.published && data.publish_url) {
        setPublished(true);
        setResult({
          repo_url: data.repo_url,
          pages_url: data.publish_url,
          repo_name: safeName,
        });
      }
    } catch {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (isFree) return;
    setPublishing(true);
    setError("");
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85));
    }, 300);

    try {
      const { data } = await githubAPI.publish(projectId, repoName);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(data);
      setPublished(true);
    } catch (e) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(e.response?.data?.detail || "Publishing failed. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0033FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="publish-page">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 md:px-12 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(`/preview/${projectId}`)} className="p-2 hover:bg-gray-100" data-testid="publish-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
              Publish — {project.name}
            </h1>
            <p className="text-xs text-[#6B7280]">Deploy to GitHub Pages</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-8">
        {/* Free plan gate */}
        {isFree && (
          <div className="bg-white border-2 border-[#FF4500] p-8 mb-8 text-center" data-testid="publish-upgrade-gate">
            <Crown className="w-10 h-10 text-[#FF4500] mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
              Upgrade to Premium to Publish
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Publishing to GitHub Pages requires a Premium plan. Upgrade for $49 (one-time) to unlock publishing, watermark removal, and more.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-accent px-8 py-3 text-sm"
              data-testid="publish-upgrade-btn"
            >
              Go to Dashboard to Upgrade
            </button>
          </div>
        )}

        {/* Publish Form (Premium only) */}
        {!isFree && !published && (
          <div className="bg-white border border-[#E5E7EB] p-8" data-testid="publish-form">
            <div className="flex items-center gap-3 mb-6">
              <Github className="w-8 h-8 text-[#0A0A0A]" />
              <div>
                <h2 className="text-2xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>Deploy to GitHub Pages</h2>
                <p className="text-sm text-[#6B7280]">Your website will be live in seconds.</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">Repository Name</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="w-full border border-[#E5E7EB] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0033FF] focus:border-transparent font-mono"
                data-testid="repo-name-input"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">This will create a new public repository on your GitHub account.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3" data-testid="publish-error">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {publishing && (
              <div className="mb-6" data-testid="publish-progress">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#0A0A0A] font-medium">Deploying...</span>
                  <span className="text-sm text-[#6B7280]">{progress}%</span>
                </div>
                <div className="bg-[#F3F4F6] h-2 overflow-hidden">
                  <div className="h-full bg-[#0033FF] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-[#6B7280]">{progress < 30 ? "Creating repository..." : progress < 60 ? "Generating HTML..." : progress < 90 ? "Pushing code..." : "Enabling GitHub Pages..."}</p>
                </div>
              </div>
            )}

            <button
              onClick={handlePublish}
              disabled={publishing || !repoName}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="publish-deploy-btn"
            >
              {publishing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <><Github className="w-4 h-4" /> Deploy to GitHub Pages</>
              )}
            </button>
          </div>
        )}

        {/* Success State */}
        {published && result && (
          <div className="bg-white border border-[#E5E7EB] p-8 text-center" data-testid="publish-success">
            <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-medium text-[#0A0A0A] mb-2" style={{ fontFamily: "Outfit" }}>
              Published Successfully!
            </h2>
            <p className="text-sm text-[#6B7280] mb-8">Your website is now live on GitHub Pages.</p>

            <div className="space-y-4 text-left max-w-md mx-auto">
              {/* Live URL */}
              <div className="border border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Live URL
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#0033FF] bg-[#F9FAFB] px-3 py-2 font-mono truncate">
                    {result.pages_url}
                  </code>
                  <button
                    onClick={() => handleCopy(result.pages_url)}
                    className="p-2 hover:bg-gray-100 transition-colors shrink-0"
                    data-testid="copy-url-btn"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                  </button>
                  <a
                    href={result.pages_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 transition-colors shrink-0"
                    data-testid="open-live-url"
                  >
                    <ExternalLink className="w-4 h-4 text-[#0033FF]" />
                  </a>
                </div>
              </div>

              {/* Repository URL */}
              <div className="border border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" /> Repository
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-[#0A0A0A] bg-[#F9FAFB] px-3 py-2 font-mono truncate">
                    {result.repo_url}
                  </code>
                  <a
                    href={result.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 transition-colors shrink-0"
                    data-testid="open-repo-url"
                  >
                    <ExternalLink className="w-4 h-4 text-[#6B7280]" />
                  </a>
                </div>
              </div>

              {/* Domain Connect */}
              <div className="border border-dashed border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5" /> Custom Domain
                </p>
                <p className="text-sm text-[#6B7280]">
                  Connect a custom domain via your repository settings → Pages → Custom domain.
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button onClick={() => navigate("/dashboard")} className="btn-secondary px-6 py-3 text-sm" data-testid="publish-to-dashboard">
                Dashboard
              </button>
              <a
                href={result.pages_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2 no-underline"
                data-testid="visit-live-site"
              >
                Visit Live Site <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
