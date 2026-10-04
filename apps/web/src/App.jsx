import { useEffect, useState } from 'react'
import {
  acceptRequest,
  getNearbyRequests,
  getRequestDetail,
} from './routeApi.js'

// รองรับ REQ-FN-002, REQ-FN-001, REQ-SEC-002 และ REQ-QA-002
function App() {
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  async function loadRequests(showLoading = true) {
    if (showLoading) {
      setLoading(true)
    }
    try {
      const nearby = await getNearbyRequests()
      setRequests(nearby)
      setError('')
    } catch {
      setError('ไม่สามารถโหลดรายการงานได้ในตอนนี้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    getNearbyRequests()
      .then((nearby) => {
        if (isMounted) {
          setRequests(nearby)
          setError('')
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('ไม่สามารถโหลดรายการงานได้ในตอนนี้')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function showDetails(requestId) {
    try {
      const detail = await getRequestDetail(requestId)
      setSelectedRequest(detail)
      setError('')
    } catch {
      setError('ไม่สามารถโหลดรายละเอียดงานได้ในตอนนี้')
    }
  }

  async function handleAccept(requestId) {
    setAccepting(true)
    try {
      await acceptRequest(requestId)
      await loadRequests()
      await showDetails(requestId)
    } catch {
      setError('ไม่สามารถรับงานได้ในตอนนี้ กรุณาลองใหม่')
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Saleng Route
            </p>
            <h1 className="mt-1 text-2xl font-bold">งานรับซื้อขยะรอบตัว</h1>
          </div>
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={loadRequests}
            disabled={loading}
          >
            {loading ? 'กำลังอัปเดต...' : 'อัปเดตรายการ'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-labelledby="nearby-heading">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                รายการตามเส้นทาง
              </p>
              <h2 id="nearby-heading" className="mt-1 text-xl font-bold">
                งานใกล้ที่สุด
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              ในรัศมี 5 กม. · {requests.length} งาน
            </span>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {loading && <p className="text-slate-600">กำลังโหลดรายการงาน...</p>}
          {!loading && requests.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
              ไม่พบงานในรัศมี 5 กม.
            </p>
          )}

          <div className="space-y-3">
            {requests.map((request) => (
              <article
                key={request.request_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-500">
                        {request.request_id}
                      </p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                        {request.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold">{request.scrap_type}</h3>
                    <p className="mt-1 text-sm text-slate-700">
                      ราคาประเมิน / ราคากลางอ้างอิง: {request.estimated_price}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {request.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">ระยะทาง</p>
                    <p className="text-xl font-bold">{request.distance_km} กม.</p>
                  </div>
                </div>
                <button
                  className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  onClick={() => showDetails(request.request_id)}
                >
                  ดูรายละเอียด
                </button>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="detail-heading">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
              รายละเอียดงาน
            </p>
            <h2 id="detail-heading" className="mt-1 text-xl font-bold">
              {selectedRequest ? selectedRequest.request_id : 'เลือกงานจากรายการ'}
            </h2>

            {!selectedRequest ? (
              <p className="mt-4 text-sm text-slate-600">
                เลือกงานเพื่อดูประเภทขยะ ราคา และข้อมูลที่เปิดเผยได้
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-500">ประเภทขยะ</p>
                  <p className="mt-1 font-semibold">{selectedRequest.scrap_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    ราคาประเมิน / ราคากลางอ้างอิง
                  </p>
                  <p className="mt-1 font-semibold">{selectedRequest.estimated_price}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">สถานะ</p>
                  <p className="mt-1 font-semibold">{selectedRequest.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ที่อยู่</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedRequest.address}
                  </p>
                  <p className="text-sm text-slate-700">
                    {selectedRequest.house_number}
                  </p>
                </div>
                {selectedRequest.status === 'รอผู้รับงาน' && (
                  <button
                    className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => handleAccept(selectedRequest.request_id)}
                    disabled={accepting}
                  >
                    {accepting ? 'กำลังรับงาน...' : 'รับงาน'}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
