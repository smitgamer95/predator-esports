import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminTournamentsPage from './pages/AdminTournamentsPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminPaymentSettingsPage from './pages/AdminPaymentSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminLiveTournamentPage from './pages/AdminLiveTournamentPage';
import AdminSupportMessagesPage from './pages/AdminSupportMessagesPage';
import AdminBanUsersPage from './pages/AdminBanUsersPage';
import SupportPage from './pages/SupportPage';
import MyTicketsPage from './pages/MyTicketsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import DebugPage from './pages/DebugPage';
import BackupPage from './pages/BackupPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    public: true,
  },
  {
    name: 'Profile Setup',
    path: '/profile-setup',
    element: <ProfileSetupPage />,
    public: false,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />,
    public: false,
  },
  {
    name: 'Tournaments',
    path: '/tournaments',
    element: <TournamentsPage />,
    public: true,
  },
  {
    name: 'Tournament Detail',
    path: '/tournaments/:id',
    element: <TournamentDetailPage />,
    public: true,
  },
  {
    name: 'Admin Login',
    path: '/admin-login',
    element: <AdminLoginPage />,
    public: true,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboardPage />,
    public: false,
  },
  {
    name: 'Admin Tournaments',
    path: '/admin/tournaments',
    element: <AdminTournamentsPage />,
    public: false,
  },
  {
    name: 'Admin Payments',
    path: '/admin/payments',
    element: <AdminPaymentsPage />,
    public: false,
  },
  {
    name: 'Admin Payment Settings',
    path: '/admin/payment-settings',
    element: <AdminPaymentSettingsPage />,
    public: false,
  },
  {
    name: 'Admin Users',
    path: '/admin/users',
    element: <AdminUsersPage />,
    public: false,
  },
  {
    name: 'Admin Settings',
    path: '/admin/settings',
    element: <AdminSettingsPage />,
    public: false,
  },
  {
    name: 'Admin Live Tournament',
    path: '/admin/live-tournament',
    element: <AdminLiveTournamentPage />,
    public: false,
  },
  {
    name: 'Admin Support Messages',
    path: '/admin/support-messages',
    element: <AdminSupportMessagesPage />,
    public: false,
  },
  {
    name: 'Admin Ban Users',
    path: '/admin/ban-users',
    element: <AdminBanUsersPage />,
    public: false,
  },
  {
    name: 'Support',
    path: '/support',
    element: <SupportPage />,
    public: true,
  },
  {
    name: 'My Tickets',
    path: '/my-tickets',
    element: <MyTicketsPage />,
    public: false,
  },
  {
    name: 'Privacy Policy',
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
    public: true,
  },
  {
    name: 'Terms & Conditions',
    path: '/terms-conditions',
    element: <TermsConditionsPage />,
    public: true,
  },
  {
    name: 'Debug',
    path: '/debug',
    element: <DebugPage />,
    public: true,
  },
  {
    name: 'Backup',
    path: '/15112010',
    element: <BackupPage />,
    public: true,
  },
];
