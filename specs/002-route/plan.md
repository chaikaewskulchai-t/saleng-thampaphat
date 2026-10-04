# แผนงาน FEATURE ROUTE

## 1. สรุปแนวทาง
- ฟีเจอร์นี้ทำหน้าที่ให้ซาเล้งเห็นงานรับซื้อขยะที่อยู่ภายในรัศมี 5 กม. เพื่อวางแผนเดินทางไปรับซื้อขยะได้โดยไม่ต้องวิ่งเปล่าและลดความซ้ำซ้อนในการรับงาน
- ผู้ใช้หลักคือซาเล้ง (ผู้รับซื้อของเก่า/คนขับ) และผู้ขายของเก่าที่โพสต์รายการขยะรอรับซื้อ
- แนวทางหลักคือแยกเป็น 4 ส่วนสำคัญ: กรองงานตามระยะทางและพิกัด GPS, ป้องกันการรับงานซ้ำแบบ concurrent accept, ซ่อนข้อมูล PII ก่อนยืนยันรับงาน, และแสดงผลรายงาน/รายละเอียดบน UI และ API ให้สอดคล้องกับ acceptance criteria
- งานจะยึดตาม spec.md โดยเฉพาะ REQ-FN-002, REQ-FN-001, REQ-BR-002, REQ-OP-002, REQ-QA-002, REQ-SEC-002 และ constraint ของ Maps API / น้ำหนักบรรทุกของยานพาหนะ
- กรอบงานนี้ยังคงเปิดให้ทีมเลือกเทคโนโลยีเบื้องต้นก่อนเริ่ม implementation เพราะ spec ไม่ได้ระบุภาษา/framework/ฐานข้อมูลอย่างชัดเจน

## 2. เทคโนโลยีที่ใช้
| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| Frontend: React + Vite + Tailwind CSS | AS-06 | ทีมเลือกเอง ไม่ได้มาจาก spec แต่เป็นการตัดสินใจของทีมเพื่อให้หน้า route ทำงานเร็วและใช้ UI component ที่สั้นและสามารถทดสอบได้ง่าย |
| Backend: FastAPI (Python) | AS-06 | ใช้สำหรับ API /requests/nearby, /requests/{id}/accept และการเชื่อมต่อกับ GPS/Maps API / verification service |
| Database: PostgreSQL | AS-06 | ใช้เก็บ ScrapRequest, SalengLocation, RequestStatusHistory และข้อมูลผู้ใช้งาน/PII ที่ต้องเก็บแบบมีโครงสร้างและรองรับ transaction |
| โครงสร้างโปรเจกต์เริ่มต้น: apps/web + apps/api + db | AS-06 | Repo ปัจจุบันยังไม่มี source code จึงคาดว่าจะเริ่มจาก monorepo ที่มี apps/web, apps/api และ docker-compose/postgres-init สำหรับ database |
| โมเดลข้อมูลสำหรับงานรับซื้อขยะและพิกัด GPS | REQ-FN-002, REQ-BR-002, REQ-SEC-002 | ใช้ field แยกชัดเจนระหว่าง public data กับ sensitive data ป้องกันการเปิดเผยบ้านเลขที่/พิกัดละเอียดก่อนรับงาน |
| Maps/GPS API และระบบภายนอกยืนยันตัวตน Thai-ID/DBD-ID | REQ-CON-002, SC-04 | ใช้ร่วมกับ timeout/fallback strategy เพื่อไม่ให้ service หลุดหรือล้มยกเว้นการแสดงงาน |
| การคำนวณรัศมีและลำดับงาน | AS-02, REQ-FN-002 | ใช้จุดอ้างอิงตำแหน่งซาเล้งและกรองงานที่อยู่ในรัศมี <= 5 กม. โดยยังคงจัดเรียงตามความใกล้เคียงก่อน |

## 3. โมเดลข้อมูล
| Entity | ฟิลด์หลัก | รองรับ FR/AC |
|---|---|---|
| ScrapRequest | id, sellerId, status, geoPoint, scrapType, estimatedPrice, createdAt, acceptedBy, acceptedAt | REQ-FN-002, REQ-FN-001, REQ-BR-002, AC-04-01, AC-04-04, AC-04-05 |
| SalengLocation | salengId, lat, long, timestamp, source | REQ-FN-002, REQ-OP-002, AC-04-06 |
| SellerProfile / Customer | id, phone, address, verifiedId | REQ-SEC-002, SC-04, AC-04-08 |
| RequestStatusHistory | requestId, oldStatus, newStatus, changedBy, changedAt | REQ-BR-002, AC-04-05 |
| DriverRoutePreference | salengId, maxRadiusKm, routeMode | REQ-FN-002, AC-04-02 |

- ข้อมูลที่เป็น PII เช่น phone, address, house number จะถูกแยกออกจาก field ที่เปิดเผยต่อซาเล้งก่อนยืนยันรับงาน
- สถานะงานใช้ตาม glossary: “รอผู้รับงาน”, “มีผู้รับงานแล้ว”, “เสร็จสิ้น”
- ต้องมีการแยกข้อมูลระหว่าง public location (แบบสรุป/คร่าว) กับ exact location (แบบละเอียด) เพื่อให้ REQ-SEC-002 ได้รับการคุ้มครอง

## 4. API / หน้าจอ
| รายการ | รูปแบบ | รองรับ FR/AC |
|---|---|---|
| GET /requests/nearby | ดึงรายการงานที่อยู่ภายในรัศมี 5 กม. ตามพิกัดซาเล้งและตัวกรองสถานะงาน | REQ-FN-002, AC-04-01, AC-04-02 |
| GET /requests/{id} | ดึงรายละเอียดงานหลังเลือกจากรายการ พร้อมแสดงประเภทขยะและราคากลาง | REQ-FN-001, AC-04-04 |
| POST /requests/{id}/accept | รับงานแบบ atomic lock เพื่อป้องกัน concurrent accept | REQ-BR-002, AC-04-05 |
| GET /saleng/location | ส่งพิกัด GPS ล่าสุดของซาเล้งไปใช้ในการคำนวณและกรองข้อมูล | REQ-OP-002, AC-04-06 |
| GET /requests/nearby?radiusKm=5 | query กลางสำหรับทดลองกรองและเรียงลำดับตามความใกล้เคียง | REQ-FN-002, AS-02 |
| UI: หน้าแสดงรายการตามเส้นทาง | แสดงงานเรียงตามความใกล้เคียงและซ่อนพิกัดละเอียดจนกกดรับงาน | REQ-FN-002, REQ-SEC-002, AC-04-03, AC-04-08 |
| UI: หน้ารายละเอียดงาน | แสดงประเภทขยะ, ราคากลาง, ประเมิน, และข้อมูลที่เปิดเผยหลังยืนยันรับงาน | REQ-FN-001, SC-04 |

## 5. ตารางตรวจ Constraints
| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| REQ-CON-002 | ใช้ในความคิดเรื่อง quota/rate limit ของ Maps API และ fallback เมื่อ timeout หรือ API ไม่ตอบ | ใช้แล้ว |
| REQ-CON-003 | ใช้เพื่อคัดกรองงานหรือแสดงงานที่ไม่ควรส่งให้ซาเล้งเมื่อยานพาหนะเกินน้ำหนักบรรทุกที่กำหนด | ใช้แล้ว |

- ถ้าทีมมีการเลือก stack ที่ใช้ฐานข้อมูลหรือ API framework เพิ่มเติม จะต้องทำให้เป็นความชัดเจนต่อทีมก่อนเริ่ม implementation
- ข้อจำกัดเรื่องภาษา/ framework/ ฐานข้อมูลไม่ได้ระบุใน spec จึงยังไม่ตัดสินใจแบบท้ายสุด

## 6. แผนทดสอบจาก Acceptance Criteria
| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-04-01 | test_AC_04_01 | ตรวจว่าเมื่อซาเล้งเปิดหน้า route จะเห็นเฉพาะงานที่อยู่ภายในรัศมี 5 กม. เท่านั้น |
| AC-04-02 | test_AC_04_02 | ตรวจว่ารายการถูกเรียงลำดับตามความใกล้เคียงจากซาเล้งไปยังผู้ขาย |
| AC-04-03 | test_AC_04_03 | ตรวจว่า UI ไม่แสดงเลขที่บ้าน/พิกัดละเอียดก่อนกดรับงาน |
| AC-04-04 | test_AC_04_04 | ตรวจว่าระบบแสดงหมวดหมู่ขยะและช่วงราคาประเมิน/ราคากลางอ้างอิงตามที่กำหนด |
| AC-04-05 | test_AC_04_05 | ทดสอบ concurrent accept ให้มีเพียงคนเดียวที่ได้รับสิทธิ์ โดยใช้ lock หรือ first-come rule |
| AC-04-06 | test_AC_04_06 | ทดสอบความคลาดเคลื่อนของ GPS/ระยะทางที่คำนวณได้และยืนยันว่าไม่เกิน 15% |
| AC-04-07 | test_AC_04_07 | วัดเวลา response ของ API/UI ให้ไม่เกิน 3 วินาที ตามนัยที่กำกับไว้ |
| AC-04-08 | test_AC_04_08 | ตรวจว่าพิกัดบ้านเลขที่หรือที่อยู่ละเอียดยังไม่ถูกเปิดเผยจนกว่าซาเล้งกดรับงาน |

- สำหรับ exception path เช่น GPS หลุด, Maps API timeout, รายการถูกรับไปแล้ว ต้องมี scenario เพิ่มเติมใน Gherkin เพื่อให้ครอบคลุม E1, E2, E3 ตาม spec

## 7. ลำดับงาน
1. ตรวจความเข้าใจ spec, requirements และ constraints เพื่อกำหนดขอบเขตและกรอบข้อมูลสำคัญ (REQ-FN-002, REQ-BR-002, REQ-SEC-002)
2. ออกแบบโมเดลข้อมูลและสถานะงานพร้อมแยก public data กับ sensitive data (ScrapRequest, SalengLocation, SellerProfile)
3. ออกแบบ logic การกรองรัศมี 5 กม. และเรียงลำดับตามความใกล้เคียง (REQ-FN-002, REQ-OP-002, AS-02)
4. ออกแบบ API contract สำหรับดึงงาน/รับงาน/refresh GPS พร้อม error handling (REQ-CON-002, REQ-BR-002)
5. ออกแบบ UI สำหรับหน้าแสดงรายการตามเส้นทางและหน้ารายละเอียดงานที่ซ่อนข้อมูลละเอียดก่อนรับงาน (REQ-SEC-002, AC-04-03, AC-04-08)
6. ออกแบบ concurrency control และ business rule ป้องกันการรับงานซ้ำ (REQ-BR-002, AC-04-05)
7. สร้าง acceptance test suite และ Gherkin สำหรับ AC-04-01 ถึง AC-04-08 รวมถึง scenario จาก exception path
8. ตรวจกลับไปที่ spec เพื่อยืนยันว่า ทุก FR, AC และ constraint ถูกนำไปใช้ครบทั้งแผนก่อนเริ่ม implementation

## 8. สิ่งที่ยังไม่ทำ
- AS-02: ระยะทาง 5 กม. ยังเป็น assumption ชั่วคราวว่าใช้ Haversine จาก GPS ซาเล้งถึงผู้ขาย และใช้ทราบระยะทางตามเส้นทางเป็นข้อมูลประกอบเท่านั้น
- AS-03: กรณี concurrent accept ยังเป็น assumption ชั่วคราวว่าใช้ First-come ตามเวลาที่ request ถึง server ก่อน
- AS-04: วิธีจัดการเมื่อ GPS/Maps API timeout หรือไม่ตอบ ยังต้องยืนยันว่าใช้ข้อมูลล่าสุดที่มีอยู่และแสดงข้อความ “ไม่สามารถอัปเดตตำแหน่งได้” หรือใช้วิธีอื่น
- AS-05: เกณฑ์เวลา <= 3 วินาที ยังต้องชัดว่าต้องวัดจากเมื่อตั้ง request, หลัง filter, หรือหลัง render เสร็จ
- ทีมยังต้องตัดสินใจเรื่อง stack (backend/frontend/database) ก่อนเริ่ม implementation อย่างเป็นทางการ
