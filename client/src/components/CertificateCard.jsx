export default function CertificateCard({ cert }){
  return (
    <div className="card">
      <p><b>{cert.studentName}</b></p>
      <p className="helper">{cert.course || '-'} • {cert.position || '-'}</p>
      <p>Serial: <span className="mono">{cert.serialNumber}</span></p>
    </div>
  )
}
