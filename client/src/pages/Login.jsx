import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setError('')
    try{
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/admin')
    }catch(err){
      setError(err.response?.data?.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 520, margin: '40px auto' }}>
        <h2 style={{ marginTop: 0 }}>Admin Login</h2>
        <p className="helper">Enter your admin email and password.</p>
        <form className="form" onSubmit={handleSubmit}>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
        <p className="helper" style={{ marginTop: 12 }}>No account? Seed one via server script <code className="mono">scripts/seedAdmin.js</code>.</p>
        <div style={{ marginTop: 10 }}>
          <Link className="btn" to="/">Back to Home</Link>
        </div>
      </section>
    </main>
  )
}
