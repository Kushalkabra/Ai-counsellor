import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Star,
  Lock,
  AlertCircle,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

interface UniversityDiscoveryProps {
  onBack: () => void;
  showShortlistedOnly?: boolean;
}

export function UniversityDiscovery({ onBack, showShortlistedOnly = false }: UniversityDiscoveryProps) {
  const { universities, shortlistUniversity, lockUniversity } = useApp();
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);

  const displayedUniversities = showShortlistedOnly
    ? universities.filter((u: any) => u.isShortlisted)
    : universities;
  const [lockingUniversity, setLockingUniversity] = useState<string | null>(null);

  const handleLockClick = (id: string) => {
    setLockingUniversity(id);
  };

  const confirmLock = () => {
    if (lockingUniversity) {
      lockUniversity(lockingUniversity);
      setLockingUniversity(null);
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Dream': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'Target': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Safe': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getCostColor = (costLevel: string) => {
    switch (costLevel) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getChanceColor = (acceptanceChance: string) => {
    switch (acceptanceChance) {
      case 'High': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900 overflow-hidden">
      {/* Aurora Background - Consistent with Dashboard */}
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

      {/* Header */}
      <motion.div
        className="glass-panel sticky top-4 z-40 mx-4 lg:mx-8 mt-4 rounded-2xl shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-slate-100/50 rounded-xl -ml-2">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {showShortlistedOnly ? 'Shortlisted Universities' : 'Discover Universities'}
              </h1>
              <p className="text-sm text-slate-500">
                {showShortlistedOnly ? 'Your curated list of favorites' : 'AI-matched options based on your profile'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 bg-white/50 border-slate-200">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Universities Grid */}
      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedUniversities.map((university, index) => (
            <motion.div
              key={university.id}
              className={`glass-card rounded-2xl p-0 overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ${university.isLocked ? 'ring-2 ring-indigo-500 shadow-indigo-200' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-6 relative">
                {/* Top Badge */}
                <div className="absolute top-6 right-6">
                  <Badge variant="outline" className={getTagColor(university.tag)}>
                    {university.tag}
                  </Badge>
                </div>

                {/* University Info */}
                <div className="mb-6 pr-16">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{university.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {university.country}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cost</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className={`${getCostColor(university.costLevel)} border-0 px-1.5 py-0`}>
                        <DollarSign className="w-3 h-3" />
                        {university.costLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Chance</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className={`${getChanceColor(university.acceptanceChance)} border-0 px-1.5 py-0`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {university.acceptanceChance}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Expandable "Why Fits" */}
                <div className="space-y-3">
                  <motion.button
                    onClick={() => setExpandedUniversity(expandedUniversity === university.id ? null : university.id)}
                    className="w-full flex items-center justify-between py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <span>AI Analysis</span>
                    {expandedUniversity === university.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </motion.button>

                  <AnimatePresence>
                    {expandedUniversity === university.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pb-2">
                          <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                            <div className="flex gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-emerald-900 leading-relaxed">{university.whyFits}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                            <div className="flex gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-900 leading-relaxed">{university.risks}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                {!university.isLocked ? (
                  <>
                    <Button
                      variant={university.isShortlisted ? "secondary" : "outline"}
                      size="sm"
                      className={`flex-1 ${university.isShortlisted ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-white hover:bg-slate-50'}`}
                      onClick={() => shortlistUniversity(university.id)}
                    >
                      <Star className={`w-4 h-4 mr-2 ${university.isShortlisted ? 'fill-amber-600 text-amber-600' : ''}`} />
                      {university.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </Button>

                    {university.isShortlisted && (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                          onClick={() => handleLockClick(university.id)}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Lock
                        </Button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="w-full py-1.5 flex items-center justify-center gap-2 text-indigo-700 font-medium bg-indigo-50 rounded-lg">
                    <Lock className="w-4 h-4" /> Locked for Application
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lock Confirmation Dialog */}
      <Dialog open={!!lockingUniversity} onOpenChange={() => setLockingUniversity(null)}>
        <DialogContent className="max-w-md glass-card border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              Lock This University?
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-5 mb-4">
                <h4 className="font-semibold text-indigo-900 mb-2">What happens next:</h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-600" /> Unlocks step-by-step application guide</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-600" /> Creates personalized admission timeline</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-600" /> Generates document checklist</li>
                </ul>
              </div>
              <p className="text-slate-600 text-sm">
                You can unlock this university later if you change your mind.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setLockingUniversity(null)}
              className="flex-1 border-slate-200"
            >
              Cancel
            </Button>
            <Button onClick={confirmLock} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              Confirm Lock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
