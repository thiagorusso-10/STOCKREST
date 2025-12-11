import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Save, AlertTriangle, TrendingDown } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState({
    expiryThresholdDays: 1,
    lowStockPercentage: 10
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      expiryThresholdDays: Number(formData.expiryThresholdDays),
      lowStockPercentage: Number(formData.lowStockPercentage)
    });
    setNotification('Configurações salvas com sucesso!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase">Configurações</h1>
          <p className="text-gray-500">Ajuste os parâmetros de alertas do sistema.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-brutalist p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Expiry Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b-2 border-dashed border-gray-200 pb-2">
              <AlertTriangle className="text-primary" size={24} />
              <h2 className="text-xl font-black uppercase">Alerta de Validade</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Dias para aviso prévio</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full border-2 border-black h-12 px-3 focus:outline-none focus:border-primary text-lg"
                  value={formData.expiryThresholdDays}
                  onChange={(e) => setFormData({...formData, expiryThresholdDays: parseInt(e.target.value) || 0})}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Produtos vencerão em <strong>{formData.expiryThresholdDays} dias</strong> ou menos aparecerão como alerta crítico.
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock Settings */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 border-b-2 border-dashed border-gray-200 pb-2">
              <TrendingDown className="text-primary" size={24} />
              <h2 className="text-xl font-black uppercase">Alerta de Estoque Baixo</h2>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Margem de segurança (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    className="w-full border-2 border-black h-12 px-3 focus:outline-none focus:border-primary text-lg"
                    value={formData.lowStockPercentage}
                    onChange={(e) => setFormData({...formData, lowStockPercentage: parseInt(e.target.value) || 0})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Produtos serão considerados "Baixos" se o estoque estiver abaixo do Mínimo + <strong>{formData.lowStockPercentage}%</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-black flex items-center justify-between">
            {notification ? (
              <span className="text-green-600 font-bold animate-pulse">{notification}</span>
            ) : <span></span>}
            
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white border-2 border-black font-black uppercase text-sm shadow-brutalist hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <Save size={18} /> Salvar Configurações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};