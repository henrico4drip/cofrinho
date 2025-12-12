import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import CategoryIcon from './CategoryIcon'

export interface PieSegment {
    category: string
    value: number
    percentage: number
    color: string
    startAngle: number
    endAngle: number
}

interface AnimatedPieChartProps {
    segments: PieSegment[]
    total: number
    onViewTransactions?: () => void
    className?: string
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export default function AnimatedPieChart({
    segments,
    total,
    onViewTransactions,
    className = ''
}: AnimatedPieChartProps) {
    const [animationProgress, setAnimationProgress] = useState(0)
    const size = 320
    const strokeWidth = 40
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const centerX = size / 2
    const centerY = size / 2

    useEffect(() => {
        const duration = 1500
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setAnimationProgress(eased)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [segments])

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            {/* Pie chart */}
            <svg width={size} height={size} className="absolute inset-0 transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke="#ffffff20"
                    strokeWidth={strokeWidth}
                />

                {/* Animated segments */}
                {segments.map((segment, index) => {
                    const segmentLength = (segment.percentage / 100) * circumference
                    const offset = segments
                        .slice(0, index)
                        .reduce((acc, s) => acc + (s.percentage / 100) * circumference, 0)

                    const animatedLength = segmentLength * animationProgress

                    return (
                        <motion.circle
                            key={segment.category}
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${animatedLength} ${circumference}`}
                            strokeDashoffset={-offset * animationProgress}
                            strokeLinecap="round"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        />
                    )
                })}
            </svg>

            {/* Category icons positioned ON the chart edge */}
            {segments.map((segment, index) => {
                const midAngle = segment.startAngle + (segment.endAngle - segment.startAngle) / 2
                const radian = (midAngle - 90) * (Math.PI / 180)

                // Position icon ON the outer edge of the chart
                const iconRadius = radius + strokeWidth / 2
                const iconX = centerX + Math.cos(radian) * iconRadius
                const iconY = centerY + Math.sin(radian) * iconRadius

                return (
                    <motion.div
                        key={`icon-${segment.category}`}
                        className="absolute"
                        style={{
                            left: iconX - 20,
                            top: iconY - 20,
                            zIndex: 10,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: animationProgress,
                            opacity: animationProgress
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.4 + index * 0.08,
                            type: 'spring',
                            stiffness: 200
                        }}
                    >
                        <CategoryIcon category={segment.category} size="md" />
                    </motion.div>
                )
            })}

            {/* Center content */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <div className="text-center text-white pointer-events-auto">
                    <div className="text-sm opacity-80 mb-1">Gasto total</div>
                    <div className="text-3xl font-bold mb-3">
                        {formatCurrency(total * animationProgress)}
                    </div>
                    {onViewTransactions && (
                        <button
                            onClick={onViewTransactions}
                            className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm hover:bg-gray-700 transition-colors"
                        >
                            Ver transações
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
