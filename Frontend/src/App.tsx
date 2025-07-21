import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Dashboard from './components/pages/Dashboard';
import Transactions from './components/pages/Transaction';
import Settings from './components/pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const isLogged = !!localStorage.getItem('token');

  return (
    <Routes>
      {/* Redireciona '/' para /dashboard se logado, senão para /login */}
      <Route
        path="/"
        element={
          isLogged ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Qualquer rota desconhecida redireciona para '/' */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
