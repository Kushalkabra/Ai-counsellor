import { ArrowRight, FileText, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

export const ApplicationsSummary = () => {
    const { universities } = useApp();
    const applications = universities.filter(u => u.isLocked).slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl p-5 shadow-soft border border-border/50 flex flex-col"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Applications</h3>
                    <p className="text-xs text-muted-foreground">Tracking your progress</p>
                </div>
                <div className="p-2 bg-success/10 rounded-xl">
                    <FileText className="h-5 w-5 text-success" />
                </div>
            </div>

            <div className="space-y-3 mb-4">
                {applications.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No active applications yet.</p>
                    </div>
                ) : (
                    universities.filter(u => u.isLocked).slice(0, 2).map((uni) => (
                        <motion.div
                            key={uni.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/10"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">{uni.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{uni.country}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px] font-medium text-success uppercase tracking-wider">Active</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <Link to="/applications" className="mt-auto">
                <Button variant="outline" className="w-full group" size="sm">
                    Track Applications
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </motion.div>
    );
};
