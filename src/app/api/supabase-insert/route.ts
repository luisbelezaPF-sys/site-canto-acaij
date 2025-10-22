import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const pedido = await request.json()
    console.log('🚀 API Route: Inserindo pedido via servidor:', pedido)
    
    // Configuração direta do Supabase
    const supabaseUrl = 'https://vbusdqtkxltoihamurfv.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidXNkcXRreGx0b2loYW11cmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTc1NzYsImV4cCI6MjA3NjYzMzU3Nn0.dlvKnBW--S_T8_Julud6jwIKIpuHdKKXUhG1kHTOOgI'
    
    // Fazer requisição direta para o Supabase via servidor
    const response = await fetch(`${supabaseUrl}/rest/v1/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(pedido)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API do Supabase:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro HTTP: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Pedido inserido com sucesso via API Route:', data)
    
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ Erro na API Route:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}