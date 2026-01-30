import { GraduationCap, MapPin, Calendar, DollarSign, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export const ProfileSnapshot = () => {
  const { userProfile } = useApp();

  const profileItems = userProfile ? [
    {
      icon: GraduationCap,
      label: "Education",
      value: userProfile.degree,
      subValue: `GPA: ${userProfile.gpa}`,
    },
    {
      icon: MapPin,
      label: "Target Countries",
      tags: userProfile.countries,
    },
    {
      icon: Calendar,
      label: "Target Intake",
      value: userProfile.targetIntake,
    },
    {
      icon: DollarSign,
      label: "Budget Range",
      value: userProfile.budgetRange,
    },
    {
      icon: Award,
      label: "Exam Scores",
      value: userProfile.ieltsScore || userProfile.greScore
        ? `${userProfile.ieltsScore ? `IELTS: ${userProfile.ieltsScore}` : ''}${userProfile.ieltsScore && userProfile.greScore ? ' | ' : ''}${userProfile.greScore ? `GRE: ${userProfile.greScore}` : ''}`
        : "Not provided",
    },
  ] : [];

  if (!userProfile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -2, boxShadow: "var(--shadow-lg)" }}
      className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 transition-shadow"
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-4"
      >
        Your Profile
      </motion.h3>

      <div className="flex items-center justify-between gap-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 flex-1"
        >
          {profileItems.map((item, index) => (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
              >
                <item.icon className="h-4 w-4 text-primary" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {item.value && (
                  <p className="font-medium text-foreground">{item.value}</p>
                )}
                {item.subValue && (
                  <p className="text-sm text-muted-foreground">{item.subValue}</p>
                )}
                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.tags.map((tag, tagIndex) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + tagIndex * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="px-2.5 py-0.5 bg-accent rounded-full text-xs font-medium text-accent-foreground cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="hidden md:block w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 flex-shrink-0"
        >
          <motion.img
            src="/assets/illustrations/profile_dashboard.svg"
            alt=""
            className="w-full h-full object-contain"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
