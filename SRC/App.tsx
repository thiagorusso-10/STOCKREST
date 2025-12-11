import React, { useState, useEffect } from 'react';
import { AppProvider, useStore } from './context/Store';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { InventoryManage } from './pages/InventoryManage';
import { InventoryFill } from './pages/InventoryFill';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

const Main = () => {
  const { user } = useStore();
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    if (user) {
      if (currentPage === 'login') {
        // Redirect logic on login
        setCurrentPage(user.role === 'admin' ? 'dashboard' : 'fill');
      }
    } else {
      setCurrentPage('login');
    }
  }, [user, currentPage]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return user.role === 'admin' ? <Dashboard /> : <div className="p-10 text-center font-bold">Acesso Negado</div>;
      case 'inventory':
        return user.role === 'admin' ? <InventoryManage /> : <div className="p-10 text-center font-bold">Acesso Negado</div>;
      case 'fill':
        return <InventoryFill />;
      case 'users':
        return user.role === 'admin' ? <UserManagement /> : <div className="p-10 text-center font-bold">Acesso Negado</div>;
      case 'settings':
        return user.role === 'admin' ? <Settings /> : <div className="p-10 text-center font-bold">Acesso Negado</div>;
      case 'logs':
        return user.role === 'admin' ? <AuditLogs /> : <div className="p-10 text-center font-bold">Acesso Negado</div>;
      default:
        return <InventoryFill />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigation}>
      {renderPage()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;