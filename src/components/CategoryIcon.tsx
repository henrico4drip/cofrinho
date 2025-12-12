import { getCategoryConfig } from '@/config/categoryConfig'

interface CategoryIconProps {
    category: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function CategoryIcon({ category, size = 'md', className = '' }: CategoryIconProps) {
    const config = getCategoryConfig(category)
    const Icon = config.icon

    const sizeClasses = {
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2.5'
    }

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    return (
        <div
            className={`rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: config.color }}
        >
            <Icon className={`${iconSizes[size]} text-white`} />
        </div>
    )
}
