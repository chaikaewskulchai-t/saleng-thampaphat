import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/requests/nearby`)
        if (!response.ok) {
          throw new Error('Failed to load route requests')
        }
        const data = await response.json()
        setRequests(data)
        setError('')
      } catch (err) {
        setError('ไม่สามารถเชื่อมต่อกับ backend ได้ในตอนนี้')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleng_id: 'SALENG-01' }),
      })
      if (!response.ok) {
        throw new Error('accept failed')
      }
      const updated = await response.json()
      setRequests((current) =>
        current.map((item) =>
          item.request_id === updated.request_id
            ? {
                ...item,
                status: updated.status,
                address: updated.address,
                house_number: updated.house_number,
              }
            : item,
        ),
      )
    } catch (err) {
      setError('ไม่สามารถรับงานได้ในตอนนี้ กรุณาลองใหม่')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Saleng Route
            </p>
            <h1 className="mt-1 text-2xl font-bold">งานรับซื้อขยะรอบตัว</h1>
          </div>
          <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500">
            อัปเดตพิกัด
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">งานในรัศมี 5 กม.</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{requests.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ระยะทางเฉลี่ย</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {requests.length > 0 ? `${(requests.reduce((sum, item) => sum + item.distance_km, 0) / requests.length).toFixed(1)} กม.` : '0.0 กม.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">ความแม่นยำ GPS</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">96%</p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                รายการ
              </p>
              <h2 className="mt-1 text-xl font-bold">งานที่ใกล้ที่สุด</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              filter: 5km
            </span>
          </div>

          {loading && <p className="text-slate-500">กำลังโหลดรายการ...</p>}
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="space-y-3">
            {requests.map((request) => (
              <article
                key={request.request_id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-500">{request.request_id}</p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      {request.status}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{request.scrap_type}</h3>
                  <p className="text-sm text-slate-500">ราคากลางอ้างอิง: {request.estimated_price}</p>
                  <p className="mt-2 text-xs text-slate-500">{request.address}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">ระยะทาง</p>
                  <p className="text-xl font-bold text-slate-900">{request.distance_km} กม.</p>
                  <button
                    className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                    onClick={() => handleAccept(request.request_id)}
                    disabled={request.status !== 'รอผู้รับงาน'}
                  >
                    {request.status === 'รอผู้รับงาน' ? 'รับงาน' : 'ถูกรับแล้ว'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
