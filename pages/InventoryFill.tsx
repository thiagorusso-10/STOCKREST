import React, { useState, useEffect } from 'react';
import { useStore, InventoryItem } from '../context/Store';
import { Save, X, Search, Filter } from 'lucide-react';

export const InventoryFill = () => {
  const { categories, items, updateStockBatch, user, settings } = useStore();
  const [localItems, setLocalItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize local state when global items change (or on mount)
  useEffect(() => {
    // Deep copy to avoid mutating global state directly
    setLocalItems(JSON.parse(JSON.stringify(items)));
  }, [items]);

  const handleQuantityChange = (id: string, val: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, currentStock: parseFloat(val) || 0 };
      }
      return item;
    }));
  };

  const handleExpiryChange = (id: string, val: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, expiryDate: val };
      }
      return item;
    }));
  };

  const handleDiscard = () => {
    setLocalItems(JSON.parse(JSON.stringify(items)));
    setNotification("Alterações descartadas.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    const updates = localItems.map(i => ({
      id: i.id,
      currentStock: i.currentStock,
      expiryDate: i.expiryDate
    }));
    
    updateStockBatch(updates, user?.name || 'Staff');
    
    // Calculate stats for notification using settings
    const lowStockCount = localItems.filter(i => {
       const threshold = i.minStock * (1 + settings.lowStockPercentage / 100);
       return i.currentStock < threshold;
    }).length;

    const expiringCount = localItems.filter(i => {
      if (!i.expiryDate || isNaN(new Date(i.expiryDate).getTime())) return false;
      const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24)) <= settings.expiryThresholdDays;
    }).length;

    setNotification(`Salvo! ${localItems.length} itens atualizados. ${lowStockCount} abaixo do mínimo/margem. ${expiringCount} vencendo.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const isValidDate = (dateStr: any) => {
    return dateStr && !isNaN(new Date(dateStr).getTime());
  };

  const filteredItems = localItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-32">
       {/* Top Bar Sticky */}
       <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur py-4 border-b-2 border-black -mx-4 px-4 md:-mx-8 md:px-8 mb-6 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-black uppercase">Preenchimento</h1>
            
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={handleDiscard}
                className="flex items-center gap-2 h-10 px-4 bg-gray-200 border-2 border-black font-bold text-sm shadow-brutalist-sm hover:bg-gray-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <X size={16} /> <span className="hidden sm:inline">Descartar</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 h-10 px-4 bg-primary text-white border-2 border-black font-bold text-sm shadow-brutalist-sm hover:bg-primary-dark hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
         </div>
         
         {notification && (
           <div className="absolute top-full left-0 right-0 bg-black text-white p-2 text-center font-bold text-sm animate-pulse">
             {notification}
           </div>
         )}
       </div>

       {/* Filters */}
       <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               className="w-full h-10 pl-10 pr-4 border-2 border-black focus:outline-none focus:border-primary"
               placeholder="Buscar por produto..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <select 
               className="w-full h-10 pl-10 pr-4 border-2 border-black bg-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
               value={selectedCategory}
               onChange={e => setSelectedCategory(e.target.value)}
             >
               <option value="all">Todas as Categorias</option>
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
       </div>

       {/* Table */}
       <div className="border-2 border-black bg-white shadow-brutalist overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead className="bg-gray-100 border-b-2 border-black text-xs uppercase font-bold text-gray-600">
               <tr>
                 <th className="p-4 border-r border-gray-300 min-w-[200px]">Produto</th>
                 <th className="p-4 border-r border-gray-300 w-20">Unid.</th>
                 <th className="p-4 border-r border-gray-300 w-24">Mínimo</th>
                 <th className="p-4 border-r border-gray-300 min-w-[120px]">Qtd. Atual</th>
                 <th className="p-4 border-r border-gray-300 min-w-[150px]">Validade</th>
                 <th className="p-4 min-w-[150px]">Responsável</th>
               </tr>
             </thead>
             <tbody>
               {filteredItems.map(item => {
                 const lowStockThreshold = item.minStock * (1 + settings.lowStockPercentage / 100);
                 const isLowStock = item.currentStock < lowStockThreshold;
                 
                 let isExpiring = false;
                 
                 if (isValidDate(item.expiryDate)) {
                   const diffTime = new Date(item.expiryDate).getTime() - new Date().getTime();
                   isExpiring = Math.ceil(diffTime / (1000 * 3600 * 24)) <= settings.expiryThresholdDays;
                 }

                 return (
                   <tr 
                      key={item.id} 
                      className={`
                        border-b border-gray-200 last:border-0 
                        ${isExpiring ? 'bg-red-50' : 'hover:bg-gray-50'}
                      `}
                   >
                     <td className="p-4 border-r border-gray-200">
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        {isExpiring && <span className="text-[10px] text-red-600 font-bold uppercase">Vencimento Próximo</span>}
                     </td>
                     <td className="p-4 border-r border-gray-200 text-sm">{item.unit}</td>
                     <td className="p-4 border-r border-gray-200 text-sm">{item.minStock}</td>
                     <td className={`p-4 border-r border-gray-200 ${isLowStock ? 'bg-yellow-50' : ''}`}>
                       <input 
                         type="number" 
                         className={`w-full h-8 px-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none ${isLowStock ? 'bg-yellow-100 font-bold text-yellow-900' : ''}`}
                         value={item.currentStock}
                         onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                         onFocus={(e) => e.target.select()}
                       />
                     </td>
                     <td className="p-4 border-r border-gray-200">
                       <input 
                         type="date" 
                         className="w-full h-8 px-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-none bg-transparent"
                         value={isValidDate(item.expiryDate) ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                         onChange={(e) => handleExpiryChange(item.id, e.target.value)}
                       />
                     </td>
                     <td className="p-4 text-sm text-gray-500">
                       {user?.name}
                     </td>
                   </tr>
                 );
               })}
               {filteredItems.length === 0 && (
                 <tr>
                   <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto encontrado.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};