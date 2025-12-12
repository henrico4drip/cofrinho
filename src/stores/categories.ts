import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CategoryState {
    activeCategories: string[]
    toggleCategory: (category: string) => void
    isActive: (category: string) => boolean
}

const allCategories = [
    'food', 'transport', 'shopping', 'services', 'health',
    'entertainment', 'technology', 'subscriptions', 'education', 'other'
]

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            activeCategories: allCategories, // All active by default

            toggleCategory: (category: string) => {
                set((state) => {
                    const isCurrentlyActive = state.activeCategories.includes(category)
                    if (isCurrentlyActive) {
                        // Remove category
                        return {
                            activeCategories: state.activeCategories.filter(c => c !== category)
                        }
                    } else {
                        // Add category
                        return {
                            activeCategories: [...state.activeCategories, category]
                        }
                    }
                })
            },

            isActive: (category: string) => {
                return get().activeCategories.includes(category)
            }
        }),
        {
            name: 'category-storage'
        }
    )
)
