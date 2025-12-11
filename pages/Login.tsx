import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Package, CheckCircle, ShieldCheck, Zap, Star, ArrowRight, Instagram, Twitter, Linkedin } from 'lucide-react';

export const Login = () => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciais inválidas. Verifique usuário e senha.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToLogin = () => {
    const element = document.getElementById('login-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-sans text-black selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* --- Navigation --- */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Package size={24} />
            </div>
            <span className="text-xl md:text-2xl font-black uppercase tracking-tighter">StockRest</span>
          </div>
          <button 
            onClick={scrollToLogin}
            className="px-4 md:px-6 py-2 bg-primary text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm md:text-base"
          >
            Acessar Sistema
          </button>
        </div>
      </nav>

      {/* --- Hero Section & Login --- */}
      <section className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left: Value Proposition */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="inline-block bg-yellow-300 border-2 border-black px-4 py-1 font-bold uppercase text-sm mb-6 w-max shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              Sistema de Gestão v1.0
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.9] mb-6">
              Domine seu <span className="text-primary underline decoration-4 underline-offset-4">Estoque</span>.
            </h1>
            <p className="text-lg md:text-xl font-medium text-gray-700 mb-8 border-l-4 border-black pl-4">
              Pare de perder dinheiro com desperdícios. O StockRest é a ferramenta brutalmente simples para restaurantes que querem lucro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 font-bold bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle className="text-green-600" /> Sem Planilhas
              </div>
              <div className="flex items-center gap-2 font-bold bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle className="text-green-600" /> Controle Total
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div id="login-form" className="bg-blue-50 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full border-4 border-black opacity-50 blur-xl"></div>
             <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-300 rotate-45 border-4 border-black opacity-50 blur-xl"></div>

             <div className="relative bg-white border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto w-full">
                <h2 className="text-3xl font-black uppercase mb-2 text-center">Login</h2>
                <p className="text-center text-gray-500 mb-8 font-medium">Insira suas credenciais para entrar.</p>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-black uppercase tracking-wider">E-mail</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-black bg-gray-50 focus:outline-none focus:ring-0 focus:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all placeholder:text-gray-400 font-medium"
                      placeholder="admin@gmail.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-black uppercase tracking-wider">Senha</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-black bg-gray-50 focus:outline-none focus:ring-0 focus:border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all placeholder:text-gray-400 font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="h-14 mt-2 bg-primary text-white font-black uppercase tracking-wider text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-dark hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Entrando...' : 'Entrar Agora'}
                  </button>
                  
                  <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                    <p className="mb-1 uppercase font-bold text-gray-400">Ambiente de Demonstração</p>
                    <p>Admin: <span className="font-mono bg-gray-100 px-1 border border-gray-300 text-black">admin@gmail.com</span> / <span className="font-mono bg-gray-100 px-1 border border-gray-300 text-black">admin</span></p>
                  </div>
                </form>
             </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">Funcionalidades <br/> <span className="text-primary bg-black px-2 inline-block transform -rotate-2">Essenciais</span></h2>
            <p className="text-xl font-medium text-gray-600 max-w-2xl mx-auto">Tudo que você precisa para controlar seu negócio, sem as frescuras que você odeia.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-pink-100 hover:-translate-y-2 transition-transform group">
              <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-3">Controle de Validade</h3>
              <p className="font-medium text-gray-800 leading-relaxed">
                Nunca mais jogue dinheiro no lixo. Receba alertas visuais agressivos para itens próximos do vencimento antes que seja tarde.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-green-100 hover:-translate-y-2 transition-transform group">
                <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <Zap size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-3">Gestão Rápida</h3>
              <p className="font-medium text-gray-800 leading-relaxed">
                Interface otimizada para a correria da cozinha. Atualize estoques em segundos, não em minutos. Clique, salve, pronto.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-yellow-100 hover:-translate-y-2 transition-transform group">
                <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <Star size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-3">Auditoria Total</h3>
              <p className="font-medium text-gray-800 leading-relaxed">
                Saiba exatamente quem fez o quê. Histórico detalhado de movimentações para evitar "sumiços" misteriosos no estoque.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Target Audience Section --- */}
      <section className="py-20 border-b-4 border-black bg-black text-white bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-12">Para quem é o StockRest?</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {['Restaurantes', 'Bares', 'Cafeterias', 'Dark Kitchens', 'Food Trucks', 'Hotéis'].map((tag, i) => (
                  <span key={tag} className={`px-6 md:px-8 py-3 md:py-4 border-4 border-white text-xl md:text-3xl font-black uppercase hover:bg-white hover:text-black hover:scale-110 transition-all cursor-default transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                      {tag}
                  </span>
                ))}
            </div>
          </div>
      </section>

      {/* --- Pricing Plans --- */}
      <section className="py-20 bg-yellow-50 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase mb-4">Escolha seu Plano</h2>
            <p className="text-lg md:text-xl font-bold text-gray-600 uppercase tracking-widest bg-white inline-block px-4 py-1 border-2 border-black">Todos os planos incluem acesso total</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* Plan 1: Mensal */}
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-black uppercase mb-2">Mensal</h3>
                <div className="text-4xl font-black mb-2">R$ 129<span className="text-lg font-normal text-gray-500">/mês</span></div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-wider">Cobrança recorrente mensal</p>
                <ul className="space-y-4 mb-8 font-medium text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Acesso Total ao Sistema</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Usuários Ilimitados</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Itens Ilimitados</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Cancele quando quiser</li>
                </ul>
                <a href="https://checkout.stripe.com/test/monthly" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-white border-2 border-black text-center font-black uppercase hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    Assinar Mensal
                </a>
              </div>

              {/* Plan 2: Semestral (Highlighted) */}
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#308ce8] relative transform md:-translate-y-4 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] tracking-wider whitespace-nowrap">
                    Mais Popular
                </div>
                <h3 className="text-3xl font-black uppercase mb-2 text-primary">Semestral</h3>
                <div className="text-5xl font-black mb-2">R$ 109<span className="text-lg font-normal text-gray-500">/mês</span></div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-wider">R$ 654 a cada 6 meses</p>
                <ul className="space-y-4 mb-8 font-bold text-gray-800">
                    <li className="flex items-center gap-2"><CheckCircle size={20} className="text-primary fill-current text-white bg-primary rounded-full p-0.5" /> Tudo do Mensal</li>
                    <li className="flex items-center gap-2"><CheckCircle size={20} className="text-primary fill-current text-white bg-primary rounded-full p-0.5" /> 15% de Desconto</li>
                    <li className="flex items-center gap-2"><CheckCircle size={20} className="text-primary fill-current text-white bg-primary rounded-full p-0.5" /> Setup Acelerado</li>
                    <li className="flex items-center gap-2"><CheckCircle size={20} className="text-primary fill-current text-white bg-primary rounded-full p-0.5" /> Suporte Prioritário</li>
                </ul>
                <a href="https://checkout.stripe.com/test/semiannual" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-primary text-white border-2 border-black text-center font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2">
                    Assinar Semestral <ArrowRight size={20} />
                </a>
              </div>

              {/* Plan 3: Anual */}
              <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-xs font-bold uppercase transform translate-x-2 -translate-y-2 rotate-12">Melhor Valor</div>
                <h3 className="text-2xl font-black uppercase mb-2">Anual</h3>
                <div className="text-4xl font-black mb-2">R$ 89<span className="text-lg font-normal text-gray-500">/mês</span></div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-6 tracking-wider">R$ 1.068 cobrado anualmente</p>
                <ul className="space-y-4 mb-8 font-medium text-gray-700">
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Tudo do Semestral</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> 30% de Desconto</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Consultoria de Estoque</li>
                    <li className="flex items-center gap-2"><CheckCircle size={18} className="text-black" /> Gestor de Conta</li>
                </ul>
                <a href="https://checkout.stripe.com/test/annual" target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-black text-white border-2 border-black text-center font-black uppercase hover:bg-gray-800 transition-colors">
                    Assinar Anual
                </a>
              </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-black text-white p-2">
                    <Package size={24} />
                  </div>
                  <span className="text-2xl font-black uppercase">StockRest</span>
                </div>
                <p className="font-medium text-gray-600 max-w-sm">
                  A solução definitiva para controle de estoque em restaurantes. Simples, rápido e sem burocracia.
                </p>
             </div>
             
             <div>
                <h4 className="font-black uppercase mb-4 text-lg">Produto</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Funcionalidades</a></li>
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Preços</a></li>
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Download App</a></li>
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Roadmap</a></li>
                </ul>
             </div>

             <div>
                <h4 className="font-black uppercase mb-4 text-lg">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Termos de Uso</a></li>
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Privacidade</a></li>
                  <li><a href="#" className="font-bold hover:text-primary hover:underline">Contato</a></li>
                </ul>
             </div>
          </div>

          <div className="pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="font-bold text-sm text-gray-500 uppercase">© 2024 StockRest Inc. Todos os direitos reservados.</p>
             <div className="flex gap-4">
                <a href="#" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"><Instagram size={20} /></a>
                <a href="#" className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"><Linkedin size={20} /></a>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
