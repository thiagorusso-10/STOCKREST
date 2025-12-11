import React, { useState } from 'react';
import { useStore, InventoryItem } from '../context/Store';
import { Package, AlertOctagon, TrendingDown, CalendarClock, X, ArrowRight, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const { items, categories, user, settings } = useStore();
  const [activeMetric, setActiveMetric] = useState<'total' | 'outOfStock' | 'lowStock' | 'expiring' | 'value' | null>(null);

  // Helper para datas com correção de fuso horário
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getDaysUntilExpiry = (dateStr: string) => {
    if (!dateStr) return 999;
    const expiry = parseLocalDate(dateStr);
    if (!expiry || isNaN(expiry.getTime())) return 999;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora atual para comparação justa
    
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const isValidDate = (dateStr: any) => {
    return dateStr && !isNaN(new Date(dateStr).getTime());
  };

  const isLowStock = (item: InventoryItem) => {
    if (item.currentStock === 0) return false; // Handled by outOfStock
    const threshold = item.minStock * (1 + settings.lowStockPercentage / 100);
    return item.currentStock < threshold;
  };

  // --- Metrics Logic ---
  const getFilteredItems = (metric: string | null): InventoryItem[] => {
    switch (metric) {
      case 'total':
      case 'value': // Value shows all items
        return items;
      case 'outOfStock':
        return items.filter(i => i.currentStock === 0);
      case 'lowStock':
        return items.filter(i => isLowStock(i)); 
      case 'expiring':
        return items.filter(i => {
            const days = getDaysUntilExpiry(i.expiryDate);
            return days <= settings.expiryThresholdDays; 
        });
      default:
        return [];
    }
  };

  const metricTitles = {
    total: 'Total de Itens',
    outOfStock: 'Sem Estoque',
    lowStock: 'Estoque Baixo',
    expiring: 'Próx. Vencimento',
    value: 'Valor do Estoque'
  };

  // --- Calculations ---
  const totalItems = items.length;
  const outOfStockItems = items.filter(i => i.currentStock === 0).length;
  const lowStockItems = items.filter(i => isLowStock(i)).length;
  const expiringSoonItems = items.filter(i => getDaysUntilExpiry(i.expiryDate) <= settings.expiryThresholdDays).length;

  const totalValue = items.reduce((acc, item) => {
    return acc + (item.currentStock * (item.valuePerUnit || 0));
  }, 0);

  const formattedTotalValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL'
  }).format(totalValue);

  const StatCard = ({ id, title, value, icon: Icon, colorClass, bgClass, textClass, isLargeValue }: any) => (
    <button 
      onClick={() => setActiveMetric(id)}
      className={`w-full text-left border-2 border-black shadow-brutalist p-6 flex flex-col justify-between h-40 ${bgClass} transition-all hover:-translate-y-1 hover:shadow-brutalist-lg active:translate-y-[2px] active:shadow-none cursor-pointer group`}
    >
      <div className="flex justify-between items-start w-full">
        <span className={`font-black text-sm uppercase tracking-wider ${textClass}`}>{title}</span>
        <div className={`p-2 border-2 border-black transition-transform group-hover:rotate-12 ${colorClass === 'text-white' ? 'bg-black text-white' : 'bg-white'}`}>
            <Icon size={24} className={colorClass === 'text-white' ? '' : textClass} />
        </div>
      </div>
      <div className="flex items-end justify-between w-full">
        <span className={`font-black ${isLargeValue ? 'text-4xl' : 'text-6xl'} ${textClass}`}>{value}</span>
        <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase border-b-2 border-current ${textClass}`}>Ver lista</span>
      </div>
    </button>
  );

  const modalItems = getFilteredItems(activeMetric);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase mb-2">Dashboard</h1>
        <p className="text-gray-500">Visão geral do restaurante para {user?.name}.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            id="value"
            title="Valor em Estoque" 
            value={formattedTotalValue} 
            icon={DollarSign} 
            bgClass="bg-green-600" 
            textClass="text-white"
            colorClass="text-white"
            isLargeValue
        />
        <StatCard 
            id="total"
            title="Total de Itens" 
            value={totalItems} 
            icon={Package} 
            bgClass="bg-white" 
            textClass="text-gray-800" 
        />
        <StatCard 
            id="outOfStock"
            title="Sem Estoque" 
            value={outOfStockItems} 
            icon={AlertOctagon} 
            bgClass="bg-red-500" 
            textClass="text-white" 
            colorClass="text-white"
        />
        <StatCard 
            id="lowStock"
            title="Estoque Baixo" 
            value={lowStockItems} 
            icon={TrendingDown} 
            bgClass="bg-yellow-400" 
            textClass="text-black" 
        />
        <StatCard 
            id="expiring"
            title="Próx. Vencimento" 
            value={expiringSoonItems} 
            icon={CalendarClock} 
            bgClass="bg-orange-100" 
            textClass="text-orange-600" 
        />
      </div>

      {/* Detail Modal */}
      {activeMetric && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-brutalist w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-black bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black text-white">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase">{metricTitles[activeMetric]}</h2>
                  <p className="text-sm text-gray-600 font-bold">{modalItems.length} produtos encontrados</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveMetric(null)}
                className="p-2 hover:bg-gray-200 border-2 border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Table */}
            <div className="overflow-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b-2 border-black text-xs uppercase font-bold text-gray-600 sticky top-0">
                  <tr>
                    <th className="p-4 border-r border-gray-300">Produto</th>
                    <th className="p-4 border-r border-gray-300">Categoria</th>
                    <th className="p-4 border-r border-gray-300">Valor Unit.</th>
                    <th className="p-4 border-r border-gray-300">Estoque</th>
                    <th className="p-4 border-r border-gray-300">Validade</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modalItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                        Nenhum item encontrado nesta categoria.
                      </td>
                    </tr>
                  ) : (
                    modalItems.map(item => {
                      const days = getDaysUntilExpiry(item.expiryDate);
                      const catName = categories.find(c => c.id === item.categoryId)?.name || 'Sem categoria';
                      const expiryDateObj = parseLocalDate(item.expiryDate);
                      const itemIsLow = isLowStock(item);

                      return (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-4 border-r border-gray-200 font-bold text-gray-800">
                            {item.name}
                            <span className="block text-xs font-normal text-gray-500">{item.unit}</span>
                          </td>
                          <td className="p-4 border-r border-gray-200 text-sm text-gray-600">
                            {catName}
                          </td>
                          <td className="p-4 border-r border-gray-200 text-sm text-gray-600 font-mono">
                            {item.valuePerUnit ? `R$ ${item.valuePerUnit.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-4 border-r border-gray-200">
                            <div className="flex flex-col">
                              <span className={`font-bold ${item.currentStock === 0 ? 'text-red-600' : ''}`}>
                                {item.currentStock}
                              </span>
                              <span className="text-xs text-gray-400">Mín: {item.minStock}</span>
                            </div>
                          </td>
                          <td className="p-4 border-r border-gray-200 font-mono text-sm">
                             {expiryDateObj ? expiryDateObj.toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 text-xs font-bold uppercase">
                            {item.currentStock === 0 && (
                              <span className="bg-red-100 text-red-700 px-2 py-1 border border-red-200">Sem Estoque</span>
                            )}
                            {itemIsLow && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 border border-yellow-200">Baixo</span>
                            )}
                            {days <= settings.expiryThresholdDays && item.currentStock > 0 && (
                              <span className="ml-1 bg-orange-100 text-orange-700 px-2 py-1 border border-orange-200">Vence em {days}d</span>
                            )}
                            {!itemIsLow && item.currentStock > 0 && days > settings.expiryThresholdDays && (
                               <span className="bg-green-100 text-green-700 px-2 py-1 border border-green-200">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end">
              <button 
                onClick={() => setActiveMetric(null)}
                className="px-6 py-2 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors shadow-brutalist-sm"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};