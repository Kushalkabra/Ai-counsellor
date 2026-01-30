import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  FileCheck,
  Mail,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Loader,
  Lock,
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface Document {
  id: string;
  name: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface TimelineMilestone {
  month: string;
  tasks: string[];
  status: 'upcoming' | 'current' | 'completed';
}

import { applicationAPI, aiCounsellorAPI } from '@/lib/api';

export function ApplicationGuidance({ onBack }: { onBack: () => void }) {
  const { universities, userProfile, unlockUniversity } = useApp();
  const lockedUniversities = universities.filter(u => u.isLocked);
  const [selectedUniversity, setSelectedUniversity] = useState(lockedUniversities[0]?.id || '');

  const [documents, setDocuments] = useState<Document[]>([]);
  const currentUniversity = universities.find(u => u.id === selectedUniversity);

  const [generatedSop, setGeneratedSop] = useState<string | null>(null);
  const [isGeneratingSop, setIsGeneratingSop] = useState(false);

  // Auto-switch selection if current university unlocks
  React.useEffect(() => {
    if (lockedUniversities.length > 0 && !lockedUniversities.find(u => u.id === selectedUniversity)) {
      setSelectedUniversity(lockedUniversities[0].id);
    }
  }, [universities, selectedUniversity, lockedUniversities.length]);

  const handleGenerateSop = async () => {
    if (!currentUniversity) return;
    setIsGeneratingSop(true);
    try {
      const res = await aiCounsellorAPI.generateSOP(currentUniversity.id);
      setGeneratedSop(res.data.sop_content);
    } catch (e) {
      console.error("SOP Generation failed", e);
    } finally {
      setIsGeneratingSop(false);
    }
  };

  // Fetch documents from API
  React.useEffect(() => {
    const fetchDocs = async () => {
      if (currentUniversity) {
        try {
          const res = await applicationAPI.getDocuments(currentUniversity.id);
          const mappedDocs = res.data.map((d: any) => ({
            id: d.id.toString(),
            name: d.name,
            completed: d.is_completed,
            icon: d.name.includes('Scores') ? <FileCheck className="w-5 h-5" /> :
              d.name.includes('Transcript') ? <GraduationCap className="w-5 h-5" /> :
                d.name.includes('Recommendation') ? <Mail className="w-5 h-5" /> :
                  <FileText className="w-5 h-5" />
          }));
          setDocuments(mappedDocs);
        } catch (e) {
          console.error("Failed to fetch documents", e);
        }
      }
    };
    fetchDocs();
  }, [currentUniversity?.id]);

  const toggleDocument = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, completed: !currentStatus } : doc))
    );

    try {
      await applicationAPI.updateDocument(id, !currentStatus);
    } catch (e) {
      console.error("Failed to update document", e);
      // Revert on failure
      setDocuments(prev =>
        prev.map(doc => (doc.id === id ? { ...doc, completed: currentStatus } : doc))
      );
    }
  };

  /* Dynamic Timeline Logic */
  const generateTimeline = (intake: string, country: string): TimelineMilestone[] => {
    const parts = intake.trim().split(' ');
    let year = 2025;
    let season = 'Fall';

    const yearIndex = parts.findIndex(p => /^\d{4}$/.test(p));
    if (yearIndex !== -1) {
      year = parseInt(parts[yearIndex]);
      if (parts.length > 1) {
        const seasonPart = parts.find((_, i) => i !== yearIndex);
        if (seasonPart) season = seasonPart;
      }
    } else {
      const val = parseInt(parts[0]);
      if (!isNaN(val) && val > 2000) {
        year = val;
      }
    }

    const isSpring = season.toLowerCase().includes('spring') || season.toLowerCase().includes('jan') || season.toLowerCase().includes('feb');
    const isFall = !isSpring;
    const isUSA = country === 'USA';

    const getMonthYear = (offsetMonths: number) => {
      const startMonth = isFall ? 8 : 0;
      const date = new Date(year, startMonth, 1);
      date.setMonth(date.getMonth() - offsetMonths);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

    if (isUSA) {
      return [
        { month: getMonthYear(12), tasks: ['Shortlist Universities', 'Start GRE/GMAT prep'], status: 'completed' },
        { month: getMonthYear(10), tasks: ['Take Standardized Tests', 'Draft SOP'], status: 'current' },
        { month: getMonthYear(8), tasks: ['Submit Applications', 'Order Transcripts'], status: 'upcoming' },
        { month: getMonthYear(5), tasks: ['Receive Decisions', 'Apply for I-20'], status: 'upcoming' },
      ];
    } else {
      return [
        { month: getMonthYear(12), tasks: ['Research Programs', 'Check Entry Requirements'], status: 'completed' },
        { month: getMonthYear(10), tasks: ['Prepare Documents', 'Take Language Tests'], status: 'current' },
        { month: getMonthYear(8), tasks: ['Submit Applications', 'Apply for Scholarships'], status: 'upcoming' },
        { month: getMonthYear(5), tasks: ['Accept Offer', 'Visa Application'], status: 'upcoming' },
      ];
    }
  };

  const timeline: TimelineMilestone[] = currentUniversity
    ? generateTimeline(userProfile?.targetIntake || 'Fall 2025', currentUniversity.country)
    : [];

  const handleUnlock = async () => {
    if (selectedUniversity) {
      if (confirm('Are you sure you want to unlock this university? You will lose access to specific guidance.')) {
        await unlockUniversity(selectedUniversity);
      }
    }
  };


  const completedDocs = documents.filter(d => d.completed).length;
  const totalDocs = documents.length;
  const progressPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  if (lockedUniversities.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl opacity-50"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="text-center max-w-md relative z-10 p-8 glass-card rounded-2xl">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">No Locked Universities</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Lock a university from the discovery page to unlock a personalized application roadmap, SOP drafter, and document checklist.
          </p>
          <Button onClick={onBack} className="bg-indigo-600 hover:bg-indigo-700 w-full shadow-lg shadow-indigo-200">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="glass-panel sticky top-4 z-40 mx-4 lg:mx-8 mt-4 rounded-2xl shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-slate-100/50 rounded-xl -ml-2">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Application Guidance</h1>
            <p className="text-sm text-slate-500">
              Your personalized roadmap for acceptance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10 max-w-7xl">
        {/* University Selector */}
        {lockedUniversities.length > 1 && (
          <div className="glass-card rounded-xl p-2 mb-8 flex flex-wrap gap-2">
            {lockedUniversities.map(uni => (
              <button
                key={uni.id}
                onClick={() => setSelectedUniversity(uni.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedUniversity === uni.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {uni.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected University Banner */}
        {currentUniversity && (
          <motion.div
            className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
            }}
          >
            {/* Abstract shapes in banner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-xl -ml-16 -mb-16 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-3xl font-bold tracking-tight">{currentUniversity.name}</h2>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                    onClick={handleUnlock}
                  >
                    <Lock className="w-3.5 h-3.5 mr-2" />
                    Unlock
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-indigo-100 mb-6">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    <GraduationCap className="w-4 h-4" /> {currentUniversity.country}
                  </span>
                  <span className="hidden md:inline text-indigo-200">•</span>
                  <span className="text-sm font-medium opacity-90">Targeting {userProfile?.targetIntake || 'Fall 2025'} Intake</span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-3 py-1">
                    {currentUniversity.tag}
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-3 py-1">
                    {currentUniversity.costLevel} Cost
                  </Badge>
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-3 py-1">
                    {currentUniversity.acceptanceChance} Chance
                  </Badge>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center min-w-[140px] border border-white/20">
                <div className="text-5xl font-bold mb-1 tracking-tighter">{progressPercentage}%</div>
                <div className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">Readiness</div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Documents Checklist */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Required Documents</h3>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {completedDocs} / {totalDocs} Done
                </span>
              </div>

              <div className="space-y-4">
                {documents.map(doc => (
                  <motion.div
                    key={doc.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-xl border transition-all duration-300 group ${doc.completed
                      ? 'bg-emerald-50/50 border-emerald-100'
                      : 'bg-white/60 border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/40'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleDocument(doc.id, doc.completed)}
                        className="transition-transform active:scale-95"
                      >
                        {doc.completed ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50" />
                        )}
                      </button>

                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.completed
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                          }`}
                      >
                        {doc.icon}
                      </div>

                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${doc.completed ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-indigo-900'}`}>
                          {doc.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {completedDocs === totalDocs && totalDocs > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-emerald-900 font-bold text-lg">You're All Set!</h4>
                    <p className="text-emerald-700">All documents are ready. You can now proceed to submit your application on the university portal.</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI Integration Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Next Steps */}
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-violet-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Focus
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/60 p-3 rounded-xl border border-violet-100 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                    <p className="text-sm text-slate-700">Review your compiled documents one last time.</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-xl border border-violet-100 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                    <p className="text-sm text-slate-700">Draft your SOP using the tool below.</p>
                  </div>
                </div>
              </div>

              {/* SOP Generator */}
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    SOP Drafter
                  </h3>
                  {!generatedSop && <Badge variant="secondary" className="bg-indigo-50 text-indigo-600">AI Powered</Badge>}
                </div>

                {!generatedSop ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Generate a tailored Statement of Purpose based on your profile and this university's strengths.
                    </p>
                    <Button
                      onClick={handleGenerateSop}
                      disabled={isGeneratingSop}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      size="sm"
                    >
                      {isGeneratingSop ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Drafting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Draft
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 h-32 overflow-y-auto">
                      {generatedSop}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setGeneratedSop(null)} className="flex-1 text-xs h-8">Reset</Button>
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedSop)} className="flex-1 bg-indigo-600 text-xs h-8">Copy</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Key Dates
              </h3>

              <div className="space-y-6 relative pl-2">
                {/* Timeline Line */}
                <div className="absolute left-[15px] top-2 bottom-4 w-0.5 bg-slate-100"></div>

                {timeline.map((milestone, index) => (
                  <motion.div
                    key={milestone.month}
                    className="relative flex gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm ${milestone.status === 'completed'
                        ? 'bg-emerald-500'
                        : milestone.status === 'current'
                          ? 'bg-indigo-600 ring-4 ring-indigo-50'
                          : 'bg-slate-200'
                        }`}
                    >
                      {milestone.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      {milestone.status === 'current' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <p
                        className={`text-sm font-bold mb-1 ${milestone.status === 'current'
                          ? 'text-indigo-600'
                          : 'text-slate-900'
                          }`}
                      >
                        {milestone.month}
                      </p>
                      <div className="space-y-1.5">
                        {milestone.tasks.map((task, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`w-1 h-1 rounded-full mt-1.5 ${milestone.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-300'}`}></span>
                            <p className={`text-xs leading-relaxed ${milestone.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                              {task}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
