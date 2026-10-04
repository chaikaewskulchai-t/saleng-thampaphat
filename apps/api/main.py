from __future__ import annotations

import math
import threading
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, create_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = 'postgresql+psycopg2://saleng:saleng@localhost:5432/saleng_route'
app = FastAPI(title='Saleng Route API', version='0.1.0')


class Base(DeclarativeBase):
    pass


class ScrapRequestModel(Base):
    __tablename__ = 'scrap_requests'

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(64), unique=True, nullable=False)
    seller_id = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False)
    scrap_type = Column(String(128), nullable=False)
    estimated_price = Column(String(32), nullable=False)
    geo_point = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_by = Column(String(64), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)


class SalengLocationModel(Base):
    __tablename__ = 'saleng_locations'

    id = Column(Integer, primary_key=True, index=True)
    saleng_id = Column(String(64), nullable=False)
    lat = Column(Float, nullable=False)
    long = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    source = Column(String(32), default='gps')


class SellerProfileModel(Base):
    __tablename__ = 'seller_profiles'

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(String(64), unique=True, nullable=False)
    phone = Column(String(32), nullable=False)
    address = Column(String(255), nullable=False)
    house_number = Column(String(64), nullable=False)
    verified_id = Column(String(64), nullable=True)


class RequestStatusHistoryModel(Base):
    __tablename__ = 'request_status_history'

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(64), nullable=False)
    old_status = Column(String(32), nullable=False)
    new_status = Column(String(32), nullable=False)
    changed_by = Column(String(64), nullable=True)
    changed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


REQUESTS: dict[str, dict[str, Any]] = {
    'REQ-104': {
        'request_id': 'REQ-104',
        'seller_id': 'SELLER-001',
        'status': 'รอผู้รับงาน',
        'scrap_type': 'กระป๋องอลูมิเนียม',
        'estimated_price': '฿430',
        'geo_point': {'lat': 13.7563, 'lng': 100.5018},
        'address': '14/5 หมู่ 3 ซอยสวนสาธิต',
        'house_number': '14/5',
        'accepted_by': None,
        'accepted_at': None,
    },
    'REQ-119': {
        'request_id': 'REQ-119',
        'seller_id': 'SELLER-002',
        'status': 'รอผู้รับงาน',
        'scrap_type': 'แก้วพลาสติก',
        'estimated_price': '฿620',
        'geo_point': {'lat': 13.7612, 'lng': 100.5102},
        'address': '75/8 หมู่ 7 ถนนสีกัน',
        'house_number': '75/8',
        'accepted_by': None,
        'accepted_at': None,
    },
    'REQ-154': {
        'request_id': 'REQ-154',
        'seller_id': 'SELLER-003',
        'status': 'มีผู้รับงานแล้ว',
        'scrap_type': 'โลหะหนัก',
        'estimated_price': '฿1,250',
        'geo_point': {'lat': 13.7651, 'lng': 100.5205},
        'address': '20/1 ถนนสายเก่า',
        'house_number': '20/1',
        'accepted_by': 'SALENG-01',
        'accepted_at': datetime.now(timezone.utc),
    },
}

SALENG_LOCATION = {'lat': 13.7567, 'lng': 100.5041}
ACCEPT_LOCK = threading.Lock()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """รองรับ REQ-OP-002: คำนวณระยะทางจริงแบบ Haversine สำหรับ radius 5 กม."""
    radius = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius * c


def sanitize_request(record: dict[str, Any]) -> dict[str, Any]:
    public = {
        'request_id': record['request_id'],
        'scrap_type': record['scrap_type'],
        'estimated_price': record['estimated_price'],
        'status': record['status'],
        'distance_km': round(
            haversine_km(
                SALENG_LOCATION['lat'],
                SALENG_LOCATION['lng'],
                record['geo_point']['lat'],
                record['geo_point']['lng'],
            ),
            2,
        ),
    }
    if record['status'] == 'มีผู้รับงานแล้ว':
        public['address'] = record['address']
        public['house_number'] = record['house_number']
    else:
        public['address'] = 'ซ่อนข้อมูลที่อยู่จนกว่ากดรับงาน'
        public['house_number'] = 'ซ่อนอยู่'
    return public


class NearbyRequest(BaseModel):
    request_id: str = Field(..., description='รหัสคำขอรับซื้อขยะ')
    scrap_type: str = Field(..., description='ประเภทของขยะ')
    estimated_price: str = Field(..., description='ราคากลางอ้างอิง')
    distance_km: float = Field(..., description='ระยะทางจากซาเล้งไปยังผู้ขาย')
    status: str = Field(..., description='สถานะคำขอ')
    address: str = Field(..., description='ที่อยู่จะซ่อนก่อนกดรับงาน')
    house_number: str = Field(..., description='เลขที่บ้านถูกซ่อนก่อนรับงาน')


class AcceptRequestPayload(BaseModel):
    saleng_id: str = Field(..., min_length=1, description='รหัสซาเล้งที่รับงาน')


@app.get('/health')
def health() -> dict[str, str]:
    """รองรับ REQ-FN-002 / REQ-CON-002: health check สำหรับ service route"""
    return {'status': 'ok'}


@app.get('/requests/nearby', response_model=list[NearbyRequest])
def get_nearby_requests(
    lat: float = Query(default=13.7567, description='latitude ของซาเล้ง'),
    lng: float = Query(default=100.5041, description='longitude ของซาเล้ง'),
) -> list[NearbyRequest]:
    """รองรับ REQ-FN-002: ส่งรายการงานในรัศมี 5 กม. ตามพิกัด GPS ของซาเล้ง"""
    nearby: list[NearbyRequest] = []
    for record in REQUESTS.values():
        dist = haversine_km(lat, lng, record['geo_point']['lat'], record['geo_point']['lng'])
        if dist <= 5:
            public_record = sanitize_request(record)
            nearby.append(
                NearbyRequest(
                    request_id=record['request_id'],
                    scrap_type=record['scrap_type'],
                    estimated_price=record['estimated_price'],
                    distance_km=public_record['distance_km'],
                    status=record['status'],
                    address=public_record['address'],
                    house_number=public_record['house_number'],
                )
            )
    nearby.sort(key=lambda item: item.distance_km)
    return nearby


@app.get('/requests/{request_id}', response_model=NearbyRequest)
def get_request_detail(request_id: str) -> NearbyRequest:
    """รองรับ REQ-FN-001: ส่งรายละเอียดงานและราคากลาง ให้ด้วยเงื่อนไขที่เปิดเผยได้"""
    record = REQUESTS.get(request_id)
    if record is None:
        raise HTTPException(status_code=404, detail='not found')
    public = sanitize_request(record)
    return NearbyRequest(
        request_id=record['request_id'],
        scrap_type=record['scrap_type'],
        estimated_price=record['estimated_price'],
        distance_km=public['distance_km'],
        status=record['status'],
        address=public['address'],
        house_number=public['house_number'],
    )


@app.post('/requests/{request_id}/accept')
def accept_request(request_id: str, payload: AcceptRequestPayload) -> dict[str, Any]:
    """รองรับ REQ-BR-002: ป้องกัน concurrent accept ด้วยการล็อกและใช้ first-come rule"""
    with ACCEPT_LOCK:
        record = REQUESTS.get(request_id)
        if record is None:
            raise HTTPException(status_code=404, detail='request not found')
        if record['status'] != 'รอผู้รับงาน':
            raise HTTPException(status_code=409, detail='request already accepted by another saleng')

        old_status = record['status']
        record['status'] = 'มีผู้รับงานแล้ว'
        record['accepted_by'] = payload.saleng_id
        record['accepted_at'] = datetime.now(timezone.utc)

        # REQ-BR-002: preserve a status change history to support first-come auditability.
        request_history = {
            'request_id': request_id,
            'old_status': old_status,
            'new_status': record['status'],
            'changed_by': payload.saleng_id,
            'changed_at': record['accepted_at'],
        }
        if request_history['request_id'] in REQUESTS:
            REQUESTS[request_id]['history'] = request_history

        return {
            'request_id': record['request_id'],
            'status': record['status'],
            'accepted_by': record['accepted_by'],
            'address': record['address'],
            'house_number': record['house_number'],
        }


try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=engine)
except Exception:
    engine = None
