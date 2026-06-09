import { useEffect, useState } from "react"
import { api } from "../api/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/authStore"
import axios from "axios"


const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const { setAuth, token } = useAuth()

    useEffect(() => {
        if (token) navigate('/')
    }, [token, navigate])

    const validateForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Заполните все поля')
            return
        }
        if (!email.includes('@')) {
            setError('Некорректный email')
            return
        }
        if (password.length < 8) {
            setError('Пароль минимум 8 символов')
            return
        }
        if (!isLogin && password !== confirmPassword) {
            setError('Пароли не совпадают')
            return
        }
        
        try {
            setIsLoading(true)
            setError('')
            const url = isLogin ? '/api/auth/login' : '/api/auth/register'
            const res = await api.post(url, {email, password})
            const { token, user } = res.data
            setAuth(token, user)
            navigate('/')

        } catch(err){
            if (axios.isAxiosError(err)){
                setError(err.response?.data?.message || 'Ошибка сервера')
            } else {
                setError('Неизвестная ошибка')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <h1>{isLogin ? 'Войти' : 'Зарегистрироваться'}</h1>
            <form onSubmit={validateForm}>
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </label>
                <label>
                    Пароль
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </label>
                {!isLogin && (
                    <label>
                        Повторите пароль
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                    </label>
                )}
                <button disabled={isLoading} type='submit'>
                    {isLoading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                </button>
                {error && <p>{error}</p>}
                <button type="button" onClick={() => {setIsLogin(!isLogin); setError('')}}>
                    {isLogin ? 'Впервые здесь? -> Зарегистрироваться' : 'Есть аккаунт? -> Войти'}
                </button>
            </form>

        </>
    )
}

export default LoginPage