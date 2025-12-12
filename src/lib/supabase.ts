import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        env: import.meta.env
    })
    // Show error on page instead of white screen
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = 'padding: 20px; background: #fee; color: #c00; margin: 20px; border-radius: 8px;'
    errorDiv.innerHTML = `
    <h2>Erro de Configuração</h2>
    <p>As variáveis de ambiente do Supabase não foram configuradas.</p>
    <p>VITE_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}</p>
    <p>VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}</p>
  `
    document.body.appendChild(errorDiv)
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')