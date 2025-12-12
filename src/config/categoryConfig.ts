import {
    UtensilsCrossed,
    Car,
    ShoppingBag,
    Home,
    Heart,
    Gamepad2,
    Plane,
    GraduationCap,
    Smartphone,
    Wrench,
    Newspaper,
    type LucideIcon
} from 'lucide-react'

export interface CategoryConfig {
    icon: LucideIcon
    color: string
    label: string
    gradient?: string
}

export const categoryConfig: Record<string, CategoryConfig> = {
    food: {
        icon: UtensilsCrossed,
        color: '#10b981',
        label: 'Alimentação',
        gradient: 'from-emerald-400 to-emerald-600'
    },
    transport: {
        icon: Car,
        color: '#f59e0b',
        label: 'Transporte',
        gradient: 'from-amber-400 to-amber-600'
    },
    shopping: {
        icon: ShoppingBag,
        color: '#ec4899',
        label: 'Compras',
        gradient: 'from-pink-400 to-pink-600'
    },
    services: {
        icon: Wrench,
        color: '#8b5cf6',
        label: 'Serviços',
        gradient: 'from-violet-400 to-violet-600'
    },
    home: {
        icon: Home,
        color: '#8b5cf6',
        label: 'Casa',
        gradient: 'from-violet-400 to-violet-600'
    },
    health: {
        icon: Heart,
        color: '#ef4444',
        label: 'Saúde',
        gradient: 'from-red-400 to-red-600'
    },
    entertainment: {
        icon: Gamepad2,
        color: '#06b6d4',
        label: 'Entretenimento',
        gradient: 'from-cyan-400 to-cyan-600'
    },
    travel: {
        icon: Plane,
        color: '#3b82f6',
        label: 'Viagens',
        gradient: 'from-blue-400 to-blue-600'
    },
    education: {
        icon: GraduationCap,
        color: '#14b8a6',
        label: 'Educação',
        gradient: 'from-teal-400 to-teal-600'
    },
    technology: {
        icon: Smartphone,
        color: '#6366f1',
        label: 'Tecnologia',
        gradient: 'from-indigo-400 to-indigo-600'
    },
    subscriptions: {
        icon: Newspaper,
        color: '#f43f5e',
        label: 'Assinaturas',
        gradient: 'from-rose-400 to-rose-600'
    },
    other: {
        icon: ShoppingBag,
        color: '#64748b',
        label: 'Outros',
        gradient: 'from-slate-400 to-slate-600'
    }
}

export function getCategoryConfig(category: string): CategoryConfig {
    return categoryConfig[category] || categoryConfig.other
}
