"use client"

import { useState, useEffect } from 'react'
import { ShoppingCart, Phone, MapPin, Clock, Instagram, Plus, Minus, CreditCard, Banknote, Smartphone } from 'lucide-react'

interface OrderItem {
  type: 'acai' | 'milkshake' | 'drink'
  size: string
  flavor: string
  toppings: string[]
  price: number
}

export default function Home() {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [activeSection, setActiveSection] = useState('inicio')
  const [selectedAcaiSize, setSelectedAcaiSize] = useState('')
  const [selectedAcaiFlavor, setSelectedAcaiFlavor] = useState('')
  const [selectedAcaiToppings, setSelectedAcaiToppings] = useState<string[]>([])
  const [selectedMilkshakeSize, setSelectedMilkshakeSize] = useState('')
  const [selectedMilkshakeFlavor, setSelectedMilkshakeFlavor] = useState('')
  const [isAcaiZero, setIsAcaiZero] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Garantir que componente só renderize no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const paymentMethods = [
    { 
      id: 'pix', 
      name: 'PIX', 
      icon: Smartphone, 
      description: 'Pagamento instantâneo',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'card', 
      name: 'Cartão', 
      icon: CreditCard, 
      description: 'Débito ou Crédito',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'cash', 
      name: 'Dinheiro', 
      icon: Banknote, 
      description: 'Pagamento na entrega',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const toppings = [
    { name: 'Ovomaltine', price: 4.00 },
    { name: 'Nutella', price: 5.00 },
    { name: 'Creme de Leite Ninho', price: 4.00 },
    { name: 'Creme de Ovomaltine', price: 4.00 },
    { name: 'Creme de Ferrero Rocher', price: 4.00 },
    { name: 'Creme de Avelã', price: 4.00 },
    { name: 'Mousse de Maracujá', price: 3.00 },
    { name: 'Mousse de Morango', price: 3.00 },
    { name: 'Mousse de Limão', price: 3.00 },
    { name: 'Sonho de Valsa', price: 3.00 },
    { name: 'Trento', price: 3.00 },
    { name: 'Confete', price: 2.50 },
    { name: 'Bis Branco', price: 2.50 },
    { name: 'Bis Preto', price: 2.50 },
    { name: 'Suflair', price: 5.00 },
    { name: 'Chantilly', price: 2.50 },
    { name: 'Paçoca', price: 3.00 },
    { name: 'Leite Condensado', price: 2.50 },
    { name: 'Kit Kat', price: 4.00 },
    { name: 'Gotas de Chocolate', price: 2.50 },
    { name: 'Power Ball', price: 2.50 },
    { name: 'Granola', price: 2.50 },
    { name: 'Leite em Pó', price: 2.00 },
    { name: 'Danoninho', price: 2.00 },
    { name: 'Banana', price: 2.00 },
    { name: 'Morango', price: 3.00 },
    { name: 'Uva', price: 3.00 },
    { name: 'Kiwi', price: 3.00 },
    { name: 'Manga', price: 3.00 },
    { name: 'Cobertura Chocolate', price: 2.00 },
    { name: 'Cobertura Morango', price: 2.00 },
    { name: 'Cobertura Caramelo', price: 2.00 }
  ]

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

  const showSuccessNotification = () => {
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const getPaymentMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId)
    return method ? method.name : ''
  }

  const openWhatsApp = (message: string) => {
    if (!isClient) return
    
    try {
      const whatsappNumber = "5535997440729"
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      
      showSuccessNotification()
      
      // Tentar abrir em nova aba primeiro
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      
      // Fallback se bloqueado
      if (!newWindow) {
        window.location.href = whatsappUrl
      }
      
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error)
      // Fallback final
      const whatsappNumber = "5535997440729"
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
      window.location.href = whatsappUrl
    }
  }

  const sendAcaiToWhatsApp = () => {
    if (!selectedAcaiSize || !selectedAcaiFlavor) {
      alert('Por favor, selecione o tamanho e sabor do açaí!')
      return
    }

    if (!selectedPaymentMethod) {
      alert('Por favor, selecione a forma de pagamento!')
      return
    }

    const totalPrice = calculateAcaiPrice()
    const toppingsText = selectedAcaiToppings.length > 0 
      ? selectedAcaiToppings.join(', ')
      : 'Nenhum'

    const message = `Olá! Quero fazer um pedido 🍧

• Tamanho: ${selectedAcaiSize} ${isAcaiZero ? '(Linha Zero)' : '(Tradicional)'}
• Sabor: ${selectedAcaiFlavor}
• Adicionais: ${toppingsText}
• Forma de Pagamento: ${getPaymentMethodName(selectedPaymentMethod)}
• Total: R$ ${totalPrice.toFixed(2)}

Aguardo confirmação!`

    openWhatsApp(message)
  }

  const sendMilkshakeToWhatsApp = () => {
    if (!selectedMilkshakeSize || !selectedMilkshakeFlavor) {
      alert('Por favor, selecione o tamanho e sabor do milk shake!')
      return
    }

    if (!selectedPaymentMethod) {
      alert('Por favor, selecione a forma de pagamento!')
      return
    }

    const totalPrice = calculateMilkshakePrice()

    const message = `Olá! Quero fazer um pedido 🥤

• Tamanho: ${selectedMilkshakeSize}
• Sabor: ${selectedMilkshakeFlavor}
• Adicionais: Chantilly e cobertura do sabor
• Forma de Pagamento: ${getPaymentMethodName(selectedPaymentMethod)}
• Total: R$ ${totalPrice.toFixed(2)}

Aguardo confirmação!`

    openWhatsApp(message)
  }

  const sendToWhatsApp = (customMessage?: string) => {
    let message = customMessage

    if (!message) {
      message = `🍇 Olá! Quero fazer um pedido no O Canto do Açaí! 🍇

Por favor, me ajude a montar meu pedido:
• Tamanho:
• Sabor:
• Acompanhamentos:
• Endereço para entrega:

Obrigado!`
    }
    
    openWhatsApp(message)
  }

  const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-8 text-center">{title}</h2>
      {children}
    </section>
  )

  // Não renderizar até estar no cliente
  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100"></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-purple-50 to-yellow-100">
      {/* Notificação de Sucesso */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          ✅ Pedido sendo enviado para o WhatsApp…
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
            <nav className="hidden md:flex space-x-6">
              {['inicio', 'acai', 'milkshake', 'como-pedir', 'contato'].map((section) => (
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
                   section === 'como-pedir' ? 'Como Pedir' : 'Contato'}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-purple-700 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto">
            {['inicio', 'acai', 'milkshake', 'como-pedir', 'contato'].map((section) => (
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
                 section === 'como-pedir' ? 'Como Pedir' : 'Contato'}
              </button>
            ))}
          </div>
        </div>
      </div>

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
              <button
                onClick={() => sendToWhatsApp(`🍇 Olá! Quero fazer um pedido de açaí! 🍇

Por favor, me ajude a montar meu pedido:
• Tamanho:
• Sabor:
• Acompanhamentos:
• Endereço para entrega:

Obrigado!`)}
                className="bg-yellow-400 text-purple-800 px-8 py-4 rounded-full text-xl font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Fazer Pedido no WhatsApp
              </button>
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

        {/* Seção Açaí */}
        {activeSection === 'acai' && (
          <MenuSection title="Monte seu Açaí do Seu Jeito 💜">
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

            {/* Forma de Pagamento */}
            {(selectedAcaiSize && selectedAcaiFlavor) && (
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
                  💳 Forma de Pagamento
                  {selectedPaymentMethod && (
                    <span className="text-lg text-green-600 ml-2">
                      ✓ {getPaymentMethodName(selectedPaymentMethod)}
                    </span>
                  )}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedPaymentMethod === method.id
                            ? 'border-purple-600 bg-purple-100 text-purple-800 scale-105'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                          <IconComponent className="text-white" size={32} />
                        </div>
                        <h4 className="text-xl font-bold mb-2">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        {selectedPaymentMethod === method.id && (
                          <div className="mt-3">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mx-auto">
                              ✓
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resumo do Pedido */}
            {(selectedAcaiSize || selectedAcaiFlavor || selectedAcaiToppings.length > 0) && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold mb-4">Resumo do seu Açaí</h3>
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
                  {selectedPaymentMethod && (
                    <p>💳 Pagamento: {getPaymentMethodName(selectedPaymentMethod)}</p>
                  )}
                  {selectedAcaiSize && selectedAcaiFlavor && (
                    <div className="border-t border-purple-400 pt-4 mt-4">
                      <p className="text-xl font-bold">💰 Total: R$ {calculateAcaiPrice().toFixed(2)}</p>
                      <p className="text-sm">+ Taxa de entrega: R$ 3,00</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão de Pedido Açaí */}
            <div className="text-center">
              <button
                onClick={sendAcaiToWhatsApp}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="inline-block mr-2" size={24} />
                Fazer Pedido no WhatsApp
              </button>
            </div>
          </MenuSection>
        )}

        {/* Seção Milk Shake */}
        {activeSection === 'milkshake' && (
          <MenuSection title="Cardápio de Milk Shakes 🥤">
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

            {/* Forma de Pagamento para Milkshake */}
            {(selectedMilkshakeSize && selectedMilkshakeFlavor) && (
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
                  💳 Forma de Pagamento
                  {selectedPaymentMethod && (
                    <span className="text-lg text-green-600 ml-2">
                      ✓ {getPaymentMethodName(selectedPaymentMethod)}
                    </span>
                  )}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          selectedPaymentMethod === method.id
                            ? 'border-purple-600 bg-purple-100 text-purple-800 scale-105'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                          <IconComponent className="text-white" size={32} />
                        </div>
                        <h4 className="text-xl font-bold mb-2">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        {selectedPaymentMethod === method.id && (
                          <div className="mt-3">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mx-auto">
                              ✓
                            </div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resumo do Pedido Milk Shake */}
            {(selectedMilkshakeSize || selectedMilkshakeFlavor) && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-xl mb-8">
                <h3 className="text-2xl font-bold mb-4">Resumo do seu Milk Shake</h3>
                <div className="space-y-2">
                  {selectedMilkshakeSize && (
                    <p>📏 Tamanho: {selectedMilkshakeSize}</p>
                  )}
                  {selectedMilkshakeFlavor && (
                    <p>🥤 Sabor: {selectedMilkshakeFlavor}</p>
                  )}
                  <p>✨ Incluso: Chantilly e cobertura do sabor</p>
                  {selectedPaymentMethod && (
                    <p>💳 Pagamento: {getPaymentMethodName(selectedPaymentMethod)}</p>
                  )}
                  {selectedMilkshakeSize && selectedMilkshakeFlavor && (
                    <div className="border-t border-purple-400 pt-4 mt-4">
                      <p className="text-xl font-bold">💰 Total: R$ {calculateMilkshakePrice().toFixed(2)}</p>
                      <p className="text-sm">+ Taxa de entrega: R$ 3,00</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Botão de Pedido Milk Shake */}
            <div className="text-center">
              <button
                onClick={sendMilkshakeToWhatsApp}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="inline-block mr-2" size={24} />
                Fazer Pedido no WhatsApp
              </button>
            </div>
          </MenuSection>
        )}

        {/* Seção Como Pedir */}
        {activeSection === 'como-pedir' && (
          <MenuSection title="Como Pedir">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Escolha o pagamento</h3>
                  <p className="text-gray-600">PIX, cartão ou dinheiro</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Clique em "Fazer Pedido"</h3>
                  <p className="text-gray-600">Envie seu pedido diretamente</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">5</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Receba rapidinho em casa 💜</h3>
                  <p className="text-gray-600">Delivery rápido e seguro</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <button
                  onClick={() => sendToWhatsApp(`🍇 Olá! Quero fazer um pedido no O Canto do Açaí! 🍇

Por favor, me ajude a montar meu pedido:
• Tamanho:
• Sabor:
• Acompanhamentos:
• Endereço para entrega:

Obrigado!`)}
                  className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Phone className="inline-block mr-2" size={24} />
                  Fazer Pedido Agora
                </button>
              </div>
            </div>
          </MenuSection>
        )}

        {/* Seção Contato */}
        {activeSection === 'contato' && (
          <MenuSection title="Contato">
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
                  onClick={() => sendToWhatsApp(`🍇 Olá! Gostaria de entrar em contato com vocês! 🍇

Tenho uma dúvida sobre:

Obrigado!`)}
                  className="bg-yellow-400 text-purple-800 px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                >
                  <Phone className="inline-block mr-2" size={20} />
                  Chamar no WhatsApp
                </button>
              </div>
            </div>
          </MenuSection>
        )}
      </main>

      {/* Botão Flutuante WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => sendToWhatsApp(`🍇 Olá! Quero fazer um pedido no O Canto do Açaí! 🍇

Por favor, me ajude a montar meu pedido:
• Tamanho:
• Sabor:
• Acompanhamentos:
• Endereço para entrega:

Obrigado!`)}
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
              onClick={() => sendToWhatsApp("🍇 Olá! Quero fazer um pedido no O Canto do Açaí! 🍇")}
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