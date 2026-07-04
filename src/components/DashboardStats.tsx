import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://187.127.45.180:3000';
const EMAIL_DOMAIN = '@UniShare.com';

interface GeneralStats {
  total_recursos: number;
  total_descargas: number;
  total_usuarios: number;
}

interface PopularResource {
  id_recurso: number;
  titulo: string;
  nombre_categoria: string;
  total_descargas: number;
}

interface CategoryStats {
  nombre_categoria: string;
  total_descargas: number;
}

interface User {
  id_usuario: number;
  nombre: string;
  correo: string;
  id_rol: number;
  fecha_registro: string;
}

interface Category {
  id_categoria: number;
  nombre_categoria: string;
}

interface Resource {
  id_recurso: number;
  titulo: string;
  descripcion: string;
  url_recurso: string;
  url_portada: string;
  id_usuario: number;
  id_categoria: number;
  nombre_categoria: string;
  nombre_creador: string;
}

export default function DashboardStats() {
  // Tab State
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'categories' | 'resources'>('metrics');

  // Metrics Data States
  const [general, setGeneral] = useState<GeneralStats | null>(null);
  const [populares, setPopulares] = useState<PopularResource[]>([]);
  const [categorias, setCategorias] = useState<CategoryStats[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Users Data States
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Categories Data States
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState<string | null>(null);
  const [deleteCategorySuccess, setDeleteCategorySuccess] = useState(false);

  // Create Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Inline Editing States
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreoPrefix, setEditCorreoPrefix] = useState(''); // Only user prefix before @
  const [editIdRol, setEditIdRol] = useState(2);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);

  // Inline Creating States
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmailPrefix, setNewUserEmailPrefix] = useState(''); // Only user prefix before @
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState(2);
  const [newUserLoading, setNewUserLoading] = useState(false);

  // Resources Data States
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const [deleteResourceError, setDeleteResourceError] = useState<string | null>(null);
  const [deleteResourceSuccess, setDeleteResourceSuccess] = useState<string | null>(null);

  // Fetch Metrics on Mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Fetch Tab Specific Data
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'resources') {
      fetchResources();
    }
  }, [activeTab]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);
      
      const responseGeneral = await fetch(`${API_BASE_URL}/api/estadisticas/general`, { headers: getHeaders() });
      const responsePopulares = await fetch(`${API_BASE_URL}/api/estadisticas/populares?limit=5`, { headers: getHeaders() });
      const responseCategorias = await fetch(`${API_BASE_URL}/api/estadisticas/categorias`, { headers: getHeaders() });

      if (!responseGeneral.ok || !responsePopulares.ok || !responseCategorias.ok) {
        throw new Error('Error al conectar con la API de estadísticas.');
      }

      const dataGeneral = await responseGeneral.json();
      const dataPopulares = await responsePopulares.json();
      const dataCategorias = await responseCategorias.json();

      if (dataGeneral.success && dataGeneral.data) setGeneral(dataGeneral.data);
      if (dataPopulares.success && Array.isArray(dataPopulares.data)) setPopulares(dataPopulares.data);
      if (dataCategorias.success && Array.isArray(dataCategorias.data)) setCategorias(dataCategorias.data);

    } catch (err: any) {
      setMetricsError(err.message || 'Error de conexión.');
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchUsers = async (searchVal?: string) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const queryParam = searchVal !== undefined ? searchVal : userSearchQuery;
      const url = queryParam.trim() 
        ? `${API_BASE_URL}/api/users?search=${encodeURIComponent(queryParam.trim())}`
        : `${API_BASE_URL}/api/users`;

      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) {
        throw new Error('Error al obtener la lista de usuarios.');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err: any) {
      setUsersError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/recursos/categorias`, { headers: getHeaders() });
      if (!response.ok) {
        throw new Error('Error al obtener las categorías.');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategoriesList(data.data);
      }
    } catch (err: any) {
      setCategoriesError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      setResourcesError(null);

      const response = await fetch(`${API_BASE_URL}/api/recursos`, { headers: getHeaders() });
      if (!response.ok) {
        throw new Error('Error al obtener los recursos.');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setResources(data.data);
      }
    } catch (err: any) {
      setResourcesError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);

    if (!newCategoryName.trim()) {
      setCreateError('El nombre de la categoría es obligatorio.');
      return;
    }

    setCreateLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recursos/categorias`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombre_categoria: newCategoryName.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al crear la categoría.');
      }

      setCreateSuccess(true);
      setNewCategoryName('');
      
      // Recargar lista y métricas en segundo plano
      fetchCategories();
      fetchMetrics();

      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err: any) {
      setCreateError(err.message || 'Error al conectar.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCategory = async (id_categoria: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`)) {
      return;
    }

    setDeleteCategoryError(null);
    setDeleteCategorySuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recursos/categorias/${id_categoria}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar la categoría.');
      }

      setDeleteCategorySuccess(true);
      fetchCategories();
      fetchMetrics();
      
      setTimeout(() => setDeleteCategorySuccess(false), 3000);
    } catch (err: any) {
      setDeleteCategoryError(err.message || 'Error al eliminar.');
    }
  };

  const handleDeleteResource = async (id_recurso: number, titulo: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el recurso "${titulo}"?`)) {
      return;
    }

    setDeleteResourceError(null);
    setDeleteResourceSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recursos/${id_recurso}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar el recurso.');
      }

      setDeleteResourceSuccess('Recurso eliminado correctamente.');
      fetchResources();
      fetchMetrics();

      setTimeout(() => setDeleteResourceSuccess(null), 3000);
    } catch (err: any) {
      setDeleteResourceError(err.message || 'Error al eliminar el recurso.');
    }
  };

  // Start Inline Editing for a Row
  const startInlineEdit = (user: User) => {
    setEditingUserId(user.id_usuario);
    setEditNombre(user.nombre);
    
    // Extract prefix from email e.g. KFlores from KFlores@UniShare.com
    const emailParts = user.correo.split('@');
    setEditCorreoPrefix(emailParts[0] || '');
    
    setEditIdRol(user.id_rol);
    setEditError(null);
    setEditSuccessMessage(null);
  };

  // Cancel Inline Editing
  const cancelInlineEdit = () => {
    setEditingUserId(null);
    setEditError(null);
  };

  // Submit Inline Edit Changes
  const saveInlineEdit = async (id_usuario: number) => {
    setEditError(null);
    setEditSuccessMessage(null);

    if (!editNombre.trim() || !editCorreoPrefix.trim()) {
      setEditError('Nombre y correo son requeridos.');
      return;
    }

    setEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id_usuario}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          nombre: editNombre.trim(),
          correo: `${editCorreoPrefix.trim()}${EMAIL_DOMAIN}`,
          id_rol: editIdRol
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al guardar los cambios.');
      }

      setEditSuccessMessage('Usuario actualizado.');
      
      // Actualizar tabla y métricas en segundo plano
      fetchUsers();
      fetchMetrics();

      setTimeout(() => {
        setEditingUserId(null);
        setEditSuccessMessage(null);
      }, 1000);

    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar.');
    } finally {
      setEditLoading(false);
    }
  };

  // Start Inline User Creation
  const startInlineCreate = () => {
    setIsCreatingUser(true);
    setNewUserName('');
    setNewUserEmailPrefix('');
    setNewUserPassword('');
    setNewUserRole(2);
    setEditError(null);
    setEditSuccessMessage(null);
  };

  // Submit Inline Creation
  const saveInlineCreate = async () => {
    setEditError(null);
    setEditSuccessMessage(null);

    if (!newUserName.trim() || !newUserEmailPrefix.trim() || !newUserPassword.trim()) {
      setEditError('Todos los campos (nombre, correo y contraseña) son obligatorios para el registro.');
      return;
    }

    if (newUserPassword.trim().length < 6) {
      setEditError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setNewUserLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: newUserName.trim(),
          correo: `${newUserEmailPrefix.trim()}${EMAIL_DOMAIN}`,
          contrasena: newUserPassword.trim(),
          id_rol: newUserRole
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar el usuario.');
      }

      setEditSuccessMessage('Usuario registrado con éxito.');
      setIsCreatingUser(false);
      
      fetchUsers();
      fetchMetrics();

      setTimeout(() => {
        setEditSuccessMessage(null);
      }, 3000);

    } catch (err: any) {
      setEditError(err.message || 'Error al registrar.');
    } finally {
      setNewUserLoading(false);
    }
  };

  // Trigger search on submit
  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Clear user search
  const clearUserSearch = () => {
    setUserSearchQuery('');
    fetchUsers('');
  };

  return (
    <div className="w-full flex flex-col gap-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
            Panel de Control
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-2.5">
            Supervisa, organiza y gestiona los recursos, categorías y usuarios de UniShare.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm shadow-emerald-50">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Conexión Estable con VPS
        </div>
      </div>

      {/* Navigation Tabs (Premium Pill Design - Solid) */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 w-fit border border-slate-200 shadow-inner flex-wrap">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'bg-white text-brand-navy shadow-md shadow-slate-200 border border-slate-200/10'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
          }`}
        >
          <span>📈</span> Métricas
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white text-brand-navy shadow-md shadow-slate-200 border border-slate-200/10'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
          }`}
        >
          <span>👤</span> Gestionar Usuarios
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-white text-brand-navy shadow-md shadow-slate-200 border border-slate-200/10'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
          }`}
        >
          <span>📚</span> Gestionar Recursos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-white text-brand-navy shadow-md shadow-slate-200 border border-slate-200/10'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
          }`}
        >
          <span>🏷️</span> Gestionar Categorías
        </button>
      </div>

      {/* === TAB 1: METRICS === */}
      {activeTab === 'metrics' && (
        <div className="flex flex-col gap-10">
          {metricsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 w-full">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-semibold text-sm">Cargando métricas de la API...</p>
            </div>
          ) : metricsError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-lg mx-auto text-center my-10 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Error de Carga</h3>
              <p className="text-sm font-medium">{metricsError}</p>
              <button onClick={fetchMetrics} className="mt-6 px-5 py-2.5 text-xs font-bold rounded-full bg-red-600 text-white hover:bg-red-700 transition-all btn-transition">Reintentar</button>
            </div>
          ) : (
            <>
              {/* Stat Cards with Solid background */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Descargas */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-200 hover:shadow-glow-brand transition-all duration-300 flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Descargas</span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-1">{general?.total_descargas || 0}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-brand-indigo transition-colors group-hover:bg-brand-indigo group-hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                </div>

                {/* Recursos */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-pink-200 hover:shadow-glow-coral transition-all duration-300 flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recursos Subidos</span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-1">{general?.total_recursos || 0}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100/50 flex items-center justify-center text-brand-pink transition-colors group-hover:bg-brand-pink group-hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
                  </div>
                </div>

                {/* Usuarios */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-purple-200 hover:shadow-glow-brand transition-all duration-300 flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Usuarios Activos</span>
                    <span className="text-3xl font-black text-slate-800 tracking-tight leading-none mt-1">{general?.total_usuarios || 0}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100/50 flex items-center justify-center text-brand-purple transition-colors group-hover:bg-brand-purple group-hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                </div>

              </div>

              {/* Detail Tables */}
              <div className="flex flex-col gap-8">
                
                {/* Popular Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo"></span>
                    Recursos Más Populares
                  </h3>
                  {populares.length === 0 ? (
                    <p className="text-slate-400 font-semibold text-sm py-14 text-center">No hay registros de descargas todavía.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Título</th>
                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
                            <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Descargas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {populares.map((item) => (
                            <tr key={item.id_recurso} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="py-4 text-sm font-extrabold text-slate-700 max-w-[200px] truncate">{item.titulo}</td>
                              <td className="py-4 text-sm">
                                <span className="bg-indigo-50 border border-indigo-100/30 text-brand-navy text-[10px] px-2.5 py-1 rounded-md font-extrabold">
                                  {item.nombre_categoria}
                                </span>
                              </td>
                              <td className="py-4 text-sm font-extrabold text-slate-800 text-right">{item.total_descargas}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Categories Download Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-pink"></span>
                    Descargas por Categoría
                  </h3>
                  {categorias.length === 0 ? (
                    <p className="text-slate-400 font-semibold text-sm py-14 text-center">No hay registros clasificados por categoría.</p>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {categorias.map((item) => {
                        const maxDescargas = Math.max(...categorias.map(c => c.total_descargas || 0), 1);
                        const percentage = Math.round((item.total_descargas / maxDescargas) * 100);
                        return (
                          <div key={item.nombre_categoria} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-extrabold text-slate-700">{item.nombre_categoria}</span>
                              <span className="text-xs font-extrabold text-slate-400">{item.total_descargas} descargas</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-gradient-brand h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* === TAB 2: USERS MANAGEMENT (INLINE EDITING + SEARCH + INLINE CREATION) === */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          
          {/* Header & Feedback */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo"></span>
              Usuarios Registrados
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full md:w-auto">
              
              {/* User search bar */}
              <form onSubmit={handleUserSearchSubmit} className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <div className="relative w-full md:w-56">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-indigo hover:bg-indigo-600 rounded-xl shadow-sm transition-all"
                >
                  Buscar
                </button>
                {userSearchQuery && (
                  <button
                    type="button"
                    onClick={clearUserSearch}
                    className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Limpiar
                  </button>
                )}
                
                {/* Inline Add User Button */}
                <button
                  type="button"
                  onClick={startInlineCreate}
                  disabled={isCreatingUser || editingUserId !== null}
                  className={`px-4 py-2 text-xs font-bold text-white bg-gradient-brand rounded-xl shadow-brand hover:opacity-95 transition-all flex items-center gap-1.5 ${
                    isCreatingUser || editingUserId !== null ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Registrar Usuario
                </button>
              </form>

              {editError && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 animate-fade-in">
                  ⚠️ {editError}
                </div>
              )}
              {editSuccessMessage && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 animate-fade-in">
                  ✓ {editSuccessMessage}
                </div>
              )}
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-14">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
            </div>
          ) : usersError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-semibold border border-red-200 text-center">
              {usersError}
            </div>
          ) : users.length === 0 && !isCreatingUser ? (
            <p className="text-slate-400 font-semibold text-sm text-center py-14">No se encontraron usuarios.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[80px]">ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[220px]">Nombre</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[280px]">Correo</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[160px]">Rol</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[180px]">
                      {isCreatingUser ? 'Contraseña' : 'Registro'}
                    </th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-[160px]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* Inline Creation Temp Row */}
                  {isCreatingUser && (
                    <tr className="border-b border-indigo-100/50 bg-indigo-50/10 animate-fade-in">
                      {/* ID Column */}
                      <td className="py-4 text-xs font-bold text-emerald-600 font-mono">
                        NUEVO
                      </td>

                      {/* Nombre Column */}
                      <td className="py-4">
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          disabled={newUserLoading}
                          className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-white focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all animate-pulse-once"
                          required
                        />
                      </td>

                      {/* Correo Column (with locked @UniShare.com domain) */}
                      <td className="py-4">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-brand-indigo focus-within:ring-2 focus-within:ring-indigo-100/50 overflow-hidden w-full transition-all">
                          <input
                            type="text"
                            placeholder="usuario"
                            value={newUserEmailPrefix}
                            onChange={(e) => setNewUserEmailPrefix(e.target.value)}
                            disabled={newUserLoading}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none w-full bg-transparent border-none"
                            required
                          />
                          <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 border-l border-slate-200 px-2.5 py-1.5 select-none h-full flex items-center">
                            {EMAIL_DOMAIN}
                          </span>
                        </div>
                      </td>

                      {/* Rol Column */}
                      <td className="py-4">
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(Number(e.target.value))}
                          disabled={newUserLoading}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-white focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none pr-7 relative"
                          style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
                        >
                          <option value={2}>Cliente</option>
                          <option value={1}>Administrador</option>
                        </select>
                      </td>

                      {/* Password Input Column */}
                      <td className="py-4">
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          disabled={newUserLoading}
                          className="w-full px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl bg-white focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                          required
                        />
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={saveInlineCreate}
                            disabled={newUserLoading}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all flex items-center gap-1 active:scale-95"
                          >
                            {newUserLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <>✓ Aceptar</>
                            )}
                          </button>
                          <button
                            onClick={() => setIsCreatingUser(false)}
                            disabled={newUserLoading}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </td>

                    </tr>
                  )}

                  {users.map((u) => {
                    const isEditing = editingUserId === u.id_usuario;
                    return (
                      <tr key={u.id_usuario} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isEditing ? 'bg-indigo-50/20 hover:bg-indigo-50/30' : ''}`}>
                        
                        {/* ID Column */}
                        <td className="py-4 text-xs font-mono text-slate-400 font-semibold">
                          #{u.id_usuario}
                        </td>

                        {/* Nombre Column */}
                        <td className="py-4 text-sm font-extrabold text-slate-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              disabled={editLoading}
                              className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-white focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                          ) : (
                            u.nombre
                          )}
                        </td>

                        {/* Correo Column (with locked @UniShare.com domain on edit) */}
                        <td className="py-4 text-sm font-semibold text-slate-500">
                          {isEditing ? (
                            <div className="flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-brand-indigo focus-within:ring-2 focus-within:ring-indigo-100/50 overflow-hidden w-full transition-all">
                              <input
                                type="text"
                                value={editCorreoPrefix}
                                onChange={(e) => setEditCorreoPrefix(e.target.value)}
                                disabled={editLoading}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none w-full bg-transparent border-none"
                                required
                              />
                              <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 border-l border-slate-200 px-2.5 py-1.5 select-none h-full flex items-center">
                                {EMAIL_DOMAIN}
                              </span>
                            </div>
                          ) : (
                            u.correo
                          )}
                        </td>

                        {/* Rol Column */}
                        <td className="py-4 text-sm">
                          {isEditing ? (
                            <select
                              value={editIdRol}
                              onChange={(e) => setEditIdRol(Number(e.target.value))}
                              disabled={editLoading}
                              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-white focus:border-brand-indigo focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none pr-7 relative"
                              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundSize: '12px', backgroundRepeat: 'no-repeat' }}
                            >
                              <option value={2}>Cliente</option>
                              <option value={1}>Administrador</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                              u.id_rol === 1 
                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                : 'bg-slate-50 text-slate-600 border-slate-200/50'
                            }`}>
                              {u.id_rol === 1 ? 'Administrador' : 'Cliente'}
                            </span>
                          )}
                        </td>

                        {/* Registro Column */}
                        <td className="py-4 text-xs font-semibold text-slate-400">
                          {new Date(u.fecha_registro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* Acciones Column */}
                        <td className="py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2 animate-fade-in">
                              <button
                                onClick={() => saveInlineEdit(u.id_usuario)}
                                disabled={editLoading}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all flex items-center gap-1 active:scale-95"
                              >
                                {editLoading ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                  <>✓ Aceptar</>
                                )}
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                disabled={editLoading}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95"
                              >
                                ✕ Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startInlineEdit(u)}
                              disabled={editingUserId !== null || isCreatingUser}
                              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                                (editingUserId !== null || isCreatingUser)
                                  ? 'border-slate-100 text-slate-300 pointer-events-none'
                                  : 'border-slate-200 text-slate-500 hover:border-brand-indigo hover:text-brand-navy hover:bg-slate-50 btn-transition'
                              }`}
                            >
                              Editar
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === TAB 3: RESOURCES MANAGEMENT === */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink"></span>
              Recursos Académicos Subidos
            </h3>

            {/* Delete resource feedback messages */}
            {deleteResourceError && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 animate-fade-in">
                ⚠️ {deleteResourceError}
              </div>
            )}
            {deleteResourceSuccess && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 animate-fade-in">
                ✓ {deleteResourceSuccess}
              </div>
            )}
          </div>

          {resourcesLoading ? (
            <div className="flex justify-center py-14">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
            </div>
          ) : resourcesError ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-semibold border border-red-200 text-center">
              {resourcesError}
            </div>
          ) : resources.length === 0 ? (
            <p className="text-slate-400 font-semibold text-sm text-center py-14">No hay recursos subidos en la biblioteca.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[80px]">ID</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[340px]">Recurso</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[160px]">Categoría</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest w-[160px]">Creador</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-[100px]">Enlace</th>
                    <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-[120px]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id_recurso} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      
                      {/* ID Column */}
                      <td className="py-4 text-xs font-mono text-slate-400 font-semibold">
                        #{r.id_recurso}
                      </td>

                      {/* Recurso Detail Column */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {r.url_portada ? (
                            <img
                              src={r.url_portada}
                              alt={r.titulo}
                              className="w-9 h-12 object-cover rounded-lg border border-slate-100 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-12 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                              📖
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-extrabold text-slate-700 max-w-[260px] truncate">{r.titulo}</span>
                            <span className="text-xs text-slate-400 font-semibold max-w-[260px] truncate mt-0.5">{r.descripcion || 'Sin descripción descriptiva.'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Categoría Column */}
                      <td className="py-4 text-sm">
                        <span className="bg-pink-50 border border-pink-100/30 text-brand-pink text-[10px] px-2.5 py-1 rounded-md font-extrabold">
                          {r.nombre_categoria}
                        </span>
                      </td>

                      {/* Creador Column */}
                      <td className="py-4 text-sm font-bold text-slate-600">
                        {r.nombre_creador || 'Invitado'}
                      </td>

                      {/* Link Column */}
                      <td className="py-4 text-center">
                        <a
                          href={r.url_recurso}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-slate-400 hover:text-brand-indigo hover:border-brand-indigo transition-all shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteResource(r.id_recurso, r.titulo)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                        >
                          Eliminar
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === TAB 4: CATEGORIES MANAGEMENT (INLINE DELETE) === */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Category Form */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm h-fit">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-6">
              Nueva Categoría
            </h3>

            {createError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-red-100">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-emerald-100">
                Categoría creada correctamente.
              </div>
            )}

            <form onSubmit={handleCreateCategory}>
              <div className="mb-5 flex flex-col">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nombre de Categoría
                </label>
                <input
                  type="text"
                  className="px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50 focus:bg-white transition-all"
                  placeholder="Ej. Programación Web"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={createLoading}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 text-xs font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:-translate-y-px transition-all btn-transition"
                disabled={createLoading}
              >
                {createLoading ? 'Creando...' : 'Crear Categoría'}
              </button>
            </form>
          </div>

          {/* List of Existing Categories & Deletes */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-pink"></span>
                Categorías Registradas
              </h3>

              {deleteCategoryError && (
                <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-100 animate-fade-in">
                  ⚠️ {deleteCategoryError}
                </div>
              )}
              {deleteCategorySuccess && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-100 animate-fade-in">
                  ✓ Categoría eliminada.
                </div>
              )}
            </div>

            {categoriesLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
              </div>
            ) : categoriesError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-semibold border border-red-200 text-center">
                {categoriesError}
              </div>
            ) : categoriesList.length === 0 ? (
              <p className="text-slate-400 font-semibold text-sm text-center py-14">No hay categorías registradas aún.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categoriesList.map((cat) => (
                  <div 
                    key={cat.id_categoria} 
                    className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 group transition-all"
                  >
                    <span className="text-xs text-slate-400 font-mono">#{cat.id_categoria}</span>
                    <span>{cat.nombre_categoria}</span>
                    
                    <button
                      onClick={() => handleDeleteCategory(cat.id_categoria, cat.nombre_categoria)}
                      title="Eliminar Categoría"
                      className="ml-1 w-5 h-5 rounded-full hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-slate-400 text-[10px] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
