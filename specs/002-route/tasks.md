# Tasks – FEATURE ROUTE

- Feature: การรับงานตามเส้นทาง (ซาเล้ง)
- Spec ID: SPEC-ROUTE v2 / Draft v2
- อ้างอิง plan.md: [plan.md](./plan.md)
- วันที่: 2026-10-04
- Stack ที่ใช้: Frontend React + Vite + Tailwind, Backend FastAPI, Database PostgreSQL
- สรุป: มี 7 task ทั้งหมด และ 0 task ที่รอ Q-xx (มี 4 assumption ที่ยังต้องยืนยันก่อน implementation อย่างเป็นทางการ)

### T-01 ตั้งโครงโปรเจกต์และสภาพแวดล้อมทดสอบ
- รองรับ: REQ-FN-002, REQ-CON-002, REQ-CON-003
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-01
- ไฟล์ที่แตะ: apps/web/package.json, apps/web/vite.config.*, apps/web/src/, apps/api/main.py, requirements.txt, docker-compose.yml, postgres/init.sql, README.md
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: โครงโปรเจกต์ React + Vite + Tailwind + FastAPI + PostgreSQL เริ่มทำได้ และรัน test เปล่าผ่าน 1 ตัว
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้างโมเดลข้อมูลและ schema ของงาน/พิกัด/ผู้ขาย
- รองรับ: REQ-FN-002, REQ-OP-002, REQ-SEC-002, REQ-CON-003
- ตรวจด้วย: AC-04-03, AC-04-06, AC-04-08
- ไฟล์ที่แตะ: apps/api/main.py, postgres/init.sql
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: model ของ ScrapRequest, SalengLocation, SellerProfile และสถานะงานพร้อมใช้งานและแยกข้อมูล PII ออกจาก public data
- สถานะ: เสร็จ รอทีมตรวจ

### T-03 สร้าง API ดึงงานในรัศมีและเรียงตามความใกล้เคียง
- รองรับ: REQ-FN-002, REQ-OP-002, REQ-CON-002
- ตรวจด้วย: AC-04-01, AC-04-02, AC-04-06
- ไฟล์ที่แตะ: apps/api/main.py, apps/api/tests/test_route_features.py
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: API ส่งรายการงานที่อยู่ภายในรัศมี 5 กม. และเรียงตามความใกล้เคียงตามพิกัดซาเล้งได้ถูกต้อง
- สถานะ: เสร็จ รอทีมตรวจ

### T-04 สร้าง workflow รับงานและป้องกัน concurrent accept
- รองรับ: REQ-BR-002, REQ-SEC-002
- ตรวจด้วย: AC-04-05, AC-04-08
- ไฟล์ที่แตะ: apps/api/main.py, apps/api/tests/test_route_features.py
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: มีเพียงซาเล้งคนเดียวที่สามารถรับงานได้ และข้อมูลบ้านเลขที่/พิกัดละเอียดยังซ่อนอยู่จนกว่าจะกดรับงาน
- สถานะ: เสร็จ รอทีมตรวจ

### T-05 สร้างหน้า UI รายการงานและหน้ารายละเอียดงาน
- รองรับ: REQ-FN-002, REQ-FN-001, REQ-SEC-002, REQ-QA-002
- ตรวจด้วย: AC-04-01, AC-04-03, AC-04-04, AC-04-07
- ไฟล์ที่แตะ: apps/web/src/App.jsx, apps/web/src/routeApi.js, apps/web/src/AC-04-01.test.js
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: หน้า UI แสดงรายการงานตามเส้นทางและรายละเอียดงานที่สอดคล้องกับข้อมูล public data พร้อมจัดการการซ่อนข้อมูลละเอียดก่อนรับงาน
- สถานะ: เสร็จ รอทีมตรวจ

### T-06 สร้าง test สำหรับ exception path และประสิทธิภาพ
- รองรับ: REQ-OP-002, REQ-QA-002, REQ-CON-002
- ตรวจด้วย: AC-04-05, AC-04-06, AC-04-07
- ไฟล์ที่แตะ: test files, mock GPS, mock Maps API timeout, performance assertions
- ต้องทำหลัง: T-03, T-04, T-05
- เสร็จเมื่อ: กรณี GPS หลุด / API timeout / งานถูกรับไปแล้ว / ความเร็วแสดงผลไม่เกิน 3 วินาที มี test ครอบคลุมตาม spec
- สถานะ: พร้อมทำ

### T-07 สร้าง Acceptance Criteria Gherkin และตรวจความครบทุก AC
- รองรับ: REQ-FN-002, REQ-FN-001, REQ-BR-002, REQ-OP-002, REQ-QA-002, REQ-SEC-002
- ตรวจด้วย: AC-04-01, AC-04-02, AC-04-03, AC-04-04, AC-04-05, AC-04-06, AC-04-07, AC-04-08
- ไฟล์ที่แตะ: specs/002-route/route.feature
- ต้องทำหลัง: T-03, T-04, T-05, T-06
- เสร็จเมื่อ: Gherkin ครอบคลุมทุก Acceptance Criteria และทุก scenario ผ่านตาม spec
- สถานะ: พร้อมทำ

## ตารางตรวจความครบ: AC ID | task ที่ตรวจ AC นี้

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-04-01 | T-03, T-05, T-07 |
| AC-04-02 | T-03, T-05, T-07 |
| AC-04-03 | T-02, T-05, T-07 |
| AC-04-04 | T-05, T-07 |
| AC-04-05 | T-04, T-06, T-07 |
| AC-04-06 | T-02, T-03, T-06, T-07 |
| AC-04-07 | T-05, T-06, T-07 |
| AC-04-08 | T-02, T-04, T-07 |

## ตารางตรวจความครบ: Constraint ID | task ที่ทำให้เป็นจริง

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| REQ-CON-002 | T-03, T-06 |
| REQ-CON-003 | T-02, T-03 |

## สิ่งที่ยังไม่ทำ
- AS-01: ซาเล้งไม่น้อยกว่า 70% มีสมาร์ทโฟนรองรับ GPS และใช้แอปเป็น — task ที่รอ: T-03, T-05, T-06; ยังต้องยืนยันก่อนเริ่มวิเคราะห์ประสิทธิภาพจริงในพื้นที่
- AS-02: ระยะทาง 5 กม. ให้คำนวณจากระยะทางตรง (Haversine) จาก GPS ซาเล้งถึงผู้ขาย — task ที่รอ: T-03, T-05; ยังต้องมีการยืนยันก่อนใช้ค่าแบบตายตัว
- AS-03: กรณีซาเล้ง 2 คนกดรับงานพร้อมกัน — task ที่รอ: T-04, T-06; ยังต้องตัดสินใจว่าหลักคือ First-come ตาม request ถึง server หรือใช้ lock แบบอื่น
- AS-04: เมื่อ GPS / Maps API timeout หรือไม่ตอบ — task ที่รอ: T-03, T-06; ยังต้องยืนยันว่าจะใช้ข้อมูลล่าสุดที่มีอยู่หรือแสดงสถานะยกเว้นทันที
- AS-05: เกณฑ์แสดงผลรายการภายใน <= 3 วินาที — task ที่รอ: T-05, T-06; ยังต้องชัดว่าใช้เวลาจาก request ถึง render หรือเฉพาะหลัง query เสร็จ
