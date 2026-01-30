import { UserPlus, Search, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Build Profile",
    description: "Share your academic background, test scores, and study preferences.",
  },
  {
    icon: Search,
    number: "02",
    title: "Discover Universities",
    description: "Get AI-matched university recommendations based on your profile.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Finalize Choices",
    description: "Shortlist and lock your dream, target, and safe universities.",
  },
  {
    icon: Send,
    number: "04",
    title: "Prepare Applications",
    description: "Follow guided checklists and timelines for each application.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-secondary/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to your dream university
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line - desktop only */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ originX: 0 }}
            className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-card rounded-2xl p-6 border border-border/50 card-elevated text-center relative z-10"
                >
                  {/* Step number badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 + index * 0.1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full"
                  >
                    Step {step.number}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground mb-4 mt-2"
                  >
                    <step.icon className="h-8 w-8" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
