import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, GraduationCap, MapPin, Calendar, DollarSign, Save, Loader2, Menu, Trash2, AlertTriangle } from "lucide-react";
import { onboardingAPI, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import profileIllust from "@/assets/profile-illust.svg";

const ProfilePage = () => {
    const { userProfile, setUserProfile, logout } = useApp();
    const { toast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        degree: userProfile?.degree || "",
        gpa: userProfile?.gpa || "",
        targetIntake: userProfile?.targetIntake || "",
        countries: userProfile?.countries.join(", ") || "",
        budgetRange: userProfile?.budgetRange.replace(/[^0-9]/g, "") || "",
        academicStrength: userProfile?.academicStrength || "average",
        examStatus: userProfile?.examStatus || "not-started",
        ieltsScore: userProfile?.ieltsScore || "",
        greScore: userProfile?.greScore || "",
        sopStatus: userProfile?.sopStatus || "not-started",
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                degree: userProfile.degree,
                gpa: userProfile.gpa,
                targetIntake: userProfile.targetIntake,
                countries: userProfile.countries.join(", "),
                budgetRange: userProfile.budgetRange.replace(/[^0-9]/g, ""),
                academicStrength: userProfile.academicStrength,
                examStatus: userProfile.examStatus,
                ieltsScore: userProfile.ieltsScore || "",
                greScore: userProfile.greScore || "",
                sopStatus: userProfile.sopStatus,
            });
        }
    }, [userProfile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const apiData = {
                current_education_level: formData.degree,
                gpa: parseFloat(formData.gpa),
                target_intake_year: parseInt(formData.targetIntake),
                preferred_countries: formData.countries,
                budget_per_year: parseInt(formData.budgetRange),
                field_of_study: "General", // Keeping it consistent
                ielts_toefl_status: formData.examStatus === "done" ? "Completed" : formData.examStatus === "in-progress" ? "In progress" : "Not started",
                ielts_toefl_score: formData.ieltsScore ? parseFloat(formData.ieltsScore) : null,
                gre_gmat_status: formData.examStatus === "done" ? "Completed" : formData.examStatus === "in-progress" ? "In progress" : "Not started",
                gre_gmat_score: formData.greScore ? parseFloat(formData.greScore) : null,
                sop_status: formData.sopStatus,
            };

            const res = await onboardingAPI.create(apiData);

            // Map back to AppContext UserProfile
            setUserProfile({
                degree: res.data.current_education_level,
                gpa: res.data.gpa.toString(),
                targetIntake: res.data.target_intake_year.toString(),
                countries: res.data.preferred_countries.split(",").map((c: string) => c.trim()),
                budgetRange: `$${res.data.budget_per_year}/yr`,
                examsCompleted: [], // Preserving existing behavior
                sopStatus: res.data.sop_status,
                academicStrength: formData.academicStrength as any, // Preserving frontend logic
                examStatus: res.data.exam_status || formData.examStatus as any,
                ieltsScore: res.data.ielts_toefl_score?.toString() || "",
                greScore: res.data.gre_gmat_score?.toString() || "",
            });

            toast({
                title: "Profile Updated",
                description: "Your details have been successfully updated.",
            });
        } catch (err) {
            console.error("Failed to update profile", err);
            toast({
                title: "Update Failed",
                description: "There was an error updating your profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await authAPI.deleteAccount();
            toast({
                title: "Account Deleted",
                description: "Your account and all associated data have been permanently removed.",
            });
            // Clear state and redirect
            logout();
        } catch (err) {
            console.error("Failed to delete account", err);
            toast({
                title: "Deletion Failed",
                description: "There was an error deleting your account. Please try again later.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />

            <main className="lg:pl-64 min-h-screen flex flex-col">
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
                            <h1 className="text-xl font-semibold text-foreground">Profile Settings</h1>
                            <p className="text-sm text-muted-foreground">Manage your academic details and preferences</p>
                        </div>
                    </div>
                </motion.header>

                <div className="p-4 lg:p-8 flex-1">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="glass rounded-3xl p-6 lg:p-8 border border-border/50 relative overflow-hidden"
                        >
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <User className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">Your Information</h2>
                                        <p className="text-sm text-muted-foreground">Keep your profile up to date for better recommendations</p>
                                    </div>
                                </div>

                                {/* Profile Illustration */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-8 flex justify-center"
                                >
                                    <img
                                        src={profileIllust}
                                        alt="Profile Illustration"
                                        className="h-24 md:h-28 w-auto drop-shadow-lg"
                                    />
                                </motion.div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Academic Details */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-primary" />
                                            Academic Details
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="degree">Current Education Level</Label>
                                                <Select
                                                    value={formData.degree}
                                                    onValueChange={(val) => setFormData(f => ({ ...f, degree: val }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="High School">High School</SelectItem>
                                                        <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                                        <SelectItem value="Master's">Master's</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="gpa">Average GPA / Score</Label>
                                                <Input
                                                    id="gpa"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={formData.gpa}
                                                    onChange={(e) => setFormData(f => ({ ...f, gpa: e.target.value }))}
                                                    placeholder="3.80"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="strength">Academic Strength</Label>
                                                <Select
                                                    value={formData.academicStrength}
                                                    onValueChange={(val) => setFormData(f => ({ ...f, academicStrength: val as "weak" | "average" | "strong" }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select strength" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="strong">Strong (High Performer)</SelectItem>
                                                        <SelectItem value="average">Average (Steady)</SelectItem>
                                                        <SelectItem value="weak">Needs Improvement</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preferences */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            Study Preferences
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="countries">Target Countries (comma separated)</Label>
                                                <Input
                                                    id="countries"
                                                    value={formData.countries}
                                                    onChange={(e) => setFormData(f => ({ ...f, countries: e.target.value }))}
                                                    placeholder="USA, UK, Canada"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="intake">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 opacity-70" />
                                                            Target Intake
                                                        </div>
                                                    </Label>
                                                    <Input
                                                        id="intake"
                                                        value={formData.targetIntake}
                                                        onChange={(e) => setFormData(f => ({ ...f, targetIntake: e.target.value }))}
                                                        placeholder="2024"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="budget">
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign className="h-3.5 w-3.5 opacity-70" />
                                                            Budget ($)
                                                        </div>
                                                    </Label>
                                                    <Input
                                                        id="budget"
                                                        type="number"
                                                        min="0"
                                                        value={formData.budgetRange}
                                                        onChange={(e) => setFormData(f => ({ ...f, budgetRange: e.target.value }))}
                                                        placeholder="25000"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="exam">Exam Status</Label>
                                                    <Select
                                                        value={formData.examStatus}
                                                        onValueChange={(val) => setFormData(f => ({ ...f, examStatus: val as "not-started" | "in-progress" | "done" }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="not-started">Not Started</SelectItem>
                                                            <SelectItem value="in-progress">In Progress / Scheduled</SelectItem>
                                                            <SelectItem value="done">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {formData.examStatus === "done" && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-4 pt-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="ielts">IELTS/TOEFL</Label>
                                                            <Input
                                                                id="ielts"
                                                                type="number"
                                                                step="0.1"
                                                                value={formData.ieltsScore}
                                                                onChange={(e) => setFormData(f => ({ ...f, ieltsScore: e.target.value }))}
                                                                placeholder="7.5"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="gre">GRE/GMAT</Label>
                                                            <Input
                                                                id="gre"
                                                                type="number"
                                                                value={formData.greScore}
                                                                onChange={(e) => setFormData(f => ({ ...f, greScore: e.target.value }))}
                                                                placeholder="320"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                            Danger Zone
                                        </h4>
                                        <p className="text-xs text-muted-foreground">Permanent actions for your account</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="rounded-xl gap-2 min-w-[140px] border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Account
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="glass border-border/50 rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                        Are you absolutely sure?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        account and remove all of your data (onboarding, shortlisted universities, and applications) from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteAccount}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                                    >
                                                        Delete Permanently
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            size="lg"
                                            className="rounded-xl gap-2 min-w-[140px] shadow-glow-primary"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
