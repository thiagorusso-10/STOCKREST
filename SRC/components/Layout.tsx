import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardEdit, 
  Users, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  List,
  Settings,
  History
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label, restrictedToAdmin = false }: any) => {
    if (restrictedToAdmin && user?.role !== 'admin') return null;
    
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          setMobileMenuOpen(false);
        }}
        className={`flex items-center gap-3 px-3 py-3 w-full text-left transition-all border-2
          ${isActive 
            ? 'bg-primary text-white border-black shadow-brutalist-sm' 
            : 'text-gray-800 border-transparent hover:bg-gray-200 hover:border-black'
          }`}
      >
        <Icon size={20} className={isActive ? 'fill-current' : ''} />
        <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r-2 border-black p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-none shadow-brutalist-sm">
            <Package size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl uppercase leading-none">StockRest</h1>
            <p className="text-xs text-gray-500 font-mono">v1.1</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {user?.role === 'admin' && (
             <>
              <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" restrictedToAdmin />
              <NavItem page="inventory" icon={List} label="Gestão de Estoque" restrictedToAdmin />
             </>
          )}
          <NavItem page="fill" icon={ClipboardEdit} label="Preencher Estoque" />
          {user?.role === 'admin' && (
            <>
              <NavItem page="users" icon={Users} label="Usuários" restrictedToAdmin />
              <NavItem page="logs" icon={History} label="Histórico" restrictedToAdmin />
              <NavItem page="settings" icon={Settings} label="Configurações" restrictedToAdmin />
            </>
          )}
        </nav>

        <div className="mt-auto border-t-2 border-black pt-4">
          <div className="flex items-center gap-3 mb-4">
            <UserCircle size={32} />
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-600 font-bold hover:underline"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b-2 border-black z-30 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-black text-white flex items-center justify-center shadow-brutalist-sm">
            <Package size={18} />
          </div>
          <span className="font-black text-lg">StockRest</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-20 pt-20 px-6 md:hidden flex flex-col gap-4">
           {user?.role === 'admin' && (
             <>
               <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" restrictedToAdmin />
               <NavItem page="inventory" icon={List} label="Gestão de Estoque" restrictedToAdmin />
             </>
          )}
          <NavItem page="fill" icon={ClipboardEdit} label="Preencher Estoque" />
          
          {user?.role === 'admin' && (
            <>
              <NavItem page="users" icon={Users} label="Usuários" restrictedToAdmin />
              <NavItem page="logs" icon={History} label="Histórico" restrictedToAdmin />
              <NavItem page="settings" icon={Settings} label="Configurações" restrictedToAdmin />
            </>
          )}
          
          <div className="mt-auto border-t-2 border-black py-6">
             <button 
              onClick={logout}
              className="flex items-center justify-center w-full gap-2 bg-red-100 border-2 border-red-500 p-3 font-bold text-red-600 shadow-brutalist-sm"
            >
              <LogOut size={18} />
              <span>SAIR</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pt-0 pt-16 h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};