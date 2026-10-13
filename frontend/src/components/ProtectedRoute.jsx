
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ role }) {
  const [status, setStatus] = useState('checking');

  const token = sessionStorage.getItem('token');
  const userData = sessionStorage.getItem('user');

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!token || !user || user.role !== role) {
        setStatus('unauthorized');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/${role}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cancelled) return;

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setStatus('unauthorized');
          return;
        }

        if (!response.ok) {
          setStatus('error');
          return;
        }

        setStatus('authorized');
      } catch {
        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [role, token, userData]);

  if (!token || !user || user.role !== role || status === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'checking') {
    return <p>Verifying your session...</p>;
  }

  if (status === 'error') {
    return (
      <p role="alert">
        Unable to verify your session. Check that the backend is running,
        then refresh the page.
      </p>
    );
  }

  return <Outlet />;
}
