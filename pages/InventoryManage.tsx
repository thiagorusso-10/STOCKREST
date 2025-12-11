import React, { useState } from 'react';
import { useStore, InventoryItem } from '../context/Store';
import { Plus, Trash2, Edit2, AlertTriangle, Search, XCircle, CheckCircle, ArrowUpDown, Download } from 'lucide-react';

export const InventoryManage = () => {
  const { categories, items, addCategory, deleteCategory, addItem, deleteItem, updateItem, user, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem | 'totalValue', direction: 'asc' | 'desc' } | null>(null);

  // Modal States
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, name: string, count: number} | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form States
  const [newCatName, setNewCatName] = useState('');
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: '', unit: 'Kg', minStock: 0, currentStock: 0, categoryId: categories[0]?.id || '', valuePerUnit: 0
  });

  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showNotification = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const isValidDate = (dateStr: any) => {
    return dateStr && !isNaN(new Date(dateStr).getTime());
  };

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

  const handleSaveCategory = () => {
    if (newCatName.trim()) {
      addCategory(newCatName);
      setNewCatName('');
      setCategoryModalOpen(false);
      showNotification('Categoria criada com sucesso.', 'success');
    }
  };

  const onRequestDeleteCategory = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    const itemCount = items.filter(i => i.categoryId === id).length;
    setDeleteConfirmation({ id, name, count: itemCount });
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirmation) {
      if (deleteConfirmation.count > 0) {
        showNotification(`Não é possível excluir. A categoria possui ${deleteConfirmation.count} itens.`, 'error');
      } else {
        deleteCategory(deleteConfirmation.id);
        showNotification(`Categoria "${deleteConfirmation.name}" excluída.`, 'success');
      }
      setDeleteConfirmation(null);
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.categoryId) return;

    const newItem: InventoryItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: itemForm.name!,
      unit: itemForm.unit || 'Kg',
      minStock: Number(itemForm.minStock) || 0,
      currentStock: Number(itemForm.currentStock) || 0,
      categoryId: itemForm.categoryId!,
      lastCountDate: editingItem?.lastCountDate || new Date().toISOString().split('T')[0],
      expiryDate: itemForm.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      responsible: editingItem?.responsible || user?.name || 'Admin',
      valuePerUnit: itemForm.valuePerUnit ? Number(itemForm.valuePerUnit) : undefined,
    };

    if (editingItem) {
      updateItem(newItem);
      showNotification('Item atualizado com sucesso.', 'success');
    } else {
      addItem(newItem);
      showNotification('Item adicionado com sucesso.', 'success');
    }
    
    closeItemModal();
  };

  const openItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm(item);
    } else {
      setEditingItem(null);
      setItemForm({ categoryId: categories[0]?.id || categories[0]?.id || '', unit: 'Kg' });
    }
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(null);
    setItemForm({});
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- Sorting Logic ---
  const handleSort = (key: keyof InventoryItem | 'totalValue') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortItems = (itemsToSort: InventoryItem[]) => {
    if (!sortConfig) return itemsToSort;

    return [...itemsToSort].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof InventoryItem];
      let bValue: any = b[sortConfig.key as keyof InventoryItem];

      // Special handling for calculated Total Value
      if (sortConfig.key === 'totalValue') {
        aValue = (a.currentStock || 0) * (a.valuePerUnit || 0);
        bValue = (b.currentStock || 0) * (b.valuePerUnit || 0);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // --- Export Logic ---
  const handleExport = () => {
    const csvRows = [
      ["Produto", "Categoria", "Estoque Atual", "Estoque Minimo", "Unidade", "Status", "Valor Unit.", "Valor Total"]
    ];

    items.forEach(item => {
      const lowStockThreshold = item.minStock * (1 + settings.lowStockPercentage / 100);
      const isLowStock = item.currentStock > 0 && item.currentStock < lowStockThreshold;
      const isOutOfStock = item.currentStock === 0;
      let status = 'OK';
      if (isOutOfStock) status = 'SEM ESTOQUE';
      else if (isLowStock) status = 'BAIXO';

      // Only export items that need attention (Optional: could export all)
      if (status !== 'OK') {
        const catName = categories.find(c => c.id === item.categoryId)?.name || '';
        const totalVal = (item.currentStock * (item.valuePerUnit || 0)).toFixed(2);
        
        csvRows.push([
          `"${item.name}"`, 
          `"${catName}"`, 
          item.currentStock.toString(),
          item.minStock.toString(),
          item.unit,
          status,
          (item.valuePerUnit || 0).toString(),
          totalVal
        ]);
      }
    });

    if (csvRows.length === 1) {
      showNotification("Nenhum item em falta para exportar.", "error");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lista_compras_stockrest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Lista de compras (itens em falta) exportada!", "success");
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-20 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 border-2 border-black shadow-brutalist transition-all transform animate-in slide-in-from-top-2 ${notification.type === 'error' ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
          {notification.type === 'error' ? <XCircle size={24} /> : <CheckCircle size={24} />}
          <span className="font-bold text-sm uppercase tracking-wide whitespace-pre-wrap">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70"><XCircle size={16} /></button>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase mb-1">Gestão de Estoque</h1>
          <p className="text-gray-500">Estrutura e monitoramento completo.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 h-10 px-4 bg-yellow-100 border-2 border-black font-bold uppercase text-sm shadow-brutalist hover:bg-yellow-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-yellow-900"
            title="Baixar lista de itens em falta"
          >
            <Download size={16} /> Exportar Lista
          </button>
          <button 
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 h-10 px-4 bg-white border-2 border-black font-bold uppercase text-sm shadow-brutalist hover:bg-gray-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Plus size={16} /> Categoria
          </button>
          <button 
            onClick={() => openItemModal()}
            className="flex items-center gap-2 h-10 px-4 bg-primary text-white border-2 border-black font-bold uppercase text-sm shadow-brutalist hover:bg-primary-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Plus size={16} /> Item
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          className="w-full h-12 pl-12 pr-4 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-primary"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-10">
        {categories.length === 0 && (
          <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded bg-gray-50">
            <p className="text-gray-500 font-bold uppercase">Nenhuma categoria encontrada.</p>
            <button onClick={() => setCategoryModalOpen(true)} className="mt-4 text-primary font-bold hover:underline">Criar primeira categoria</button>
          </div>
        )}

        {categories.map(category => {
          let categoryItems = filteredItems.filter(i => i.categoryId === category.id);
          categoryItems = sortItems(categoryItems); // Apply sorting

          if (categoryItems.length === 0 && searchTerm) return null;

          return (
            <section key={category.id} className="group">
              <div className="flex items-center justify-between mb-4 border-l-8 border-black pl-3 bg-gray-50/50 py-2 pr-3 transition-colors hover:bg-gray-100">
                <h2 className="text-2xl font-black uppercase tracking-tight">{category.name}</h2>
                <button 
                  type="button"
                  onClick={(e) => onRequestDeleteCategory(category.id, category.name, e)}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer z-10"
                  title="Excluir Categoria"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="overflow-x-auto border-2 border-black shadow-brutalist bg-white">
                <table className="w-full min-w-[1000px] text-left border-collapse">
                  <thead className="bg-gray-100 border-b-2 border-black text-sm uppercase font-bold text-gray-600">
                    <tr>
                      <th className="p-4 border-r border-gray-300 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">Produto <ArrowUpDown size={14} /></div>
                      </th>
                      <th className="p-4 border-r border-gray-300 w-24">Unidade</th>
                      <th className="p-4 border-r border-gray-300 w-32 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('valuePerUnit')}>
                         <div className="flex items-center gap-1">Valor Un. <ArrowUpDown size={14} /></div>
                      </th>
                      <th className="p-4 border-r border-gray-300 w-32 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('totalValue')}>
                         <div className="flex items-center gap-1">Valor Total <ArrowUpDown size={14} /></div>
                      </th>
                      <th className="p-4 border-r border-gray-300 w-32">Min</th>
                      <th className="p-4 border-r border-gray-300 w-32 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('currentStock')}>
                        <div className="flex items-center gap-1">Atual <ArrowUpDown size={14} /></div>
                      </th>
                      <th className="p-4 border-r border-gray-300 w-32 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('expiryDate')}>
                        <div className="flex items-center gap-1">Validade <ArrowUpDown size={14} /></div>
                      </th>
                      <th className="p-4 border-r border-gray-300">Responsável</th>
                      <th className="p-4 w-32 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.length === 0 ? (
                      <tr><td colSpan={9} className="p-8 text-center text-gray-500 italic">Nenhum item nesta categoria.</td></tr>
                    ) : categoryItems.map((item, idx) => {
                      const lowStockThreshold = item.minStock * (1 + settings.lowStockPercentage / 100);
                      const isLowStock = item.currentStock > 0 && item.currentStock < lowStockThreshold;
                      const isOutOfStock = item.currentStock === 0;
                      
                      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                      const isExpiring = daysUntilExpiry <= settings.expiryThresholdDays;
                      const expiryDateObj = parseLocalDate(item.expiryDate);

                      const totalValue = (item.currentStock || 0) * (item.valuePerUnit || 0);

                      // Row color logic
                      let rowClass = 'bg-green-100 hover:bg-green-200'; // Normal
                      if (isOutOfStock) {
                        rowClass = 'bg-red-200 hover:bg-red-300';
                      } else if (isLowStock) {
                        rowClass = 'bg-yellow-100 hover:bg-yellow-200';
                      }

                      // Cell color logic
                      const dateCellClass = isExpiring ? 'bg-yellow-300 font-bold border-2 border-yellow-500 text-yellow-900' : 'text-gray-600';

                      return (
                        <tr 
                          key={item.id} 
                          className={`border-b border-gray-200 last:border-0 transition-colors ${rowClass}`}
                        >
                          <td className="p-4 border-r border-gray-200 font-bold text-gray-800">
                             <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                   {isExpiring && <AlertTriangle size={16} className="text-yellow-600" />}
                                   <span>{item.name}</span>
                                </div>
                              </div>
                          </td>
                          <td className="p-4 border-r border-gray-200 text-gray-600">{item.unit}</td>
                          <td className="p-4 border-r border-gray-200 text-gray-600 font-mono text-sm">
                            {formatCurrency(item.valuePerUnit)}
                          </td>
                           <td className="p-4 border-r border-gray-200 text-gray-800 font-mono text-sm font-bold">
                            {formatCurrency(totalValue)}
                          </td>
                          <td className="p-4 border-r border-gray-200 text-gray-600">{item.minStock}</td>
                          <td className={`p-4 border-r border-gray-200 font-bold text-gray-800`}>
                            {item.currentStock}
                          </td>
                          <td className={`p-4 border-r border-gray-200 font-mono text-sm ${dateCellClass}`}>
                            {expiryDateObj ? expiryDateObj.toLocaleDateString() : '-'}
                          </td>
                          <td className="p-4 border-r border-gray-200 text-sm text-gray-600">{item.responsible}</td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <button onClick={() => openItemModal(item)} className="p-2 hover:bg-blue-100 text-primary rounded"><Edit2 size={16}/></button>
                            <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-red-100 text-red-500 rounded"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-brutalist w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle size={32} />
              <h3 className="text-xl font-black uppercase">Excluir Categoria</h3>
            </div>
            
            <div className="mb-8 text-gray-700">
              {deleteConfirmation.count > 0 ? (
                <>
                  <p className="mb-2">Você está prestes a excluir a categoria <strong>{deleteConfirmation.name}</strong>.</p>
                  <p className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm font-bold">
                     ⚠️ Esta categoria possui {deleteConfirmation.count} itens.
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Para excluir a categoria, primeiro remova ou mova todos os itens dela.</p>
                </>
              ) : (
                <p>Tem certeza que deseja excluir a categoria <strong>{deleteConfirmation.name}</strong>?</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="px-4 py-2 font-bold hover:bg-gray-100 border-2 border-transparent"
              >
                Cancelar
              </button>
              {deleteConfirmation.count === 0 && (
                <button 
                  onClick={confirmDeleteCategory} 
                  className="px-4 py-2 bg-red-600 text-white border-2 border-black font-bold shadow-brutalist-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none hover:bg-red-700"
                >
                  Sim, Excluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-brutalist w-full max-w-sm p-6">
            <h3 className="text-xl font-black uppercase mb-4">Nova Categoria</h3>
            <input 
              className="w-full border-2 border-black h-12 px-3 mb-6 focus:outline-none focus:border-primary"
              placeholder="Ex: Frutos do Mar"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 font-bold hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSaveCategory} className="px-4 py-2 bg-primary text-white border-2 border-black font-bold shadow-brutalist-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-brutalist w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase mb-4">{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nome do Produto</label>
                <input 
                  className="w-full border-2 border-black h-10 px-3 focus:outline-none focus:border-primary"
                  value={itemForm.name || ''}
                  onChange={e => setItemForm({...itemForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Categoria</label>
                  <select 
                    className="w-full border-2 border-black h-10 px-3 bg-white focus:outline-none focus:border-primary"
                    value={itemForm.categoryId}
                    onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Unidade</label>
                  <select 
                     className="w-full border-2 border-black h-10 px-3 bg-white focus:outline-none focus:border-primary"
                     value={itemForm.unit}
                     onChange={e => setItemForm({...itemForm, unit: e.target.value})}
                  >
                    <option value="Kg">Kg</option>
                    <option value="Lt">Lt</option>
                    <option value="Un">Un</option>
                    <option value="Gr">Gr</option>
                    <option value="Cx">Cx</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Valor por Unidade (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border-2 border-black h-10 px-3 focus:outline-none focus:border-primary"
                  value={itemForm.valuePerUnit || ''}
                  onChange={e => setItemForm({...itemForm, valuePerUnit: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Estoque Mínimo</label>
                  <input 
                    type="number"
                    className="w-full border-2 border-black h-10 px-3 focus:outline-none focus:border-primary"
                    value={itemForm.minStock}
                    onChange={e => setItemForm({...itemForm, minStock: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Estoque Atual</label>
                  <input 
                    type="number"
                    className="w-full border-2 border-black h-10 px-3 focus:outline-none focus:border-primary"
                    value={itemForm.currentStock}
                    onChange={e => setItemForm({...itemForm, currentStock: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-bold mb-1">Validade</label>
                <input 
                  type="date"
                  className="w-full border-2 border-black h-10 px-3 focus:outline-none focus:border-primary"
                  value={isValidDate(itemForm.expiryDate) ? new Date(itemForm.expiryDate!).toISOString().split('T')[0] : ''}
                  onChange={e => setItemForm({...itemForm, expiryDate: e.target.value})}
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={closeItemModal} className="px-4 py-2 font-bold hover:bg-gray-100">Cancelar</button>
              <button onClick={handleSaveItem} className="px-4 py-2 bg-primary text-white border-2 border-black font-bold shadow-brutalist-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};