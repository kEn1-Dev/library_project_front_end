import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<{ nombre: string, id_rol: number } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3 group">
          <img src="/logo.svg" alt="UniShare Logo" className="w-10 h-10 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-brand-navy leading-none tracking-tight">
              UniShare
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-[3px] uppercase mt-0.5">
              Academic Forum
            </span>
          </div>
        </a>

        <nav className="flex items-center gap-6">
          <a href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Inicio
          </a>
          {user && (
            <a href="/recursos" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Biblioteca
            </a>
          )}
          {user && user.id_rol === 1 && (
            <a href="/admin/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              Panel Admin
            </a>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Hola, <strong className="text-slate-800">{user.nombre}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all btn-transition"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="px-4 py-2 text-xs font-bold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all btn-transition"
              >
                Ingresar
              </a>
              <a
                href="/register"
                className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:-translate-y-px transition-all btn-transition"
              >
                Registrarse
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
