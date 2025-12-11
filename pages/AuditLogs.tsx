import React, { useState } from 'react';
import { useStore, Log } from '../context/Store';
import { Search, Clock, ShieldAlert, History } from 'lucide-react';

export const AuditLogs = () => {
  const { logs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Criação';
      case 'update': return 'Atualização';
      case 'delete': return 'Exclusão';
      case 'stock_update': return 'Estoque';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      case 'stock_update': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
       <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-black text-white shadow-brutalist-sm">
                <History size={24} />
            </div>
            <h1 className="text-4xl font-black uppercase">Histórico</h1>
        </div>
        <p className="text-gray-500">Registro de todas as atividades do sistema.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full h-12 pl-10 pr-4 border-2 border-black focus:outline-none focus:border-primary shadow-brutalist-sm"
              placeholder="Buscar por usuário ou detalhes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <select 
           className="h-12 border-2 border-black px-4 bg-white font-bold uppercase text-sm shadow-brutalist-sm focus:outline-none"
           value={filterAction}
           onChange={e => setFilterAction(e.target.value)}
         >
           <option value="all">Todas Ações</option>
           <option value="create">Criação</option>
           <option value="update">Edição</option>
           <option value="delete">Exclusão</option>
           <option value="stock_update">Estoque</option>
         </select>
      </div>

      {/* Timeline / List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
           <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded bg-gray-50">
             <ShieldAlert className="mx-auto mb-2 text-gray-400" size={32} />
             <p className="text-gray-500 font-bold uppercase">Nenhum registro encontrado.</p>
           </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-white border-2 border-black p-4 shadow-brutalist-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                <div className="flex items-start gap-4">
                    <div className={`px-3 py-1 rounded text-xs font-black uppercase border ${getActionColor(log.action)} w-24 text-center shrink-0`}>
                        {getActionLabel(log.action)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">{log.details}</p>
                        <p className="text-sm text-gray-500">Por: <span className="font-semibold text-black">{log.userName}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-mono shrink-0">
                    <Clock size={14} />
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};