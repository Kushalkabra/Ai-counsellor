import { Bell, User, Lock, Sparkles, MapPin, DollarSign, TrendingUp, Unlock, Menu } from "lucide-react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categoryStyles = {
  dream: { bg: "bg-primary/10", text: "text-primary", label: "Dream" },
  target: { bg: "bg-warning-muted", text: "text-warning", label: "Target" },
  safe: { bg: "bg-success-muted", text: "text-success", label: "Safe" },
};

const ShortlistPage = () => {
  const { universities, lockUniversity, unlockUniversity } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const shortlistedUniversities = universities.filter(u => u.isShortlisted);

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-xl font-semibold text-foreground leading-tight">Your Shortlisted Universities</h1>
              <p className="text-sm text-muted-foreground">{shortlistedUniversities.length} universities selected</p>
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
          {shortlistedUniversities.length === 0 && (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground">You haven't shortlisted any universities yet.</p>
              <Button variant="link" asChild className="mt-2">
                <a href="/discover">Go to Discover</a>
              </Button>
            </div>
          )}
          <div className="space-y-6">
            {shortlistedUniversities.map((uni) => {
              const categoryStyle = categoryStyles[uni.tag.toLowerCase() as keyof typeof categoryStyles] || categoryStyles.target;

              return (
                <div
                  key={uni.id}
                  className={cn(
                    "bg-card rounded-2xl overflow-hidden border shadow-soft transition-all",
                    uni.isLocked ? "border-success/30 shadow-glow-success" : "border-border/50"
                  )}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden flex-shrink-0">
                      <img
                        src={uni.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f"}
                        alt={uni.name}
                        className="w-full h-full object-cover"
                      />
                      {uni.isLocked && (
                        <div className="absolute inset-0 bg-success/10 flex items-center justify-center">
                          <div className="bg-success text-success-foreground px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" />
                            Locked
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">{uni.name}</h3>
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                categoryStyle.bg,
                                categoryStyle.text
                              )}
                            >
                              {categoryStyle.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>{uni.country}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{uni.costLevel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">{uni.acceptanceChance}{typeof uni.acceptanceChance === 'number' ? '%' : ''} chance</span>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          variant={uni.isLocked ? "outline" : "success"}
                          className={cn(
                            "flex-shrink-0",
                            uni.isLocked && "border-success text-success hover:bg-success/10"
                          )}
                          onClick={() => {
                            if (uni.isLocked) {
                              if (window.confirm(`Are you sure you want to unlock ${uni.name}? This will remove your university-specific application guidance.`)) {
                                unlockUniversity(uni.id);
                              }
                            } else {
                              lockUniversity(uni.id);
                            }
                          }}
                        >
                          {uni.isLocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Lock University
                            </>
                          )}
                        </Button>
                      </div>

                      {/* AI Insight */}
                      <div className="ai-panel rounded-xl p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-primary mb-1">AI Insight</p>
                            <p className="text-sm text-foreground">{uni.whyFits}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShortlistPage;
