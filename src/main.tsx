import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AppShell } from './components/AppShell';
import { CommandCentre } from './views/CommandCentre';
import { Investigation } from './views/Investigation';
import { Dashboard } from './views/Dashboard';
import { Registry } from './views/Registry';
import { GateBoard } from './views/GateBoard';
import { Authorisation } from './views/Authorisation';
import { Serving } from './views/Serving';
import { Compliance } from './views/Compliance';
import { Egress } from './views/Egress';
import { Ledger } from './views/Ledger';
import { Runner } from './views/Runner';
import { Disclosure } from './views/Disclosure';

// Hash routing keeps the POC deployable as pure static files with no server.
// Command Centre is the index — it is Demonstration 2's entry point (§12.1)
// and the platform-wide solution map; the original eight-phase model demo
// (Demonstration 1) now lives at /overview rather than at the root.
const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <CommandCentre /> },
      { path: 'investigation', element: <Investigation /> },
      { path: 'overview', element: <Dashboard /> },
      { path: 'registry', element: <Registry /> },
      { path: 'gates', element: <GateBoard /> },
      { path: 'authorisation', element: <Authorisation /> },
      { path: 'serving', element: <Serving /> },
      { path: 'compliance', element: <Compliance /> },
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
