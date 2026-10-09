
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import AttendeeDashboard from './pages/AttendeeDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute role="host" />}>
          <Route
            path="/host/dashboard"
            element={<HostDashboard />}
          />
        </Route>

        <Route element={<ProtectedRoute role="attendee" />}>
          <Route
            path="/attendee/dashboard"
            element={<AttendeeDashboard />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
