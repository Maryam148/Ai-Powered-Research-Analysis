'use client'

import { useState } from 'react'
import { useNotification } from '@/components/ui/notifications'

export default function DashboardSettings() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const { showNotification } = useNotification()

    return (
        <div className="p-6 lg:p-8 max-w-[700px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
            <p className="text-sm text-foreground/35 mb-8">Manage your account and preferences</p>

            {/* Profile */}
            <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm mb-6">
                <h3 className="font-bold text-foreground mb-5">Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[12px] font-semibold text-foreground/40 mb-1.5 block">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 rounded-xl border-2 border-foreground/8 bg-transparent text-sm text-foreground outline-none focus:border-[hsl(45,100%,50%)] transition-colors" />
                    </div>
                    <div>
                        <label className="text-[12px] font-semibold text-foreground/40 mb-1.5 block">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl border-2 border-foreground/8 bg-transparent text-sm text-foreground outline-none focus:border-[hsl(45,100%,50%)] transition-colors" />
                    </div>
                    <button
                        onClick={() => showNotification('Profile changes saved successfully.', 'success')}
                        className="px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm mb-6">
                <h3 className="font-bold text-foreground mb-5">Preferences</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Email notifications for new papers', key: 'notif' },
                        { label: 'Weekly research digest', key: 'digest' },
                        { label: 'Auto-save search results', key: 'autosave' },
                    ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between py-1">
                            <span className="text-sm text-foreground">{pref.label}</span>
                            <div
                                onClick={() => showNotification(`Preference "${pref.label}" updated.`, 'info')}
                                className="w-10 h-6 bg-foreground/10 rounded-full relative cursor-pointer hover:bg-foreground/15 transition-colors"
                            >
                                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm transition-all pointer-events-none"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border-2 border-red-100 p-6 shadow-sm">
                <h3 className="font-bold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-[12px] text-foreground/35 mb-4">Permanently delete your account and all associated data.</p>
                <button
                    onClick={() => showNotification('Account deletion requested. Please check your email.', 'error')}
                    className="px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
                >
                    Delete Account
                </button>
            </div>
        </div>
    )
}
