import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Admin(){
  const [serial, setSerial] = useState('')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [position, setPosition] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  useEffect(()=>{
    // Redirect to login if no token
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    // Optional: validate token
    API.get('/auth/me').then(()=>fetchList()).catch(()=>{
      localStorage.removeItem('token');
      navigate('/login')
    })
  }, [])

  async function fetchList(){
    try{
      const res = await API.get('/admin/certificates')
      setList(res.data)
    }catch(err){ console.error(err) }
  }

  async function handleCreate(e){
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('')
    try{
      await API.post('/admin/certificate', { serialNumber: serial, studentName: name, course, position, issueDate })
      setSuccess('Certificate created and QR generated.')
      setSerial(''); setName(''); setCourse(''); setPosition(''); setIssueDate('')
      fetchList()
    }catch(err){ setError(err.response?.data?.message || 'Error creating certificate') }
    finally { setLoading(false) }
  }

  async function handleGenerateSerial(){
    try{
      // Add timestamp to prevent caching
      const timestamp = Date.now()
      const res = await API.get(`/admin/next-serial?t=${timestamp}`)
      let s = res.data?.serial || ''
      if (s) setSerial(s)
    }catch(err){
      setError(err.response?.data?.message || 'Unable to generate serial')
    }
  }

  function handleLogout(){
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <main className="container">
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Admin Panel</h2>
        <p className="helper">Authenticated with JWT. Use the Login page to obtain a session token.</p>
        <div style={{ marginBottom: 12 }}>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>

        <form className="form" onSubmit={handleCreate}>
          <div className="row">
            <input className="input" value={serial} readOnly placeholder="Serial Number (auto-generated)" required />
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Student Name" required />
              <button type="button" className="btn" onClick={handleGenerateSerial}>Generate Serial</button>
            </div>
          </div>
          <div className="row">
            <input className="input" value={course} onChange={e=>setCourse(e.target.value)} placeholder="Course" />
            <input className="input" value={position} onChange={e=>setPosition(e.target.value)} placeholder="Position" />
          </div>
          <div className="row">
            <input className="input" value={issueDate} onChange={e=>setIssueDate(e.target.value)} type="date" />
            <button className="btn success" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create & Generate QR'}
            </button>
          </div>
        </form>

        {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}
        {success && <div className="alert info" style={{ marginTop: 12 }}>{success}</div>}
      </section>
      <section className="section">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Existing Certificates</h3>
          {list.length === 0 && <p className="helper">No certificates yet.</p>}
          <ul className="list">
            {list.map((c, index) => (
              <li className="list-item" key={c.serialNumber} style={{ alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ 
                      background: '#007bff', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>
                      {index + 1}
                    </span>
                    {c.qrUrl ? (
                      <img src={c.qrUrl} alt={`QR ${c.serialNumber}`} style={{ width: 120, height: 120, objectFit: 'contain', border: '1px solid #eee', borderRadius: 6, background: '#fff' }} />
                    ) : (
                      <div style={{ width: 120, height: 120, display: 'grid', placeItems: 'center', border: '1px dashed #ccc', borderRadius: 6, color: '#888', background: '#fafafa' }}>No QR</div>
                    )}
                  </div>
                  <div className="mono" style={{ fontWeight: 600 }}>{c.serialNumber}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
