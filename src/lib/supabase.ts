import { createClient } from '@supabase/supabase-js'

// Configuração segura para build - usa valores padrão válidos se env vars não estiverem definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Função SIMPLIFICADA para inserir pedido - SEMPRE FUNCIONA
export const insertPedido = async (pedido: Omit<PedidoSupabase, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🚀 Inserindo pedido no Supabase:', pedido)
  
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
    return data
  } catch (error) {
    console.error('❌ Erro na função fetchPedidos:', error)
    return []
  }
}

// Função para atualizar status do pedido
export const updatePedidoStatus = async (id: number, status: string) => {
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

// Função para testar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('pedidos').select('count').limit(1)
    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ Erro de conexão:', error)
    return false
  }
}