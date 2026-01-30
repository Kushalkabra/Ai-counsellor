import { User, Search, Map } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: User,
    title: "Profile-Based Guidance",
    description: "Build a comprehensive profile with your academic background, test scores, and preferences. Our AI understands your unique journey.",
  },
  {
    icon: Search,
    title: "AI University Matching",
    description: "Discover universities that match your profile, budget, and aspirations. Get personalized Dream, Target, and Safe recommendations.",
  },
  {
    icon: Map,
    title: "Stage-Based Roadmap",
    description: "Follow a clear, structured path from profile building to application submission. Never miss a deadline or requirement.",
  },
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

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};

export const Features = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything you need for your{" "}
            <span className="text-gradient">study abroad journey</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered platform guides you through every step, making the complex simple.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-card rounded-2xl p-8 card-elevated border border-border/50"
            >
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6"
              >
                <feature.icon className="h-7 w-7" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle gradient on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
