const salengLocation = { lat: 13.7567, lng: 100.5041 }

const requests = [
  {
    request_id: 'REQ-104',
    status: 'รอผู้รับงาน',
    scrap_type: 'กระป๋องอลูมิเนียม',
    estimated_price: '฿430',
    distance_km: 0,
    geo_point: { lat: 13.7563, lng: 100.5018 },
    address: '14/5 หมู่ 3 ซอยสวนสาธิต',
    house_number: '14/5',
  },
  {
    request_id: 'REQ-119',
    status: 'รอผู้รับงาน',
    scrap_type: 'แก้วพลาสติก',
    estimated_price: '฿620',
    distance_km: 0,
    geo_point: { lat: 13.7612, lng: 100.5102 },
    address: '75/8 หมู่ 7 ถนนสีกัน',
    house_number: '75/8',
  },
]

// รองรับ REQ-FN-002 และ AS-02 โดยจำลองสัญญา nearby API ภายในโดยไม่เรียก Maps API
function distanceKm(from, to) {
  const radiusKm = 6371
  const latitudeDelta = ((to.lat - from.lat) * Math.PI) / 180
  const longitudeDelta = ((to.lng - from.lng) * Math.PI) / 180
  const latitude1 = (from.lat * Math.PI) / 180
  const latitude2 = (to.lat * Math.PI) / 180
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDelta / 2) ** 2
  const boundedA = Math.min(1, Math.max(0, a))
  return radiusKm * 2 * Math.atan2(Math.sqrt(boundedA), Math.sqrt(1 - boundedA))
}

// รองรับ REQ-SEC-002 ด้วยการปกปิดข้อมูลบ้านก่อนรับงาน
function toPublicRequest(request) {
  const accepted = request.status === 'มีผู้รับงานแล้ว'
  return {
    request_id: request.request_id,
    status: request.status,
    scrap_type: request.scrap_type,
    estimated_price: request.estimated_price,
    distance_km: Number(
      distanceKm(salengLocation, request.geo_point).toFixed(2),
    ),
    address: accepted ? request.address : 'ซ่อนข้อมูลที่อยู่จนกว่ากดรับงาน',
    house_number: accepted ? request.house_number : 'ซ่อนอยู่',
  }
}

// รองรับ REQ-FN-002 ด้วยรายการเฉพาะในรัศมี 5 กม. และเรียงใกล้ไปไกล
export async function getNearbyRequests() {
  return requests
    .map(toPublicRequest)
    .filter((request) => request.distance_km <= 5)
    .sort((first, second) => first.distance_km - second.distance_km)
}

// รองรับ REQ-FN-001 และ REQ-SEC-002 สำหรับรายละเอียดงานตามสิทธิ์การเปิดเผย
export async function getRequestDetail(requestId) {
  const request = requests.find((item) => item.request_id === requestId)
  if (!request) {
    throw new Error('Request not found')
  }
  return toPublicRequest(request)
}

// รองรับ REQ-BR-002 และ REQ-SEC-002 ใน mock API สำหรับการรับงานจากหน้า UI
export async function acceptRequest(requestId) {
  const request = requests.find((item) => item.request_id === requestId)
  if (!request) {
    throw new Error('Request not found')
  }
  if (request.status !== 'รอผู้รับงาน') {
    throw new Error('Request already accepted')
  }
  request.status = 'มีผู้รับงานแล้ว'
  return toPublicRequest(request)
}
