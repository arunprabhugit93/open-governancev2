import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AppShell } from './components/AppShell';
import { Dashboard } from './views/Dashboard';
import { Registry } from './views/Registry';
import { GateBoard } from './views/GateBoard';
import { Authorisation } from './views/Authorisation';
import { Serving } from './views/Serving';
import { Egress } from './views/Egress';
import { Ledger } from './views/Ledger';
import { Runner } from './views/Runner';
import { Disclosure } from './views/Disclosure';

// Hash routing keeps the POC deployable as pure static files with no server.
const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'registry', element: <Registry /> },
      { path: 'gates', element: <GateBoard /> },
      { path: 'authorisation', element: <Authorisation /> },
      { path: 'serving', element: <Serving /> },
      { path: 'egress', element: <Egress /> },
      { path: 'ledger', element: <Ledger /> },
      { path: 'runner', element: <Runner /> },
      { path: 'disclosure', element: <Disclosure /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
