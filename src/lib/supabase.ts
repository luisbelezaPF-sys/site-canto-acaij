import { createClient } from '@supabase/supabase-js'

// Configuração segura para Vercel - verifica se as variáveis existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Usando cliente mock.')
}

// Cria cliente SEMPRE - mesmo se as variáveis não estiverem definidas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

// Tipos para o banco de dados
export interface PedidoSupabase {
  id?: number
  produto: string
  quantidade: number
  valor: number
  nome_cliente: string | null
  email_cliente: string | null
  status: string
  endereco?: string
  rua?: string
  numero_casa?: string
  forma_pagamento?: string
  valor_pago?: number
  taxa_entrega?: number
  total?: number
  created_at?: string
  updated_at?: string
}

// Função para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Função SEGURA para inserir pedido
export const insertPedido = async (pedido: Omit<PedidoSupabase, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🚀 Tentando inserir pedido:', pedido)
  
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado. Pedido não será salvo.')
    throw new Error('Supabase não configurado. Configure as variáveis de ambiente.')
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
    
    if (error) {
      console.error('❌ Erro ao inserir pedido:', error)
      throw error
    }
    
    console.log('✅ Pedido inserido com sucesso:', data)
    return data
  } catch (error) {
    console.error('❌ Erro na função insertPedido:', error)
    throw error
  }
}

// Função para buscar todos os pedidos
export const fetchPedidos = async () => {
  console.log('📥 Buscando pedidos do Supabase...')
  
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado. Retornando array vazio.')
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error)
      throw error
    }
    
    console.log(`✅ ${data?.length || 0} pedidos encontrados`)
    return data || []
  } catch (error) {
    console.error('❌ Erro na função fetchPedidos:', error)
    return []
  }
}

// Função para atualizar status do pedido
export const updatePedidoStatus = async (id: number, status: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado')
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('❌ Erro ao atualizar status:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('❌ Erro na função updatePedidoStatus:', error)
    throw error
  }
}

// Função para escutar mudanças em tempo real
export const subscribeToChanges = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado. Subscription não será criada.')
    return null
  }
  
  try {
    return supabase
      .channel('pedidos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pedidos' 
        }, 
        callback
      )
      .subscribe()
  } catch (error) {
    console.error('❌ Erro ao configurar subscription:', error)
    return null
  }
}

// Função para testar conexão - MELHORADA
export const testConnection = async () => {
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase não configurado - variáveis de ambiente ausentes')
    return false
  }
  
  try {
    console.log('🔄 Testando conexão com Supabase...')
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('pedidos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    return true
  } catch (error: any) {
    console.error('❌ Erro ao testar conexão:', error.message)
    return false
  }
}