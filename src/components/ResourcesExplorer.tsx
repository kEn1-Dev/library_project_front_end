import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'http://187.127.45.180:3000';

// === SUPABASE STORAGE CONFIGURATION ===
const SUPABASE_URL = 'https://mtdhwmgywooveqljfetx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_secret_WgEkpp7U8cyUnooadOyzGQ_Qcie7T6J';
const BUCKET_RECURSOS = 'DOCUMENTOS';
const BUCKET_PORTADAS = 'FOTOS';

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

interface Category {
  id_categoria: number;
  nombre_categoria: string;
}

interface DownloadHistoryItem {
  id_recurso: number;
  titulo: string;
  descripcion: string;
  url_recurso: string;
  url_portada: string;
  nombre_categoria: string;
  cantidad_descargas: number;
  ultima_descarga: string;
}

interface MyUploadedResourceItem {
  id_recurso: number;
  titulo: string;
  descripcion: string;
  url_recurso: string;
  url_portada: string;
  fecha_subida: string;
  nombre_categoria: string;
  total_descargas: number;
}

export default function ResourcesExplorer() {
  const [user, setUser] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'general' | 'subidos' | 'descargas'>('general');

  // User uploaded resources state
  const [myResources, setMyResources] = useState<MyUploadedResourceItem[]>([]);
  const [myResourcesLoading, setMyResourcesLoading] = useState(false);

  // User download history state
  const [myDownloads, setMyDownloads] = useState<DownloadHistoryItem[]>([]);
  const [myDownloadsLoading, setMyDownloadsLoading] = useState(false);

  // Search & Filter state (for General tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Upload Resource Form Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newTitulo, setNewTitulo] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  
  // File inputs state
  const [newFileRecurso, setNewFileRecurso] = useState<File | null>(null);
  const [newFilePortada, setNewFilePortada] = useState<File | null>(null);
  const [newPortadaPreview, setNewPortadaPreview] = useState<string | null>(null);

  const [newIdCategoria, setNewIdCategoria] = useState<number | ''>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // File input refs for clearing files
  const fileRecursoRef = useRef<HTMLInputElement>(null);
  const filePortadaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }

    fetchResources();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'subidos') {
      fetchMyResources();
    } else if (activeTab === 'descargas') {
      fetchMyDownloads();
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchResources(true);
      
      const loggedIn = localStorage.getItem('token');
      if (loggedIn) {
        if (activeTab === 'subidos') {
          fetchMyResources(true);
        } else if (activeTab === 'descargas') {
          fetchMyDownloads(true);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchResources = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const response = await fetch(`${API_BASE_URL}/api/recursos`);
      if (!response.ok) {
        if (!silent) throw new Error('Error al conectar con el servidor.');
        return;
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setResources(data.data);
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Error al obtener recursos.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recursos/categorias`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchMyResources = async (silent = false) => {
    try {
      if (!silent) setMyResourcesLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recursos/usuario/mis-recursos`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMyResources(data.data);
        }
      }
    } catch (e) {
      console.error('Error fetching my resources:', e);
    } finally {
      if (!silent) setMyResourcesLoading(false);
    }
  };

  const fetchMyDownloads = async (silent = false) => {
    try {
      if (!silent) setMyDownloadsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/recursos/usuario/descargas`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setMyDownloads(data.data);
        }
      }
    } catch (e) {
      console.error('Error fetching my downloads:', e);
    } finally {
      if (!silent) setMyDownloadsLoading(false);
    }
  };

  const handleDeleteResource = async (id_recurso: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este recurso de la biblioteca?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/recursos/${id_recurso}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Refresh active list
        fetchMyResources();
        fetchResources();
      } else {
        alert(data.message || 'Error al eliminar el recurso.');
      }
    } catch (e) {
      console.error('Error deleting resource:', e);
      alert('Error de conexión al eliminar el recurso.');
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('categories-roulette');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRegisterDownload = async (id_recurso: number, url: string, titulo: string) => {
    // 1. Force the file to download in the browser
    try {
      const fileExt = url.split('.').pop()?.split('?')[0] || 'pdf';
      const cleanTitle = titulo.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${cleanTitle}.${fileExt}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      // If downloads tab is active, wait and reload history
      if (activeTab === 'descargas') {
        setTimeout(fetchMyDownloads, 1000);
      }
    } catch (e) {
      console.error('Error triggering direct file download, falling back to open in new tab:', e);
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    // 2. Register download in background
    try {
      await fetch(`${API_BASE_URL}/api/recursos/descargas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_recurso,
          id_usuario: user?.id_usuario || null
        })
      });
    } catch (e) {
      console.error('Error registering download stats:', e);
    }
  };

  // Helper function to upload files directly to Supabase Storage via REST API
  const uploadFileToSupabase = async (file: File, bucket: string): Promise<string> => {
    if (SUPABASE_URL.includes('tu-proyecto') || SUPABASE_ANON_KEY.includes('tu-anon-key')) {
      throw new Error('Por favor, configura las constantes SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales de Supabase.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': file.type
      },
      body: file
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error al subir el archivo al bucket "${bucket}".`);
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
  };

  const convertImageToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas.'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const convertedFile = new File([blob], `${originalName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                resolve(convertedFile);
              } else {
                reject(new Error('Error al convertir a WebP.'));
              }
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = () => {
          reject(new Error('Error al cargar la imagen.'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo.'));
      };
    });
  };

  const handlePortadaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('El archivo de portada debe ser una imagen (PNG, JPG, WEBP, etc.).');
        setNewFilePortada(null);
        setNewPortadaPreview(null);
        if (filePortadaRef.current) filePortadaRef.current.value = '';
        return;
      }
      setUploadLoading(true);
      setUploadProgressMsg('Optimizando imagen de portada a formato WebP...');
      try {
        const webpFile = await convertImageToWebP(file);
        setNewFilePortada(webpFile);
        setNewPortadaPreview(URL.createObjectURL(webpFile));
        setUploadError(null);
      } catch (err: any) {
        setUploadError(err.message || 'Error al procesar la imagen.');
        setNewFilePortada(null);
        setNewPortadaPreview(null);
        if (filePortadaRef.current) filePortadaRef.current.value = '';
      } finally {
        setUploadLoading(false);
        setUploadProgressMsg('');
      }
    }
  };

  const handleRecursoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadError('El archivo de documento no puede ser una imagen. Debe ser un PDF, Word, Excel, PowerPoint, Zip o TXT.');
        setNewFileRecurso(null);
        if (fileRecursoRef.current) fileRecursoRef.current.value = '';
        return;
      }
      setNewFileRecurso(file);
      setUploadError(null);
    }
  };

  const removeSelectedPortada = () => {
    setNewFilePortada(null);
    if (newPortadaPreview) {
      URL.revokeObjectURL(newPortadaPreview);
      setNewPortadaPreview(null);
    }
    if (filePortadaRef.current) {
      filePortadaRef.current.value = '';
    }
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!newTitulo.trim() || !newFileRecurso || !newIdCategoria) {
      setUploadError('El título, el archivo del recurso y la categoría son requeridos.');
      return;
    }

    setUploadLoading(true);

    try {
      setUploadProgressMsg('Subiendo documento a Supabase Storage...');
      const urlRecurso = await uploadFileToSupabase(newFileRecurso, BUCKET_RECURSOS);

      let urlPortada = '';
      if (newFilePortada) {
        setUploadProgressMsg('Subiendo portada a Supabase Storage...');
        urlPortada = await uploadFileToSupabase(newFilePortada, BUCKET_PORTADAS);
      }

      setUploadProgressMsg('Registrando recurso en la biblioteca...');
      const response = await fetch(`${API_BASE_URL}/api/recursos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          titulo: newTitulo.trim(),
          descripcion: newDescripcion.trim() || undefined,
          url_recurso: urlRecurso,
          url_portada: urlPortada || undefined,
          id_categoria: Number(newIdCategoria)
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al registrar el recurso.');
      }

      setUploadSuccess(true);
      
      setNewTitulo('');
      setNewDescripcion('');
      setNewFileRecurso(null);
      setNewFilePortada(null);
      if (newPortadaPreview) {
        URL.revokeObjectURL(newPortadaPreview);
        setNewPortadaPreview(null);
      }
      setNewIdCategoria('');

      if (fileRecursoRef.current) fileRecursoRef.current.value = '';
      if (filePortadaRef.current) filePortadaRef.current.value = '';

      fetchResources();
      if (activeTab === 'subidos') fetchMyResources();

      setTimeout(() => {
        setIsDrawerOpen(false);
        setUploadSuccess(false);
      }, 1000);

    } catch (err: any) {
      setUploadError(err.message || 'Error al subir el recurso.');
    } finally {
      setUploadLoading(false);
      setUploadProgressMsg('');
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (res.descripcion && res.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === null || res.id_categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-brand-indigo mb-8 border border-indigo-100 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Acceso a la Biblioteca</h2>
        <p className="text-slate-400 font-semibold text-sm leading-relaxed mb-10">
          Para poder explorar, visualizar y descargar recursos de estudio compartidos por la comunidad, primero necesitas ingresar a tu cuenta.
        </p>
        <div className="flex gap-4 w-full justify-center">
          <a href="/login" className="px-6 py-3 text-xs font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:-translate-y-px transition-all">
            Iniciar Sesión
          </a>
          <a href="/register" className="px-6 py-3 text-xs font-bold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
            Registrarse
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
            Biblioteca Digital
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-2.5">
            Explora apuntes, guías y libros cargados por la comunidad de UniShare.
          </p>
        </div>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-6 py-3.5 text-xs font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:-translate-y-px transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Subir Material
        </button>
      </div>

      {/* Sleek Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === 'general'
              ? 'border-brand-indigo text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Biblioteca General
        </button>
        <button
          onClick={() => setActiveTab('subidos')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === 'subidos'
              ? 'border-brand-indigo text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mis Aportes / Subidos
        </button>
        <button
          onClick={() => setActiveTab('descargas')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === 'descargas'
              ? 'border-brand-indigo text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Historial de Descargas
        </button>
      </div>

      {/* --- TAB CONTENT: GENERAL CATALOG --- */}
      {activeTab === 'general' && (
        <div className="flex flex-col gap-8">
          {/* Filters Area (Search on top, Roulette on bottom) */}
          <div className="flex flex-col gap-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            
            {/* Style injection to hide Webkit scrollbars */}
            <style>{`
              #categories-roulette::-webkit-scrollbar,
              #upload-drawer-panel::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Search */}
            <div className="relative w-full max-w-xl mx-auto">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por título, descripción o palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100/50 transition-all font-semibold bg-slate-50/50 focus:bg-white"
              />
            </div>

            {/* Categories Roulette Slider */}
            <div className="relative flex items-center w-full px-8 group select-none">
              
              {/* Scroll Left Button */}
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="absolute left-0 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-indigo hover:border-brand-indigo hover:shadow-sm active:scale-95 transition-all z-10"
                title="Desplazar izquierda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {/* Horizontal Scroll Bar container */}
              <div 
                id="categories-roulette"
                className="flex gap-2 overflow-x-auto scroll-smooth w-full py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                    selectedCategory === null
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id_categoria}
                    onClick={() => setSelectedCategory(cat.id_categoria)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      selectedCategory === cat.id_categoria
                        ? 'bg-brand-indigo text-white border-brand-indigo shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.nombre_categoria}
                  </button>
                ))}
              </div>

              {/* Scroll Right Button */}
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="absolute right-0 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-indigo hover:border-brand-indigo hover:shadow-sm active:scale-95 transition-all z-10"
                title="Desplazar derecha"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

            </div>

          </div>

          {/* Grid of Resource Cards */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-lg mx-auto text-center my-6 shadow-sm">
              <h3 className="text-lg font-bold mb-2">Error de Carga</h3>
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <span className="text-3xl">📂</span>
              <p className="text-slate-400 font-bold text-sm mt-4">No se encontraron recursos en la biblioteca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <div 
                  key={res.id_recurso}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-200 hover:shadow-glow-brand transition-all duration-300 flex flex-col justify-between group h-full"
                >
                  <div>
                    {/* Portada Preview */}
                    <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl mb-6 overflow-hidden flex items-center justify-center relative">
                      {res.url_portada ? (
                        <img 
                          src={res.url_portada} 
                          alt={res.titulo} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-4xl text-slate-300 select-none">
                          📖
                        </div>
                      )}
                      
                      {/* Category Badge overlay */}
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 text-brand-indigo text-[10px] px-2.5 py-1 rounded-md font-black shadow-sm">
                        {res.nombre_categoria}
                      </span>
                    </div>

                    {/* Info */}
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-brand-navy transition-colors mb-2 truncate">
                      {res.titulo}
                    </h3>
                    
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-6 line-clamp-2 h-8">
                      {res.descripcion || 'Sin descripción disponible.'}
                    </p>
                  </div>

                  {/* Card Footer Info */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subido por</span>
                      <span className="text-xs font-bold text-slate-600 mt-0.5 truncate max-w-[120px]">{res.nombre_creador || 'Invitado'}</span>
                    </div>

                    <button
                      onClick={() => handleRegisterDownload(res.id_recurso, res.url_recurso, res.titulo)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-brand-indigo hover:text-white hover:border-brand-indigo transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Descargar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: MY UPLOADED RESOURCES --- */}
      {activeTab === 'subidos' && (
        <div className="flex flex-col gap-8">
          {myResourcesLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
            </div>
          ) : myResources.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto w-full">
              <span className="text-4xl">📤</span>
              <p className="text-slate-600 font-extrabold text-base mt-4">Aún no has compartido material</p>
              <p className="text-slate-400 font-medium text-xs mt-1 max-w-xs mx-auto">
                Tus aportes ayudan a que la biblioteca crezca. ¡Sube un apunte o guía de estudio hoy mismo!
              </p>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="mt-6 px-5 py-2.5 text-xs font-bold rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all inline-flex items-center gap-2"
              >
                Subir mi primer documento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myResources.map((res) => (
                <div 
                  key={res.id_recurso}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-200 hover:shadow-glow-brand transition-all duration-300 flex flex-col justify-between group h-full relative"
                >
                  <div>
                    {/* Portada Preview */}
                    <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl mb-6 overflow-hidden flex items-center justify-center relative">
                      {res.url_portada ? (
                        <img 
                          src={res.url_portada} 
                          alt={res.titulo} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-4xl text-slate-300 select-none">
                          📖
                        </div>
                      )}
                      
                      {/* Category Badge overlay */}
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 text-brand-indigo text-[10px] px-2.5 py-1 rounded-md font-black shadow-sm">
                        {res.nombre_categoria}
                      </span>
                    </div>

                    {/* Info */}
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-brand-navy transition-colors mb-2 truncate">
                      {res.titulo}
                    </h3>
                    
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-6 line-clamp-2 h-8">
                      {res.descripcion || 'Sin descripción disponible.'}
                    </p>
                  </div>

                  {/* Card Footer Info */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total descargas</span>
                      <span className="text-xs font-black text-brand-indigo mt-0.5">{res.total_descargas || 0} descargas</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRegisterDownload(res.id_recurso, res.url_recurso, res.titulo)}
                        className="p-2 text-slate-500 hover:bg-slate-50 hover:text-brand-indigo rounded-xl border border-slate-200 transition-all"
                        title="Descargar mi archivo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>

                      <button
                        onClick={() => handleDeleteResource(res.id_recurso)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all"
                        title="Eliminar recurso"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: DOWNLOADS HISTORY --- */}
      {activeTab === 'descargas' && (
        <div className="flex flex-col gap-8">
          {myDownloadsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-brand-indigo rounded-full animate-spin"></div>
            </div>
          ) : myDownloads.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto w-full">
              <span className="text-4xl">📥</span>
              <p className="text-slate-600 font-extrabold text-base mt-4">Historial de descargas vacío</p>
              <p className="text-slate-400 font-medium text-xs mt-1 max-w-xs mx-auto">
                Los apuntes y guías que descargues aparecerán aquí organizados para que puedas volver a acceder a ellos rápidamente.
              </p>
              <button
                onClick={() => setActiveTab('general')}
                className="mt-6 px-5 py-2.5 text-xs font-bold rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all inline-flex items-center gap-2"
              >
                Explorar Biblioteca
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col divide-y divide-slate-100">
              {myDownloads.map((item) => (
                <div key={item.id_recurso} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 first:pt-0 last:pb-0 gap-4">
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/50 overflow-hidden">
                      {item.url_portada ? (
                        <img src={item.url_portada} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">📖</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-800 truncate max-w-xs sm:max-w-md">
                        {item.titulo}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {item.nombre_categoria}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Última descarga: {new Date(item.ultima_descarga).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-1.5 border border-slate-100 rounded-xl">
                      Descargado <strong className="text-brand-indigo font-black">{item.cantidad_descargas}</strong> {item.cantidad_descargas === 1 ? 'vez' : 'veces'}
                    </span>
                    
                    <button
                      onClick={() => handleRegisterDownload(item.id_recurso, item.url_recurso, item.titulo)}
                      className="px-4 py-2 text-xs font-extrabold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Volver a descargar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === SUBIR RECURSO DRAWER PANEL === */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[200] bg-transparent flex justify-end">
          {/* Backdrop Click Closer */}
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          
          {/* Drawer Panel Container */}
          <div 
            id="upload-drawer-panel"
            className="relative w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col p-6 md:p-8 animate-slide-in overflow-y-auto z-[210]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-pink-50 flex items-center justify-center text-brand-pink border border-pink-100/50 shadow-sm shadow-pink-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                    Subir Recurso
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400 mt-1.5">
                    Comparte material con la biblioteca
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsDrawerOpen(false)} 
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
                disabled={uploadLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {uploadError && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs font-semibold mb-5 border border-red-100 animate-fade-in">
                ⚠️ {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-xs font-semibold mb-5 border border-emerald-100 animate-fade-in">
                ✓ Recurso subido correctamente.
              </div>
            )}

            <form onSubmit={handleUploadResource} className="space-y-6 flex-1 flex flex-col">
              <div className="space-y-5 flex-1">
                
                {/* Título Input */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Título del Recurso
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Guía Completa de Álgebra Lineal"
                    className="w-full px-4 py-3.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50 focus:bg-white transition-all font-semibold text-slate-700"
                    value={newTitulo}
                    onChange={(e) => setNewTitulo(e.target.value)}
                    disabled={uploadLoading || uploadSuccess}
                    required
                  />
                </div>

                {/* Descripción Input */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Descripción
                  </label>
                  <textarea
                    placeholder="Describe brevemente de qué trata este documento..."
                    className="w-full px-4 py-3.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50 focus:bg-white transition-all font-semibold text-slate-700 h-24 resize-none"
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    disabled={uploadLoading || uploadSuccess}
                  />
                </div>

                {/* Document File Selector (Supabase Bucket: DOCUMENTOS) */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Archivo de Documento (.pdf, .docx, .zip, etc.)
                  </label>
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-indigo transition-all cursor-pointer">
                    <input
                      type="file"
                      ref={fileRecursoRef}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z"
                      onChange={handleRecursoFileChange}
                      disabled={uploadLoading || uploadSuccess}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      required
                    />
                    <span className="text-2xl mb-2">📄</span>
                    <span className="text-xs font-bold text-slate-600 text-center">
                      {newFileRecurso ? newFileRecurso.name : 'Haz clic o arrastra para seleccionar el archivo'}
                    </span>
                    {newFileRecurso && (
                      <span className="text-[10px] font-semibold text-slate-400 mt-1">
                        {(newFileRecurso.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Cover File Selector (Supabase Bucket: FOTOS) */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Imagen de Portada (Opcional)
                  </label>
                  {!newPortadaPreview ? (
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-indigo transition-all cursor-pointer">
                      <input
                        type="file"
                        ref={filePortadaRef}
                        accept="image/*"
                        onChange={handlePortadaFileChange}
                        disabled={uploadLoading || uploadSuccess}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-2xl mb-2">🖼️</span>
                      <span className="text-xs font-bold text-slate-600 text-center">
                        Selecciona una imagen de portada
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full rounded-2xl border border-slate-200 p-3 bg-slate-50 flex items-center gap-4">
                      <img 
                        src={newPortadaPreview} 
                        alt="Vista previa de portada" 
                        className="w-12 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-700 truncate">{newFilePortada?.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {((newFilePortada?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedPortada}
                        disabled={uploadLoading}
                        className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors"
                        title="Eliminar portada"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Categoría Selector */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3.5 text-sm border border-slate-200 rounded-xl outline-none bg-slate-50/50 focus:bg-white focus:border-brand-indigo focus:ring-4 focus:ring-indigo-100/50 transition-all font-semibold text-slate-700 appearance-none"
                      value={newIdCategoria}
                      onChange={(e) => setNewIdCategoria(e.target.value ? Number(e.target.value) : '')}
                      disabled={uploadLoading || uploadSuccess}
                      required
                    >
                      <option value="">Selecciona una categoría...</option>
                      {categories.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                </div>

              </div>

              {/* Progress and status message */}
              {uploadLoading && uploadProgressMsg && (
                <div className="text-xs text-brand-indigo font-bold flex items-center gap-2 animate-pulse mt-4 bg-indigo-50 border border-indigo-100/50 p-3 rounded-xl">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-brand-indigo rounded-full animate-spin"></div>
                  {uploadProgressMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-3 text-xs font-bold rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all btn-transition"
                  disabled={uploadLoading || uploadSuccess}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-xs font-bold rounded-full bg-gradient-brand text-white shadow-brand hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  disabled={uploadLoading || uploadSuccess}
                >
                  {uploadLoading ? 'Subiendo...' : 'Publicar Recurso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
