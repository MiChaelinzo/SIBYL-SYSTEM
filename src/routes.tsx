import Dashboard from './pages/Dashboard';
import CitizenProfile from './pages/CitizenProfile';
import ScanSimulator from './pages/ScanSimulator';
import DominatorPage from './pages/DominatorPage';
import AgentLogPage from './pages/AgentLogPage';
import CaseDetailsPage from './pages/CaseDetails';
import FacialRecognition from './pages/FacialRecognition';
import BulkImport from './pages/BulkImport';
import SibylAI from './pages/SibylAI';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Dashboard',            path: '/',                   element: <Dashboard />,         public: true },
  { name: 'Citizen Profile',      path: '/citizen/:citizenId', element: <CitizenProfile />,    public: true },
  { name: 'Cymatic Scan',         path: '/scan',               element: <ScanSimulator />,     public: true },
  { name: 'Dominator',            path: '/dominator',          element: <DominatorPage />,     public: true },
  { name: 'Agent Communications', path: '/agents',             element: <AgentLogPage />,      public: true },
  { name: 'Case Details',         path: '/case/:caseId',       element: <CaseDetailsPage />,   public: true },
  { name: 'Facial Recognition',   path: '/facial-recognition', element: <FacialRecognition />, public: true },
  { name: 'Bulk Import',          path: '/import',             element: <BulkImport />,        public: true },
  { name: 'Sibyl Oracle',         path: '/sibyl-ai',           element: <SibylAI />,           public: true },
];
