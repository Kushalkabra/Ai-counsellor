import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, onboardingAPI, dashboardAPI, universityAPI, todoAPI } from '@/lib/api';
import { countryImages } from '@/lib/constants';

export interface UserProfile {
    degree: string;
    gpa: string;
    targetIntake: string;
    countries: string[];
    budgetRange: string;
    examsCompleted: string[];
    sopStatus: 'not-started' | 'draft' | 'ready';
    academicStrength: 'weak' | 'average' | 'strong';
    examStatus: 'not-started' | 'in-progress' | 'done';
    ieltsScore?: string;
    greScore?: string;
}

export interface University {
    id: string; // Keeping as string to match frontend usage, will convert to int for API
    name: string;
    country: string;
    costLevel: 'Low' | 'Medium' | 'High';
    acceptanceChance: 'Low' | 'Medium' | 'High';
    tag: 'Dream' | 'Target' | 'Safe';
    whyFits: string;
    risks: string;
    isShortlisted: boolean;
    isLocked: boolean;
    image?: string; // Added for new UI
    location?: string; // Added for new UI
    ranking?: string; // Added for new UI
    matchScore?: number; // Added for new UI
}

export interface TodoItem {
    id: string;
    text: string;
    status: 'pending' | 'in-progress' | 'done';
}

export interface ChatMessage {
    id: string;
    role: 'ai' | 'user'; // Changed from 'type' to 'role' to match new UI
    content: string;
    timestamp?: Date;
    actions?: {
        label: string;
        universityId?: string;
    }[];
}

export type AppStage = 'profile-building' | 'discover-universities' | 'finalize-universities' | 'prepare-applications';

interface AppContextType {
    token: string | null;
    onboardingCompleted: boolean;
    setOnboardingCompleted: (completed: boolean) => void;
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;
    currentStage: AppStage;
    setCurrentStage: (stage: AppStage) => void;
    universities: University[];
    setUniversities: (universities: University[]) => void;
    todoItems: TodoItem[];
    setTodoItems: React.Dispatch<React.SetStateAction<TodoItem[]>>;
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    shortlistUniversity: (id: string) => Promise<void>;
    lockUniversity: (id: string) => Promise<void>;
    unlockUniversity: (id: string) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    addTodo: (title: string, description?: string) => Promise<void>;
    loadUniversities: (search?: string, country?: string) => Promise<void>;
    loadUserData: () => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentStage, setCurrentStage] = useState<AppStage>('profile-building');
    const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Load initial data if logged in
    useEffect(() => {
        if (token) {
            setIsLoading(true); // Ensure loading starts immediately when token is found
            loadUserData().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const loadUserData = async () => {
        try {
            await authAPI.getMe();
            // If getMe succeeds, user is authenticated

            // 1. Check onboarding status
            try {
                const onboardingRes = await onboardingAPI.get();
                setOnboardingCompleted(true);

                const normalizeCountryName = (c: string) => {
                    const trimmed = c.trim();
                    if (!trimmed) return '';
                    if (trimmed.toLowerCase() === 'usa') return 'USA';
                    if (trimmed.toLowerCase() === 'uk') return 'UK';
                    return trimmed.split(' ').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                };

                // Map onboarding data to UserProfile
                const profile: UserProfile = {
                    degree: onboardingRes.data.current_education_level || '',
                    gpa: onboardingRes.data.gpa?.toString() || '',
                    targetIntake: onboardingRes.data.target_intake_year?.toString() || '',
                    countries: (onboardingRes.data.preferred_countries?.split(',') || [])
                        .map((c: string) => normalizeCountryName(c))
                        .filter((c: string) => c !== ''),
                    budgetRange: onboardingRes.data.budget_per_year ? `$${onboardingRes.data.budget_per_year}/yr` : '',
                    examsCompleted: [],
                    sopStatus: (onboardingRes.data.sop_status as any) || 'not-started',
                    academicStrength: 'average',
                    examStatus: (onboardingRes.data.ielts_toefl_status === 'Completed' || onboardingRes.data.gre_gmat_status === 'Completed') ? 'done' :
                        (onboardingRes.data.ielts_toefl_status === 'In progress' || onboardingRes.data.gre_gmat_status === 'In progress') ? 'in-progress' : 'not-started',
                    ieltsScore: onboardingRes.data.ielts_toefl_score?.toString() || '',
                    greScore: onboardingRes.data.gre_gmat_score?.toString() || '',
                };
                setUserProfile(profile);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setOnboardingCompleted(false);
                } else {
                    console.error("Onboarding fetch failed", err);
                }
            }

            // 2. Fetch Stage & Universities & Todos (Always run if Auth)
            try {
                const stageRes = await dashboardAPI.getStage();
                const stageMap: Record<number, AppStage> = {
                    0: 'profile-building',
                    1: 'profile-building',
                    2: 'discover-universities',
                    3: 'finalize-universities',
                    4: 'prepare-applications'
                };
                setCurrentStage(stageMap[stageRes.data.stage] || 'profile-building');

                await loadUniversities();

                const todoRes = await todoAPI.getAll();
                setTodoItems(todoRes.data.map((t: any) => ({
                    id: t.id.toString(),
                    text: t.title,
                    status: t.completed ? 'done' : 'pending'
                })));
            } catch (err) {
                console.error("Dashboard data load failed", err);
            }

        } catch (err) {
            // Token invalid or network error
            logout();
        }
    };

    const loadUniversities = async (search?: string, country?: string) => {
        console.log(`DEBUG: AppContext.loadUniversities started (search=${search}, country=${country})`);
        try {
            const uniRes = await universityAPI.getAll({ search, country });
            console.log(`DEBUG: universityAPI.getAll() returned ${uniRes.data?.length || 0} items`);

            let shortlistedIds = new Set<number>();
            let lockedIds = new Set<number>();

            // Try fetching status, but don't fail everything if one fails
            try {
                const shortRes = await universityAPI.getShortlisted();
                shortlistedIds = new Set(shortRes.data.map((u: any) => u.id));
                console.log(`DEBUG: Found ${shortlistedIds.size} shortlisted universities`);
            } catch (e) {
                console.error("DEBUG: Failed to load shortlisted universities", e);
            }

            try {
                const lockedRes = await universityAPI.getLocked();
                lockedIds = new Set(lockedRes.data.map((u: any) => u.id));
                console.log(`DEBUG: Found ${lockedIds.size} locked universities`);
            } catch (e) {
                console.error("DEBUG: Failed to load locked universities", e);
            }

            const mappedUniversities: University[] = uniRes.data.map((u: any) => ({
                id: u.id.toString(),
                name: u.name,
                country: u.country,
                costLevel: u.tuition_fee > 30000 ? 'High' : (u.tuition_fee > 10000 ? 'Medium' : 'Low'),
                acceptanceChance: u.acceptance_chance || 'Medium',
                tag: u.category || 'Target',
                whyFits: u.why_fits || 'Matched based on your profile.',
                risks: 'General competitive admission.',
                isShortlisted: shortlistedIds.has(u.id),
                isLocked: lockedIds.has(u.id),
                location: u.country,
                ranking: u.ranking ? `#${u.ranking} Global` : "# -- Global",
                matchScore: 85,
                image: `/${countryImages[u.country] || "univ_usa"}.png`,
            }));

            console.log(`DEBUG: setting ${mappedUniversities.length} mapped universities to state`);
            setUniversities(mappedUniversities);
        } catch (e) {
            console.error("DEBUG: Failed to load universities (main list)", e);
        }
    }

    const login = async (email: string, pass: string) => {
        const formData = { username: email, password: pass };
        const res = await authAPI.login(formData);
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token);
        // User loading will happen via useEffect
    };

    const googleLogin = async (credential: string) => {
        const res = await authAPI.googleLogin(credential);
        localStorage.setItem('token', res.data.access_token);
        setToken(res.data.access_token);
    };

    const signup = async (data: any) => {
        await authAPI.signup(data);
        await login(data.email, data.password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserProfile(null);
        setUniversities([]);
        setTodoItems([]);
        setChatMessages([]);
        window.location.href = '/login';
    };

    const shortlistUniversity = async (id: string) => {
        const uni = universities.find(u => u.id === id);
        if (!uni) return;

        // Optimistic update
        setUniversities(prev =>
            prev.map(u => u.id === id ? { ...u, isShortlisted: !u.isShortlisted } : u)
        );

        try {
            await universityAPI.shortlist(id);
            // Refresh to get correct server state and avoid race conditions
            await loadUniversities();
        } catch (e) {
            console.error("Shortlist failed", e);
            // Revert
            setUniversities(prev =>
                prev.map(u => u.id === id ? { ...u, isShortlisted: !u.isShortlisted } : u)
            );
        }
    };

    const lockUniversity = async (id: string) => {
        // Optimistic
        setUniversities(prev =>
            prev.map(u => u.id === id ? { ...u, isLocked: true, isShortlisted: true } : u)
        );
        try {
            await universityAPI.lock(id);
            // Refresh todos as locking generates them
            const todoRes = await todoAPI.getAll();
            setTodoItems(todoRes.data.map((t: any) => ({
                id: t.id.toString(),
                text: t.title,
                status: t.completed ? 'done' : 'pending'
            })));
            await loadUserData(); // to update stage
        } catch (e) {
            setUniversities(prev =>
                prev.map(u => u.id === id ? { ...u, isLocked: false } : u)
            );
        }
    };

    const unlockUniversity = async (id: string) => {
        setUniversities(prev =>
            prev.map(u => u.id === id ? { ...u, isLocked: false } : u)
        );
        try {
            await universityAPI.unlock(id);
            await loadUserData();
        } catch (e) {
            setUniversities(prev =>
                prev.map(u => u.id === id ? { ...u, isLocked: true } : u)
            );
        }
    };

    const toggleTodo = async (id: string) => {
        const item = todoItems.find(t => t.id === id);
        if (!item) return;

        const newStatus = item.status === 'done' ? 'pending' : 'done'; // Simplified toggle
        // Optimistic
        setTodoItems(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            await todoAPI.update(parseInt(id), newStatus === 'done');
        } catch (e) {
            console.error("Failed to toggle todo", e);
            // Revert
            setTodoItems(prev => prev.map(t => t.id === id ? { ...t, status: item.status } : t));
        }
    };

    const addTodo = async (title: string, description?: string) => {
        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const newTodo: TodoItem = { id: tempId, text: title, status: 'pending' };
        setTodoItems(prev => [newTodo, ...prev]);

        try {
            const res = await todoAPI.create({ title, description });
            // Replace temp item with real one
            setTodoItems(prev => prev.map(t => t.id === tempId ? {
                id: res.data.id.toString(),
                text: res.data.title,
                status: res.data.completed ? 'done' : 'pending'
            } : t));
        } catch (e) {
            console.error("Failed to add todo", e);
            // Remove temp item
            setTodoItems(prev => prev.filter(t => t.id !== tempId));
        }
    };

    return (
        <AppContext.Provider
            value={{
                token,
                onboardingCompleted,
                setOnboardingCompleted,
                userProfile,
                setUserProfile,
                currentStage,
                setCurrentStage,
                universities,
                setUniversities,
                todoItems,
                setTodoItems,
                chatMessages,
                setChatMessages,
                shortlistUniversity,
                lockUniversity,
                unlockUniversity,
                toggleTodo,
                addTodo,
                loadUniversities,
                loadUserData,
                login,
                googleLogin,
                signup,
                logout,
                isLoading,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
