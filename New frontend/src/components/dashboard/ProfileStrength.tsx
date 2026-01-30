import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

const statusStyles = {
  strong: "bg-success-muted text-success border-success/20",
  average: "bg-warning-muted text-warning border-warning/20",
  weak: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels = {
  strong: "Strong",
  average: "Average",
  weak: "Needs Work",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const ProfileStrength = () => {
  const { userProfile } = useApp();

  const metrics = [
    {
      label: "Academic Profile",
      status: userProfile?.academicStrength || "average"
    },
    {
      label: "Test Scores",
      status: userProfile?.examStatus === "done" ? "strong" : userProfile?.examStatus === "in-progress" ? "average" : "weak"
    },
    {
      label: "Application Documents",
      status: userProfile?.sopStatus === "ready" ? "strong" : userProfile?.sopStatus === "draft" ? "average" : "weak"
    },
    {
      label: "University Selection",
      status: (userProfile?.countries.length || 0) > 0 ? "strong" : "weak"
    },
    {
      label: "Target Specifications",
      status: (userProfile?.degree && userProfile?.targetIntake) ? "strong" : "average"
    },
  ];

  const strongCount = metrics.filter(m => m.status === "strong").length;
  const averageCount = metrics.filter(m => m.status === "average").length;
  // Calculate percentage: strong = 20%, average = 10%
  const percentage = Math.round(((strongCount * 1) + (averageCount * 0.5)) / metrics.length * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-lg)" }}
      className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-foreground"
        >
          Profile Strength
        </motion.h3>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
          className="text-2xl font-bold text-primary"
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-success rounded-full"
        />
      </div>

      {/* Metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between cursor-default"
          >
            <span className="text-sm text-foreground">{metric.label}</span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                statusStyles[metric.status]
              )}
            >
              {statusLabels[metric.status]}
            </motion.span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
