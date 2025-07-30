import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const resp = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      login(resp.data.token, resp.data.user); // <-- usa o contexto
      nav('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao fazer login');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f7fafc] to-[#e3eef9] relative overflow-hidden">
      <div className="relative bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full flex items-center justify-center mb-2">
          <span className="text-white text-3xl">💲</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-8">
          Lisboa Finance
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu email"
                className="pl-10 mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-300 focus:border-blue-400 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Senha</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="pl-10 mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-300 focus:border-blue-400 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow hover:scale-105 transition"
          >
            Conectar
          </button>
        </form>
        <p className="mt-6 text-center w-full">
          <span className="inline-block w-full py-2 border border-yellow-100 rounded-lg text-yellow-700 font-semibold bg-yellow-50">
            Para criar uma conta, entre em contato.
          </span>
        </p>
      </div>
    </div>
  );
}
