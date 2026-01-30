import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Progress } from '@/app/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { onboardingAPI } from '@/lib/api';

const STEPS = [
  { id: 1, title: 'Academic Background' },
  { id: 2, title: 'Study Goals' },
  { id: 3, title: 'Budget & Funding' },
  { id: 4, title: 'Exams & Readiness' },
];

export function OnboardingWizard() {
  const { setCurrentView, setOnboardingCompleted, setUserProfile, setCurrentStage, userProfile, loadUniversities } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    degree: userProfile?.degree || '',
    gpa: userProfile?.gpa || '',
    targetIntake: userProfile?.targetIntake || '',
    countries: userProfile?.countries || [] as string[],
    budgetRange: userProfile?.budgetRange || '',
    examsCompleted: userProfile?.examStatus === 'done' ? ['IELTS'] : [] as string[], // Simplified mapping
  });

  const progress = (currentStep / STEPS.length) * 100;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.degree && formData.gpa;
      case 2:
        return formData.targetIntake && formData.countries.length > 0;
      case 3:
        return formData.budgetRange;
      case 4:
        return true; // Optional exams
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        const payload = {
          current_education_level: formData.degree,
          gpa: parseFloat(formData.gpa) || 3.0,
          target_intake_year: parseInt(formData.targetIntake.split(' ').pop() || '2026'),
          preferred_countries: formData.countries.join(','),
          budget_per_year: formData.budgetRange === 'low' ? 15000 : formData.budgetRange === 'medium' ? 35000 : 60000,
          ielts_toefl_status: formData.examsCompleted.some(e => ['IELTS', 'TOEFL'].includes(e)) ? 'Completed' : 'Not Started',
          gre_gmat_status: formData.examsCompleted.some(e => ['GRE', 'GMAT'].includes(e)) ? 'Completed' : 'Not Started',
          sop_status: 'Not Started'
        };

        await onboardingAPI.create(payload);

        setUserProfile({
          ...formData,
          sopStatus: 'not-started',
          academicStrength: parseFloat(formData.gpa) >= 3.5 ? 'strong' : parseFloat(formData.gpa) >= 3.0 ? 'average' : 'weak',
          examStatus: formData.examsCompleted.length > 0 ? 'done' : 'not-started',
        });
        setOnboardingCompleted(true);
        setCurrentStage('discover-universities');

        // Load universities for the new user
        await loadUniversities();

        setCurrentView('dashboard');
      } catch (error) {
        console.error("Onboarding failed", error);
      }
    }
  };

  const handleCountryToggle = (country: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country],
    }));
  };

  const handleExamToggle = (exam: string) => {
    setFormData(prev => ({
      ...prev,
      examsCompleted: prev.examsCompleted.includes(exam)
        ? prev.examsCompleted.filter(e => e !== exam)
        : [...prev.examsCompleted, exam],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Progress Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">Step {currentStep} of {STEPS.length}</span>
              <span className="text-sm text-indigo-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${step.id < currentStep
                    ? 'bg-indigo-600 text-white'
                    : step.id === currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                    }`}
                >
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs text-center ${step.id <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2 text-slate-900">Academic Background</h2>
                <p className="text-slate-600">Tell us about your educational qualifications</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="degree">Degree & Major</Label>
                  <Input
                    id="degree"
                    placeholder="e.g., Bachelor's in Computer Science"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="gpa">GPA / Percentage</Label>
                  <Input
                    id="gpa"
                    placeholder="e.g., 3.8 / 85%"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2 text-slate-900">Study Goals</h2>
                <p className="text-slate-600">What are you looking to study and where?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="intake">Target Intake</Label>
                  <select
                    id="intake"
                    value={formData.targetIntake}
                    onChange={(e) => setFormData({ ...formData, targetIntake: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select intake</option>
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                  </select>
                </div>

                <div>
                  <Label>Preferred Countries</Label>
                  <div className="mt-3 space-y-3">
                    {['USA', 'Canada', 'UK', 'Germany', 'Australia', 'Singapore'].map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={country}
                          checked={formData.countries.includes(country)}
                          onCheckedChange={() => handleCountryToggle(country)}
                        />
                        <label htmlFor={country} className="text-sm cursor-pointer">
                          {country}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2 text-slate-900">Budget & Funding</h2>
                <p className="text-slate-600">What's your budget for studying abroad?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Annual Budget (USD)</Label>
                  <div className="mt-3 space-y-3">
                    {[
                      { value: 'low', label: 'Under $20,000' },
                      { value: 'medium', label: '$20,000 - $50,000' },
                      { value: 'high', label: 'Above $50,000' },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={option.value}
                          name="budget"
                          value={option.value}
                          checked={formData.budgetRange === option.value}
                          onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl mb-2 text-slate-900">Exams & Readiness</h2>
                <p className="text-slate-600">Which standardized tests have you completed?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Completed Exams</Label>
                  <div className="mt-3 space-y-3">
                    {['IELTS', 'TOEFL', 'GRE', 'GMAT', 'SAT', 'None yet'].map((exam) => (
                      <div key={exam} className="flex items-center space-x-2">
                        <Checkbox
                          id={exam}
                          checked={formData.examsCompleted.includes(exam)}
                          onCheckedChange={() => handleExamToggle(exam)}
                        />
                        <label htmlFor={exam} className="text-sm cursor-pointer">
                          {exam}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {currentStep === STEPS.length && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">Almost done! Click Complete to finish your profile.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {currentStep === STEPS.length ? 'Complete Profile ✓' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Save Progress Indicator */}
        <div className="mt-4 text-center">
          <span className="text-sm text-slate-500">✓ Your progress is automatically saved</span>
        </div>
      </div>
    </div>
  );
}