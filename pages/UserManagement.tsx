import React, { useState } from 'react';
import { useStore, User } from '../context/Store';
import { Plus, Edit, CheckCircle, XCircle, Calendar, Shield, Mail, Filter } from 'lucide-react';

export const UserManagement = () => {
  const { users, addUser, updateUser } = useStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<Partial<User>>({
    name: '', email: '', role: 'staff', password: '', status: 'active'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ role: 'staff', status: 'active' });
    }
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    if (editingUser) {
      updateUser({ ...editingUser, ...formData } as User);
    } else {
      addUser({ 
        id: Date.now().toString(), 
        createdAt: new Date().toISOString(),
        ...formData 
      } as User);
    }
    setModalOpen(false);
  };

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  };

  // Helper to translate roles
  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Funcionário';
  };

  // Filter Logic
  const filteredUsers = users.filter(u => {
    if (filterStatus === 'all') return true;
    return u.status === filterStatus;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase">Usuários</h1>
          <p className="text-gray-500">Gerencie o acesso da equipe.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 h-10 px-4 bg-primary text-white border-2 border-black font-bold shadow-brutalist hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-end mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
             <Filter size={18} />
          </div>
          <select
            className="w-full h-12 pl-10 pr-4 border-2 border-black bg-white focus:outline-none focus:border-primary font-bold text-sm uppercase appearance-none cursor-pointer shadow-brutalist-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Apenas Ativos</option>
            <option value="inactive">Apenas Inativos</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
             ▼
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full p-10 text-center border-2 border-dashed border-gray-300 rounded bg-gray-50">
            <p className="text-gray-500 font-bold uppercase">Nenhum usuário encontrado com este filtro.</p>
          </div>
        ) : (
          filteredUsers.map(u => (
            <div key={u.id} className="bg-white border-2 border-black shadow-brutalist p-6 flex flex-col gap-4 group transition-all hover:-translate-y-1">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-lg leading-tight mb-1">{u.name}</h3>
                   <span className={`inline-block px-2 py-0.5 text-xs font-bold border border-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'}`}>
                     {getRoleLabel(u.role)}
                   </span>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    {u.status === 'active' 
                      ? <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-green-700 font-bold border border-green-200 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={12}/> Ativo</span> 
                      : <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 font-bold border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-full"><XCircle size={12}/> Inativo</span>
                    }
                 </div>
               </div>
               
               <div className="space-y-2 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-2">
                     <Mail size={16} className="text-gray-400" />
                     <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={16} className="text-gray-400" />
                     <span>Criado em: <strong>{formatDate(u.createdAt)}</strong></span>
                  </div>
               </div>

               <div className="mt-auto pt-4 border-t-2 border-dashed border-gray-200">
                 <button 
                   onClick={() => handleOpenModal(u)}
                   className="w-full py-2 flex items-center justify-center gap-2 font-bold hover:bg-black hover:text-white transition-colors uppercase text-sm border-2 border-transparent hover:border-black"
                 >
                   <Edit size={16} /> Editar
                 </button>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black shadow-brutalist w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase mb-6">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold uppercase mb-1">Nome</label>
                 <input 
                   className="w-full border-2 border-black h-12 px-3 focus:outline-none focus:border-primary"
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   placeholder="Nome completo"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold uppercase mb-1">E-mail</label>
                 <input 
                   type="email"
                   className="w-full border-2 border-black h-12 px-3 focus:outline-none focus:border-primary"
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   placeholder="email@exemplo.com"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold uppercase mb-1">Senha</label>
                 <input 
                   type="text"
                   className="w-full border-2 border-black h-12 px-3 focus:outline-none focus:border-primary"
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   placeholder={editingUser ? 'Mantenha para não alterar' : 'Defina uma senha'}
                   required={!editingUser}
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold uppercase mb-1">Função</label>
                    <div className="relative">
                      <select 
                        className="w-full border-2 border-black h-12 px-3 bg-white focus:outline-none focus:border-primary appearance-none"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as any})}
                      >
                        <option value="staff">Funcionário</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold uppercase mb-1">Status</label>
                    <select 
                      className="w-full border-2 border-black h-12 px-3 bg-white focus:outline-none focus:border-primary"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                 </div>
               </div>

               <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 font-bold hover:bg-gray-100 uppercase text-sm">Cancelar</button>
                  <button type="submit" className="px-6 py-3 bg-primary text-white border-2 border-black font-black uppercase text-sm shadow-brutalist hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                    Salvar
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};