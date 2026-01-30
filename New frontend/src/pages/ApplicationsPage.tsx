import { Bell, User, FileText, GraduationCap, Award, Users, Check, Circle, Sparkles, Loader2, Menu, PenTool, Copy, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationAPI, aiCounsellorAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { countryImages } from "@/lib/constants";

const ApplicationsPage = () => {
  const { universities, userProfile } = useApp();
  const lockedUniversities = universities.filter(u => u.isLocked);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeUniId, setActiveUniId] = useState<string | null>(
    lockedUniversities.length > 0 ? lockedUniversities[0].id : null
  );
  const [togglingDocIds, setTogglingDocIds] = useState<Set<number>>(new Set());

  const activeUni = lockedUniversities.find(u => u.id === activeUniId);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [strategyPoints, setStrategyPoints] = useState<string[]>([]);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [sopContent, setSopContent] = useState<string | null>(null);
  const [generatingSop, setGeneratingSop] = useState(false);

  const handleToggleDocument = async (docId: number, currentStatus: boolean) => {
    if (togglingDocIds.has(docId)) return;

    setTogglingDocIds(prev => new Set(prev).add(docId));
    try {
      const res = await applicationAPI.updateDocument(docId.toString(), !currentStatus);
      setDocuments(prev => prev.map(d => d.id === docId ? res.data : d));
    } catch (e) {
      console.error("Failed to toggle document status", e);
    } finally {
      setTogglingDocIds(prev => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    }
  };

  const getTimelineData = () => {
    const completedCount = documents.filter(d => d.is_completed).length;
    const totalCount = documents.length || 1;
    const progress = (completedCount / totalCount) * 100;
    const intakeYearStr = userProfile?.targetIntake || (new Date().getFullYear() + 1).toString();
    const intakeYear = parseInt(intakeYearStr.toString());

    type TimelineStep = { title: string; date: string; desc: string; status: "completed" | "current" | "upcoming" };

    let currentPhase: Omit<TimelineStep, 'status'> = { title: "Getting Started", date: "Month 1", desc: "Setting up your checklist" };
    let nextPhase: Omit<TimelineStep, 'status'> = { title: "Document Collection", date: "Month 2-3", desc: "Gathering academic records" };
    let finalPhase: Omit<TimelineStep, 'status'> = { title: "Review & Submission", date: `By Oct ${intakeYear - 1}`, desc: "Final portal submission" };

    let currentStatus: "completed" | "current" = progress > 0 ? "completed" : "current";
    let nextStatus: "completed" | "current" | "upcoming" = "upcoming";
    let finalStatus: "upcoming" = "upcoming";

    if (progress >= 100) {
      currentStatus = "completed";
      nextStatus = "current";
      currentPhase = { title: "Preparation Complete", date: "Done", desc: "All documents are ready" };
      nextPhase = { title: "Review & Submission", date: "Active", desc: "Final portal check" };
      finalPhase = { title: "Visa & Enrollment", date: `By May ${intakeYear}`, desc: "Booking your flight" };
    } else if (progress > 50) {
      currentStatus = "completed";
      nextStatus = "current";
      currentPhase = { title: "Document Collection", date: "Done", desc: "Most records gathered" };
      nextPhase = { title: "Review & Refine", date: "Active", desc: "Polishing your SOP and LORs" };
    } else if (progress > 0) {
      currentStatus = "current";
      currentPhase = { title: "Document Collection", date: "Active", desc: "Requesting transcripts & scores" };
      nextPhase = { title: "SOP Drafting", date: "Next 2 Weeks", desc: "Starting your AI SOP draft" };
    }

    return [
      { ...currentPhase, status: currentStatus },
      { ...nextPhase, status: nextStatus },
      { ...finalPhase, status: finalStatus },
    ];
  };

  const handleGenerateSop = async () => {
    if (!activeUni) return;
    setGeneratingSop(true);
    try {
      const res = await aiCounsellorAPI.generateSOP(activeUni.id);
      setSopContent(res.data.sop_content);
    } catch (e) {
      console.error("Failed to generate SOP", e);
    } finally {
      setGeneratingSop(false);
    }
  };

  // Update active id if universities load or change and current active is gone
  useEffect(() => {
    if (lockedUniversities.length > 0 && !activeUniId) {
      setActiveUniId(lockedUniversities[0].id);
    }
  }, [lockedUniversities, activeUniId]);

  useEffect(() => {
    if (activeUni) {
      // Reset states when switching universities to prevent stale data
      setSopContent(null);
      setStrategyPoints([]);

      const fetchData = async () => {
        setLoadingDocs(true);
        setLoadingStrategy(true);
        try {
          // Fetch Docs
          const docsRes = await applicationAPI.getDocuments(activeUni.id);
          setDocuments(docsRes.data);

          // Fetch Strategy (Fire and forget? No, let's wait to show state)
          try {
            // Check if we have cached strategy for this uni in session/local storage?
            // For now, simpler to just fetch.
            const stratRes = await aiCounsellorAPI.generateStrategy(activeUni.id);
            setStrategyPoints(stratRes.data.strategy_points);
          } catch (e) {
            console.error("Failed to fetch strategy", e);
            setStrategyPoints([
              "Tailor your SOP to match the program's specific strengths.",
              "Secure strongly positive Letters of Recommendation.",
              "Highlight your most relevant projects and experience.",
              "Submit your application well before the deadline."
            ]);
          }
        } catch (err) {
          console.error("Failed to fetch data", err);
        } finally {
          setLoadingDocs(false);
          setLoadingStrategy(false);
        }
      };
      fetchData();
    }
  }, [activeUniId, activeUni]);

  const docIcons: Record<string, any> = {
    "Statement of Purpose": FileText,
    "Academic Transcripts": GraduationCap,
    "Test Scores": Award,
    "Letters of Recommendation": Users,
  };

  const getIcon = (title: string) => {
    for (const key in docIcons) {
      if (title.includes(key)) return docIcons[key];
    }
    return FileText;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Application Guidance</h1>
              <p className="text-sm text-muted-foreground">Track and prepare your applications</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/profile"
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer"
              >
                <User className="h-5 w-5 text-primary" />
              </Link>
            </motion.div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {lockedUniversities.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground">You haven't locked any universities yet. Shortlist and lock a university to start your application guidance.</p>
              <Button variant="link" asChild className="mt-2">
                <a href="/shortlist">Go to Shortlist</a>
              </Button>
            </div>
          ) : (
            <>
              {/* University Selector Tabs if multiple */}
              {lockedUniversities.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {lockedUniversities.map((uni) => (
                    <Button
                      key={uni.id}
                      variant={activeUniId === uni.id ? "default" : "secondary"}
                      className={cn(
                        "rounded-full whitespace-nowrap",
                        activeUniId === uni.id ? "bg-primary shadow-glow-primary" : "bg-card border-border/50"
                      )}
                      onClick={() => setActiveUniId(uni.id)}
                    >
                      {uni.name}
                    </Button>
                  ))}
                </div>
              )}

              {activeUni && (
                <motion.div
                  key={activeUni.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* University Banner */}
                  <div className="relative rounded-2xl overflow-hidden mb-8 min-h-[12rem] lg:h-48 shadow-lg">
                    <div className="absolute inset-0">
                      <img
                        src={activeUni.image || "/univ_usa.png"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 lg:via-background/80 to-transparent" />
                    </div>
                    <div className="relative z-10 p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center h-full gap-4 lg:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="w-16 h-16 lg:w-20 lg:h-20 bg-card rounded-2xl flex items-center justify-center shadow-elevated border border-border/50 flex-shrink-0"
                      >
                        <GraduationCap className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                      </motion.div>
                      <div>
                        <p className="text-primary font-medium text-xs lg:text-sm mb-1">Preparing Application for</p>
                        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{activeUni.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {userProfile?.targetIntake || "2024"} Intake
                          </span>
                          <span>•</span>
                          <span className="truncate">{userProfile?.degree || "Master's"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Document Checklist */}
                    <div className="lg:col-span-2">
                      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-foreground">Document Checklist</h3>
                          <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                            {documents.filter(d => d.is_completed).length}/{documents.length} Completed
                          </div>
                        </div>

                        {loadingDocs ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Customizing your checklist...</p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {documents.length === 0 && (
                              <p className="text-center col-span-2 py-8 text-muted-foreground">Checking for required documents...</p>
                            )}
                            {documents.map((doc) => {
                              const Icon = getIcon(doc.name);
                              const isDone = doc.is_completed;
                              return (
                                <motion.div
                                  key={doc.id}
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleToggleDocument(doc.id, doc.is_completed)}
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group/doc",
                                    isDone
                                      ? "bg-success-muted/30 border-success/30"
                                      : "bg-secondary/30 border-border/50 hover:border-primary/30",
                                    togglingDocIds.has(doc.id) && "opacity-60 cursor-not-allowed"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/doc:scale-110",
                                      isDone ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
                                    )}
                                  >
                                    {togglingDocIds.has(doc.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Icon className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                      {isDone ? "Ready to Submit" : "In Progress"}
                                    </p>
                                  </div>
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                      isDone
                                        ? "bg-success text-success-foreground scale-110"
                                        : "border-2 border-border group-hover/doc:border-primary/50"
                                    )}
                                  >
                                    {isDone && <Check className="h-3.5 w-3.5" />}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* AI Next Steps */}
                      <div className="ai-panel rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Sparkles className="h-20 w-20 text-primary" />
                        </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">AI Strategy for {activeUni.name}</h3>
                            <p className="text-sm text-muted-foreground">Boosting your acceptance odds</p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 relative z-10">
                          {loadingStrategy ? (
                            <div className="col-span-2 flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="ml-2 text-sm text-muted-foreground">Generating personalized strategy...</span>
                            </div>
                          ) : (
                            strategyPoints.map((step, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-background/40 backdrop-blur-sm rounded-xl border border-white/5"
                              >
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column Container */}
                    <div className="space-y-6 h-fit">
                      {/* Timeline */}
                      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 h-fit">
                        <div className="flex items-center gap-2 mb-6">
                          <Circle className="h-4 w-4 text-primary animate-pulse" />
                          <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                        </div>
                        <div className="relative pl-2">
                          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-border/50" />
                          <div className="space-y-8">
                            {getTimelineData().map((item, index) => (
                              <div key={index} className="flex gap-4 relative">
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center z-10 flex-shrink-0 mt-1",
                                    item.status === "completed"
                                      ? "bg-success text-success-foreground"
                                      : item.status === "current"
                                        ? "bg-primary text-primary-foreground shadow-glow-primary"
                                        : "bg-secondary border-2 border-border"
                                  )}
                                >
                                  {item.status === "completed" ? (
                                    <Check className="h-3 w-3" />
                                  ) : item.status === "current" ? (
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                  ) : null}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">{item.date}</p>
                                  <p className={cn("font-semibold text-sm", item.status === "current" ? "text-foreground" : "text-muted-foreground")}>
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-border/50">
                          <Button variant="outline" className="w-full text-xs h-9 rounded-xl">
                            Download Guide (PDF)
                          </Button>
                        </div>
                      </div>

                      {/* AI SOP Draft Section */}
                      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 relative overflow-hidden group">
                        {/* Background Decor */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                            <PenTool className="h-5 w-5 text-violet-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">AI SOP Draft</h3>
                            <p className="text-sm text-muted-foreground">Start with a strong first draft</p>
                          </div>
                        </div>

                        <div className="relative z-10">
                          {!sopContent ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <p className="text-sm text-foreground/80 mb-4 px-2">
                                Generate a personalized Statement of Purpose tailored to {activeUni.name} and your profile.
                              </p>
                              <Button
                                onClick={handleGenerateSop}
                                disabled={generatingSop}
                                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/20"
                              >
                                {generatingSop ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Drafting...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Draft
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="bg-muted/30 rounded-xl p-3 border border-border/50 max-h-60 overflow-y-auto text-sm leading-relaxed text-muted-foreground scrollbar-hide">
                                {sopContent.split('\n').map((line, i) => (
                                  <p key={i} className="mb-2 last:mb-0">{line}</p>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => {
                                  navigator.clipboard.writeText(sopContent);
                                  // Ideally show a toast here
                                }}>
                                  <Copy className="mr-2 h-3 w-3" /> Copy
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleGenerateSop}>
                                  <RefreshCw className="mr-2 h-3 w-3" /> Regenerate
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main >
    </div >
  );
};

export default ApplicationsPage;
