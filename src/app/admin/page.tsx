'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Package, ShoppingCart, Printer, Settings, LogOut, Plus, Edit, Trash2, Download, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    flavor?: string;
    extras?: string[];
  }>;
  total: number;
  paymentMethod: string;
  status: 'em preparo' | 'entregue' | 'cancelado';
  date: string;
  phone: string;
  address?: string;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [activeTab, setActiveTab] = useState('pedidos');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados iniciais de exemplo
  useEffect(() => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Açaí 300ml',
        description: 'Açaí cremoso tradicional',
        price: 8.50,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí'
      },
      {
        id: '2',
        name: 'Açaí 500ml',
        description: 'Açaí cremoso tradicional tamanho médio',
        price: 12.00,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
        category: 'Açaí'
      }
    ];

    const sampleOrders: Order[] = [
      {
        id: 'PED001',
        customerName: 'João Silva',
        items: [
          { name: 'Açaí 500ml', quantity: 1, price: 12.00, size: 'Médio', flavor: 'Tradicional', extras: ['Granola', 'Banana'] }
        ],
        total: 12.00,
        paymentMethod: 'PIX',
        status: 'em preparo',
        date: new Date().toLocaleString(),
        phone: '35999887766',
        address: 'Rua das Flores, 123'
      }
    ];

    setProducts(sampleProducts);
    setOrders(sampleOrders);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.id === 'admin' && loginData.password === 'jonjon25') {
      setIsAuthenticated(true);
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
      id: editingProduct?.id || Date.now().toString(),
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

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: 'em preparo' | 'entregue' | 'cancelado') => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const printCoupon = (order: Order) => {
    const couponContent = `
      ================================
           CANTO DO AÇAÍ
      ================================
      
      Pedido: ${order.id}
      Data: ${order.date}
      Cliente: ${order.customerName}
      Telefone: ${order.phone}
      ${order.address ? `Endereço: ${order.address}` : ''}
      
      --------------------------------
      ITENS:
      --------------------------------
      ${order.items.map(item => `
      ${item.name} ${item.size ? `(${item.size})` : ''}
      Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)}
      ${item.flavor ? `Sabor: ${item.flavor}` : ''}
      ${item.extras?.length ? `Extras: ${item.extras.join(', ')}` : ''}
      `).join('\n')}
      
      --------------------------------
      Total: R$ ${order.total.toFixed(2)}
      Pagamento: ${order.paymentMethod}
      Status: ${order.status.toUpperCase()}
      
      ================================
      Obrigado pela preferência!
      ================================
    `;

    // Simular impressão (em produção, integraria com API da impressora)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom - ${order.id}</title>
            <style>
              body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${couponContent}</pre>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const generateSalesReport = () => {
    const today = new Date().toLocaleDateString();
    const todayOrders = orders.filter(order => 
      order.date.includes(today) && order.status === 'entregue'
    );
    const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    alert(`Relatório de Vendas - ${today}\n\nPedidos entregues: ${todayOrders.length}\nTotal de vendas: R$ ${totalSales.toFixed(2)}`);
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
              <span className="text-white text-2xl font-bold">CA</span>
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
              <span className="text-white font-bold">CA</span>
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
              onClick={() => setActiveTab('impressao')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'impressao' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Printer size={20} />
              <span>Impressão</span>
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
            {activeTab === 'impressao' && 'Central de Impressão'}
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
            
            {activeTab === 'configuracoes' && (
              <button
                onClick={generateSalesReport}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                <span>Relatório de Vendas</span>
              </button>
            )}
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
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'em preparo' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'entregue' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="em preparo">Em Preparo</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <button
                      onClick={() => printCoupon(order)}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
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
                    </div>
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
                      <option value="Açaí">Açaí</option>
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

        {/* Aba Impressão */}
        {activeTab === 'impressao' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações de Impressão</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Impressora Selecionada
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>Elgin i9 (Térmica)</option>
                    <option>Bematech MP-4200 TH</option>
                    <option>Epson TM-T20X</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-print" className="rounded" />
                  <label htmlFor="auto-print" className="text-sm text-gray-700">
                    Impressão automática de cupons
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Pedidos Recentes para Impressão</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <span className="font-medium">#{order.id}</span>
                      <span className="text-gray-600 ml-2">{order.customerName}</span>
                      <span className="text-sm text-gray-500 ml-2">R$ {order.total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => printCoupon(order)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Aba Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Relatórios de Vendas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">Vendas Hoje</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {orders.filter(o => o.status === 'entregue').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Pedidos Entregues</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'entregue').length}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Em Preparo</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'em preparo').length}
                  </p>
                </div>
              </div>
              <button
                onClick={generateSalesReport}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download size={20} />
                <span>Gerar Relatório Completo</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Configurações Gerais</h3>
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
                    defaultValue="Rua Principal, 123 - Centro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={3}
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