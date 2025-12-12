export default function PiggyBankLogo({ className = "h-6 w-6" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Piggy Bank Body */}
            <ellipse cx="32" cy="36" rx="20" ry="16" fill="#FF9EBB" />
            <ellipse cx="32" cy="36" rx="18" ry="14" fill="#FFB4CC" />

            {/* Coin Slot */}
            <rect x="28" y="22" width="8" height="3" rx="1" fill="#E85A8A" />

            {/* Coin falling */}
            <circle cx="32" cy="16" r="4" fill="#FFD700" />
            <circle cx="32" cy="16" r="3" fill="#FFC700" />
            <text x="32" y="18" fontSize="4" fill="#DAA520" textAnchor="middle" fontWeight="bold">$</text>

            {/* Legs */}
            <rect x="20" y="48" width="4" height="8" rx="2" fill="#FF9EBB" />
            <rect x="40" y="48" width="4" height="8" rx="2" fill="#FF9EBB" />

            {/* Snout */}
            <ellipse cx="48" cy="36" rx="6" ry="5" fill="#FF9EBB" />
            <ellipse cx="48" cy="36" rx="4" ry="3" fill="#FFB4CC" />
            <circle cx="47" cy="35" r="1" fill="#E85A8A" />
            <circle cx="49" cy="37" r="1" fill="#E85A8A" />

            {/* Ear */}
            <ellipse cx="24" cy="26" rx="4" ry="6" fill="#FF9EBB" transform="rotate(-20 24 26)" />

            {/* Eye */}
            <circle cx="38" cy="32" r="2" fill="#333" />
            <circle cx="38.5" cy="31.5" r="0.8" fill="#FFF" />

            {/* Tail */}
            <path
                d="M 12 36 Q 8 36 6 34"
                stroke="#FF9EBB"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
            />

            {/* Smile */}
            <path
                d="M 44 38 Q 46 40 48 38"
                stroke="#E85A8A"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
            />
        </svg>
    )
}
