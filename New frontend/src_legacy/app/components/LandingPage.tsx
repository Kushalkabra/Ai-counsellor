import React from 'react';
import { Button } from '@/app/components/ui/button';
import { GraduationCap, Target, Map, Sparkles } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { motion } from 'motion/react';

export function LandingPage() {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-indigo-200/50 text-indigo-700 px-4 py-2 rounded-full mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI-Powered Study Abroad Platform</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl mb-6 text-slate-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Plan your study-abroad journey with a guided AI counsellor.
          </motion.h1>

          <motion.p
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Get step-by-step guidance, university matches, and application clarity — all in one place.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl shadow-indigo-500/30"
                onClick={() => setCurrentView('signup')}
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 bg-white/60 backdrop-blur-sm px-8 py-6 text-lg rounded-xl shadow-lg hover:bg-white/80"
                onClick={() => setCurrentView('login')}
              >
                Login
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <GraduationCap className="w-7 h-7 text-indigo-600" />
              </motion.div>
              <h3 className="text-xl mb-3 text-slate-900">Profile-based guidance</h3>
              <p className="text-slate-600 leading-relaxed">
                AI analyzes your academic background, goals, and preferences to provide personalized recommendations.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Target className="w-7 h-7 text-purple-600" />
              </motion.div>
              <h3 className="text-xl mb-3 text-slate-900">AI-powered university matching</h3>
              <p className="text-slate-600 leading-relaxed">
                Get matched with universities that fit your profile, categorized as Dream, Target, and Safe options.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Map className="w-7 h-7 text-blue-600" />
              </motion.div>
              <h3 className="text-xl mb-3 text-slate-900">Stage-based application roadmap</h3>
              <p className="text-slate-600 leading-relaxed">
                Follow a structured journey from profile building to application submission with clear milestones.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}