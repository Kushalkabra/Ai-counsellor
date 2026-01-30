import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';

function AppContent() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <Login />;
    case 'signup':
      return <Signup />;
    case 'onboarding':
      return <OnboardingWizard />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
