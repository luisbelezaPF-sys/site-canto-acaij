"use client"

import { useState, useEffect } from 'react'
import { ShoppingCart, Phone, MapPin, Clock, Instagram, Plus, Minus, Trash2, CreditCard, DollarSign, FileText, Calendar, TrendingUp, Package, Lock, LogOut } from 'lucide-react'
import { supabase, insertPedido, fetchPedidos, subscribeToChanges, PedidoSupabase } from '@/lib/supabase'

interface OrderItem {
  id: string
  type: 'acai' | 'milkshake'
  size: string
  flavor: string
  toppings: string[]
  price: number
  isZero?: boolean
  quantity: number
}

interface CompletedOrder {
  id: string
  items: OrderItem[]
  customerName?: string
  address?: string
  streetName?: string
  houseNumber?: string
  paymentMethod: string
  cashAmount?: number
  subtotal: number
  deliveryFee: number
  total: number
  timestamp: Date
  date: string
  hasFiscalCoupon: boolean
}

interface DailyReport {
  date: string
  totalSales: number
  totalRevenue: number
  orders: CompletedOrder[]
  productSales: { [key: string]: { quantity: number, revenue: number } }
}

interface PromotionImage {
  id: string
  url: string
  title: string
  description: string
}

interface Ingredient {
  id: string
  name: string
  price: number
}

export default function Home() {
  const [cart, setCart] = useState<OrderItem[]>([])
  const [activeSection, setActiveSection] = useState('inicio')
  const [selectedAcaiSize, setSelectedAcaiSize] = useState('')
  const [selectedAcaiFlavor, setSelectedAcaiFlavor] = useState('')
  const [selectedAcaiToppings, setSelectedAcaiToppings] = useState<string[]>([])
  const [selectedMilkshakeSize, setSelectedMilkshakeSize] = useState('')
  const [selectedMilkshakeFlavor, setSelectedMilkshakeFlavor] = useState('')
  const [isAcaiZero, setIsAcaiZero] = useState(false)
  
  // Estados para o formulário de pedido
  const [selectedPayment, setSelectedPayment] = useState('')
  const [cashAmount, setCashAmount] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [streetName, setStreetName] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [customerName, setCustomerName] = useState('')

  // Estados para sistema de vendas e relatórios
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [showReports, setShowReports] = useState(false)

  // Estados para autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Estados para promoções
  const [promotionImages, setPromotionImages] = useState<PromotionImage[]>([])

  // Estados para ingredientes editáveis
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  // Estados para Supabase
  const [pedidosSupabase, setPedidosSupabase] = useState<PedidoSupabase[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const deliveryFee = 3.00
  const whatsappNumber = "+5535997440729"

  // Verificar conexão com Supabase e carregar dados
  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Testar conexão
        const { data, error } = await supabase.from('pedidos').select('count').limit(1)
        if (!error) {
          setIsConnected(true)
          console.log('✅ Conectado ao Supabase com sucesso!')
          
          // Carregar pedidos existentes
          const pedidos = await fetchPedidos()
          setPedidosSupabase(pedidos || [])
        } else {
          console.error('❌ Erro ao conectar com Supabase:', error)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('❌ Erro na inicialização do Supabase:', error)
        setIsConnected(false)
      }
    }

    initSupabase()

    // Configurar escuta em tempo real
    const subscription = subscribeToChanges((payload) => {
      console.log('🔄 Mudança detectada:', payload)
      // Recarregar pedidos quando houver mudanças
      fetchPedidos().then(pedidos => {
        setPedidosSupabase(pedidos || [])
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Verificar autenticação salva (mantido para compatibilidade)
  useEffect(() => {
    const savedAuth = localStorage.getItem('acai-admin-auth')
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  // Carregar dados padrão (ingredientes e promoções)
  useEffect(() => {
    // Carregar ingredientes padrão
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
    ]
    setIngredients(defaultIngredients)

    // Carregar promoções padrão
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
    ]
    setPromotionImages(defaultPromotions)
  }, [])

  // Função de login
  const handleLogin = () => {
    if (loginUsername === 'admin' && loginPassword === 'jon2425') {
      setIsAuthenticated(true)
      setShowLogin(false)
      setLoginError('')
      setLoginUsername('')
      setLoginPassword('')
      localStorage.setItem('acai-admin-auth', 'authenticated')
    } else {
      setLoginError('Usuário ou senha incorretos!')
    }
  }

  // Função de logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowReports(false)
    localStorage.removeItem('acai-admin-auth')
  }

  // Função para abrir relatórios (com verificação de autenticação)
  const openReports = () => {
    if (isAuthenticated) {
      setShowReports(true)
    } else {
      setShowLogin(true)
    }
  }

  const acaiSizes = [
    { size: '300ml', price: 10.00 },
    { size: '400ml', price: 12.00 },
    { size: '500ml', price: 15.00 },
    { size: '700ml', price: 18.00 }
  ]

  const acaiZeroSizes = [
    { size: '300ml', price: 15.00 },
    { size: '500ml', price: 21.00 },
    { size: '700ml', price: 27.00 }
  ]

  const acaiFlavors = [
    'Açaí Saborizado com Maracujá',
    'Açaí Duo com Danoninho',
    'Açaí Duo com Leite Ninho',
    'Açaí Tradicional Premium'
  ]

  const milkshakeSizes = [
    { size: '300ml', price: 14.00 },
    { size: '500ml', price: 16.00 },
    { size: '700ml', price: 18.00 }
  ]

  const milkshakeFlavors = [
    'Ovomaltine',
    'Café',
    'Rafaello',
    'Unicórnio (com marshmallows, confete e chantilly)'
  ]

  // Usar ingredientes dinâmicos em vez de array fixo
  const toppings = ingredients.map(ingredient => ({
    name: ingredient.name,
    price: ingredient.price
  }))

  const toggleTopping = (toppingName: string) => {
    setSelectedAcaiToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    )
  }

  const calculateAcaiPrice = () => {
    const sizes = isAcaiZero ? acaiZeroSizes : acaiSizes
    const sizePrice = sizes.find(s => s.size === selectedAcaiSize)?.price || 0
    const toppingsPrice = selectedAcaiToppings.reduce((total, toppingName) => {
      const topping = toppings.find(t => t.name === toppingName)
      return total + (topping?.price || 0)
    }, 0)
    return sizePrice + toppingsPrice
  }

  const calculateMilkshakePrice = () => {
    return milkshakeSizes.find(s => s.size === selectedMilkshakeSize)?.price || 0
  }

  const calculateCartTotal = () => {
    const itemsTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    return itemsTotal + deliveryFee
  }

  const calculateItemsTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const addToCart = (item: Omit<OrderItem, 'id' | 'quantity'>) => {
    const newItem: OrderItem = {
      ...item,
      id: Date.now().toString(),
      quantity: 1
    }
    setCart(prev => [...prev, newItem])
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const clearCart = () => {
    setCart([])
  }

  // Função para salvar pedido no Supabase
  const saveOrderToSupabase = async (orderData: {
    items: OrderItem[]
    customerName?: string
    address?: string
    streetName?: string
    houseNumber?: string
    paymentMethod: string
    cashAmount?: number
    subtotal: number
    deliveryFee: number
    total: number
  }) => {
    try {
      // Converter cada item do carrinho em um registro separado na tabela
      const pedidosParaSalvar = orderData.items.map(item => {
        const productName = `${item.type === 'acai' ? 'Açaí' : 'Milk Shake'} ${item.size}${item.isZero ? ' (Zero)' : ''} - ${item.flavor}`
        const toppingsText = item.toppings.length > 0 ? ` com ${item.toppings.join(', ')}` : ''
        
        return {
          produto: productName + toppingsText,
          quantidade: item.quantity,
          valor: item.price,
          nome_cliente: orderData.customerName || null,
          email_cliente: null, // Pode ser adicionado futuramente
          status: 'pendente',
          endereco: orderData.address || null,
          rua: orderData.streetName || null,
          numero_casa: orderData.houseNumber || null,
          forma_pagamento: orderData.paymentMethod || null,
          valor_pago: orderData.cashAmount || null,
          taxa_entrega: orderData.deliveryFee,
          total: orderData.total
        }
      })

      // Salvar todos os itens no Supabase
      for (const pedido of pedidosParaSalvar) {
        await insertPedido(pedido)
      }

      console.log('✅ Pedido salvo no Supabase com sucesso!')
      
      // Recarregar pedidos
      const pedidos = await fetchPedidos()
      setPedidosSupabase(pedidos || [])
      
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar pedido no Supabase:', error)
      return false
    }
  }

  // Registrar pedido completo (mantido para compatibilidade com relatórios)
  const registerOrder = (orderData: Omit<CompletedOrder, 'id' | 'timestamp' | 'date' | 'hasFiscalCoupon'>) => {
    const now = new Date()
    const newOrder: CompletedOrder = {
      ...orderData,
      id: Date.now().toString(),
      timestamp: now,
      date: now.toISOString().split('T')[0],
      hasFiscalCoupon: true
    }

    const updatedOrders = [...completedOrders, newOrder]
    setCompletedOrders(updatedOrders)

    return newOrder
  }

  // Gerar relatório diário
  const generateDailyReport = (date: string): DailyReport => {
    const dayOrders = completedOrders.filter(order => order.date === date)
    
    const productSales: { [key: string]: { quantity: number, revenue: number } } = {}
    
    dayOrders.forEach(order => {
      order.items.forEach(item => {
        const productKey = `${item.type === 'acai' ? 'Açaí' : 'Milk Shake'} ${item.size}${item.isZero ? ' (Zero)' : ''} - ${item.flavor}`
        
        if (!productSales[productKey]) {
          productSales[productKey] = { quantity: 0, revenue: 0 }
        }
        
        productSales[productKey].quantity += item.quantity
        productSales[productKey].revenue += item.price * item.quantity
      })
    })

    return {
      date,
      totalSales: dayOrders.length,
      totalRevenue: dayOrders.reduce((total, order) => total + order.total, 0),
      orders: dayOrders,
      productSales
    }
  }

  // Gerar e enviar relatório diário automaticamente
  const generateAndSendDailyReport = () => {
    const today = new Date().toISOString().split('T')[0]
    const report = generateDailyReport(today)
    
    if (report.totalSales > 0) {
      const updatedReports = [...dailyReports.filter(r => r.date !== today), report]
      setDailyReports(updatedReports)
      
      sendDailyReportToWhatsApp(report)
    }
  }

  // Formatar relatório para WhatsApp
  const formatReportForWhatsApp = (report: DailyReport): string => {
    const date = new Date(report.date).toLocaleDateString('pt-BR')
    
    let message = `📊 *RELATÓRIO DIÁRIO - O CANTO DO AÇAÍ*\\n`
    message += `📅 Data: ${date}\\n\\n`
    
    message += `💰 *RESUMO FINANCEIRO:*\\n`
    message += `• Total de vendas: ${report.totalSales} pedidos\\n`
    message += `• Faturamento total: R$ ${report.totalRevenue.toFixed(2)}\\n\\n`
    
    message += `📦 *PRODUTOS MAIS VENDIDOS:*\\n`
    const sortedProducts = Object.entries(report.productSales)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5)
    
    sortedProducts.forEach(([product, data], index) => {
      message += `${index + 1}. ${product}\\n`
      message += `   Qtd: ${data.quantity} | Receita: R$ ${data.revenue.toFixed(2)}\\n`
    })
    
    message += `\\n📋 *LISTA COMPLETA DE PEDIDOS:*\\n`
    report.orders.forEach((order, index) => {
      const time = order.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      message += `\\n🕐 Pedido ${index + 1} - ${time}\\n`
      
      if (order.customerName) {
        message += `👤 Cliente: ${order.customerName}\\n`
      }
      
      message += `💳 Pagamento: ${order.paymentMethod}`
      if (order.cashAmount) {
        message += ` (Valor pago: R$ ${order.cashAmount.toFixed(2)})`
      }
      message += `\\n`
      
      if (order.address) {
        message += `📍 Endereço: ${order.address}\\n`
        if (order.streetName) message += `🛣️ Rua: ${order.streetName}\\n`
        if (order.houseNumber) message += `🏠 Nº: ${order.houseNumber}\\n`
      }
      
      message += `📦 Itens:\\n`
      order.items.forEach(item => {
        message += `  • ${item.type === 'acai' ? 'Açaí' : 'Milk Shake'} ${item.size}${item.isZero ? ' (Zero)' : ''}\\n`
        message += `    ${item.flavor} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\\n`
        if (item.toppings.length > 0) {
          message += `    Adicionais: ${item.toppings.join(', ')}\\n`
        }
      })
      
      message += `💰 Total: R$ ${order.total.toFixed(2)}\\n`
    })
    
    message += `\\n✨ Relatório gerado automaticamente pelo sistema O Canto do Açaí`
    
    return message
  }

  // Enviar relatório via WhatsApp
  const sendDailyReportToWhatsApp = (report: DailyReport) => {
    const message = formatReportForWhatsApp(report)
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/5535997440729?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const openWhatsApp = (message: string) => {
    const whatsappNumber = "5535997440729"
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const addAcaiToCart = () => {
    if (!selectedAcaiSize || !selectedAcaiFlavor) {
      alert('Por favor, selecione o tamanho e sabor do açaí!')
      return
    }

    const acaiItem: Omit<OrderItem, 'id' | 'quantity'> = {
      type: 'acai',
      size: selectedAcaiSize,
      flavor: selectedAcaiFlavor,
      toppings: [...selectedAcaiToppings],
      price: calculateAcaiPrice(),
      isZero: isAcaiZero
    }

    addToCart(acaiItem)
    
    setSelectedAcaiSize('')
    setSelectedAcaiFlavor('')
    setSelectedAcaiToppings([])
    
    alert('Açaí adicionado ao carrinho! 🍇')
  }

  const addMilkshakeToCart = () => {
    if (!selectedMilkshakeSize || !selectedMilkshakeFlavor) {
      alert('Por favor, selecione o tamanho e sabor do milk shake!')
      return
    }

    const milkshakeItem: Omit<OrderItem, 'id' | 'quantity'> = {
      type: 'milkshake',
      size: selectedMilkshakeSize,
      flavor: selectedMilkshakeFlavor,
      toppings: ['Chantilly', 'Cobertura do sabor'],
      price: calculateMilkshakePrice()
    }

    addToCart(milkshakeItem)
    
    setSelectedMilkshakeSize('')
    setSelectedMilkshakeFlavor('')
    
    alert('Milk Shake adicionado ao carrinho! 🥤')
  }

  const sendOrderWithDeliveryInfo = async () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!')
      return
    }

    if (!selectedPayment || !deliveryAddress || !streetName || !houseNumber) {
      alert('Por favor, preencha todos os campos de pagamento e entrega!')
      return
    }

    if (selectedPayment === 'Dinheiro' && !cashAmount) {
      alert('Por favor, informe o valor em dinheiro que você vai pagar!')
      return
    }

    // Dados do pedido
    const orderData = {
      items: [...cart],
      customerName: customerName || undefined,
      address: deliveryAddress,
      streetName,
      houseNumber,
      paymentMethod: selectedPayment,
      cashAmount: selectedPayment === 'Dinheiro' ? parseFloat(cashAmount) : undefined,
      subtotal: calculateItemsTotal(),
      deliveryFee,
      total: calculateCartTotal()
    }

    // Salvar no Supabase
    const savedToSupabase = await saveOrderToSupabase(orderData)
    
    if (savedToSupabase) {
      console.log('✅ Pedido salvo no Supabase!')
    } else {
      console.log('⚠️ Erro ao salvar no Supabase, mas continuando com WhatsApp...')
    }

    // Registrar pedido local (para relatórios)
    const registeredOrder = registerOrder(orderData)

    // MENSAGEM FORMATADA CORRETAMENTE PARA WHATSAPP
    let message = `Novo pedido\n`
    
    // Cliente
    if (customerName) {
      message += `Cliente: ${customerName}\n`
    }
    
    // Telefone (se disponível)
    message += `Telefone: (a ser informado)\n`
    
    // Endereço
    message += `Endereco: ${deliveryAddress}\n`
    message += `Rua: ${streetName}\n`
    message += `Numero: ${houseNumber}\n\n`
    
    // Itens
    message += `Itens:\n`
    cart.forEach((item) => {
      const productName = item.type === 'acai' ? 'Acai' : 'Milk Shake'
      const sizeInfo = item.size + (item.isZero ? ' Zero' : '')
      const ingredientsList = item.toppings.length > 0 ? item.toppings.join(', ') : 'sem adicionais'
      
      message += `- ${productName} ${sizeInfo} sabor ${item.flavor} com ${ingredientsList}\n`
    })
    message += `\n`
    
    // Total
    message += `Total: R$ ${calculateCartTotal().toFixed(2)}\n`
    
    // Forma de pagamento
    message += `Forma de pagamento: ${selectedPayment}\n`
    
    // Observações (se houver troco)
    if (selectedPayment === 'Dinheiro' && cashAmount) {
      const cashValue = parseFloat(cashAmount)
      const total = calculateCartTotal()
      const change = cashValue - total
      if (change > 0) {
        message += `Observacoes: Valor pago R$ ${cashValue.toFixed(2)}, troco R$ ${change.toFixed(2)}\n`
      }
    }

    // Enviar para o WhatsApp com o número correto
    const whatsappNumber = "5535997440729"
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')

    // Limpar formulário após envio
    setCart([])
    setSelectedPayment('')
    setCashAmount('')
    setDeliveryAddress('')
    setStreetName('')
    setHouseNumber('')
    setCustomerName('')
    
    alert('Pedido enviado com sucesso! Aguarde nossa resposta no WhatsApp.')
  }

  const sendCartToWhatsApp = () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!')
      return
    }

    // Redirecionar para a seção "Como Pedir" para preencher dados de entrega
    setActiveSection('como-pedir')
  }

  const sendToWhatsApp = (customMessage?: string) => {
    const message = customMessage || `Olá! Quero fazer um pedido no O Canto do Açaí!\\n\\nPor favor, me ajude a montar meu pedido:\\n• Tamanho:\\n• Sabor:\\n• Acompanhamentos:\\n• Endereço para entrega:\\n\\nObrigado!`
    openWhatsApp(message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100">
      {/* Status de Conexão Supabase */}
      {isConnected && (
        <div className="bg-green-500 text-white text-center py-2 text-sm">
          ✅ Conectado ao Supabase - Dados sincronizados em tempo real
        </div>
      )}
      
      {!isConnected && (
        <div className="bg-orange-500 text-white text-center py-2 text-sm">
          ⚠️ Conectando ao banco de dados... Pedidos serão salvos quando conectar
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍇</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">O Canto do Açaí</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveSection('carrinho')}
                className="relative bg-yellow-400 text-purple-800 p-3 rounded-full hover:bg-yellow-300 transition-all duration-300"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
              
              {/* Botão de Painel Administrativo */}
              <div className="relative">
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-all duration-300 inline-flex items-center justify-center"
                  title="Painel Administrativo"
                >
                  <Lock size={24} />
                </a>
              </div>

              <nav className="hidden md:flex space-x-6">
                {['inicio', 'acai', 'milkshake', 'promocoes', 'como-pedir', 'contato'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ${
                      activeSection === section 
                        ? 'bg-yellow-400 text-purple-800 font-bold' 
                        : 'hover:bg-purple-700'
                    }`}
                  >
                    {section === 'inicio' ? 'Início' : 
                     section === 'acai' ? 'Açaí' :
                     section === 'milkshake' ? 'Milk Shake' :
                     section === 'promocoes' ? 'Promoções' :
                     section === 'como-pedir' ? 'Como Pedir' : 'Contato'}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-purple-700 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto">
            {['inicio', 'acai', 'milkshake', 'promocoes', 'carrinho', 'como-pedir', 'contato'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-3 py-2 rounded-full whitespace-nowrap text-sm transition-all duration-300 ${
                  activeSection === section 
                    ? 'bg-yellow-400 text-purple-800 font-bold' 
                    : 'hover:bg-purple-600'
                }`}
              >
                {section === 'inicio' ? 'Início' : 
                 section === 'acai' ? 'Açaí' :
                 section === 'milkshake' ? 'Milk Shake' :
                 section === 'promocoes' ? 'Promoções' :
                 section === 'carrinho' ? `Carrinho (${cart.reduce((total, item) => total + item.quantity, 0)})` :
                 section === 'como-pedir' ? 'Como Pedir' : 'Contato'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-purple-800">Acesso Administrativo</h2>
              <p className="text-gray-600 mt-2">Entre com suas credenciais para acessar os relatórios</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuário:
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Digite o usuário"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha:
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {loginError}
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowLogin(false)
                    setLoginError('')
                    setLoginUsername('')
                    setLoginPassword('')
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all duration-300"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatórios (apenas para usuários autenticados) */}
      {showReports && isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-800">📊 Relatórios de Vendas</h2>
                    <p className="text-sm text-green-600 font-medium">✓ Acesso Administrativo Autorizado</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReports(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Estatísticas Gerais */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total de Pedidos</p>
                      <p className="text-3xl font-bold">{completedOrders.length}</p>
                    </div>
                    <Package size={40} className="text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Faturamento Total</p>
                      <p className="text-3xl font-bold">
                        R$ {completedOrders.reduce((total, order) => total + order.total, 0).toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp size={40} className="text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Pedidos Supabase</p>
                      <p className="text-3xl font-bold">{pedidosSupabase.length}</p>
                    </div>
                    <FileText size={40} className="text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    const report = generateDailyReport(today)
                    sendDailyReportToWhatsApp(report)
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-all duration-300"
                >
                  📱 Enviar Relatório de Hoje
                </button>
                
                <button
                  onClick={generateAndSendDailyReport}
                  className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-all duration-300"
                >
                  📊 Gerar Relatório Automático
                </button>
              </div>

              {/* Lista de Pedidos do Supabase */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-800">📋 Pedidos Salvos no Supabase</h3>
                
                {pedidosSupabase.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Nenhum pedido salvo ainda</p>
                    <p className="text-sm">Os pedidos aparecerão aqui quando forem feitos</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pedidosSupabase.slice(0, 10).map((pedido) => (
                      <div key={pedido.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-purple-800">{pedido.produto}</h4>
                            <p className="text-sm text-gray-600">
                              Qtd: {pedido.quantidade} | Valor: R$ {pedido.valor.toFixed(2)}
                            </p>
                            {pedido.nome_cliente && (
                              <p className="text-sm text-gray-600">Cliente: {pedido.nome_cliente}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              pedido.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              pedido.status === 'concluido' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pedido.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(pedido.created_at || '').toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {pedido.endereco && (
                          <p className="text-sm text-gray-600">
                            📍 {pedido.endereco} - {pedido.rua}, {pedido.numero_casa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Seção Início */}
        {activeSection === 'inicio' && (
          <section className="text-center mb-16">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Bem-vindo ao Canto do Açaí 🍇
              </h1>
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                O melhor açaí premium de Poço Fundo! Monte o seu, escolha seus acompanhamentos favoritos e peça direto pelo WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveSection('acai')}
                  className="bg-yellow-400 text-purple-800 px-8 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Ver Cardápio de Açaí
                </button>
                <button
                  onClick={() => setActiveSection('milkshake')}
                  className="bg-purple-100 text-purple-800 px-8 py-4 rounded-full text-xl font-bold hover:bg-purple-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Ver Milk Shakes
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🍇</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Açaí Premium</h3>
                <p className="text-gray-600">Açaí de qualidade superior com sabores únicos</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🥤</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Milk Shakes</h3>
                <p className="text-gray-600">Cremosos e deliciosos, feitos na hora</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Delivery Rápido</h3>
                <p className="text-gray-600">Entregamos rapidinho na sua casa</p>
              </div>
            </div>
          </section>
        )}

        {/* Seção Promoções */}
        {activeSection === 'promocoes' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">
              Promoções Especiais 🎉
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {promotionImages.map((promotion) => (
                <div key={promotion.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative">
                    <img
                      src={promotion.url}
                      alt={promotion.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      PROMOÇÃO
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-purple-800 mb-3">
                      {promotion.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {promotion.description}
                    </p>
                    <button
                      onClick={() => sendToWhatsApp(`Olá! Tenho interesse na promoção: ${promotion.title}\\n\\n${promotion.description}\\n\\nPoderia me dar mais detalhes?`)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-full font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
                    >
                      <Phone className="inline-block mr-2" size={20} />
                      Aproveitar Promoção
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {promotionImages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">
                  Nenhuma promoção ativa no momento
                </h3>
                <p className="text-gray-600 mb-6">
                  Fique de olho! Sempre temos ofertas especiais para você.
                </p>
                <button
                  onClick={() => sendToWhatsApp('Olá! Gostaria de saber sobre as promoções disponíveis.')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-all duration-300"
                >
                  <Phone className="inline-block mr-2" size={20} />
                  Perguntar sobre Promoções
                </button>
              </div>
            )}
          </section>
        )}

        {/* Seção Açaí */}
        {activeSection === 'acai' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">Monte seu Açaí do Seu Jeito 💜</h2>
            
            {/* Seletor de Linha */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Escolha a Linha</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setIsAcaiZero(false)
                    setSelectedAcaiSize('')
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !isAcaiZero 
                      ? 'border-purple-600 bg-purple-100 text-purple-800' 
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🍇</div>
                  <h4 className="font-bold">Açaí Tradicional</h4>
                  <p className="text-sm">Com açúcar natural</p>
                </button>
                <button
                  onClick={() => {
                    setIsAcaiZero(true)
                    setSelectedAcaiSize('')
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isAcaiZero 
                      ? 'border-green-600 bg-green-100 text-green-800' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🌿</div>
                  <h4 className="font-bold">Linha Zero</h4>
                  <p className="text-sm">Sem açúcar adicionado</p>
                </button>
              </div>
            </div>

            {/* Tamanhos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">
                Tamanhos {isAcaiZero ? '(Linha Zero)' : '(Tradicional)'}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(isAcaiZero ? acaiZeroSizes : acaiSizes).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAcaiSize(item.size)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAcaiSize === item.size
                        ? 'border-purple-600 bg-purple-100 text-purple-800 transform scale-105'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-lg font-bold">{item.size}</div>
                    <div className="text-xl font-bold text-green-600">R$ {item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sabores */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Sabores</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {acaiFlavors.map((flavor, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAcaiFlavor(flavor)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAcaiFlavor === flavor
                        ? 'border-purple-600 bg-purple-100 text-purple-800 transform scale-105'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span className="font-semibold">{flavor}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Acompanhamentos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">
                Acompanhamentos 
                {selectedAcaiToppings.length > 0 && (
                  <span className="text-lg text-green-600 ml-2">
                    ({selectedAcaiToppings.length} selecionados)
                  </span>
                )}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {toppings.map((topping, index) => (
                  <button
                    key={index}
                    onClick={() => toggleTopping(topping.name)}
                    className={`flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                      selectedAcaiToppings.includes(topping.name)
                        ? 'border-green-600 bg-green-100 text-green-800 transform scale-105'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <span className="font-medium">{topping.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">R$ {topping.price.toFixed(2)}</span>
                      {selectedAcaiToppings.includes(topping.name) && (
                        <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resumo do Açaí Atual */}
            {(selectedAcaiSize || selectedAcaiFlavor || selectedAcaiToppings.length > 0) && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold mb-4">Resumo do Açaí Atual</h3>
                <div className="space-y-2">
                  {selectedAcaiSize && (
                    <p>📏 Tamanho: {selectedAcaiSize} {isAcaiZero ? '(Linha Zero)' : '(Tradicional)'}</p>
                  )}
                  {selectedAcaiFlavor && (
                    <p>🍇 Sabor: {selectedAcaiFlavor}</p>
                  )}
                  {selectedAcaiToppings.length > 0 && (
                    <div>
                      <p>🍓 Acompanhamentos:</p>
                      <ul className="ml-4 space-y-1">
                        {selectedAcaiToppings.map(toppingName => {
                          const topping = toppings.find(t => t.name === toppingName)
                          return (
                            <li key={toppingName}>• {toppingName} - R$ {topping?.price.toFixed(2)}</li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {selectedAcaiSize && selectedAcaiFlavor && (
                    <div className="border-t border-purple-400 pt-4 mt-4">
                      <p className="text-xl font-bold">💰 Preço: R$ {calculateAcaiPrice().toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão Adicionar ao Carrinho */}
            <div className="text-center mb-8">
              <button
                onClick={addAcaiToCart}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="inline-block mr-2" size={24} />
                Adicionar ao Carrinho
              </button>
            </div>
          </section>
        )}

        {/* Seção Milk Shake */}
        {activeSection === 'milkshake' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">Cardápio de Milk Shakes 🥤</h2>
            
            {/* Tamanhos */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Tamanhos</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {milkshakeSizes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMilkshakeSize(item.size)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMilkshakeSize === item.size
                        ? 'border-purple-600 bg-purple-100 text-purple-800 transform scale-105'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-lg font-bold">{item.size}</div>
                    <div className="text-xl font-bold text-green-600">R$ {item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sabores */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Sabores</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {milkshakeFlavors.map((flavor, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMilkshakeFlavor(flavor)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedMilkshakeFlavor === flavor
                        ? 'border-purple-600 bg-purple-100 text-purple-800 transform scale-105'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span className="font-semibold">{flavor}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 mb-8">
              <p className="text-center text-lg font-semibold">
                ✨ Todos os Milk Shakes acompanham chantilly e cobertura do sabor escolhido ✨
              </p>
            </div>

            {/* Resumo do Milk Shake Atual */}
            {(selectedMilkshakeSize || selectedMilkshakeFlavor) && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold mb-4">Resumo do Milk Shake Atual</h3>
                <div className="space-y-2">
                  {selectedMilkshakeSize && (
                    <p>📏 Tamanho: {selectedMilkshakeSize}</p>
                  )}
                  {selectedMilkshakeFlavor && (
                    <p>🥤 Sabor: {selectedMilkshakeFlavor}</p>
                  )}
                  <p>✨ Incluso: Chantilly e cobertura do sabor</p>
                  {selectedMilkshakeSize && selectedMilkshakeFlavor && (
                    <div className="border-t border-purple-400 pt-4 mt-4">
                      <p className="text-xl font-bold">💰 Preço: R$ {calculateMilkshakePrice().toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão Adicionar ao Carrinho */}
            <div className="text-center mb-8">
              <button
                onClick={addMilkshakeToCart}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Plus className="inline-block mr-2" size={24} />
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Bebidas */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Bebidas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="font-semibold text-purple-800">Água Mineral</span>
                  <span className="text-xl font-bold text-green-600">R$ 3,00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="font-semibold text-purple-800">Água com Gás</span>
                  <span className="text-xl font-bold text-green-600">R$ 4,00</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seção Carrinho */}
        {activeSection === 'carrinho' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">
              Seu Carrinho ({cart.reduce((total, item) => total + item.quantity, 0)} itens)
            </h2>
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">Seu carrinho está vazio</h3>
                <p className="text-gray-600 mb-6">Adicione alguns deliciosos açaís ou milk shakes!</p>
                <button
                  onClick={() => setActiveSection('acai')}
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-full font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* Itens do Carrinho */}
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-purple-800 mb-2">
                            {item.type === 'acai' ? '🍇 Açaí' : '🥤 Milk Shake'}
                            {item.isZero && ' (Linha Zero)'}
                          </h4>
                          <p className="text-gray-600 mb-1">📏 Tamanho: {item.size}</p>
                          <p className="text-gray-600 mb-1">🍓 Sabor: {item.flavor}</p>
                          {item.toppings.length > 0 && (
                            <p className="text-gray-600 mb-3">✨ Adicionais: {item.toppings.join(', ')}</p>
                          )}
                          <p className="text-lg font-bold text-green-600">R$ {item.price.toFixed(2)} cada</p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-xl font-bold text-purple-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <p className="text-right text-lg font-bold text-purple-800">
                          Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo Final */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-xl mb-8">
                  <h3 className="text-2xl font-bold mb-4">💰 Resumo do Pedido</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal dos itens:</span>
                      <span className="font-bold">R$ {calculateItemsTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span className="font-bold">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-purple-400 pt-2 mt-2">
                      <div className="flex justify-between text-xl">
                        <span className="font-bold">TOTAL FINAL:</span>
                        <span className="font-bold text-yellow-400">R$ {calculateCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearCart}
                    className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all duration-300"
                  >
                    <Trash2 className="inline-block mr-2" size={20} />
                    Limpar Carrinho
                  </button>
                  <button
                    onClick={sendCartToWhatsApp}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Phone className="inline-block mr-2" size={24} />
                    Finalizar Pedido
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Seção Como Pedir */}
        {activeSection === 'como-pedir' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">Como Pedir</h2>
            
            {/* Passos do Pedido */}
            <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Escolha o tamanho e sabor</h3>
                  <p className="text-gray-600">Selecione seu açaí ou milk shake favorito</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Monte seus acompanhamentos</h3>
                  <p className="text-gray-600">Adicione seus toppings preferidos</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Adicione ao carrinho</h3>
                  <p className="text-gray-600">Adicione quantos quiser!</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Finalize no WhatsApp 💜</h3>
                  <p className="text-gray-600">Delivery rápido e seguro</p>
                </div>
              </div>
            </div>

            {/* Formulário de Pedido Interativo */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
                <h3 className="text-2xl font-bold text-purple-800 mb-6">Finalize seu Pedido</h3>
                
                {/* Resumo do Carrinho */}
                <div className="bg-purple-50 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-purple-800 mb-2">Resumo do seu pedido:</h4>
                  <div className="space-y-1 text-sm">
                    {cart.map((item, index) => (
                      <p key={item.id}>
                        {index + 1}. {item.type === 'acai' ? 'Açaí' : 'Milk Shake'} {item.size} - 
                        {item.flavor} (x{item.quantity}) - R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    ))}
                    <div className="border-t pt-2 mt-2 font-bold">
                      Total: R$ {calculateCartTotal().toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Campo Nome do Cliente */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Seu nome (opcional):
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Formas de Pagamento - MELHORADAS */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-purple-800 mb-4">💳 Escolha a forma de pagamento:</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* PIX */}
                    <button
                      onClick={() => setSelectedPayment('PIX')}
                      className={`group relative p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                        selectedPayment === 'PIX'
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl scale-105'
                          : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-lg'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-5xl mb-3 transition-all duration-300 ${
                          selectedPayment === 'PIX' ? 'animate-pulse' : ''
                        }`}>
                          📱
                        </div>
                        <h5 className="text-xl font-bold text-green-700 mb-2">PIX</h5>
                        <p className="text-sm text-gray-600 mb-3">Pagamento instantâneo</p>
                        <div className="flex items-center justify-center space-x-1 text-green-600">
                          <span className="text-xs">✓ Rápido</span>
                          <span className="text-xs">✓ Seguro</span>
                        </div>
                      </div>
                      {selectedPayment === 'PIX' && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>

                    {/* Cartão */}
                    <button
                      onClick={() => setSelectedPayment('Cartão')}
                      className={`group relative p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                        selectedPayment === 'Cartão'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl scale-105'
                          : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-5xl mb-3 transition-all duration-300 ${
                          selectedPayment === 'Cartão' ? 'animate-pulse' : ''
                        }`}>
                          💳
                        </div>
                        <h5 className="text-xl font-bold text-blue-700 mb-2">Cartão</h5>
                        <p className="text-sm text-gray-600 mb-3">Débito ou Crédito</p>
                        <div className="flex items-center justify-center space-x-1 text-blue-600">
                          <span className="text-xs">✓ Débito</span>
                          <span className="text-xs">✓ Crédito</span>
                        </div>
                      </div>
                      {selectedPayment === 'Cartão' && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>

                    {/* Dinheiro */}
                    <button
                      onClick={() => setSelectedPayment('Dinheiro')}
                      className={`group relative p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                        selectedPayment === 'Dinheiro'
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-xl scale-105'
                          : 'border-gray-300 bg-white hover:border-yellow-400 hover:shadow-lg'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-5xl mb-3 transition-all duration-300 ${
                          selectedPayment === 'Dinheiro' ? 'animate-pulse' : ''
                        }`}>
                          💵
                        </div>
                        <h5 className="text-xl font-bold text-yellow-700 mb-2">Dinheiro</h5>
                        <p className="text-sm text-gray-600 mb-3">Pagamento na entrega</p>
                        <div className="flex items-center justify-center space-x-1 text-yellow-600">
                          <span className="text-xs">✓ Tradicional</span>
                          <span className="text-xs">✓ Troco</span>
                        </div>
                      </div>
                      {selectedPayment === 'Dinheiro' && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Campo para valor em dinheiro */}
                {selectedPayment === 'Dinheiro' && (
                  <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">💵</span>
                        <h5 className="text-lg font-bold text-yellow-800">Valor em Dinheiro</h5>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        Informe o valor da nota que você vai usar para pagar. 
                        <br />
                        <strong>Total do pedido: R$ {calculateCartTotal().toFixed(2)}</strong>
                      </p>
                      
                      <label className="block text-sm font-medium text-yellow-800 mb-2">
                        💰 Com quanto você vai pagar?
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={calculateCartTotal()}
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder={`Ex: ${Math.ceil(calculateCartTotal() / 10) * 10}.00`}
                        className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                      />
                      
                      {cashAmount && parseFloat(cashAmount) >= calculateCartTotal() && (
                        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700">💰 Valor pago:</span>
                            <span className="font-bold text-green-800">R$ {parseFloat(cashAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700">💸 Troco:</span>
                            <span className="font-bold text-green-800">
                              R$ {(parseFloat(cashAmount) - calculateCartTotal()).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {cashAmount && parseFloat(cashAmount) < calculateCartTotal() && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-sm text-red-700">
                            ⚠️ O valor informado é menor que o total do pedido!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dados de Entrega */}
                {selectedPayment && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-purple-800">📍 Dados para entrega:</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço completo (bairro, cidade):
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Ex: Centro, Poço Fundo - MG"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da rua:
                      </label>
                      <input
                        type="text"
                        value={streetName}
                        onChange={(e) => setStreetName(e.target.value)}
                        placeholder="Ex: Rua das Flores"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número da casa:
                      </label>
                      <input
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        placeholder="Ex: 123"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    {/* Resumo dos dados preenchidos */}
                    {(selectedPayment || deliveryAddress || streetName || houseNumber || customerName) && (
                      <div className="bg-purple-50 rounded-xl p-4 mt-6">
                        <h5 className="font-bold text-purple-800 mb-2">📋 Resumo dos dados:</h5>
                        <div className="text-sm space-y-1">
                          {customerName && (
                            <p className="flex items-center space-x-2">
                              <span>👤</span>
                              <span>Nome: <strong>{customerName}</strong></span>
                            </p>
                          )}
                          {selectedPayment && (
                            <p className="flex items-center space-x-2">
                              <span>💳</span>
                              <span>Pagamento: <strong>{selectedPayment}</strong></span>
                              {selectedPayment === 'Dinheiro' && cashAmount && (
                                <span className="text-green-600">
                                  (R$ {parseFloat(cashAmount).toFixed(2)})
                                </span>
                              )}
                            </p>
                          )}
                          {deliveryAddress && (
                            <p className="flex items-center space-x-2">
                              <span>📍</span>
                              <span>Endereço: <strong>{deliveryAddress}</strong></span>
                            </p>
                          )}
                          {streetName && (
                            <p className="flex items-center space-x-2">
                              <span>🛣️</span>
                              <span>Rua: <strong>{streetName}</strong></span>
                            </p>
                          )}
                          {houseNumber && (
                            <p className="flex items-center space-x-2">
                              <span>🏠</span>
                              <span>Número: <strong>{houseNumber}</strong></span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Botão Finalizar */}
                    <div className="text-center pt-4">
                      <button
                        onClick={sendOrderWithDeliveryInfo}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Phone className="inline-block mr-2" size={24} />
                        Enviar Pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-center">
              <button
                onClick={() => sendToWhatsApp()}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="inline-block mr-2" size={24} />
                Fazer Pedido Agora
              </button>
            </div>
          </section>
        )}

        {/* Seção Contato */}
        {activeSection === 'contato' && (
          <section className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">Contato</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-purple-800 mb-6">Informações</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <MapPin className="text-purple-600" size={24} />
                    <div>
                      <p className="font-semibold text-purple-800">Localização</p>
                      <p className="text-gray-600">Poço Fundo – MG</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="text-purple-600" size={24} />
                    <div>
                      <p className="font-semibold text-purple-800">WhatsApp</p>
                      <p className="text-gray-600">+55 35 99744-0729</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Instagram className="text-purple-600" size={24} />
                    <div>
                      <p className="font-semibold text-purple-800">Instagram</p>
                      <p className="text-gray-600">@ocantodoacai</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Clock className="text-purple-600" size={24} />
                    <div>
                      <p className="font-semibold text-purple-800">Horário</p>
                      <p className="text-gray-600">13h às 23h, todos os dias</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Fale Conosco</h3>
                <p className="text-lg mb-6">
                  Estamos sempre prontos para atender você! Entre em contato pelo WhatsApp e faça seu pedido.
                </p>
                <button
                  onClick={() => sendToWhatsApp(`Olá! Gostaria de entrar em contato com vocês!\\n\\nTenho uma dúvida sobre:\\n\\nObrigado!`)}
                  className="bg-yellow-400 text-purple-800 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="inline-block mr-2" size={20} />
                  Chamar no WhatsApp
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Botão Flutuante WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => sendToWhatsApp()}
          className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          <Phone size={24} />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-800 to-purple-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xl">🍇</span>
            </div>
            <h3 className="text-2xl font-bold">O Canto do Açaí</h3>
          </div>
          <p className="text-purple-200 mb-4">O melhor açaí premium de Poço Fundo – MG</p>
          <div className="flex justify-center space-x-6 mb-4">
            <button
              onClick={() => sendToWhatsApp("Olá! Quero fazer um pedido no O Canto do Açaí!")}
              className="text-purple-200 hover:text-yellow-400 transition-colors"
            >
              <Phone size={24} />
            </button>
            <button
              onClick={() => window.open('https://instagram.com/ocantodoacai', '_blank')}
              className="text-purple-200 hover:text-yellow-400 transition-colors"
            >
              <Instagram size={24} />
            </button>
          </div>
          <p className="text-sm text-purple-300">
            © 2024 O Canto do Açaí. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}