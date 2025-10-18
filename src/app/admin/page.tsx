'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Package, ShoppingCart, Printer, Settings, LogOut, Plus, Edit, Trash2, Download, Search, Clock, Bell, BellOff, Upload, Image as ImageIcon } from 'lucide-react';

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
}

interface PromotionImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [activeTab, setActiveTab] = useState('pedidos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promotionImages, setPromotionImages] = useState<PromotionImage[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<PromotionImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

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
        createdAt: new Date()
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
        createdAt: new Date(Date.now() - 30 * 60000)
      }
    ];

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

    setProducts(siteProducts);
    setOrders(sampleOrders);
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
          createdAt: new Date()
        };

        setOrders(prev => [newOrder, ...prev]);
        
        // Tocar som de notificação se habilitado
        if (soundEnabled) {
          playNotificationSound();
        }
        
        // Mostrar notificação visual
        showNotification('Novo pedido recebido!', `Pedido #${newOrder.id} - ${newOrder.customerName}`);
      }
    }, 30000); // Verificar a cada 30 segundos

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

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      id: editingProduct?.id || `product-${Date.now()}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
      category: formData.get('category') as string,
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts([...products, productData]);
    }

    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const promotionData = {
      id: editingPromotion?.id || `promo-${Date.now()}`,
      url: formData.get('url') as string,
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

  const printCoupon = (order: Order) => {
    const couponContent = `
      <div style="width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; margin: 0; padding: 10px;">
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
        </div>
      </div>
    `;

    // Abrir janela de impressão formatada para papel térmico 80mm
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom Fiscal - ${order.id}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
              }
              @media print {
                body {
                  width: 80mm;
                }
              }
            </style>
          </head>
          <body>
            ${couponContent}
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

  const generateSalesReport = (period: 'daily' | 'weekly' | 'monthly') => {
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
      
      PRODUTOS MAIS VENDIDOS:
      ${topProducts.map(([product, data], index) => 
        `${index + 1}. ${product}\n   Qtd: ${data.quantity} | Receita: R$ ${data.revenue.toFixed(2)}`
      ).join('\n')}
      
      DETALHES DOS PEDIDOS:
      ${filteredOrders.map(order => 
        `\nPedido #${order.id} - ${order.date} ${order.time}
        Cliente: ${order.customerName}
        Total: R$ ${order.total.toFixed(2)} (${order.paymentMethod})`
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
              onClick={() => setActiveTab('produtos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'produtos' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package size={20} />
              <span>Produtos</span>
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
            {activeTab === 'produtos' && 'Gerenciamento de Produtos'}
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

        {/* Aba Pedidos */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
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
                    <button
                      onClick={() => printCoupon(order)}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                      title="Imprimir Cupom"
                    >
                      <Printer size={16} />
                    </button>
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
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                    <input
                      name="image"
                      type="url"
                      placeholder="URL da imagem"
                      defaultValue={editingProduct?.image}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
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
                      >
                        {editingProduct ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
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
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingPromotion ? 'Editar Promoção' : 'Adicionar Promoção'}
                  </h3>
                  <form onSubmit={handlePromotionSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL da Imagem
                      </label>
                      <input
                        name="url"
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        defaultValue={editingPromotion?.url}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use URLs de imagens públicas (Unsplash, Pexels, etc.)
                      </p>
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
                      >
                        {editingPromotion ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPromotionForm(false);
                          setEditingPromotion(null);
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
                    <option>A4 (Não recomendado)</option>
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
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-print" className="rounded" />
                  <label htmlFor="auto-print" className="text-sm text-gray-700">
                    Impressão automática de cupons ao receber pedido
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Pedidos para Impressão</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Gerar Relatórios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => generateSalesReport('daily')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Relatório Diário</span>
                </button>
                
                <button
                  onClick={() => generateSalesReport('weekly')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Relatório Semanal</span>
                </button>
                
                <button
                  onClick={() => generateSalesReport('monthly')}
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
          </div>
        )}
      </div>
    </div>
  );
}