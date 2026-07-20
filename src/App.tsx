import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import { HelmetProvider } from 'react-helmet-async';
import { BrandingProvider } from './contexts/BrandingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import CapacitorHardware from './components/CapacitorHardware';
import InstallAppPrompt from './components/InstallAppPrompt';
import { usePushNotifications } from './hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';
import Bootstrapper from './components/Bootstrapper';
import ForceUpdate from './components/ForceUpdate';
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';

const HomePromise = import('./pages/Home'); const Home = lazy(() => HomePromise);
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Exams = lazy(() => import('./pages/Exams'));
const MyProfile = lazy(() => import('./pages/MyProfile'));
const Category = lazy(() => import('./pages/Category'));
const ExamDetail = lazy(() => import('./pages/ExamDetail'));
const LoginPromise = import('./pages/Login'); const Login = lazy(() => LoginPromise);
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminStudyMaterials = lazy(() => import('./pages/admin/AdminStudyMaterials'));
const AdminMockTests = lazy(() => import('./pages/admin/AdminMockTests'));
const AdminUpdates = lazy(() => import('./pages/admin/AdminUpdates'));
const AdminQuickActions = lazy(() => import('./pages/admin/AdminQuickActions'));
const AdminTestSeries = lazy(() => import('./pages/admin/AdminTestSeries'));
const AdminSubjectSeries = lazy(() => import('./pages/admin/AdminSubjectSeries'));
const AdminSectionSeries = lazy(() => import('./pages/admin/AdminSectionSeries'));
const SubjectSeriesListing = lazy(() => import('./pages/SubjectSeriesListing'));
const SubjectSeriesDetail = lazy(() => import('./pages/SubjectSeriesDetail'));
const SectionSeriesListing = lazy(() => import('./pages/SectionSeriesListing'));
const SectionSeriesDetail = lazy(() => import('./pages/SectionSeriesDetail'));
const TestSeries = lazy(() => import('./pages/TestSeries'));
const AdminQuestionBank = lazy(() => import('./pages/admin/AdminQuestionBank'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminSearchManager = lazy(() => import('./pages/admin/AdminSearchManager'));
const AdminStudentAttempts = lazy(() => import('./pages/admin/AdminStudentAttempts'));
const AdminHomeManager = lazy(() => import('./pages/admin/AdminHomeManager'));
const CategoryTestSeries = lazy(() => import('./pages/CategoryTestSeries'));
const ManageTestQuestions = lazy(() => import('./pages/admin/ManageTestQuestions'));
const TestInstructions = lazy(() => import('./pages/TestInstructions'));
const TakeTest = lazy(() => import('./pages/TakeTest'));
const TestResult = lazy(() => import('./pages/TestResult'));
const PerformanceHistory = lazy(() => import('./pages/PerformanceHistory'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SavedItems = lazy(() => import('./pages/SavedItems'));
const ReferralDashboard = lazy(() => import('./pages/ReferralDashboard'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const StudyMaterialsPage = lazy(() => import('./pages/StudyMaterialsPage'));
const Updates = lazy(() => import('./pages/Updates'));
const QuickAccessPage = lazy(() => import('./pages/QuickAccessPage'));
const AIQuestionGenerator = lazy(() => import('./pages/admin/AIQuestionGenerator'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));


function PushNotificationHandler() {
  usePushNotifications();
  return null;
}

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <BrandingProvider>
          <ThemeProvider>
            <ForceUpdate>
              <BrowserRouter>
                <PushNotificationHandler />
                <CapacitorHardware />
          <Bootstrapper>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0B1020]"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/referral" element={<ReferralDashboard />} />
            <Route path="saved" element={<SavedItems />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route path="test-instructions/:testId" element={<TestInstructions />} />
            <Route path="take-test/:testId" element={<TakeTest />} />
            <Route path="test-result/:testId/:resultId?" element={<TestResult />} />
            <Route path="certificate/:resultId" element={<CertificateView />} />
            <Route path="performance" element={<PerformanceHistory />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="exams" element={<Exams />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="study-materials" element={<StudyMaterialsPage />} />
            <Route path="updates" element={<Updates />} />
            <Route path="daily-quiz" element={<QuickAccessPage />} />
            <Route path="current-affairs" element={<QuickAccessPage />} />
            <Route path="vacancies" element={<QuickAccessPage />} />
            <Route path="admit-card" element={<QuickAccessPage />} />
            <Route path="answer-key" element={<QuickAccessPage />} />
            <Route path="test-series" element={<TestSeries />} />
            <Route path="subject-series" element={<SubjectSeriesListing />} />
            <Route path="subject-series/:id" element={<SubjectSeriesDetail />} />
            <Route path="section-series" element={<SectionSeriesListing />} />
            <Route path="section-series/:id" element={<SectionSeriesDetail />} />
            <Route path="test-series/:categorySlug" element={<CategoryTestSeries />} />
            <Route path="exams/:categorySlug" element={<Category />} />
            <Route path=":categorySlug/:examSlug" element={<ExamDetail />} />
            <Route path="*" element={<div className="flex items-center justify-center h-[50vh] text-gray-500">Page not found</div>} />
          </Route>
          
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="ai-generator" element={<AIQuestionGenerator />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="materials" element={<AdminStudyMaterials />} />
              <Route path="tests" element={<AdminMockTests />} />
              <Route path="tests/:testId/questions" element={<ManageTestQuestions />} />
              <Route path="updates" element={<AdminUpdates />} />
              <Route path="quick-actions" element={<AdminQuickActions />} />
              <Route path="test-series" element={<AdminTestSeries />} />
              <Route path="subject-series" element={<AdminSubjectSeries />} />
              <Route path="section-series" element={<AdminSectionSeries />} />
              <Route path="question-bank" element={<AdminQuestionBank />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="attempts" element={<AdminStudentAttempts />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="search" element={<AdminSearchManager />} />
              <Route path="home-manager" element={<AdminHomeManager />} />
                            <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
        </Suspense>
        </Bootstrapper>
      </BrowserRouter>
      </ForceUpdate>
          </ThemeProvider>
        </BrandingProvider>
        <InstallAppPrompt />
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '12px',
        },
      }} />
      </AuthProvider>
    </HelmetProvider>
  );
}
