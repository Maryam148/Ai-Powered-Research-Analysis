export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            {/* Puzzle piece shape — Didasko-style */}
            <path
                d="M8 12C8 9.79 9.79 8 12 8H16C16 5.79 17.79 4 20 4S24 5.79 24 8H28C30.21 8 32 9.79 32 12V16C34.21 16 36 17.79 36 20S34.21 24 32 24V28C32 30.21 30.21 32 28 32H24C24 34.21 22.21 36 20 36S16 34.21 16 32H12C9.79 32 8 30.21 8 28V24C5.79 24 4 22.21 4 20S5.79 16 8 16V12Z"
                fill="hsl(45, 100%, 60%)"
                stroke="hsl(35, 80%, 40%)"
                strokeWidth="1.5"
            />
            {/* Inner shadow/highlight for depth */}
            <path
                d="M10 13C10 11.34 11.34 10 13 10H16.5C16.5 8.07 18.07 6.5 20 6.5S23.5 8.07 23.5 10H27C28.66 10 30 11.34 30 13V16.5C31.93 16.5 33.5 18.07 33.5 20S31.93 23.5 30 23.5V27C30 28.66 28.66 30 27 30H23.5C23.5 31.93 22.21 33.5 20 33.5S16.5 31.93 16.5 30H13C11.34 30 10 28.66 10 27V23.5C8.07 23.5 6.5 21.93 6.5 20S8.07 16.5 10 16.5V13Z"
                fill="hsl(45, 100%, 68%)"
                opacity="0.5"
            />
        </svg>
    )
}
