'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
    id: string
    message: string
    type: NotificationType
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9)
        setNotifications((prev) => [...prev, { id, message, type }])

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 4000)
    }, [])

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`
              pointer-events-auto transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-bottom-5 fade-in-0
              flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border-2 min-w-[300px] max-w-[400px]
              ${notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${notif.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${notif.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
              ${notif.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : ''}
            `}
                    >
                        <div className="flex-shrink-0 text-xl">
                            {notif.type === 'success' && '✅'}
                            {notif.type === 'error' && '❌'}
                            {notif.type === 'info' && 'ℹ️'}
                            {notif.type === 'warning' && '⚠️'}
                        </div>
                        <p className="text-[13px] font-semibold flex-1 leading-snug">{notif.message}</p>
                        <button
                            onClick={() => removeNotification(notif.id)}
                            className="text-current opacity-50 hover:opacity-100 transition-opacity ml-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}
