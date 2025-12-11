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

// NOTE: Ensure you have these variables in your .env file or Vercel Environment Variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// --- Context ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Settings are local-only for this version to simplify DB schema
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('stockrest_settings');
    return saved ? JSON.parse(saved) : { expiryThresholdDays: 3, lowStockPercentage: 20 };
  });

  // --- Data Mapping Helpers (DB Snake_case <-> App CamelCase) ---

  const mapUserFromDB = (u: any): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    password: u.password,
    status: u.status,
    createdAt: u.created_at
  });

  const mapCategoryFromDB = (c: any): Category => ({
    id: c.id,
    name: c.name
  });

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
    if (!supabase) return;
    
    try {
      // Fetch Users
      const { data: usersData } = await supabase.from('users').select('*').order('name');
      if (usersData) setUsers(usersData.map(mapUserFromDB));

      // Fetch Categories
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData.map(mapCategoryFromDB));

      // Fetch Items
      const { data: itemsData } = await supabase.from('items').select('*').order('name');
      if (itemsData) setItems(itemsData.map(mapItemFromDB));

      // Fetch Logs (Limit 50)
      const { data: logsData } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (logsData) setLogs(logsData.map(mapLogFromDB));

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // 1. Check Session Storage for logged user
    const storedUser = sessionStorage.getItem('stockrest_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Initial Data Load
    if (supabase) {
      setLoading(true);
      refreshData().finally(() => setLoading(false));
    } else {
      console.warn("Supabase keys missing. App running in offline/mock mode (empty).");
    }
  }, []);

  // --- Actions ---

  const addLog = async (action: Log['action'], details: string) => {
    if (!supabase) return;
    const newLog = {
      action,
      details,
      user_id: user?.id || 'system',
      user_name: user?.name || 'System',
      timestamp: new Date().toISOString()
    };
    
    // Optimistic update
    const tempLog: Log = { ...newLog, id: Math.random().toString(), userId: newLog.user_id, userName: newLog.user_name };
    setLogs(prev => [tempLog, ...prev]);

    await supabase.from('logs').insert(newLog);
    // Silent refresh not needed for logs usually
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!supabase) return false;
    
    // Simple custom auth query (Not secure for high-value production, but matches requested architecture)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', pass)
      .eq('status', 'active')
      .single();

    if (error || !data) return false;

    const loggedUser = mapUserFromDB(data);
    setUser(loggedUser);
    sessionStorage.setItem('stockrest_user', JSON.stringify(loggedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('stockrest_user');
  };

  const addUser = async (newUser: User) => {
    if (!supabase) return;
    const dbUser = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      password: newUser.password,
      status: newUser.status
    };
    await supabase.from('users').insert(dbUser);
    addLog('create', `Usuário criado: ${newUser.name}`);
    refreshData();
  };

  const updateUser = async (updatedUser: User) => {
    if (!supabase) return;
    const dbUser = {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      password: updatedUser.password, // Be careful updating passwords this way in real apps
      status: updatedUser.status
    };
    await supabase.from('users').update(dbUser).eq('id', updatedUser.id);
    addLog('update', `Usuário atualizado: ${updatedUser.name}`);
    refreshData();
  };

  const addCategory = async (name: string) => {
    if (!supabase) return;
    await supabase.from('categories').insert({ name });
    addLog('create', `Categoria criada: ${name}`);
    refreshData();
  };

  const deleteCategory = async (id: string) => {
    if (!supabase) return;
    const catName = categories.find(c => c.id === id)?.name || id;
    await supabase.from('categories').delete().eq('id', id);
    addLog('delete', `Categoria excluída: ${catName}`);
    refreshData();
  };

  const addItem = async (item: InventoryItem) => {
    if (!supabase) return;
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
    addLog('create', `Item criado: ${item.name}`);
    refreshData();
  };

  const updateItem = async (item: InventoryItem) => {
    if (!supabase) return;
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
    addLog('update', `Item atualizado: ${item.name}`);
    refreshData();
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    const itemName = items.find(i => i.id === id)?.name || id;
    await supabase.from('items').delete().eq('id', id);
    addLog('delete', `Item excluído: ${itemName}`);
    refreshData();
  };

  const updateStockBatch = async (updates: { id: string, currentStock: number, expiryDate: string }[], responsibleName: string) => {
    if (!supabase) return;
    
    // Process updates in a loop (Simple for MVP). Ideally use an RPC function or UPSERT.
    const now = new Date().toISOString().split('T')[0];
    let changedCount = 0;

    for (const update of updates) {
      // Find original to compare (optional, skipped for speed)
      // Just update
      const { error } = await supabase.from('items').update({
        current_stock: update.currentStock,
        expiry_date: update.expiryDate,
        last_count_date: now,
        responsible: responsibleName
      }).eq('id', update.id);
      
      if (!error) changedCount++;
    }

    if (changedCount > 0) {
      addLog('stock_update', `Estoque atualizado em massa (${changedCount} itens)`);
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