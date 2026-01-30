import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

const STAGE_MAPPING = {
  'profile-building': 1,
  'discover-universities': 2,
  'finalize-universities': 3,
  'prepare-applications': 4
};

const STAGE_NAMES = [
  { id: 1, name: "Profile Building" },
  { id: 2, name: "Discover Universities" },
  { id: 3, name: "Finalize Universities" },
  { id: 4, name: "Prepare Applications" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const StageProgress = () => {
  const { currentStage } = useApp();
  const currentStageId = STAGE_MAPPING[currentStage] || 1;

  const stages = STAGE_NAMES.map(s => ({
    ...s,
    completed: s.id < currentStageId,
    current: s.id === currentStageId
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 mb-8"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar"
      >
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            variants={itemVariants}
            className="flex items-center flex-1"
          >
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all cursor-pointer",
                  stage.completed
                    ? "bg-success text-success-foreground shadow-glow-success"
                    : stage.current
                      ? "bg-primary text-primary-foreground shadow-glow step-active"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {stage.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  stage.id
                )}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[100px]",
                  stage.completed
                    ? "text-success"
                    : stage.current
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                {stage.name}
              </span>
            </div>

            {/* Connector line */}
            {index < stages.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                style={{ originX: 0 }}
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  stage.completed ? "bg-success" : "bg-border"
                )}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
