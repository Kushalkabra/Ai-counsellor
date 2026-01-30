import { Bell, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { StageProgress } from "@/components/dashboard/StageProgress";
import { ProfileSnapshot } from "@/components/dashboard/ProfileSnapshot";
import { ProfileStrength } from "@/components/dashboard/ProfileStrength";
import { AICounsellorPanel } from "@/components/dashboard/AICounsellorPanel";
import { ShortlistSummary } from "@/components/dashboard/ShortlistSummary";
import { ApplicationsSummary } from "@/components/dashboard/ApplicationsSummary";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8"
        >
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
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-foreground"
              >
                Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                Welcome back! Let's continue your journey.
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"
                />
              </Button>
            </motion.div>
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
          </motion.div>
        </motion.header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Stage Progress */}
          <StageProgress />

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ProfileSnapshot />
              <ProfileStrength />
              <ShortlistSummary />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AICounsellorPanel />
              <ApplicationsSummary />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
