import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useCategoryStore } from '@/stores/categories'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, User, Save, Palette, Eye, EyeOff } from 'lucide-react'
import CategoryIcon from '@/components/CategoryIcon'
import { getCategoryConfig } from '@/config/categoryConfig'

export default function Settings() {
    const navigate = useNavigate()
    const { user, checkUser } = useAuthStore()
    const { activeCategories, toggleCategory, isActive } = useCategoryStore()

    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        checkUser()
        if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name)
        }
    }, [checkUser, user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })

            if (updateError) throw updateError

            setSuccess('Nome atualizado com sucesso!')
            setTimeout(() => setSuccess(''), 3000)

            // Refresh user data
            await checkUser()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
        } finally {
            setLoading(false)
        }
    }

    const allCategories = [
        'food', 'transport', 'shopping', 'services', 'health',
        'entertainment', 'technology', 'subscriptions', 'education', 'other'
    ]

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-gray-600 mt-2">Gerencie seu perfil e preferências</p>
                </motion.div>

                {/* User Profile Section */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm p-6 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Perfil do Usuário</h2>
                            <p className="text-sm text-gray-600">Atualize suas informações pessoais</p>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                placeholder="Digite seu nome completo"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Save className="h-5 w-5" />
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </motion.div>

                {/* Categories Section */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                            <Palette className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Categorias</h2>
                            <p className="text-sm text-gray-600">Ative ou desative categorias para suas transações</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {allCategories.map((category) => {
                            const config = getCategoryConfig(category)
                            const active = isActive(category)
                            return (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={`flex flex-col items-center p-4 rounded-xl transition-all relative ${active
                                            ? 'bg-emerald-50 ring-2 ring-emerald-500'
                                            : 'bg-gray-100 opacity-50'
                                        }`}
                                >
                                    <div className="absolute top-2 right-2">
                                        {active ? (
                                            <Eye className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                    <CategoryIcon category={category} size="md" />
                                    <span className="text-sm font-medium text-gray-700 mt-2 text-center">
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Dica:</strong> As categorias inativas não aparecerão ao criar novas transações.
                            Você tem <strong>{activeCategories.length}</strong> categoria{activeCategories.length !== 1 ? 's' : ''} ativa{activeCategories.length !== 1 ? 's' : ''}.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
