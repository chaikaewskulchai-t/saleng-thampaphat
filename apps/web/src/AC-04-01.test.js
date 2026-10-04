import assert from 'node:assert/strict'
import test from 'node:test'

import { getNearbyRequests, getRequestDetail } from './routeApi.js'

test('test_AC_04_01_nearby_requests_are_within_five_kilometers', async () => {
  const requests = await getNearbyRequests()

  assert.ok(requests.length > 0)
  assert.ok(requests.every((request) => request.distance_km <= 5))
})

test('test_AC_04_03_address_is_hidden_before_accept', async () => {
  const detail = await getRequestDetail('REQ-104')

  assert.equal(detail.address, 'ซ่อนข้อมูลที่อยู่จนกว่ากดรับงาน')
  assert.equal(detail.house_number, 'ซ่อนอยู่')
})

test('test_AC_04_04_detail_shows_scrap_type_and_reference_price', async () => {
  const detail = await getRequestDetail('REQ-104')

  assert.equal(detail.scrap_type, 'กระป๋องอลูมิเนียม')
  assert.equal(detail.estimated_price, '฿430')
})

test('test_AC_04_07_nearby_requests_load_under_three_seconds', async () => {
  const startedAt = performance.now()
  const requests = await getNearbyRequests()
  const elapsedMs = performance.now() - startedAt

  assert.ok(requests.length > 0)
  assert.ok(elapsedMs < 3000, `Loading took ${elapsedMs}ms`)
})
