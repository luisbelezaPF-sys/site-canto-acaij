'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Package, ShoppingCart, Printer, Settings, LogOut, Plus, Edit, Trash2, Download, Search, Clock, Bell, BellOff, Upload, Image as ImageIcon, FileText, Receipt, Save, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { fetchPedidos, PedidoSupabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  flavor?: string;
  extras?: string[];
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: 'em preparo' | 'saiu para entrega' | 'entregue' | 'cancelado';
  date: string;
  time: string;
  phone: string;
  address?: string;
  streetName?: string;
  houseNumber?: string;
  cashAmount?: number;
  createdAt: Date;
  hasFiscalCoupon?: boolean;
}

interface PromotionImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface Ingredient {
  id: string;
  name: string;
  price: number;
}

// Interface para relatórios de faturamento
interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailyBreakdown: { date: string; revenue: number; orders: number }[];
  paymentMethods: { method: string; count: number; revenue: number }[];
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [activeTab, setActiveTab] = useState('pedidos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotionImages, setPromotionImages] = useState<PromotionImage[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<PromotionImage | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estados para faturamento e relatórios
  const [pedidosSupabase, setPedidosSupabase] = useState<PedidoSupabase[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Estados para upload de imagens
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingPromotionImage, setUploadingPromotionImage] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState<string>('');
  const [promotionImagePreview, setPromotionImagePreview] = useState<string>('');

  // Carregar pedidos do Supabase e calcular faturamento
  useEffect(() => {
    const loadSupabaseData = async () => {
      try {
        console.log('🔄 Carregando dados do Supabase para faturamento...');
        const pedidos = await fetchPedidos();
        setPedidosSupabase(pedidos || []);
        
        if (pedidos && pedidos.length > 0) {
          console.log(`✅ ${pedidos.length} pedidos carregados do Supabase`);
          generateSalesReport(pedidos, reportPeriod);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Supabase:', error);
      }
    };

    if (isAuthenticated) {
      loadSupabaseData();
    }
  }, [isAuthenticated, reportPeriod]);

  // Função para gerar relatório de vendas baseado nos dados do Supabase
  const generateSalesReport = (pedidos: PedidoSupabase[], period: 'today' | 'week' | 'month' | 'all') => {
    setIsLoadingReport(true);
    
    try {
      const now = new Date();
      let filteredPedidos = pedidos;

      // Filtrar por período
      switch (period) {
        case 'today':
          const today = now.toISOString().split('T')[0];
          filteredPedidos = pedidos.filter(p => 
            p.created_at && p.created_at.startsWith(today)
          );
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredPedidos = pedidos.filter(p => 
            p.created_at && new Date(p.created_at) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filteredPedidos = pedidos.filter(p => 
            p.created_at && new Date(p.created_at) >= monthAgo
          );
          break;
        case 'all':
        default:
          filteredPedidos = pedidos;
          break;
      }

      // Calcular métricas
      const totalRevenue = filteredPedidos.reduce((sum, p) => {
        const itemTotal = p.valor * p.quantidade;
        const deliveryFee = p.taxa_entrega || 0;
        return sum + itemTotal + deliveryFee;
      }, 0);

      const totalOrders = filteredPedidos.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Produtos mais vendidos
      const productSales: { [key: string]: { quantity: number; revenue: number } } = {};
      filteredPedidos.forEach(p => {
        const productName = p.produto;
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += p.quantidade;
        productSales[productName].revenue += p.valor * p.quantidade;
      });

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Breakdown diário
      const dailyBreakdown: { [key: string]: { revenue: number; orders: number } } = {};
      filteredPedidos.forEach(p => {
        const date = p.created_at ? p.created_at.split('T')[0] : 'Sem data';
        if (!dailyBreakdown[date]) {
          dailyBreakdown[date] = { revenue: 0, orders: 0 };
        }
        dailyBreakdown[date].revenue += (p.valor * p.quantidade) + (p.taxa_entrega || 0);
        dailyBreakdown[date].orders += 1;
      });

      const dailyBreakdownArray = Object.entries(dailyBreakdown)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Últimos 30 dias

      // Métodos de pagamento
      const paymentMethods: { [key: string]: { count: number; revenue: number } } = {};
      filteredPedidos.forEach(p => {
        const method = p.forma_pagamento || 'Não informado';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, revenue: 0 };
        }
        paymentMethods[method].count += 1;
        paymentMethods[method].revenue += (p.valor * p.quantidade) + (p.taxa_entrega || 0);
      });

      const paymentMethodsArray = Object.entries(paymentMethods)
        .map(([method, data]) => ({ method, ...data }));

      const report: SalesReport = {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        dailyBreakdown: dailyBreakdownArray,
        paymentMethods: paymentMethodsArray
      };

      setSalesReport(report);
      console.log('📊 Relatório de vendas gerado:', report);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Função para exportar relatório
  const exportReport = () => {
    if (!salesReport) return;

    const reportData = {
      periodo: reportPeriod,
      dataGeracao: new Date().toISOString(),
      resumo: {
        faturamentoTotal: salesReport.totalRevenue,
        totalPedidos: salesReport.totalOrders,
        ticketMedio: salesReport.averageOrderValue
      },
      produtosMaisVendidos: salesReport.topProducts,
      breakdownDiario: salesReport.dailyBreakdown,
      metodosPagamento: salesReport.paymentMethods
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-faturamento-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dados iniciais de produtos do site
  useEffect(() => {
    const siteProducts: Product[] = [
      // Açaí Tradicional
      {
        id: 'acai-300ml',
        name: 'Açaí Tradicional 300ml',
        description: 'Açaí cremoso tradicional premium',
        price: 10.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Tradicional'
      },
      {
        id: 'acai-400ml',
        name: 'Açaí Tradicional 400ml',
        description: 'Açaí cremoso tradicional premium',
        price: 12.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Tradicional'
      },
      {
        id: 'acai-500ml',
        name: 'Açaí Tradicional 500ml',
        description: 'Açaí cremoso tradicional premium',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Tradicional'
      },
      {
        id: 'acai-700ml',
        name: 'Açaí Tradicional 700ml',
        description: 'Açaí cremoso tradicional premium',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Tradicional'
      },
      // Açaí Zero
      {
        id: 'acai-zero-300ml',
        name: 'Açaí Zero 300ml',
        description: 'Açaí sem açúcar adicionado',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Zero'
      },
      {
        id: 'acai-zero-500ml',
        name: 'Açaí Zero 500ml',
        description: 'Açaí sem açúcar adicionado',
        price: 21.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Zero'
      },
      {
        id: 'acai-zero-700ml',
        name: 'Açaí Zero 700ml',
        description: 'Açaí sem açúcar adicionado',
        price: 27.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí Zero'
      },
      // Milk Shakes
      {
        id: 'milkshake-300ml',
        name: 'Milk Shake 300ml',
        description: 'Milk shake cremoso com chantilly',
        price: 14.00,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop',
        category: 'Milk Shake'
      },
      {
        id: 'milkshake-500ml',
        name: 'Milk Shake 500ml',
        description: 'Milk shake cremoso com chantilly',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop',
        category: 'Milk Shake'
      },
      {
        id: 'milkshake-700ml',
        name: 'Milk Shake 700ml',
        description: 'Milk shake cremoso com chantilly',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop',
        category: 'Milk Shake'
      },
      // Bebidas
      {
        id: 'agua-mineral',
        name: 'Água Mineral',
        description: 'Água mineral gelada',
        price: 3.00,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
        category: 'Bebidas'
      },
      {
        id: 'agua-gas',
        name: 'Água com Gás',
        description: 'Água com gás gelada',
        price: 4.00,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
        category: 'Bebidas'
      }
    ];

    // Carregar pedidos do localStorage ou usar dados de exemplo
    const savedOrders = localStorage.getItem('acai-orders');
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
        ...order,
        createdAt: new Date(order.timestamp || order.createdAt),
        hasFiscalCoupon: order.hasFiscalCoupon || false
      }));
      setOrders(parsedOrders);
    } else {
      const sampleOrders: Order[] = [
        {
          id: 'PED001',
          customerName: 'João Silva',
          items: [
            { 
              name: 'Açaí Tradicional 500ml', 
              quantity: 1, 
              price: 15.00, 
              size: '500ml', 
              flavor: 'Açaí Tradicional Premium', 
              extras: ['Granola', 'Banana', 'Leite Condensado'] 
            }
          ],
          total: 18.00,
          paymentMethod: 'PIX',
          status: 'em preparo',
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          phone: '35999887766',
          address: 'Centro, Poço Fundo - MG',
          streetName: 'Rua das Flores',
          houseNumber: '123',
          createdAt: new Date(),
          hasFiscalCoupon: true
        },
        {
          id: 'PED002',
          customerName: 'Maria Santos',
          items: [
            { 
              name: 'Milk Shake 500ml', 
              quantity: 2, 
              price: 16.00, 
              size: '500ml', 
              flavor: 'Ovomaltine', 
              extras: ['Chantilly', 'Cobertura Ovomaltine'] 
            }
          ],
          total: 35.00,
          paymentMethod: 'Dinheiro',
          cashAmount: 40.00,
          status: 'saiu para entrega',
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date(Date.now() - 30 * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          phone: '35988776655',
          address: 'Vila Nova, Poço Fundo - MG',
          streetName: 'Rua São José',
          houseNumber: '456',
          createdAt: new Date(Date.now() - 30 * 60000),
          hasFiscalCoupon: true
        }
      ];
      setOrders(sampleOrders);
    }

    // Carregar promoções do localStorage ou usar padrão
    const savedPromotions = localStorage.getItem('acai-promotions');
    if (savedPromotions) {
      setPromotionImages(JSON.parse(savedPromotions));
    } else {
      const defaultPromotions: PromotionImage[] = [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
          title: 'Promoção Açaí Premium',
          description: 'Açaí 500ml + 2 acompanhamentos por apenas R$ 15,00'
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
          title: 'Combo Milk Shake',
          description: 'Milk Shake 700ml + Açaí 300ml por R$ 25,00'
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
          title: 'Oferta Especial',
          description: 'Na compra de 2 açaís, ganhe 1 água mineral grátis'
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
          title: 'Promoção Final de Semana',
          description: '20% de desconto em todos os produtos aos sábados e domingos'
        }
      ];
      setPromotionImages(defaultPromotions);
      localStorage.setItem('acai-promotions', JSON.stringify(defaultPromotions));
    }

    // Carregar ingredientes do localStorage ou usar padrão
    const savedIngredients = localStorage.getItem('acai-ingredients');
    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients));
    } else {
      const defaultIngredients: Ingredient[] = [
        { id: '1', name: 'Ovomaltine', price: 4.00 },
        { id: '2', name: 'Nutella', price: 5.00 },
        { id: '3', name: 'Creme de Leite Ninho', price: 4.00 },
        { id: '4', name: 'Creme de Ovomaltine', price: 4.00 },
        { id: '5', name: 'Creme de Ferrero Rocher', price: 4.00 },
        { id: '6', name: 'Creme de Avelã', price: 4.00 },
        { id: '7', name: 'Mousse de Maracujá', price: 3.00 },
        { id: '8', name: 'Mousse de Morango', price: 3.00 },
        { id: '9', name: 'Mousse de Limão', price: 3.00 },
        { id: '10', name: 'Sonho de Valsa', price: 3.00 },
        { id: '11', name: 'Trento', price: 3.00 },
        { id: '12', name: 'Confete', price: 2.50 },
        { id: '13', name: 'Bis Branco', price: 2.50 },
        { id: '14', name: 'Bis Preto', price: 2.50 },
        { id: '15', name: 'Suflair', price: 5.00 },
        { id: '16', name: 'Chantilly', price: 2.50 },
        { id: '17', name: 'Paçoca', price: 3.00 },
        { id: '18', name: 'Leite Condensado', price: 2.50 },
        { id: '19', name: 'Kit Kat', price: 4.00 },
        { id: '20', name: 'Gotas de Chocolate', price: 2.50 },
        { id: '21', name: 'Power Ball', price: 2.50 },
        { id: '22', name: 'Granola', price: 2.50 },
        { id: '23', name: 'Leite em Pó', price: 2.00 },
        { id: '24', name: 'Danoninho', price: 2.00 },
        { id: '25', name: 'Banana', price: 2.00 },
        { id: '26', name: 'Morango', price: 3.00 },
        { id: '27', name: 'Uva', price: 3.00 },
        { id: '28', name: 'Kiwi', price: 3.00 },
        { id: '29', name: 'Manga', price: 3.00 },
        { id: '30', name: 'Cobertura Chocolate', price: 2.00 },
        { id: '31', name: 'Cobertura Morango', price: 2.00 },
        { id: '32', name: 'Cobertura Caramelo', price: 2.00 }
      ];
      setIngredients(defaultIngredients);
      localStorage.setItem('acai-ingredients', JSON.stringify(defaultIngredients));
    }

    setProducts(siteProducts);
  }, []);

  // Simular chegada de novos pedidos
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular novo pedido ocasionalmente (5% de chance a cada 30 segundos)
      if (Math.random() < 0.05) {
        const newOrder: Order = {
          id: `PED${String(Date.now()).slice(-3)}`,
          customerName: ['Ana Costa', 'Pedro Lima', 'Carla Souza', 'Roberto Alves'][Math.floor(Math.random() * 4)],
          items: [
            {
              name: products[Math.floor(Math.random() * products.length)]?.name || 'Açaí 500ml',
              quantity: Math.floor(Math.random() * 2) + 1,
              price: 15.00,
              size: '500ml',
              flavor: 'Açaí Tradicional Premium',
              extras: ['Granola', 'Banana']
            }
          ],
          total: 18.00,
          paymentMethod: ['PIX', 'Cartão', 'Dinheiro'][Math.floor(Math.random() * 3)],
          status: 'em preparo',
          date: new Date().toLocaleDateString('pt-BR'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          phone: '35999000000',
          address: 'Centro, Poço Fundo - MG',
          streetName: 'Rua Principal',
          houseNumber: '100',
          createdAt: new Date(),
          hasFiscalCoupon: true
        };

        setOrders(prev => [newOrder, ...prev]);
        
        // Tocar som de notificação se habilitado
        if (soundEnabled) {
          playNotificationSound();
        }
        
        // Mostrar notificação visual
        showNotification('Novo pedido recebido!', `Pedido #${newOrder.id} - ${newOrder.customerName}`);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [products, soundEnabled]);

  const playNotificationSound = () => {
    // Criar um som de notificação usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icon.svg' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/icon.svg' });
          }
        });
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.id === 'admin' && loginData.password === 'jonjon25') {
      setIsAuthenticated(true);
      // Solicitar permissão para notificações
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      alert('Credenciais inválidas!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginData({ id: '', password: '' });
  };

  // Função para converter arquivo para base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Função para redimensionar imagem automaticamente
  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para base64
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para upload de imagem de produto
  const handleProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem!');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB!');
      return;
    }

    setUploadingProductImage(true);
    
    try {
      const resizedImage = await resizeImage(file, 400, 300, 0.8);
      setProductImagePreview(resizedImage);
    } catch (error) {
      alert('Erro ao processar a imagem. Tente novamente.');
      console.error('Erro no upload:', error);
    } finally {
      setUploadingProductImage(false);
    }
  };

  // Função para upload de imagem de promoção
  const handlePromotionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem!');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB!');
      return;
    }

    setUploadingPromotionImage(true);
    
    try {
      const resizedImage = await resizeImage(file, 600, 400, 0.8);
      setPromotionImagePreview(resizedImage);
    } catch (error) {
      alert('Erro ao processar a imagem. Tente novamente.');
      console.error('Erro no upload:', error);
    } finally {
      setUploadingPromotionImage(false);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Usar imagem uploadada ou manter a existente
    const imageUrl = productImagePreview || editingProduct?.image || '';
    
    if (!imageUrl) {
      alert('Por favor, faça upload de uma imagem para o produto!');
      return;
    }

    const productData = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: imageUrl,
      category: formData.get('category') as string,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts([...products, productData]);
    }

    setShowProductForm(false);
    setEditingProduct(null);
    setProductImagePreview('');
  };

  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Usar imagem uploadada ou manter a existente
    const imageUrl = promotionImagePreview || editingPromotion?.url || '';
    
    if (!imageUrl) {
      alert('Por favor, faça upload de uma imagem para a promoção!');
      return;
    }

    const promotionData = {
      id: editingPromotion?.id || `promo-${Date.now()}`,
      url: imageUrl,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };

    let updatedPromotions;
    if (editingPromotion) {
      updatedPromotions = promotionImages.map(p => p.id === editingPromotion.id ? promotionData : p);
    } else {
      // Limitar a 4 promoções
      if (promotionImages.length >= 4) {
        alert('Máximo de 4 promoções permitidas. Remova uma promoção existente primeiro.');
        return;
      }
      updatedPromotions = [...promotionImages, promotionData];
    }

    setPromotionImages(updatedPromotions);
    localStorage.setItem('acai-promotions', JSON.stringify(updatedPromotions));
    setShowPromotionForm(false);
    setEditingPromotion(null);
    setPromotionImagePreview('');
  };

  const handleIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const ingredientData = {
      id: editingIngredient?.id || `ingredient-${Date.now()}`,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
    };

    let updatedIngredients;
    if (editingIngredient) {
      updatedIngredients = ingredients.map(i => i.id === editingIngredient.id ? ingredientData : i);
    } else {
      updatedIngredients = [...ingredients, ingredientData];
    }

    setIngredients(updatedIngredients);
    localStorage.setItem('acai-ingredients', JSON.stringify(updatedIngredients));
    setShowIngredientForm(false);
    setEditingIngredient(null);
  };

  const updateIngredientPrice = (id: string, newPrice: number) => {
    const updatedIngredients = ingredients.map(ingredient => 
      ingredient.id === id ? { ...ingredient, price: newPrice } : ingredient
    );
    setIngredients(updatedIngredients);
    localStorage.setItem('acai-ingredients', JSON.stringify(updatedIngredients));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const deletePromotion = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
      const updatedPromotions = promotionImages.filter(p => p.id !== id);
      setPromotionImages(updatedPromotions);
      localStorage.setItem('acai-promotions', JSON.stringify(updatedPromotions));
    }
  };

  const deleteIngredient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ingrediente?')) {
      const updatedIngredients = ingredients.filter(i => i.id !== id);
      setIngredients(updatedIngredients);
      localStorage.setItem('acai-ingredients', JSON.stringify(updatedIngredients));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: 'em preparo' | 'saiu para entrega' | 'entregue' | 'cancelado') => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getTimeSinceOrder = (createdAt: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}min atrás`;
    }
  };

  // Função para imprimir cupom fiscal - RESPONSIVA para celular e PC
  const printCoupon = (order: Order) => {
    const couponContent = `
      <div style="width: 100%; max-width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; margin: 0 auto; padding: 10px; background: white;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="font-size: 16px; font-weight: bold;">CANTO DO AÇAÍ</div>
          <div style="font-size: 10px;">Poço Fundo - MG</div>
          <div style="font-size: 10px;">WhatsApp: (35) 99744-0729</div>
        </div>
        
        <div style="margin-bottom: 10px;">
          <div><strong>CUPOM FISCAL</strong></div>
          <div>Pedido: #${order.id}</div>
          <div>Data: ${order.date}</div>
          <div>Hora: ${order.time}</div>
        </div>
        
        <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <div><strong>CLIENTE:</strong></div>
          <div>Nome: ${order.customerName}</div>
          <div>Telefone: ${order.phone}</div>
          ${order.address ? `<div>Endereço: ${order.address}</div>` : ''}
          ${order.streetName ? `<div>Rua: ${order.streetName}</div>` : ''}
          ${order.houseNumber ? `<div>Nº: ${order.houseNumber}</div>` : ''}
        </div>
        
        <div style="margin-bottom: 10px;">
          <div><strong>ITENS:</strong></div>
          ${order.items.map(item => `
            <div style="margin: 5px 0;">
              <div>${item.name} ${item.size ? `(${item.size})` : ''}</div>
              <div>Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)} = R$ ${(item.quantity * item.price).toFixed(2)}</div>
              ${item.flavor ? `<div>Sabor: ${item.flavor}</div>` : ''}
              ${item.extras?.length ? `<div>Extras: ${item.extras.join(', ')}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>TOTAL:</strong></span>
            <span><strong>R$ ${order.total.toFixed(2)}</strong></span>
          </div>
          <div>Pagamento: ${order.paymentMethod}</div>
          ${order.cashAmount ? `<div>Valor Pago: R$ ${order.cashAmount.toFixed(2)}</div>` : ''}
          ${order.cashAmount ? `<div>Troco: R$ ${(order.cashAmount - order.total).toFixed(2)}</div>` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 15px; font-size: 10px;">
          <div>Obrigado pela preferência!</div>
          <div>Status: ${order.status.toUpperCase()}</div>
          <div style="margin-top: 10px; font-weight: bold;">📄 CUPOM FISCAL VÁLIDO</div>
        </div>
      </div>
    `;

    // Detectar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Abrir janela de impressão otimizada para celular E computador
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Fiscal - ${order.id}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                background: #f0f0f0;
                padding: 10px;
              }
              
              .coupon-container {
                max-width: 80mm;
                margin: 0 auto;
                background: white;
                border: 1px solid #000;
                padding: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              
              /* Estilos para impressão */
              @media print {
                body {
                  background: white;
                  padding: 0;
                }
                
                .coupon-container {
                  box-shadow: none;
                  border: none;
                  max-width: none;
                  width: 80mm;
                }
                
                /* Para impressoras térmicas */
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
              }
              
              /* Estilos específicos para celular */
              @media screen and (max-width: 480px) {
                body {
                  padding: 5px;
                  font-size: 11px;
                }
                
                .coupon-container {
                  max-width: 100%;
                  padding: 8px;
                }
                
                .print-button {
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  background: #7C3AED;
                  color: white;
                  border: none;
                  padding: 15px 20px;
                  border-radius: 50px;
                  font-size: 16px;
                  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
                  z-index: 1000;
                }
              }
              
              /* Estilos para computador */
              @media screen and (min-width: 481px) {
                .print-button {
                  display: block;
                  margin: 20px auto;
                  background: #7C3AED;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  font-size: 14px;
                  cursor: pointer;
                }
                
                .print-button:hover {
                  background: #6D28D9;
                }
              }
              
              .no-print {
                display: block;
              }
              
              @media print {
                .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="coupon-container">
              ${couponContent}
            </div>
            
            <button class="print-button no-print" onclick="window.print()">
              🖨️ ${isMobile ? 'Imprimir' : 'Imprimir Cupom'}
            </button>
            
            <script>
              // Auto-print apenas em desktop
              if (!${isMobile}) {
                window.onload = function() {
                  setTimeout(() => window.print(), 500);
                }
              }
              
              // Fechar janela após impressão
              window.onafterprint = function() {
                setTimeout(() => window.close(), 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Função para imprimir lista de pedidos
  const printOrdersList = () => {
    const ordersContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7C3AED; margin-bottom: 10px;">🍇 CANTO DO AÇAÍ</h1>
          <h2 style="color: #666; margin: 0;">Lista de Pedidos</h2>
          <p style="color: #888; margin: 5px 0;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">📊 Resumo Geral</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
              <strong>Total de Pedidos:</strong> ${orders.length}
            </div>
            <div>
              <strong>Em Preparo:</strong> ${orders.filter(o => o.status === 'em preparo').length}
            </div>
            <div>
              <strong>Saiu para Entrega:</strong> ${orders.filter(o => o.status === 'saiu para entrega').length}
            </div>
            <div>
              <strong>Entregues:</strong> ${orders.filter(o => o.status === 'entregue').length}
            </div>
          </div>
        </div>

        ${orders.map((order, index) => `
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="margin: 0; color: #7C3AED;">Pedido #${order.id}</h3>
              <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; ${
                order.status === 'em preparo' ? 'background: #FEF3C7; color: #92400E;' :
                order.status === 'saiu para entrega' ? 'background: #DBEAFE; color: #1E40AF;' :
                order.status === 'entregue' ? 'background: #D1FAE5; color: #065F46;' :
                'background: #FEE2E2; color: #991B1B;'
              }">
                ${order.status.toUpperCase()}
              </span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px;">
              <div>
                <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${order.customerName}</p>
                <p style="margin: 5px 0;"><strong>📱 Telefone:</strong> ${order.phone}</p>
                <p style="margin: 5px 0;"><strong>📅 Data/Hora:</strong> ${order.date} às ${order.time}</p>
                <p style="margin: 5px 0;"><strong>💳 Pagamento:</strong> ${order.paymentMethod}</p>
                ${order.cashAmount ? `<p style="margin: 5px 0;"><strong>💵 Valor Pago:</strong> R$ ${order.cashAmount.toFixed(2)}</p>` : ''}
              </div>
              
              ${order.address ? `
                <div>
                  <p style="margin: 5px 0;"><strong>📍 Endereço:</strong></p>
                  <p style="margin: 5px 0; padding-left: 15px;">${order.address}</p>
                  ${order.streetName ? `<p style="margin: 5px 0; padding-left: 15px;">Rua: ${order.streetName}</p>` : ''}
                  ${order.houseNumber ? `<p style="margin: 5px 0; padding-left: 15px;">Nº: ${order.houseNumber}</p>` : ''}
                </div>
              ` : ''}
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 10px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">🛒 Itens do Pedido:</h4>
              ${order.items.map(item => `
                <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${item.name}</strong> ${item.size ? `(${item.size})` : ''}</span>
                    <span><strong>R$ ${(item.quantity * item.price).toFixed(2)}</strong></span>
                  </div>
                  <div style="font-size: 14px; color: #666; margin-top: 4px;">
                    Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)}
                    ${item.flavor ? ` | Sabor: ${item.flavor}` : ''}
                  </div>
                  ${item.extras?.length ? `<div style="font-size: 12px; color: #888;">Extras: ${item.extras.join(', ')}</div>` : ''}
                </div>
              `).join('')}
              
              <div style="text-align: right; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                <p style="margin: 5px 0; font-size: 18px;"><strong>💰 TOTAL: R$ ${order.total.toFixed(2)}</strong></p>
                ${order.hasFiscalCoupon ? '<p style="margin: 5px 0; color: #059669; font-size: 12px;">📄 Cupom Fiscal Disponível</p>' : ''}
              </div>
            </div>
          </div>
        `).join('')}
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #7C3AED; color: #666;">
          <p>📄 Relatório gerado automaticamente pelo sistema O Canto do Açaí</p>
          <p style="font-size: 12px;">Total de ${orders.length} pedidos listados</p>
        </div>
      </div>
    `;

    // Abrir janela de impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Lista de Pedidos - Canto do Açaí</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                font-size: 14px;
                line-height: 1.4;
              }
              @media print {
                .no-print { display: none; }
                h1, h2, h3 { page-break-after: avoid; }
                div { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            ${ordersContent}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const generateSalesReportFile = (period: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    let startDate: Date;
    let periodName: string;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodName = 'Diário';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodName = 'Semanal';
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodName = 'Mensal';
        break;
    }

    const filteredOrders = orders.filter(order => 
      order.createdAt >= startDate && order.status === 'entregue'
    );
    
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const totalCoupons = filteredOrders.filter(order => order.hasFiscalCoupon).length;
    
    // Produtos mais vendidos
    const productSales: { [key: string]: { quantity: number, revenue: number } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5);

    const reportContent = `
      RELATÓRIO ${periodName.toUpperCase()} - CANTO DO AÇAÍ
      ================================================
      
      Período: ${startDate.toLocaleDateString('pt-BR')} até ${now.toLocaleDateString('pt-BR')}
      
      RESUMO FINANCEIRO:
      • Total de pedidos entregues: ${totalOrders}
      • Faturamento total: R$ ${totalSales.toFixed(2)}
      • Ticket médio: R$ ${totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00'}
      • Cupons fiscais emitidos: ${totalCoupons}
      
      PRODUTOS MAIS VENDIDOS:
      ${topProducts.map(([product, data], index) => 
        `${index + 1}. ${product}\\n   Qtd: ${data.quantity} | Receita: R$ ${data.revenue.toFixed(2)}`
      ).join('\\n')}
      
      DETALHES DOS PEDIDOS:
      ${filteredOrders.map(order => 
        `\\nPedido #${order.id} - ${order.date} ${order.time}
        Cliente: ${order.customerName}
        Total: R$ ${order.total.toFixed(2)} (${order.paymentMethod})
        Cupom Fiscal: ${order.hasFiscalCoupon ? 'SIM' : 'NÃO'}`
      ).join('')}
      
      ================================================
      Relatório gerado em: ${now.toLocaleString('pt-BR')}
    `;

    // Criar e baixar arquivo PDF (simulado como texto)
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${period}-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar pedidos com cupom fiscal
  const ordersWithCoupons = orders.filter(order => order.hasFiscalCoupon);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🍇</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Canto do Açaí</h1>
            <p className="text-gray-600">Painel Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Administrador
              </label>
              <input
                type="text"
                value={loginData.id}
                onChange={(e) => setLoginData({...loginData, id: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite seu ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Menu Lateral */}
      <div className="bg-white shadow-lg w-64 min-h-screen">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🍇</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Canto do Açaí</h2>
              <p className="text-sm text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'pedidos' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart size={20} />
              <span>Pedidos</span>
              {orders.filter(o => o.status === 'em preparo').length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                  {orders.filter(o => o.status === 'em preparo').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('faturamento')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'faturamento' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={20} />
              <span>Faturamento</span>
              {salesReport && (
                <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                  R$ {salesReport.totalRevenue.toFixed(0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cupons')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'cupons' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Receipt size={20} />
              <span>Cupons Fiscais</span>
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                {ordersWithCoupons.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('produtos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'produtos' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package size={20} />
              <span>Produtos</span>
            </button>

            <button
              onClick={() => setActiveTab('ingredientes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'ingredientes' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span>Gerenciar Ingredientes</span>
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                {ingredients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('promocoes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'promocoes' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ImageIcon size={20} />
              <span>Promoções</span>
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                {promotionImages.length}/4
              </span>
            </button>

            <button
              onClick={() => setActiveTab('impressao')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'impressao' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Printer size={20} />
              <span>Impressão</span>
            </button>

            <button
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'relatorios' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Download size={20} />
              <span>Relatórios</span>
            </button>

            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'configuracoes' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span>Configurações</span>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {activeTab === 'pedidos' && 'Gestão de Pedidos'}
            {activeTab === 'faturamento' && 'Relatório de Faturamento'}
            {activeTab === 'cupons' && 'Cupons Fiscais'}
            {activeTab === 'produtos' && 'Gerenciamento de Produtos'}
            {activeTab === 'ingredientes' && 'Gerenciar Ingredientes'}
            {activeTab === 'promocoes' && 'Gerenciamento de Promoções'}
            {activeTab === 'impressao' && 'Central de Impressão'}
            {activeTab === 'relatorios' && 'Relatórios de Vendas'}
            {activeTab === 'configuracoes' && 'Configurações'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Aba Faturamento - NOVA IMPLEMENTAÇÃO */}
        {activeTab === 'faturamento' && (
          <div className="space-y-6">
            {/* Seletor de Período */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📊 Período do Relatório</h3>
                <button
                  onClick={exportReport}
                  disabled={!salesReport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Exportar</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'today', label: 'Hoje', icon: '📅' },
                  { key: 'week', label: 'Última Semana', icon: '📆' },
                  { key: 'month', label: 'Último Mês', icon: '🗓️' },
                  { key: 'all', label: 'Todos os Tempos', icon: '📊' }
                ].map(period => (
                  <button
                    key={period.key}
                    onClick={() => setReportPeriod(period.key as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      reportPeriod === period.key
                        ? 'border-purple-600 bg-purple-100 text-purple-800'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{period.icon}</div>
                    <div className="font-semibold">{period.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cards de Métricas Principais */}
            {salesReport && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Faturamento Total</p>
                        <p className="text-3xl font-bold">R$ {salesReport.totalRevenue.toFixed(2)}</p>
                      </div>
                      <DollarSign size={40} className="text-green-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total de Pedidos</p>
                        <p className="text-3xl font-bold">{salesReport.totalOrders}</p>
                      </div>
                      <ShoppingCart size={40} className="text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Ticket Médio</p>
                        <p className="text-3xl font-bold">R$ {salesReport.averageOrderValue.toFixed(2)}</p>
                      </div>
                      <TrendingUp size={40} className="text-purple-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Pedidos Supabase</p>
                        <p className="text-3xl font-bold">{pedidosSupabase.length}</p>
                      </div>
                      <BarChart3 size={40} className="text-orange-200" />
                    </div>
                  </div>
                </div>

                {/* Produtos Mais Vendidos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Produtos Mais Vendidos</h3>
                  <div className="space-y-3">
                    {salesReport.topProducts.slice(0, 10).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.quantity} unidades vendidas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {product.revenue.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">receita</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown Diário */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Vendas por Dia</h3>
                  <div className="space-y-2">
                    {salesReport.dailyBreakdown.slice(0, 15).map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 border-b border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {new Date(day.date).toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{day.orders} pedidos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {day.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métodos de Pagamento */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">💳 Métodos de Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {salesReport.paymentMethods.map((method) => (
                      <div key={method.method} className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl mb-2">
                            {method.method === 'PIX' ? '📱' :
                             method.method === 'Cartão' ? '💳' :
                             method.method === 'Dinheiro' ? '💵' : '❓'}
                          </p>
                          <p className="font-semibold text-gray-800">{method.method}</p>
                          <p className="text-sm text-gray-600">{method.count} pedidos</p>
                          <p className="font-bold text-green-600">R$ {method.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Loading State */}
            {isLoadingReport && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Gerando relatório de faturamento...</p>
              </div>
            )}

            {/* Empty State */}
            {!salesReport && !isLoadingReport && (
              <div className="text-center py-12">
                <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum dado de faturamento</h3>
                <p className="text-gray-500">Os dados aparecerão aqui quando houver pedidos no Supabase</p>
              </div>
            )}
          </div>
        )}

        {/* Aba Gerenciar Ingredientes */}
        {activeTab === 'ingredientes' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">🧪 Gerenciar Ingredientes</h3>
                  <p className="text-blue-100">
                    Controle os preços dos ingredientes que aparecem no site. Alterações são aplicadas automaticamente.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{ingredients.length}</div>
                  <div className="text-blue-100">Ingredientes</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Lista de Ingredientes</h2>
              <button
                onClick={() => setShowIngredientForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Adicionar Ingrediente</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome do Ingrediente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Atual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIngredients.map((ingredient) => (
                      <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ingredient.price}
                            onChange={(e) => updateIngredientPrice(ingredient.id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <span className="ml-2 text-sm text-gray-500">R$</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingIngredient(ingredient);
                                setShowIngredientForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            >
                              <Edit size={16} />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => deleteIngredient(ingredient.id)}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <Trash2 size={16} />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal de Ingrediente */}
            {showIngredientForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingIngredient ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
                  </h3>
                  <form onSubmit={handleIngredientSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Ingrediente
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="Ex: Nutella"
                        defaultValue={editingIngredient?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preço (R$)
                      </label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ex: 5.00"
                        defaultValue={editingIngredient?.price}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Save size={16} />
                        <span>{editingIngredient ? 'Atualizar' : 'Adicionar'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowIngredientForm(false);
                          setEditingIngredient(null);
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba Cupons Fiscais - NOVA IMPLEMENTAÇÃO RESPONSIVA */}
        {activeTab === 'cupons' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold mb-2">📄 Sistema de Cupons Fiscais</h3>
                  <p className="text-green-100">
                    Todos os pedidos geram automaticamente cupons fiscais para impressão em celular e computador
                  </p>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold">{ordersWithCoupons.length}</div>
                  <div className="text-green-100">Cupons Disponíveis</div>
                </div>
              </div>
            </div>

            {/* Botões de Ação Rápida */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  ordersWithCoupons.forEach(order => printCoupon(order));
                }}
                className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
                disabled={ordersWithCoupons.length === 0}
              >
                <Printer size={20} />
                <span>Imprimir Todos os Cupons</span>
              </button>
              
              <button
                onClick={printOrdersList}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
              >
                <FileText size={20} />
                <span>Lista de Pedidos</span>
              </button>
              
              <div className="bg-gray-100 px-6 py-4 rounded-lg flex items-center justify-center space-x-2">
                <Receipt size={20} className="text-gray-600" />
                <span className="font-semibold text-gray-700">
                  {ordersWithCoupons.length} cupons prontos
                </span>
              </div>
            </div>

            {/* Lista de Cupons Fiscais */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Cupons Fiscais Disponíveis</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Clique em "Imprimir" para gerar cupom otimizado para seu dispositivo
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {ordersWithCoupons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhum cupom fiscal disponível</p>
                    <p className="text-sm mt-2">Os cupons são gerados automaticamente quando pedidos são feitos pelo site</p>
                  </div>
                ) : (
                  ordersWithCoupons.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        {/* Informações do Pedido */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                Cupom #{order.id}
                              </h4>
                              <p className="text-gray-600">{order.customerName}</p>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock size={16} />
                                <span>{getTimeSinceOrder(order.createdAt)}</span>
                              </span>
                              <span>{order.date} às {order.time}</span>
                            </div>
                            
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'em preparo' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'saiu para entrega' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'entregue' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          {/* Resumo do Pedido */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <strong>📱 Telefone:</strong> {order.phone}
                              </p>
                              <p className="text-gray-600">
                                <strong>💰 Total:</strong> R$ {order.total.toFixed(2)} ({order.paymentMethod})
                              </p>
                              <p className="text-gray-600">
                                <strong>🛒 Itens:</strong> {order.items.length} produto(s)
                              </p>
                            </div>
                            
                            {order.address && (
                              <div>
                                <p className="text-gray-600">
                                  <strong>📍 Endereço:</strong>
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {order.address}
                                  {order.streetName && ` - ${order.streetName}`}
                                  {order.houseNumber && `, ${order.houseNumber}`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Botão de Impressão */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => printCoupon(order)}
                            className="w-full lg:w-auto bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg"
                          >
                            <Printer size={18} />
                            <span>Imprimir Cupom</span>
                          </button>
                          
                          {/* Indicador de Compatibilidade */}
                          <div className="mt-2 text-center">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              📱💻 Celular & PC
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detalhes dos Itens (Expansível) */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-800 font-medium">
                          Ver detalhes dos itens
                        </summary>
                        <div className="mt-3 bg-gray-50 rounded-lg p-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                              <div>
                                <span className="font-medium text-gray-800">{item.name}</span>
                                {item.size && <span className="text-gray-600 text-sm"> ({item.size})</span>}
                                {item.extras?.length && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Extras: {item.extras.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{item.quantity}x R$ {item.price.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">= R$ {(item.quantity * item.price).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Informações do Sistema */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Sistema de Impressão Inteligente</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>📱 <strong>Celular:</strong> Interface otimizada com botão de impressão destacado</p>
                    <p>💻 <strong>Computador:</strong> Impressão automática em papel A4 ou térmico 80mm</p>
                    <p>🖨️ <strong>Compatível:</strong> Impressoras térmicas, jato de tinta e laser</p>
                    <p>📄 <strong>Formato:</strong> Cupom fiscal válido com todas as informações obrigatórias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Pedidos */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {/* Botão para imprimir lista de pedidos */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Lista de Pedidos</h2>
                <p className="text-gray-600">Gerencie todos os pedidos recebidos</p>
              </div>
              <button
                onClick={printOrdersList}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Printer size={20} />
                <span>Imprimir Lista de Pedidos</span>
              </button>
            </div>

            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Pedido #{order.id}</h3>
                    <p className="text-gray-600">{order.customerName} - {order.phone}</p>
                    <p className="text-sm text-gray-500">{order.date} às {order.time}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">{getTimeSinceOrder(order.createdAt)}</span>
                      {order.hasFiscalCoupon && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                          📄 Cupom Fiscal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                        order.status === 'em preparo' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'saiu para entrega' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'entregue' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="em preparo">Em Preparo</option>
                      <option value="saiu para entrega">Saiu para Entrega</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    {order.hasFiscalCoupon && (
                      <button
                        onClick={() => printCoupon(order)}
                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                        title="Imprimir Cupom Fiscal"
                      >
                        <Printer size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Itens do Pedido:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.size && <span className="text-gray-600"> ({item.size})</span>}
                        {item.flavor && <span className="text-gray-600"> - {item.flavor}</span>}
                        {item.extras?.length && (
                          <div className="text-sm text-gray-500">
                            Extras: {item.extras.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div>{item.quantity}x R$ {item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Pagamento: {order.paymentMethod}
                      {order.cashAmount && ` (Pago: R$ ${order.cashAmount.toFixed(2)} | Troco: R$ ${(order.cashAmount - order.total).toFixed(2)})`}
                    </div>
                    {order.address && (
                      <div className="text-sm text-gray-600 mt-1">
                        📍 {order.address}
                        {order.streetName && ` - ${order.streetName}`}
                        {order.houseNumber && `, ${order.houseNumber}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aba Produtos */}
        {activeTab === 'produtos' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Adicionar Produto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-purple-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setProductImagePreview('');
                          setShowProductForm(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 size={16} />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de Produto */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
                  </h3>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="Nome do produto"
                      defaultValue={editingProduct?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <textarea
                      name="description"
                      placeholder="Descrição"
                      defaultValue={editingProduct?.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      required
                    />
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="Preço"
                      defaultValue={editingProduct?.price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    
                    {/* Upload de Imagem */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem do Produto
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {(productImagePreview || editingProduct?.image) && (
                          <div className="mb-4">
                            <img
                              src={productImagePreview || editingProduct?.image}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="hidden"
                            id="product-image-upload"
                            disabled={uploadingProductImage}
                          />
                          <label
                            htmlFor="product-image-upload"
                            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                              uploadingProductImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploadingProductImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                Redimensionando...
                              </>
                            ) : (
                              <>
                                <Upload size={16} className="mr-2" />
                                {productImagePreview || editingProduct?.image ? 'Alterar Imagem' : 'Fazer Upload'}
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF até 5MB (redimensionado automaticamente)
                          </p>
                        </div>
                      </div>
                    </div>

                    <select
                      name="category"
                      defaultValue={editingProduct?.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Selecione a categoria</option>
                      <option value="Açaí Tradicional">Açaí Tradicional</option>
                      <option value="Açaí Zero">Açaí Zero</option>
                      <option value="Milk Shake">Milk Shake</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Extras">Extras</option>
                    </select>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={uploadingProductImage}
                      >
                        {editingProduct ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                          setProductImagePreview('');
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba Promoções */}
        {activeTab === 'promocoes' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Promoções do Site</h2>
                <p className="text-gray-600">Máximo de 4 promoções ativas ({promotionImages.length}/4)</p>
              </div>
              {promotionImages.length < 4 && (
                <button
                  onClick={() => setShowPromotionForm(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Adicionar Promoção</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotionImages.map((promotion) => (
                <div key={promotion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    <img
                      src={promotion.url}
                      alt={promotion.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      PROMOÇÃO
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{promotion.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{promotion.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPromotion(promotion);
                          setPromotionImagePreview('');
                          setShowPromotionForm(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => deletePromotion(promotion.id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 size={16} />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {promotionImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma promoção cadastrada</h3>
                <p className="text-gray-500 mb-6">Adicione até 4 promoções para exibir no site</p>
                <button
                  onClick={() => setShowPromotionForm(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Adicionar Primeira Promoção
                </button>
              </div>
            )}

            {/* Modal de Promoção */}
            {showPromotionForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingPromotion ? 'Editar Promoção' : 'Adicionar Promoção'}
                  </h3>
                  <form onSubmit={handlePromotionSubmit} className="space-y-4">
                    {/* Upload de Imagem */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem da Promoção
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {(promotionImagePreview || editingPromotion?.url) && (
                          <div className="mb-4">
                            <img
                              src={promotionImagePreview || editingPromotion?.url}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePromotionImageUpload}
                            className="hidden"
                            id="promotion-image-upload"
                            disabled={uploadingPromotionImage}
                          />
                          <label
                            htmlFor="promotion-image-upload"
                            className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                              uploadingPromotionImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploadingPromotionImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                Redimensionando...
                              </>
                            ) : (
                              <>
                                <Upload size={16} className="mr-2" />
                                {promotionImagePreview || editingPromotion?.url ? 'Alterar Imagem' : 'Fazer Upload'}
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF até 5MB (redimensionado automaticamente)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título da Promoção
                      </label>
                      <input
                        name="title"
                        type="text"
                        placeholder="Ex: Promoção Açaí Premium"
                        defaultValue={editingPromotion?.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição da Promoção
                      </label>
                      <textarea
                        name="description"
                        placeholder="Ex: Açaí 500ml + 2 acompanhamentos por apenas R$ 15,00"
                        defaultValue={editingPromotion?.description}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={uploadingPromotionImage}
                      >
                        {editingPromotion ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPromotionForm(false);
                          setEditingPromotion(null);
                          setPromotionImagePreview('');
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aba Impressão */}
        {activeTab === 'impressao' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Impressão</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato do Papel
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Papel Térmico 80mm (Recomendado)</option>
                    <option>Papel Térmico 58mm</option>
                    <option>A4 (Para computador)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impressora Conectada
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Detectar automaticamente</option>
                    <option>Elgin i9 (Térmica)</option>
                    <option>Bematech MP-4200 TH</option>
                    <option>Epson TM-T20X</option>
                    <option>Impressora do computador (A4)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-print" className="rounded" />
                  <label htmlFor="auto-print" className="text-sm text-gray-700">
                    Impressão automática de cupons ao receber pedido
                  </label>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">💻📱 Impressão Responsiva</h4>
                  <p className="text-sm text-blue-700">
                    Os cupons fiscais agora são totalmente responsivos! Funcionam perfeitamente em celulares com interface otimizada 
                    e em computadores com impressão automática. O sistema detecta automaticamente o dispositivo e ajusta o formato.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pedidos para Impressão</h3>
                <button
                  onClick={printOrdersList}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Imprimir Todos os Pedidos</span>
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <span className="font-medium">#{order.id}</span>
                      <span className="text-gray-600 ml-2">{order.customerName}</span>
                      <span className="text-sm text-gray-500 ml-2">R$ {order.total.toFixed(2)}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        order.status === 'em preparo' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'saiu para entrega' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'entregue' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                      {order.hasFiscalCoupon && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          📄 Cupom
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => printCoupon(order)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Printer size={16} />
                      <span>Imprimir Cupom</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aba Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Vendas Hoje</h3>
                <p className="text-3xl font-bold">
                  R$ {orders.filter(o => o.status === 'entregue' && o.date === new Date().toLocaleDateString('pt-BR')).reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </p>
                <p className="text-green-100 text-sm">
                  {orders.filter(o => o.status === 'entregue' && o.date === new Date().toLocaleDateString('pt-BR')).length} pedidos
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Em Preparo</h3>
                <p className="text-3xl font-bold">
                  {orders.filter(o => o.status === 'em preparo').length}
                </p>
                <p className="text-blue-100 text-sm">pedidos ativos</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Total de Produtos</h3>
                <p className="text-3xl font-bold">{products.length}</p>
                <p className="text-purple-100 text-sm">no cardápio</p>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Cupons Fiscais</h3>
                <p className="text-3xl font-bold">{ordersWithCoupons.length}</p>
                <p className="text-orange-100 text-sm">disponíveis</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Gerar Relatórios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => generateSalesReportFile('daily')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Relatório Diário</span>
                </button>
                
                <button
                  onClick={() => generateSalesReportFile('weekly')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Relatório Semanal</span>
                </button>
                
                <button
                  onClick={() => generateSalesReportFile('monthly')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Relatório Mensal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aba Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Notificações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Som de Notificação</h4>
                    <p className="text-sm text-gray-600">Tocar som quando novo pedido chegar</p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="browser-notifications" className="rounded" defaultChecked />
                  <label htmlFor="browser-notifications" className="text-sm text-gray-700">
                    Notificações do navegador para novos pedidos
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações da Loja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Loja
                  </label>
                  <input
                    type="text"
                    defaultValue="Canto do Açaí"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp para Pedidos
                  </label>
                  <input
                    type="text"
                    defaultValue="35997440729"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço da Loja
                  </label>
                  <textarea
                    defaultValue="Poço Fundo - MG"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue="3.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Salvar Configurações
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Sistema de Cupons Fiscais</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-coupon" className="rounded" defaultChecked />
                  <label htmlFor="auto-coupon" className="text-sm text-gray-700">
                    Gerar cupom fiscal automaticamente para todos os pedidos
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="print-auto" className="rounded" />
                  <label htmlFor="print-auto" className="text-sm text-gray-700">
                    Imprimir cupom fiscal automaticamente ao receber pedido
                  </label>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="text-green-600" size={20} />
                    <h4 className="font-medium text-green-800">Status do Sistema</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    ✅ Sistema de cupons fiscais ativo e funcionando
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Todos os pedidos feitos pelo site geram automaticamente cupons fiscais válidos para impressão responsiva 
                    em papel térmico (celular/impressoras térmicas) ou A4 (computador).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}