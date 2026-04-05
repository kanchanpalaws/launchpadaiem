import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Globe, Clock, Wallet, CreditCard, Trash2, ExternalLink, ArrowRight, Sparkles, Crown } from "lucide-react";
import { projectsAPI, walletAPI } from "@/lib/api";

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, plan: "free", transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projRes, walletRes] = await Promise.all([projectsAPI.list(), walletAPI.get()]);
      setProjects(projRes.data);
      setWallet(walletRes.data);
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await projectsAPI.delete(projectId);
      setProjects((p) => p.filter((proj) => proj.project_id !== projectId));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleTopUp = async () => {
    try {
      const { data } = await walletAPI.credit(topUpAmount, "Manual top-up");
      setWallet((w) => ({ ...w, balance: data.balance }));
      setShowTopUp(false);
    } catch (e) {
      console.error("Top-up failed:", e);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data } = await walletAPI.upgrade("premium");
      setWallet((w) => ({ ...w, balance: data.balance, plan: data.plan }));
      if (setUser && user) {
        setUser({ ...user, plan: data.plan, wallet_balance: data.balance });
      }
    } catch (e) {
      alert(e.response?.data?.detail || "Upgrade failed");
    }
  };

  const statusColor = (s) => {
    if (s === "published") return "bg-green-100 text-green-700";
    if (s === "generated") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0033FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]" data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl tracking-tight font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
              Welcome back, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Manage your projects and launch new websites.</p>
          </div>
          <button
            onClick={() => navigate("/wizard")}
            className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
            data-testid="create-project-btn"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#E5E7EB] p-6" data-testid="stat-projects">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-4 h-4 text-[#0033FF]" />
              <span className="text-xs text-[#6B7280] uppercase tracking-wider font-bold">Projects</span>
            </div>
            <p className="text-3xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>{projects.length}</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-6" data-testid="stat-wallet">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-4 h-4 text-[#0033FF]" />
              <span className="text-xs text-[#6B7280] uppercase tracking-wider font-bold">Wallet Balance</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-medium text-[#0A0A0A]" style={{ fontFamily: "Outfit" }}>
                &#8377;{wallet.balance?.toFixed(0)}
              </p>
              <button
                onClick={() => setShowTopUp(true)}
                className="text-xs text-[#0033FF] font-medium hover:underline"
                data-testid="topup-btn"
              >
                + Top Up
              </button>
            </div>
          </div>
          <div className="bg-white border border-[#E5E7EB] p-6" data-testid="stat-plan">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-4 h-4 text-[#FF4500]" />
              <span className="text-xs text-[#6B7280] uppercase tracking-wider font-bold">Plan</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-medium text-[#0A0A0A] capitalize" style={{ fontFamily: "Outfit" }}>
                {wallet.plan}
              </p>
              {wallet.plan === "free" && (
                <button
                  onClick={handleUpgrade}
                  className="text-xs bg-[#0033FF] text-white px-3 py-1.5 font-medium hover:bg-[#002FA7] transition-colors shadow-sm"
                  data-testid="upgrade-btn"
                >
                  Upgrade &#8377;9,999
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Up Modal */}
        {showTopUp && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTopUp(false)}>
            <div className="bg-white border border-[#E5E7EB] p-8 max-w-sm w-full animate-fade-in" onClick={(e) => e.stopPropagation()} data-testid="topup-modal">
              <h3 className="text-xl font-medium text-[#0A0A0A] mb-4" style={{ fontFamily: "Outfit" }}>Top Up Wallet</h3>
              <div className="flex gap-3 mb-6">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`flex-1 py-2 text-sm font-medium border transition-colors ${topUpAmount === amt ? "bg-[#0033FF] text-white border-[#0033FF]" : "bg-white text-[#0A0A0A] border-[#E5E7EB] hover:bg-gray-50"}`}
                    data-testid={`topup-${amt}`}
                  >
                    &#8377;{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <button onClick={handleTopUp} className="btn-primary w-full py-3 text-sm" data-testid="topup-confirm">
                <CreditCard className="w-4 h-4 inline mr-2" /> Add &#8377;{topUpAmount.toLocaleString("en-IN")} to Wallet
              </button>
            </div>
          </div>
        )}

        {/* Projects */}
        <div className="mb-10">
          <h2 className="text-xl font-medium text-[#0A0A0A] mb-4" style={{ fontFamily: "Outfit" }}>Your Projects</h2>
          {projects.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] p-12 text-center" data-testid="empty-projects">
              <Sparkles className="w-8 h-8 text-[#0033FF] mx-auto mb-4" />
              <p className="text-base font-medium text-[#0A0A0A] mb-2">No projects yet</p>
              <p className="text-sm text-[#6B7280] mb-6">Create your first AI-powered website in minutes.</p>
              <button
                onClick={() => navigate("/wizard")}
                className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2"
                data-testid="empty-create-btn"
              >
                <Plus className="w-4 h-4" /> Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div key={proj.project_id} className="bg-white border border-[#E5E7EB] p-6 card-hover" data-testid={`project-card-${proj.project_id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-medium text-[#0A0A0A] truncate pr-2" style={{ fontFamily: "Outfit" }}>{proj.name}</h3>
                    <span className={`text-xs px-2 py-0.5 font-medium capitalize shrink-0 ${statusColor(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-1 capitalize">{proj.business_type}</p>
                  <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mb-4">
                    <Clock className="w-3 h-3" />
                    {new Date(proj.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    {proj.status === "draft" && (
                      <button
                        onClick={() => navigate(`/wizard/${proj.project_id}`)}
                        className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1"
                        data-testid={`project-continue-${proj.project_id}`}
                      >
                        Continue <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {(proj.status === "generated" || proj.content?.hero) && (
                      <button
                        onClick={() => navigate(`/preview/${proj.project_id}`)}
                        className="flex-1 btn-secondary py-2 text-xs"
                        data-testid={`project-preview-${proj.project_id}`}
                      >
                        Preview
                      </button>
                    )}
                    {proj.published && proj.publish_url && (
                      <a
                        href={proj.publish_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 transition-colors"
                        data-testid={`project-live-${proj.project_id}`}
                      >
                        <ExternalLink className="w-4 h-4 text-[#0033FF]" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(proj.project_id)}
                      className="p-2 hover:bg-red-50 transition-colors"
                      data-testid={`project-delete-${proj.project_id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        {wallet.transactions?.length > 0 && (
          <div>
            <h2 className="text-xl font-medium text-[#0A0A0A] mb-4" style={{ fontFamily: "Outfit" }}>Recent Transactions</h2>
            <div className="bg-white border border-[#E5E7EB] overflow-hidden">
              {wallet.transactions.slice(0, 8).map((txn, i) => (
                <div key={txn.transaction_id || i} className="flex items-center justify-between px-6 py-3 border-b border-[#E5E7EB] last:border-0" data-testid={`txn-${i}`}>
                  <div>
                    <p className="text-sm text-[#0A0A0A]">{txn.description}</p>
                    <p className="text-xs text-[#9CA3AF]">{new Date(txn.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-sm font-medium ${txn.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {txn.type === "credit" ? "+" : "-"}&#8377;{txn.amount?.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
