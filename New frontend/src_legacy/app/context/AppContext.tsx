import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, onboardingAPI, dashboardAPI, universityAPI, todoAPI, aiCounsellorAPI } from '@/lib/api';

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
}

export interface TodoItem {
  id: string;
  text: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  actions?: {
    label: string;
    universityId?: string;
  }[];
}

export type AppStage = 'profile-building' | 'discover-universities' | 'finalize-universities' | 'prepare-applications';

interface AppContextType {
  currentView: string;
  setCurrentView: (view: string) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  currentStage: AppStage;
  setCurrentStage: (stage: AppStage) => void;
  universities: University[];
  setUniversities: (universities: University[]) => void;
  todoItems: TodoItem[];
  setTodoItems: (items: TodoItem[]) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  shortlistUniversity: (id: string) => Promise<void>;
  lockUniversity: (id: string) => Promise<void>;
  unlockUniversity: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  addTodo: (title: string, description?: string) => Promise<void>;
  loadUniversities: () => Promise<void>;
  loadUserData: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState('landing');
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentStage, setCurrentStage] = useState<AppStage>('profile-building');
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Load initial data if logged in
  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      // If no token, ensure we are on landing, login or signup
      if (!['landing', 'login', 'signup'].includes(currentView)) {
        setCurrentView('landing');
      }
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      await authAPI.getMe();
      // If getMe succeeds, user is authenticated

      // Check onboarding status
      try {
        const onboardingRes = await onboardingAPI.get();
        setOnboardingCompleted(true);
        if (currentView === 'landing' || currentView === 'login' || currentView === 'signup') {
          setCurrentView('dashboard');
        }

        // Map onboarding data to UserProfile
        const profile: UserProfile = {
          degree: onboardingRes.data.current_education_level || '',
          gpa: onboardingRes.data.gpa?.toString() || '',
          targetIntake: onboardingRes.data.target_intake_year?.toString() || '',
          countries: onboardingRes.data.preferred_countries?.split(',') || [],
          budgetRange: onboardingRes.data.budget_per_year ? `$${onboardingRes.data.budget_per_year}/yr` : '',
          examsCompleted: [], // derived from ielts_toefl_status etc if needed
          sopStatus: (onboardingRes.data.sop_status as any) || 'not-started',
          academicStrength: 'average', // placeholder logic
          examStatus: 'not-started', // placeholder logic
        };
        setUserProfile(profile);

        // Fetch Stage
        const stageRes = await dashboardAPI.getStage();
        const stageMap: Record<number, AppStage> = {
          0: 'profile-building',
          1: 'profile-building',
          2: 'discover-universities',
          3: 'finalize-universities',
          4: 'prepare-applications'
        };
        setCurrentStage(stageMap[stageRes.data.stage] || 'profile-building');

        // Fetch Universities (and merge with shortlisted/locked status)
        await loadUniversities();

        // Fetch Todos
        const todoRes = await todoAPI.getAll();
        setTodoItems(todoRes.data.map((t: any) => ({
          id: t.id.toString(),
          text: t.title,
          status: t.completed ? 'done' : 'pending' // Simplified mapping
        })));

      } catch (err: any) {
        if (err.response?.status === 404) {
          setOnboardingCompleted(false);
          setCurrentView('onboarding');
        }
      }

    } catch (err) {
      // Token invalid or network error
      logout();
    }
  };

  const loadUniversities = async () => {
    try {
      const uniRes = await universityAPI.getAll();
      const shortRes = await universityAPI.getShortlisted();
      const lockedRes = await universityAPI.getLocked();

      const shortlistedIds = new Set(shortRes.data.map((u: any) => u.id));
      const lockedIds = new Set(lockedRes.data.map((u: any) => u.id));

      const mappedUniversities: University[] = uniRes.data.map((u: any) => ({
        id: u.id.toString(),
        name: u.name,
        country: u.country,
        costLevel: u.tuition_fee > 30000 ? 'High' : (u.tuition_fee > 10000 ? 'Medium' : 'Low'), // Simple logic
        acceptanceChance: u.acceptance_chance || 'Medium',
        tag: u.category || 'Target',
        whyFits: u.why_fits || 'Matched based on your profile.',
        risks: 'General competitive admission.', // Placeholder for now
        isShortlisted: shortlistedIds.has(u.id),
        isLocked: lockedIds.has(u.id)
      }));
      setUniversities(mappedUniversities);
    } catch (e) {
      console.error("Failed to load universities", e);
    }
  }

  const login = async (email: string, pass: string) => {
    const formData = { username: email, password: pass };
    const res = await authAPI.login(formData);
    localStorage.setItem('token', res.data.access_token);
    setToken(res.data.access_token);
    // User loading will happen via useEffect
  };

  const signup = async (data: any) => {
    await authAPI.signup(data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentView('landing');
    setUserProfile(null);
    setUniversities([]);
    setTodoItems([]);
    setChatMessages([]);
  };

  const shortlistUniversity = async (id: string) => {
    const uni = universities.find(u => u.id === id);
    if (!uni) return;

    // Optimistic update
    setUniversities(prev =>
      prev.map(u => u.id === id ? { ...u, isShortlisted: !u.isShortlisted } : u)
    );

    try {
      await universityAPI.shortlist(parseInt(id));
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
      await universityAPI.lock(parseInt(id));
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
      await universityAPI.unlock(parseInt(id));
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
        currentView,
        setCurrentView,
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
        signup,
        logout
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
