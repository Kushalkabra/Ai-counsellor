import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

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
  hidden: { opacity: 0, x: -20 },
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

export const ActionTasks = () => {
  const { todoItems, toggleTodo } = useApp();

  const tasks = todoItems.map(t => ({
    id: t.id,
    title: t.text,
    completed: t.status === 'done'
  }));

  const completedCount = tasks.filter((t) => t.completed).length;
  const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
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
          Action Items
        </motion.h3>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-muted-foreground"
        >
          {completedCount}/{tasks.length} completed
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Tasks list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {tasks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No tasks yet.</p>
        )}
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            whileHover={{ x: 4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleTodo(task.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer",
              task.completed ? "bg-success-muted/50" : "bg-secondary/50 hover:bg-secondary"
            )}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                task.completed
                  ? "bg-success text-success-foreground"
                  : "border-2 border-muted-foreground/30"
              )}
            >
              {task.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              ) : (
                <Circle className="h-2 w-2 text-muted-foreground/30" />
              )}
            </motion.div>
            <span
              className={cn(
                "text-sm",
                task.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {task.title}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
