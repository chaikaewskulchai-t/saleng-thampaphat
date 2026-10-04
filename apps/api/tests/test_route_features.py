import time
from concurrent.futures import ThreadPoolExecutor

from fastapi.testclient import TestClient

from main import REQUESTS, app, haversine_km

client = TestClient(app)


def reset_requests() -> None:
    REQUESTS.clear()
    REQUESTS.update(
        {
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
            },
        }
    )


def test_AC_04_01_nearby_radius_filters():
    reset_requests()
    payload = client.get('/requests/nearby')

    assert payload.status_code == 200
    data = payload.json()
    assert len(data) >= 2
    assert all(item['distance_km'] <= 5 for item in data)


def test_AC_04_02_sort_by_distance():
    reset_requests()
    payload = client.get('/requests/nearby')

    data = payload.json()
    distances = [item['distance_km'] for item in data]
    assert distances == sorted(distances)


def test_AC_04_02_distance_and_order_use_requested_saleng_location():
    reset_requests()
    lat = 13.75
    lng = 100.49

    response = client.get('/requests/nearby', params={'lat': lat, 'lng': lng})

    assert response.status_code == 200
    results = response.json()
    expected_distances = {
        request_id: round(
            haversine_km(
                lat,
                lng,
                record['geo_point']['lat'],
                record['geo_point']['lng'],
            ),
            2,
        )
        for request_id, record in REQUESTS.items()
        if haversine_km(
            lat,
            lng,
            record['geo_point']['lat'],
            record['geo_point']['lng'],
        )
        <= 5
    }
    assert [item['distance_km'] for item in results] == sorted(
        expected_distances.values()
    )
    assert {
        item['request_id']: item['distance_km'] for item in results
    } == expected_distances


def test_AC_04_05_concurrent_accept_only_one():
    reset_requests()

    def accept_once(saleng_id: str):
        return client.post('/requests/REQ-104/accept', json={'saleng_id': saleng_id})

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(accept_once, ['SALENG-01', 'SALENG-02']))

    accepted = [result for result in results if result.status_code == 200]
    rejected = [result for result in results if result.status_code == 409]

    assert len(accepted) == 1
    assert len(rejected) == 1
    history = REQUESTS['REQ-104']['history']
    assert len(history) == 1
    assert history[0]['old_status'] == 'รอผู้รับงาน'
    assert history[0]['new_status'] == 'มีผู้รับงานแล้ว'
    assert history[0]['changed_by'] == accepted[0].json()['accepted_by']


def test_AC_04_06_distance_calculation_is_under_threshold():
    reset_requests()
    result = client.get('/requests/nearby')
    data = result.json()

    assert data[0]['distance_km'] < 5
    assert max(item['distance_km'] for item in data) <= 5


def test_AC_04_06_haversine_distance_error_is_within_fifteen_percent():
    known_equatorial_distance_km = 111.195
    calculated_distance_km = haversine_km(0, 0, 0, 1)

    assert (
        abs(calculated_distance_km - known_equatorial_distance_km)
        / known_equatorial_distance_km
        <= 0.15
    )


def test_AC_04_07_response_time_under_three_seconds():
    reset_requests()
    start = time.perf_counter()
    response = client.get('/requests/nearby')
    elapsed = time.perf_counter() - start

    assert response.status_code == 200
    assert elapsed < 3


def test_AC_04_08_address_hidden_before_accept():
    reset_requests()
    response = client.get('/requests/REQ-104')

    assert response.status_code == 200
    body = response.json()
    assert body['address'] == 'ซ่อนข้อมูลที่อยู่จนกว่ากดรับงาน'
    assert body['house_number'] == 'ซ่อนอยู่'


def test_AC_04_08_address_revealed_after_accept():
    reset_requests()

    accepted = client.post(
        '/requests/REQ-104/accept',
        json={'saleng_id': 'SALENG-01'},
    )
    detail = client.get('/requests/REQ-104')

    assert accepted.status_code == 200
    assert detail.status_code == 200
    body = detail.json()
    assert body['address'] == '14/5 หมู่ 3 ซอยสวนสาธิต'
    assert body['house_number'] == '14/5'
