import { useState } from 'react'
import API from '../api'

export default function Verify(){
  const [serial, setSerial] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try{
      const res = await API.get(`/certificate/${serial}`)
      setResult(res.data)
    }catch(err){
      setError(err.response?.data?.message || 'Not found')
    }finally{ setLoading(false) }
  }

  return (
    <main className="container">
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Verify Certificate</h2>
        <p className="helper">Enter the serial number printed on your certificate.</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <input className="input" value={serial} onChange={e=>setSerial(e.target.value)} placeholder="e.g. SN20250001" required />
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </form>

        {error && <div className="alert error" style={{ marginTop: 12 }}>{error}</div>}

        {result && (
          <div className="section">
            <h3 style={{ marginTop: 0 }}>Certificate Details</h3>
            <div className="list">
              <div className="list-item"><span><b>Name</b></span><span>{result.studentName}</span></div>
              <div className="list-item"><span><b>Course</b></span><span>{result.course || '-'}</span></div>
              <div className="list-item"><span><b>Position</b></span><span>{result.position || '-'}</span></div>
              <div className="list-item"><span><b>Serial</b></span><span className="mono">{result.serialNumber}</span></div>
              <div className="list-item"><span><b>Issue Date</b></span><span>{result.issueDate ? new Date(result.issueDate).toDateString() : '-'}</span></div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
