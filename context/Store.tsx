import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Types ---

export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  status: 'active' | 'inactive';
  createdAt: string; 
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  minStock: number;
  currentStock: number;
  lastCountDate: string;
  expiryDate: string;
  responsible: string;
  categoryId: string;
  valuePerUnit?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface AppSettings {
  expiryThresholdDays: number;
  lowStockPercentage: number;
}

export interface Log {
  id: string;
  action: 'create' | 'update' | 'delete' | 'stock_update';
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;

  categories: Category[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;

  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  updateStockBatch: (updates: { id: string, currentStock: number, expiryDate: string }[], responsibleName: string) => void;

  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;

  logs: Log[];
  loading: boolean;
}

// --- Supabase Client ---

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// --- Mock Data for MVP/Demo ---
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Proteínas' },
  { id: '2', name: 'Hortifruti' },
  { id: '3', name: 'Bebidas' },
  { id: '4', name: 'Mercearia' }
];

const MOCK_ITEMS: InventoryItem[] = [
  { id: '101', name: 'Filé Mignon Limpo', unit: 'Kg', minStock: 5, currentStock: 12.5, lastCountDate: '2024-03-01', expiryDate: '2024-03-10', responsible: 'Chef', categoryId: '1', valuePerUnit: 89.90 },
  { id: '102', name: 'Salmão Fresco', unit: 'Kg', minStock: 3, currentStock: 0, lastCountDate: '2024-03-01', expiryDate: '2024-03-05', responsible: 'Chef', categoryId: '1', valuePerUnit: 120.00 },
  { id: '103', name: 'Tomate Italiano', unit: 'Kg', minStock: 10, currentStock: 8, lastCountDate: '2024-03-02', expiryDate: '2024-03-08', responsible: 'Estoque', categoryId: '2', valuePerUnit: 8.50 },
  { id: '104', name: 'Coca-Cola Lata', unit: 'Un', minStock: 48, currentStock: 120, lastCountDate: '2024-02-28', expiryDate: '2024-12-01', responsible: 'Bar', categoryId: '3', valuePerUnit: 2.50 },
  { id: '105', name: 'Arroz Arbóreo', unit: 'Kg', minStock: 5, currentStock: 2, lastCountDate: '2024-02-20', expiryDate: '2025-01-01', responsible: 'Estoque', categoryId: '4', valuePerUnit: 22.00 },
];

const MOCK_LOGS: Log[] = [
  { id: 'l1', action: 'create', details: 'Sistema iniciado em modo demonstração', userId: 'system', userName: 'System', timestamp: new Date().toISOString() }
];

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('stockrest_settings');
    return saved ? JSON.parse(saved) : { expiryThresholdDays: 3, lowStockPercentage: 20 };
  });

  // --- Data Mapping Helpers ---

  const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    password: u.password,
    status: u.status,
    createdAt: u.created_at
  });

  const mapCategoryFromDB = (c: any): Category => ({ id: c.id, name: c.name });

  const mapItemFromDB = (i: any): InventoryItem => ({
    id: i.id,
    name: i.name,
    unit: i.unit,
    minStock: Number(i.min_stock),
    currentStock: Number(i.current_stock),
    valuePerUnit: Number(i.value_per_unit),
    lastCountDate: i.last_count_date,
    expiryDate: i.expiry_date,
    responsible: i.responsible,
    categoryId: i.category_id
  });

  const mapLogFromDB = (l: any): Log => ({
    id: l.id,
    action: l.action,
    details: l.details,
    userId: l.user_id,
    userName: l.user_name,
    timestamp: l.timestamp
  });

  // --- Data Fetching ---

  const refreshData = async () => {
    if (!supabase) {
      // Mock Data Load
      setCategories(MOCK_CATEGORIES);
      setItems(MOCK_ITEMS);
      setLogs(MOCK_LOGS);
      setUsers([{ id: 'demo', name: 'Admin Demo', email: 'admin@gmail.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() }]);
      return;
    }
    
    try {
      const { data: usersData } = await supabase.from('users').select('*').order('name');
      if (usersData) setUsers(usersData.map(mapUserFromDB));

      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData.map(mapCategoryFromDB));

      const { data: itemsData } = await supabase.from('items').select('*').order('name');
      if (itemsData) setItems(itemsData.map(mapItemFromDB));

      const { data: logsData } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (logsData) setLogs(logsData.map(mapLogFromDB));

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem('stockrest_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(true);
    refreshData().finally(() => setLoading(false));
  }, []);

  // --- Actions ---

  const addLog = async (action: Log['action'], details: string) => {
    const newLog = {
      action,
      details,
      user_id: user?.id || 'system',
      user_name: user?.name || 'System',
      timestamp: new Date().toISOString()
    };
    
    // Local Update
    const tempLog: Log = { ...newLog, id: Math.random().toString(), userId: newLog.user_id, userName: newLog.user_name };
    setLogs(prev => [tempLog, ...prev]);

    if (supabase) {
      await supabase.from('logs').insert(newLog);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    // 1. Try Supabase Login
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        const loggedUser = mapUserFromDB(data);
        setUser(loggedUser);
        sessionStorage.setItem('stockrest_user', JSON.stringify(loggedUser));
        return true;
      }
    }

    // 2. Demo Fallback (If Supabase fails or is missing)
    if (email === 'admin@gmail.com' && pass === 'admin') {
      const demoUser: User = { 
        id: 'demo-admin', 
        name: 'Admin Demonstração', 
        email: 'admin@gmail.com', 
        role: 'admin', 
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setUser(demoUser);
      sessionStorage.setItem('stockrest_user', JSON.stringify(demoUser));
      
      // Ensure data is loaded
      if (items.length === 0) refreshData();
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('stockrest_user');
  };

  const addUser = async (newUser: User) => {
    // Local
    setUsers(prev => [...prev, newUser]);
    addLog('create', `Usuário criado: ${newUser.name}`);
    
    // DB
    if (supabase) {
      const dbUser = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        status: newUser.status
      };
      await supabase.from('users').insert(dbUser);
      refreshData();
    }
  };

  const updateUser = async (updatedUser: User) => {
    // Local
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addLog('update', `Usuário atualizado: ${updatedUser.name}`);

    // DB
    if (supabase) {
      const dbUser = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        password: updatedUser.password,
        status: updatedUser.status
      };
      await supabase.from('users').update(dbUser).eq('id', updatedUser.id);
      refreshData();
    }
  };

  const addCategory = async (name: string) => {
    // Local
    const newCat = { id: Date.now().toString(), name };
    setCategories(prev => [...prev, newCat]);
    addLog('create', `Categoria criada: ${name}`);

    // DB
    if (supabase) {
      await supabase.from('categories').insert({ name });
      refreshData();
    }
  };

  const deleteCategory = async (id: string) => {
    const catName = categories.find(c => c.id === id)?.name || id;
    // Local
    setCategories(prev => prev.filter(c => c.id !== id));
    addLog('delete', `Categoria excluída: ${catName}`);

    // DB
    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
      refreshData();
    }
  };

  const addItem = async (item: InventoryItem) => {
    // Local
    setItems(prev => [...prev, item]);
    addLog('create', `Item criado: ${item.name}`);

    // DB
    if (supabase) {
      const dbItem = {
        name: item.name,
        unit: item.unit,
        min_stock: item.minStock,
        current_stock: item.currentStock,
        value_per_unit: item.valuePerUnit,
        last_count_date: item.lastCountDate,
        expiry_date: item.expiryDate,
        responsible: item.responsible,
        category_id: item.categoryId
      };
      await supabase.from('items').insert(dbItem);
      refreshData();
    }
  };

  const updateItem = async (item: InventoryItem) => {
    // Local
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    addLog('update', `Item atualizado: ${item.name}`);

    // DB
    if (supabase) {
      const dbItem = {
        name: item.name,
        unit: item.unit,
        min_stock: item.minStock,
        current_stock: item.currentStock,
        value_per_unit: item.valuePerUnit,
        last_count_date: item.lastCountDate,
        expiry_date: item.expiryDate,
        responsible: item.responsible,
        category_id: item.categoryId
      };
      await supabase.from('items').update(dbItem).eq('id', item.id);
      refreshData();
    }
  };

  const deleteItem = async (id: string) => {
    const itemName = items.find(i => i.id === id)?.name || id;
    // Local
    setItems(prev => prev.filter(i => i.id !== id));
    addLog('delete', `Item excluído: ${itemName}`);

    // DB
    if (supabase) {
      await supabase.from('items').delete().eq('id', id);
      refreshData();
    }
  };

  const updateStockBatch = async (updates: { id: string, currentStock: number, expiryDate: string }[], responsibleName: string) => {
    const now = new Date().toISOString().split('T')[0];
    
    // Local Update
    setItems(prev => prev.map(item => {
      const update = updates.find(u => u.id === item.id);
      if (update) {
        return { 
          ...item, 
          currentStock: update.currentStock, 
          expiryDate: update.expiryDate,
          lastCountDate: now,
          responsible: responsibleName
        };
      }
      return item;
    }));
    
    const changedCount = updates.length;
    if (changedCount > 0) {
      addLog('stock_update', `Estoque atualizado em massa (${changedCount} itens)`);
    }

    // DB
    if (supabase) {
      for (const update of updates) {
        await supabase.from('items').update({
          current_stock: update.currentStock,
          expiry_date: update.expiryDate,
          last_count_date: now,
          responsible: responsibleName
        }).eq('id', update.id);
      }
      refreshData();
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('stockrest_settings', JSON.stringify(newSettings));
    addLog('update', 'Configurações locais atualizadas');
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      users, addUser, updateUser,
      categories, addCategory, deleteCategory,
      items, addItem, updateItem, deleteItem, updateStockBatch,
      settings, updateSettings,
      logs, loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};

