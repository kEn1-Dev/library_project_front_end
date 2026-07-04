import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-10">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="UniShare Logo" className="w-8 h-8" />
            <span className="font-extrabold text-xl text-brand-navy tracking-tight">UniShare</span>
          </div>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            La plataforma académica de biblioteca digital para compartir recursos, apuntes, libros y conocimiento de forma abierta y colaborativa.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Plataforma</h4>
          <a href="/" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Inicio</a>
          <a href="/login" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Ingresar</a>
          <a href="/register" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Registrarse</a>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Comunidad</h4>
          <a href="#" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Estadísticas</a>
          <a href="#" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Categorías</a>
          <a href="#" className="text-sm text-slate-500 hover:text-brand-indigo transition-colors">Ayuda / FAQ</a>
        </div>
      </div>
      <div className="border-t border-slate-200 py-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-semibold">
          <p>&copy; {new Date().getFullYear()} UniShare. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Desarrollado con <span className="text-brand-pink text-sm">❤️</span> para estudiantes
          </p>
        </div>
      </div>
    </footer>
  );
}
