import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    GraduationCap,
    ArrowRight,
    ArrowLeft,
    Check,
    MapPin,
    DollarSign,
    BookOpen,
    Calendar,
    Star,
    Loader2,
    Bot,
    MessageSquare,
    Sparkles,
    Send,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingAPI } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import onboarding1 from "@/assets/onboarding-1.svg";
import onboarding2 from "@/assets/onboarding-2.svg";
import aiIllustration from "@/assets/ai-counsellor.svg";
import choiceIllustration from "@/assets/onboarding-choice.svg";
import aiOnboardingBg from "@/assets/ai-onboarding-bg.svg";

const AI_QUESTIONS = [
    { field: "current_education_level", question: "Hello! I'm your AI counsellor. Let's build your profile together. What's your current education level?", type: "select", options: ["High School", "Bachelor's Degree", "Master's Degree"] },
    { field: "degree_major", question: "Great! And what was your major or field of study?", type: "text" },
    { field: "gpa", question: "What's your current GPA or percentage? (e.g. 3.8 or 85)", type: "number" },
    { field: "preferred_countries", question: "Which countries are you most interested in studying in? You can name a few like USA, UK, or Canada.", type: "text" },
    { field: "intended_degree", question: "What level of degree are you aiming for next?", type: "select", options: ["Bachelor's", "Master's", "MBA", "PhD"] },
    { field: "field_of_study", question: "And what specific field do you want to specialize in?", type: "text" },
    { field: "target_intake_year", question: "Which year are you planning to start your studies? (e.g. 2025)", type: "number" },
    { field: "budget_per_year", question: "What's your estimated annual tuition budget in USD?", type: "number" },
    { field: "ielts_toefl_status", question: "Have you taken any English proficiency tests like IELTS or TOEFL?", type: "select", options: ["Not started", "In progress", "Completed"] },
    { field: "ielts_toefl_score", question: "What was your IELTS or TOEFL score?", type: "number", condition: (data: any) => data.ielts_toefl_status === "Completed" },
    { field: "gre_gmat_status", question: "What about GRE or GMAT?", type: "select", options: ["Not started", "In progress", "Completed"] },
    { field: "gre_gmat_score", question: "What was your GRE or GMAT score?", type: "number", condition: (data: any) => data.gre_gmat_status === "Completed" },
];

const OnboardingPage = () => {
    const [onboardingMode, setOnboardingMode] = useState<'select' | 'manual' | 'ai'>('select');
    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const navigate = useNavigate();
    const { loadUserData } = useApp();
    const [loading, setLoading] = useState(false);

    // AI Led State
    const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
    const [currentAiQuestion, setCurrentAiQuestion] = useState(0);
    const [aiInput, setAiInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isAIFinished, setIsAIFinished] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        current_education_level: "",
        degree_major: "",
        graduation_year: new Date().getFullYear(),
        gpa: "",
        intended_degree: "Master's",
        field_of_study: "",
        target_intake_year: 2025,
        preferred_countries: [] as string[],
        budget_per_year: "",
        funding_plan: "Self-funded",
        ielts_toefl_status: "Not started",
        ielts_toefl_score: "",
        gre_gmat_status: "Not started",
        gre_gmat_score: "",
        sop_status: "Not started"
    });

    const normalizeCountryName = (c: string) => {
        const trimmed = c.trim();
        if (trimmed.toLowerCase() === 'usa') return 'USA';
        if (trimmed.toLowerCase() === 'uk') return 'UK';
        return trimmed.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const handleAiSend = (overrideValue?: string) => {
        const val = overrideValue || aiInput;
        if (!val.trim() && !overrideValue) return;

        // Add user message to UI
        setChatMessages(prev => [...prev, { role: 'user', content: val }]);
        setAiInput("");

        const question = AI_QUESTIONS[currentAiQuestion];
        let updatedData: any = {};
        setFormData(prev => {
            const updated = { ...prev };
            if (question.field === 'preferred_countries') {
                updated.preferred_countries = val.split(',').map(c => normalizeCountryName(c));
            } else {
                (updated as any)[question.field] = question.type === 'number' ? parseFloat(val) : val;
            }
            updatedData = updated;
            return updated;
        });

        setIsTyping(true);

        // Simulate AI thinking and move to next question
        setTimeout(() => {
            setIsTyping(false);

            let nextIndex = currentAiQuestion + 1;
            while (nextIndex < AI_QUESTIONS.length) {
                const q = AI_QUESTIONS[nextIndex];
                if (!q.condition || q.condition(updatedData)) {
                    break;
                }
                nextIndex++;
            }

            if (nextIndex < AI_QUESTIONS.length) {
                setCurrentAiQuestion(nextIndex);
                setChatMessages(prev => [...prev, { role: 'ai', content: AI_QUESTIONS[nextIndex].question }]);
            } else {
                setIsAIFinished(true);
                setChatMessages(prev => [...prev, {
                    role: 'ai',
                    content: "Excellent! I've collected all the information I need to build your profile. Click 'Finish Setup' below to enter your dashboard!"
                }]);
            }
        }, 800);
    };

    useEffect(() => {
        if (onboardingMode === 'ai' && chatMessages.length === 0) {
            setChatMessages([{ role: 'ai', content: AI_QUESTIONS[0].question }]);
        }
    }, [onboardingMode]);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages, isTyping]);

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleCountryToggle = (country: string) => {
        setFormData(prev => ({
            ...prev,
            preferred_countries: prev.preferred_countries.includes(country)
                ? prev.preferred_countries.filter(c => c !== country)
                : [...prev.preferred_countries, country]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                gpa: parseFloat(formData.gpa) || 0,
                budget_per_year: parseFloat(formData.budget_per_year) || 0,
                ielts_toefl_score: parseFloat(formData.ielts_toefl_score) || null,
                gre_gmat_score: parseFloat(formData.gre_gmat_score) || null,
                preferred_countries: formData.preferred_countries.join(',')
            };
            await onboardingAPI.create(payload);
            toast.success("Profile completed! Redirecting to dashboard...");
            await loadUserData(); // Refresh context
            navigate("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
            {/* Aurora Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"
                />
            </div>

            <header className="relative z-10 p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                    >
                        <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <span className="text-xl font-bold tracking-tight">AI Counsellor</span>
                </div>
                {onboardingMode === 'manual' && (
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mr-2">
                        Step {step} of {totalSteps}
                    </div>
                )}
                {onboardingMode === 'ai' && (
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mr-2">
                        {Math.round((currentAiQuestion / (AI_QUESTIONS.length - 1)) * 100)}% Complete
                    </div>
                )}
            </header>

            <main className="flex-1 relative z-10 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    {onboardingMode === 'select' ? (
                        <motion.div
                            key="select-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl grid md:grid-cols-2 gap-6"
                        >
                            <div className="md:col-span-2 text-center mb-6">
                                <h1 className="text-4xl font-bold text-foreground mb-4 font-bungee">Choose Your Journey</h1>
                                <p className="text-muted-foreground text-lg mb-8">How would you like to set up your profile?</p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex justify-center mb-10"
                                >
                                    <img
                                        src={choiceIllustration}
                                        alt="Choose Your Journey"
                                        className="h-48 md:h-64 h-auto drop-shadow-2xl"
                                    />
                                </motion.div>
                            </div>

                            {/* AI Mode Card */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="glass rounded-[2rem] p-8 cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all group"
                                onClick={() => setOnboardingMode('ai')}
                            >
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Sparkles className="h-8 w-8 text-primary group-hover:text-inherit" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">AI-Led Setup</h3>
                                <p className="text-muted-foreground mb-6">Chat with our AI counsellor to build your profile naturally. Fast, easy, and personalized.</p>
                                <Button variant="gradient" className="w-full h-12 rounded-xl">
                                    Start AI Journey
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>

                            {/* Manual Mode Card */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="glass rounded-[2rem] p-8 cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all group"
                                onClick={() => setOnboardingMode('manual')}
                            >
                                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <MessageSquare className="h-8 w-8 text-muted-foreground group-hover:text-inherit" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Manual Setup</h3>
                                <p className="text-muted-foreground mb-6">Complete a structured form at your own pace. Best if you have all your details ready.</p>
                                <Button variant="outline" className="w-full h-12 rounded-xl">
                                    Use Manual Form
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : onboardingMode === 'ai' ? (
                        <motion.div
                            key="ai-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center"
                        >
                            {/* Illustration Side */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="hidden lg:flex flex-col items-center text-center space-y-8"
                            >
                                <img src={aiOnboardingBg} alt="AI Representation" className="w-full max-w-md drop-shadow-2xl" />
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold font-bungee text-primary">Let's talk!</h2>
                                    <p className="text-xl text-muted-foreground max-w-sm">I'll help you set up everything in just a few minutes of conversation.</p>
                                </div>
                            </motion.div>

                            {/* Chat Box Side */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-full glass rounded-[2rem] h-[650px] flex flex-col shadow-dramatic relative overflow-hidden"
                            >
                                {/* Chat Header */}
                                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-background/20 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Bot className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">AI Onboarding</h3>
                                            <p className="text-xs text-muted-foreground">Ask me anything as we go</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setOnboardingMode('select')} className="text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Change Mode
                                    </Button>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 relative" ref={chatScrollRef}>
                                    <AnimatePresence initial={false}>
                                        {chatMessages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-primary/10 text-primary' : 'bg-primary text-primary-foreground'}`}>
                                                        {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                                    </div>
                                                    <div className={`p-4 rounded-2xl whitespace-pre-line ${msg.role === 'user'
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10'
                                                        : 'bg-card border border-border/40 text-foreground rounded-tl-none shadow-sm'
                                                        }`}>
                                                        <p className="text-sm">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isTyping && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Bot className="h-4 w-4" />
                                                </div>
                                                <div className="bg-card border border-border/40 text-foreground rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Chat Input / Controls */}
                                <div className="p-6 bg-background/20 backdrop-blur-md border-t border-border/50">
                                    {AI_QUESTIONS[currentAiQuestion]?.options ? (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {AI_QUESTIONS[currentAiQuestion].options?.map(opt => (
                                                <Button
                                                    key={opt}
                                                    variant="outline"
                                                    className="rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all"
                                                    onClick={() => handleAiSend(opt)}
                                                >
                                                    {opt}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : null}

                                    {isAIFinished && !isTyping ? (
                                        <Button variant="gradient" className="w-full h-12 rounded-xl shadow-lg border-2 border-primary/20 animate-pulse" onClick={handleSubmit} disabled={loading}>
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Finish Setup & Enter Dashboard"}
                                            {!loading && <Check className="ml-2 h-5 w-5" />}
                                        </Button>
                                    ) : (
                                        <div className="relative">
                                            <Input
                                                placeholder="Type your answer..."
                                                value={aiInput}
                                                onChange={(e) => setAiInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                                                className="pr-12 h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                disabled={isTyping}
                                            />
                                            <Button
                                                size="icon"
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
                                                onClick={() => handleAiSend()}
                                                disabled={isTyping || !aiInput.trim()}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manual-mode"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-2xl glass rounded-[2rem] p-8 md:p-12 shadow-dramatic relative overflow-hidden"
                        >
                            {/* Progress Dots */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-primary" : "w-1.5 bg-muted"
                                            }`}
                                    />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                        <div className="flex justify-center mb-8">
                                            <motion.img
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                src={onboarding1}
                                                alt="Welcome"
                                                className="h-32 md:h-40 w-auto drop-shadow-2xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-foreground text-center">Let's build your profile</h2>
                                            <p className="text-muted-foreground text-lg text-center">Tell us about your current academic standing.</p>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Current Education Level</label>
                                                <select
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none text-foreground"
                                                    value={formData.current_education_level}
                                                    onChange={(e) => setFormData({ ...formData, current_education_level: e.target.value })}
                                                >
                                                    <option value="" disabled>Select your level</option>
                                                    <option value="High School">High School</option>
                                                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                                                    <option value="Master's Degree">Master's Degree</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-foreground">Current GPA / %</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        placeholder="3.80"
                                                        className="bg-background border-border"
                                                        value={formData.gpa}
                                                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-foreground">Degree Major</label>
                                                    <Input
                                                        placeholder="e.g. Computer Science & Engineering"
                                                        className="bg-background border-border"
                                                        value={formData.degree_major}
                                                        onChange={(e) => setFormData({ ...formData, degree_major: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                        <div className="flex justify-center mb-8">
                                            <img src={onboarding1} alt="Destination" className="h-32 md:h-40 w-auto drop-shadow-2xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-foreground text-center">Where do you want to go?</h2>
                                            <p className="text-muted-foreground text-lg text-center">Select your preferred destination countries.</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                                            {["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Ireland"].map(country => (
                                                <button
                                                    key={country}
                                                    onClick={() => handleCountryToggle(country)}
                                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.preferred_countries.includes(country)
                                                        ? "bg-primary/10 border-primary shadow-sm"
                                                        : "bg-background border-border hover:border-primary/30"
                                                        }`}
                                                >
                                                    <MapPin className={`h-5 w-5 ${formData.preferred_countries.includes(country) ? "text-primary" : "text-muted-foreground"}`} />
                                                    <span className={`font-medium ${formData.preferred_countries.includes(country) ? "text-primary" : "text-foreground"}`}>{country}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                        <div className="flex justify-center mb-8">
                                            <img src={onboarding1} alt="Goals" className="h-32 md:h-40 w-auto drop-shadow-2xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-foreground text-center">Your Study Goals</h2>
                                            <p className="text-muted-foreground text-lg text-center">Define what and when you want to study.</p>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Intended Degree</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {["Bachelor's", "Master's", "MBA", "PhD"].map(deg => (
                                                        <button
                                                            key={deg}
                                                            onClick={() => setFormData({ ...formData, intended_degree: deg })}
                                                            className={`py-3 rounded-xl border text-sm font-medium transition-all ${formData.intended_degree === deg
                                                                ? "bg-primary text-primary-foreground border-primary shadow-md"
                                                                : "bg-background border-border hover:border-primary/30"
                                                                }`}
                                                        >
                                                            {deg}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Field of Study</label>
                                                <Input
                                                    placeholder="e.g. MSc in Advanced Computing"
                                                    className="bg-background border-border"
                                                    value={formData.field_of_study}
                                                    onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Target Intake Year</label>
                                                <select
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none text-foreground"
                                                    value={formData.target_intake_year}
                                                    onChange={(e) => setFormData({ ...formData, target_intake_year: parseInt(e.target.value) })}
                                                >
                                                    {[2024, 2025, 2026, 2027].map(yr => <option key={yr} value={yr}>{yr}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                        <div className="flex justify-center mb-8">
                                            <motion.img
                                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                src={onboarding2}
                                                alt="Nearly Done"
                                                className="h-32 md:h-40 w-auto drop-shadow-2xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-foreground text-center">Almost there!</h2>
                                            <p className="text-muted-foreground text-lg text-center">Budget and exam readiness.</p>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Annual Tuition Budget (USD)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="25000"
                                                        className="bg-background border-border pl-11"
                                                        value={formData.budget_per_year}
                                                        onChange={(e) => setFormData({ ...formData, budget_per_year: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-foreground">IELTS/TOEFL Status</label>
                                                        <select
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none text-foreground"
                                                            value={formData.ielts_toefl_status}
                                                            onChange={(e) => setFormData({ ...formData, ielts_toefl_status: e.target.value })}
                                                        >
                                                            {["Not started", "In progress", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    {formData.ielts_toefl_status === "Completed" && (
                                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                                            <label className="block text-sm font-medium mb-2 text-foreground">Score</label>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="e.g. 7.5"
                                                                className="bg-background border-border"
                                                                value={formData.ielts_toefl_score}
                                                                onChange={(e) => setFormData({ ...formData, ielts_toefl_score: e.target.value })}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2 text-foreground">GRE/GMAT Status</label>
                                                        <select
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none text-foreground"
                                                            value={formData.gre_gmat_status}
                                                            onChange={(e) => setFormData({ ...formData, gre_gmat_status: e.target.value })}
                                                        >
                                                            {["Not started", "In progress", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    {formData.gre_gmat_status === "Completed" && (
                                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                                            <label className="block text-sm font-medium mb-2 text-foreground">Score</label>
                                                            <Input
                                                                type="number"
                                                                placeholder="e.g. 320"
                                                                className="bg-background border-border"
                                                                value={formData.gre_gmat_score}
                                                                onChange={(e) => setFormData({ ...formData, gre_gmat_score: e.target.value })}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex gap-4">
                                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                    <Star className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-primary">AI Match Insight</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Providing this info helps our AI counsellor suggest the most realistic matches for your profile.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons for Manual Mode */}
                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
                                <Button
                                    variant="ghost"
                                    onClick={() => step === 1 ? setOnboardingMode('select') : prevStep()}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {step === 1 ? "Change Mode" : "Back"}
                                </Button>

                                {step < totalSteps ? (
                                    <Button
                                        variant="gradient"
                                        onClick={nextStep}
                                        disabled={step === 1 && !formData.current_education_level}
                                        className="px-8 shadow-md hover:shadow-lg"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="gradient"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-10 shadow-md hover:shadow-lg"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <>
                                                Finish Setup
                                                <Check className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default OnboardingPage;
