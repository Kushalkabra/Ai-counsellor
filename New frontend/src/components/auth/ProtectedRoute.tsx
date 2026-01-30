import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
    const { token, onboardingCompleted, isLoading, userProfile, isAuthenticated: contextAuth } = useApp();
    const location = useLocation();

    // Debugging to see what's happening during access
    console.log("ProtectedRoute - Auth Check:", {
        token: token ? (token.substring(0, 5) + "...") : null,
        isLoading,
        contextAuth,
        path: location.pathname
    });

    // If data is loading or we have a token but no profile yet, show loader
    // to prevent flashing wrong states (like onboarding)
    if (isLoading || (!!token && !userProfile)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Robust authentication check
    const isAuthenticated = !!token && token !== 'undefined' && token !== 'null';

    if (!isAuthenticated) {
        console.warn("Protected Route - Unauthorized access attempt, redirecting to /login");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If onboarding is required (default for most pages)
    if (requireOnboarding && !onboardingCompleted) {
        console.log("ProtectedRoute - Onboarding required but not completed, redirecting to /onboarding");
        return <Navigate to="/onboarding" replace />;
    }

    // If accessing onboarding specifically (requireOnboarding=false)
    if (!requireOnboarding && onboardingCompleted) {
        console.log("ProtectedRoute - User already onboarded, redirecting from /onboarding to /dashboard");
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
