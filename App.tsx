
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Product } from './types';
import { fetchMarketTrends } from './services/geminiService';
import { getResearch, saveResearch, saveCustomLink, getSettings } from './services/leadStore';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('MARKETPLACE');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState<string>('');

  const loadData = useCallback(async (force = false) => {
    setLoading(true);
    const cached = getResearch();
    
    if (!cached || force) {
      const data = await fetchMarketTrends();
      if (data.length > 0) {
        setProducts(data);
        saveResearch({ lastUpdated: new Date().toISOString(), items: data });
        setLastSync(new Date().toLocaleTimeString());
      }
    } else {
      // Re-executa o processamento de links para garantir que configurações novas do Admin sejam aplicadas
      const freshData = getResearch();
      if (freshData) {
        setProducts(freshData.items);
        setLastSync(new Date(freshData.lastUpdated).toLocaleTimeString());
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUpdateProductLink = (id: string, newLink: string) => {
    saveCustomLink(id, newLink);
    loadData(); // Recarrega para aplicar visualmente
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'LANDING' && selectedProduct) {
    return <LandingPage product={selectedProduct} onSuccess={() => setView('MARKETPLACE')} />;
  }

  if (view === 'ADMIN') {
    return <AdminDashboard products={products} onBack={() => { setView('MARKETPLACE'); loadData(); }} onUpdateProductLink={handleUpdateProductLink} onForceSync={() => loadData(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="bg-slate-950 text-[10px] font-black text-white py-2 px-6 flex items-center justify-center gap-4 uppercase tracking-[0.2em] sticky top-0 z-[60]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          Operação Live
        </span>
        <span className="opacity-30">|</span>
        <span className="text-blue-400">Sincronizado: {lastSync || '...'}</span>
      </div>

      <header className="bg-white/90 backdrop-blur-xl sticky top-[28px] z-50 border-b border-slate-100 h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('MARKETPLACE')}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black group-hover:bg-blue-600 transition-colors">AM</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">All Market <span className="text-blue-600">Brasil</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('ADMIN')} 
              className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-white hover:border-blue-600 hover:text-blue-600 uppercase tracking-widest transition-all"
            >
              Painel de Controle
            </button>
          </div>
        </div>
      </header>

      <main className="animate-in fade-in duration-700 pb-24">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
            Curadoria Inteligente de Ofertas
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-950 mb-8 tracking-tighter leading-none">
            Encontramos.<br/><span className="text-blue-600">Você Lucra.</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Produtos minerados em tempo real nas maiores plataformas do Brasil. 
            Toda oferta é validada e atualizada automaticamente.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="O que você deseja comprar hoje?"
              className="w-full px-8 py-6 rounded-2xl bg-white border border-slate-200 focus:border-blue-600 shadow-xl shadow-slate-100 outline-none font-bold text-lg transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="flex flex-col items-center py-32 gap-6">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando Novas Ideias...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map(p => (
                <div key={p.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:border-blue-100 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col">
                  <div className="relative h-72 overflow-hidden rounded-[2rem] bg-slate-50 mb-6">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                      {p.platform}
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{p.niche}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                    <p className="text-slate-400 text-sm font-medium line-clamp-2 mb-8">{p.description}</p>
                    <button 
                      onClick={() => { setSelectedProduct(p); setView('LANDING'); }}
                      className="mt-auto w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                    >
                      Pegar Cupom VIP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-xl mb-6"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">All Market Brasil &copy; 2025</p>
          <div className="flex gap-8 mt-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-[9px] font-bold uppercase tracking-widest">Segurança SSL</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">LGPD Compliant</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Verified IA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
