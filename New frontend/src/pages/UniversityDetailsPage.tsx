import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    DollarSign,
    TrendingUp,
    Star,
    GraduationCap,
    Calendar,
    Users,
    Award,
    BookOpen,
    Globe,
    CheckCircle2,
    Sparkles,
    Building2,
    Clock,
    FileText,
    Loader2,
} from "lucide-react";
import { universityAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const categoryStyles = {
    dream: { bg: "bg-primary/10", text: "text-primary", label: "Dream School" },
    target: { bg: "bg-warning-muted", text: "text-warning", label: "Target School" },
    safe: { bg: "bg-success-muted", text: "text-success", label: "Safe School" },
};

const statusStyles = {
    met: { bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
    partial: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
    pending: { bg: "bg-muted", text: "text-muted-foreground", icon: FileText },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const UniversityDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { shortlistUniversity, universities } = useApp();
    const [university, setUniversity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isShortlisted = universities.some(u => u.id.toString() === id?.toString() && u.isShortlisted);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await universityAPI.getDetails(id);
                setUniversity(res.data);
            } catch (err) {
                console.error("Failed to fetch university details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 text-center"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-t-2 border-primary"
                        />
                        <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">AI Analyzing University...</h2>
                        <p className="text-muted-foreground max-w-sm">
                            We're processing admission data and matching it to your personal profile.
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!university) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground">University not found</p>
                <Button variant="link" onClick={() => navigate("/discover")}>Back to Discover</Button>
            </div>
        );
    }

    const categoryKey = (university.personal_match_analysis.status.toLowerCase() as keyof typeof categoryStyles) || "target";
    const categoryStyle = categoryStyles[categoryKey];

    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />

            <main className="lg:pl-64 min-h-screen pb-20">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative h-80 overflow-hidden"
                >
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070')] bg-cover bg-center mix-blend-overlay opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-6 left-6"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/discover")}
                            className="gap-2 backdrop-blur-md bg-background/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Discover
                        </Button>
                    </motion.div>

                    {/* University info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div>
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3",
                                        categoryStyle.bg,
                                        categoryStyle.text
                                    )}
                                >
                                    {categoryStyle.label}
                                </motion.span>
                                <h1 className="text-4xl font-bold text-foreground mb-2">{university.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {university.city}, {university.country}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Award className="h-4 w-4 text-primary" />
                                        #{university.ranking} World Ranking
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        variant={isShortlisted ? "secondary" : "outline"}
                                        size="lg"
                                        className="gap-2 min-w-[140px]"
                                        onClick={() => shortlistUniversity(id!)}
                                    >
                                        <Star className={cn("h-4 w-4", isShortlisted && "fill-current")} />
                                        {isShortlisted ? "Shortlisted" : "Shortlist"}
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="default" size="lg" className="gap-2 shadow-lg shadow-primary/20" onClick={() => navigate("/applications")}>
                                        <GraduationCap className="h-4 w-4" />
                                        Start Application
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-4 lg:p-8"
                >
                    {/* Quick Stats */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: DollarSign, label: "Tuition", value: university.tuition_display },
                            { icon: TrendingUp, label: "Your Chance", value: university.personal_match_analysis.chance },
                            { icon: Users, label: "Students", value: university.students },
                            { icon: Calendar, label: "Founded", value: university.founded.toString() },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <stat.icon className="h-5 w-5 text-primary" />
                                    </div>
                                </div>
                                <p className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* About */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-card rounded-2xl p-6 border border-border/50"
                            >
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    About the University
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">{university.description}</p>
                            </motion.div>

                            {/* Programs */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-card rounded-2xl p-6 border border-border/50"
                            >
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    Popular Programs
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {university.programs.map((program: string, index: number) => (
                                        <motion.span
                                            key={program}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            whileHover={{ scale: 1.05 }}
                                            className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium text-foreground cursor-pointer hover:bg-primary/10 transition-colors"
                                        >
                                            {program}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Requirements */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-card rounded-2xl p-6 border border-border/50"
                            >
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Admission Requirements
                                </h2>
                                <div className="space-y-3">
                                    {university.requirements.map((req: any, index: number) => {
                                        const statusKey = req.status as keyof typeof statusStyles;
                                        const statusStyle = statusStyles[statusKey] || statusStyles.pending;
                                        const StatusIcon = statusStyle.icon;
                                        return (
                                            <motion.div
                                                key={req.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * index }}
                                                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                                            >
                                                <span className="text-foreground font-medium">{req.name}</span>
                                                <span className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                                                    statusStyle.bg,
                                                    statusStyle.text
                                                )}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {req.status === "met" ? "Met" : req.status === "partial" ? "In Progress" : "Pending"}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Deadlines */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-card rounded-2xl p-6 border border-border/50"
                            >
                                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Application Deadlines
                                </h2>
                                <div className="space-y-3">
                                    {university.deadlines.map((deadline: any, index: number) => (
                                        <motion.div
                                            key={deadline.intake}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
                                        >
                                            <div>
                                                <p className="font-semibold text-foreground">{deadline.intake}</p>
                                                <p className="text-xs text-muted-foreground">Admission Cycle</p>
                                            </div>
                                            <span className="text-primary font-bold">{deadline.deadline}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar - AI Insights */}
                        <div className="space-y-6">
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl p-8 border border-primary/20 relative overflow-hidden bg-card/50 backdrop-blur-xl"
                            >
                                {/* Animated background */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent rounded-full blur-2xl" />
                                </div>

                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <motion.div
                                            animate={{
                                                boxShadow: ["0 0 0 0 rgba(139, 92, 246, 0.3)", "0 0 0 10px rgba(139, 92, 246, 0)", "0 0 0 0 rgba(139, 92, 246, 0)"]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                                        >
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-foreground">AI Insights</h3>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold text-primary">Personalized for you</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 italic text-foreground text-sm leading-relaxed mb-6">
                                            "{university.personal_match_analysis.reason}"
                                        </div>

                                        {university.ai_insights.map((insight: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + 0.1 * index }}
                                                className="flex gap-3 p-4 rounded-2xl bg-background/50 border border-border/50 shadow-sm"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                                <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button variant="default" className="w-full gap-2 py-6 rounded-2xl shadow-lg shadow-primary/20" onClick={() => navigate("/dashboard")}>
                                            <Sparkles className="h-4 w-4" />
                                            Chat with AI Counsellor
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-card rounded-2xl p-6 border border-border/50"
                            >
                                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                                    Quick Links
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Globe, label: "Visit Official Website" },
                                        { icon: FileText, label: "Degree Curriculum" },
                                        { icon: Users, label: "Alumni Network" },
                                    ].map((action, index) => (
                                        <motion.div
                                            key={action.label}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-border/50 hover:bg-secondary">
                                                <action.icon className="h-4 w-4 text-primary" />
                                                {action.label}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default UniversityDetailsPage;
