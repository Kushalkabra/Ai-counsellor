import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  GraduationCap,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  Circle,
  Loader,
  Edit,
  MessageSquare,
  Search,
  Lock,
  FileText,
  User,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { AICounsellorPanel } from './AICounsellorPanel';
import { UniversityDiscovery } from './UniversityDiscovery';
import { ApplicationGuidance } from './ApplicationGuidance';
import { motion, AnimatePresence } from 'motion/react';

const STAGES = [
  { id: 'profile-building', label: 'Profile' },
  { id: 'discover-universities', label: 'Discovery' },
  { id: 'finalize-universities', label: 'Shortlisting' },
  { id: 'prepare-applications', label: 'Applications' },
] as const;

export function Dashboard() {
  const { userProfile, currentStage, todoItems, toggleTodo, universities, setCurrentView, logout } = useApp();
  const [showAICounsellor, setShowAICounsellor] = useState(false);
  const [dashboardView, setDashboardView] = useState<'overview' | 'discovery' | 'applications' | 'shortlist'>('overview');

  const lockedUniversities = universities.filter(u => u.isLocked);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in-progress': return <Loader className="w-5 h-5 text-indigo-500 animate-spin" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  if (dashboardView === 'discovery') return <UniversityDiscovery onBack={() => setDashboardView('overview')} />;
  if (dashboardView === 'applications') return <ApplicationGuidance onBack={() => setDashboardView('overview')} />;
  if (dashboardView === 'shortlist') return <UniversityDiscovery onBack={() => setDashboardView('overview')} showShortlistedOnly={true} />;

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900 overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-400/20 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-400/20 blur-[120px]"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-6 max-w-7xl">

        {/* Navbar */}
        <header className="flex justify-between items-center mb-10 glass-panel p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              AI Counsellor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAICounsellor(!showAICounsellor)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </Button>
            <div
              onClick={logout}
              className="w-10 h-10 rounded-full bg-slate-200 cursor-pointer overflow-hidden border-2 border-white shadow-sm flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <User className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </header>

        {/* Hero / Timeline Section */}
        <section className="mb-12">
          <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <GraduationCap className="w-64 h-64 text-indigo-900" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Plan your study-abroad journey
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Get personalized, step-by-step guidance to find and apply to your dream universities abroad.
              </p>

              {/* Stage Tracker */}
              <div className="flex items-center justify-between relative max-w-3xl">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-1000"
                  style={{ width: `${(STAGES.findIndex(s => s.id === currentStage) / (STAGES.length - 1)) * 100}%` }}
                ></div>

                {STAGES.map((stage, idx) => {
                  const isCompleted = STAGES.findIndex(s => s.id === currentStage) > idx;
                  const isCurrent = stage.id === currentStage;

                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-3">
                      <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-500
                                        ${isCompleted || isCurrent ? 'bg-indigo-600 text-white scale-110' : 'bg-white text-slate-400'}
                                    `}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{idx + 1}</span>}
                      </div>
                      <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {stage.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <button
          onClick={() => setDashboardView('discovery')}
          className="w-full mb-8"
        >
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all group cursor-pointer text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800">Discover Universities</h3>
                <p className="text-slate-500 text-sm">Find and apply to your dream universities</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <User className="w-4 h-4" />
            </div>
          </div>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Snapshot */}
          <div className="md:col-span-1">
            <div className="glass-card p-6 rounded-2xl h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800">Profile Snapshot</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('onboarding')}>
                  <Edit className="w-4 h-4 text-slate-400" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Degree</p>
                    <p className="font-medium text-slate-800">{userProfile?.degree || 'N/A'}</p>
                    <p className="text-sm text-slate-500">GPA: {userProfile?.gpa}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Target Intake</p>
                    <p className="font-medium text-slate-800">{userProfile?.targetIntake || '2026'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Countries</p>
                    <p className="font-medium text-slate-800">
                      {userProfile?.countries.join(', ') || 'Global'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* University Recommendations / Shortlist */}
          <div className="md:col-span-1">
            <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-4">University Watchlist</h3>

              <div className="flex-1 space-y-3">
                {lockedUniversities.length > 0 ? lockedUniversities.map(uni => (
                  <div key={uni.id} className="p-3 bg-white/50 rounded-xl border border-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {uni.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800 truncate">{uni.name}</p>
                      <p className="text-xs text-slate-500">{uni.country}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Locked</Badge>
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No universities locked yet.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <Button onClick={() => setDashboardView('shortlist')} variant="outline" className="flex-1 text-xs">
                  View Shortlist
                </Button>
                <Button onClick={() => setDashboardView('applications')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  App Guide
                </Button>
              </div>
            </div>
          </div>

          {/* AI Action Items (To Do) */}
          <div className="md:col-span-1">
            <div className="glass-card p-6 rounded-2xl h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">To Do List</h3>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600">AI Generated</Badge>
              </div>

              <div className="space-y-3">
                {todoItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-start gap-3 group">
                    <button
                      onClick={() => toggleTodo(item.id)}
                      className="mt-0.5 text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      {getStatusIcon(item.status)}
                    </button>
                    <span className={`text-sm text-slate-600 transition-all ${item.status === 'done' ? 'line-through opacity-50' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-xs text-indigo-600 font-medium hover:underline text-center">
                View all tasks
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* AI Panel Overlay */}
      <AnimatePresence>
        {showAICounsellor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
          >
            <div className="w-full max-w-2xl h-[80vh] bg-white rounded-3xl shadow-2xl relative overflow-hidden">
              <AICounsellorPanel onClose={() => setShowAICounsellor(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
