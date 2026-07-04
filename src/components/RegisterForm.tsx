import React, { useState } from 'react';

const API_BASE_URL = 'http://187.127.45.180:3000';

const EMAIL_DOMAIN = '@UniShare.com';

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [correoPrefix, setCorreoPrefix] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmContrasena, setConfirmContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre || !correoPrefix || !contrasena || !confirmContrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (contrasena !== confirmContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          correo: `${correoPrefix.trim()}${EMAIL_DOMAIN}`,
          contrasena,
          id_rol: 2, // 2 = Cliente (usuario normal)
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar el usuario.');
      }

      setSuccess(true);

      // Redireccionar al login después de un breve delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-10 max-w-[450px] w-full shadow-lg shadow-slate-100 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center tracking-tight mb-2">
        Crear cuenta en UniShare
      </h2>
      <p className="text-sm text-slate-400 font-semibold text-center mb-8">
        Regístrate como usuario para acceder y descargar recursos.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold mb-5 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold mb-5 border border-emerald-200">
          ¡Registro exitoso! Redireccionando al ingreso...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            className="px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading || success}
            required
          />
        </div>

        <div className="mb-4 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Correo Electrónico
          </label>
          <div className="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-brand-indigo focus-within:ring-4 focus-within:ring-indigo-100 transition-all overflow-hidden w-full">
            <input
              type="text"
              className="px-4 py-3 text-sm outline-none w-full bg-transparent border-none"
              placeholder="nombre.usuario"
              value={correoPrefix}
              onChange={(e) => setCorreoPrefix(e.target.value)}
              disabled={loading || success}
              required
            />
            <span className="text-sm font-extrabold text-slate-400 bg-slate-50 border-l border-slate-200 px-4 py-3 select-none h-full flex items-center">
              {EMAIL_DOMAIN}
            </span>
          </div>
        </div>

        <div className="mb-4 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Contraseña
          </label>
          <input
            type="password"
            className="px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="Mínimo 6 caracteres"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={loading || success}
            required
          />
        </div>

        <div className="mb-6 flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            className="px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100 transition-all"
            placeholder="Repite tu contraseña"
            value={confirmContrasena}
            onChange={(e) => setConfirmContrasena(e.target.value)}
            disabled={loading || success}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 text-sm font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:-translate-y-px transition-all btn-transition"
          disabled={loading || success}
        >
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>

      <p className="text-xs text-slate-400 font-semibold mt-8 text-center">
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" className="text-brand-pink hover:text-brand-pink/90 font-extrabold transition-colors">
          Inicia sesión aquí
        </a>
      </p>
    </div>
  );
}
