import { createClient } from '@supabase/supabase-js'

// Configuração com as credenciais fornecidas pelo usuário
const supabaseUrl = 'https://vbusdqtkxltoihamurfv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidXNkcXRreGx0b2loYW11cmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc1NzYsImV4cCI6MjA3NjYzMzU3Nn0.dlvKnBW--S_T8_Julud6jwIKIpuHdKKXUhG1kHTOOgI'

// Cria cliente Supabase com as credenciais reais
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

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
  return true // Sempre configurado agora
}

// Função SEGURA para inserir pedido
export const insertPedido = async (pedido: Omit<PedidoSupabase, 'id' | 'created_at' | 'updated_at'>) => {
  console.log('🚀 Tentando inserir pedido:', pedido)
  
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
    return data || []
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