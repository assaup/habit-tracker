import { create } from 'zustand'

interface AuthState {
    token: string | null
    user: { id: string; email: string } | null
    setAuth: (token: string, user: { id: string; email: string }) => void
    logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: null,
    setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({token, user})
    },
    logout: () => {
        localStorage.removeItem('token')
        set({token: null, user: null})
    }
}))

























