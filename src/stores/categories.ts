import { create } from 'zustand'

interface CategoryState {
    activeCategories: string[]
    toggleCategory: (category: string) => void
    isActive: (category: string) => boolean
}

const allCategories = [
    'food', 'transport', 'shopping', 'services', 'health',
    'entertainment', 'technology', 'subscriptions', 'education', 'other'
]

export const useCategoryStore = create<CategoryState>((set, get) => ({
    activeCategories: allCategories, // All active by default

    toggleCategory: (category: string) => {
        set((state) => {
            const isCurrentlyActive = state.activeCategories.includes(category)
            if (isCurrentlyActive) {
                // Remove category
                const newCategories = state.activeCategories.filter(c => c !== category)
                // Save to localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('active-categories', JSON.stringify(newCategories))
                }
                return { activeCategories: newCategories }
            } else {
                // Add category
                const newCategories = [...state.activeCategories, category]
                // Save to localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('active-categories', JSON.stringify(newCategories))
                }
                return { activeCategories: newCategories }
            }
        })
    },

    isActive: (category: string) => {
        return get().activeCategories.includes(category)
    }
}))

// Load from localStorage on initialization
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('active-categories')
    if (stored) {
        try {
            const categories = JSON.parse(stored)
            useCategoryStore.setState({ activeCategories: categories })
        } catch (e) {
            console.error('Error loading categories from localStorage', e)
        }
    }
}
