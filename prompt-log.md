# prompt-log.md บันทึกการใช้ AI ของกลุ่ม <ชื่อกลุ่ม>

กติกา: เพิ่มต่อท้ายเท่านั้น ห้ามแก้หรือลบบันทึกเดิม
ทุกบันทึกมี: เลขที่ | วันที่ | เครื่องมือ | คำสั่ง | สิ่งที่ AI ถามหรือรายงาน | คำตอบหรือการตัดสินใจของทีม | สิ่งที่ AI เดา (ถ้ามี)
AI จะเพิ่มบันทึกให้เองเมื่อใช้คำสั่ง /clarify /plan /tasks /implement ทีมเพิ่มเองได้เมื่อสั่งแก้นอกคำสั่ง

## #1 | 2026-10-04 | VS Code / Copilot | /clarify specs/002-route/spec.md
- AI ถาม: ระบุความหมายของ “เส้นทางในรัศมี 5 กม.”, วิธีจัดการ concurrent accept, การวัด GPS accuracy, การซ่อนพิกัดผู้ขาย, และเกณฑ์เวลาการแสดงผล
- คำตอบหรือการตัดสินใจของทีม: ใช้ค่าเดิมที่ AI ได้เดาให้ตามคำสั่ง “คำถามที่ค้างอยู่เอาตามที่เดาได้เลย”
- สิ่งที่ AI เดา: ระยะทาง 5 กม. คำนวณจากระยะทางตรง Haversine จาก GPS ซาเล้งถึงผู้ขาย; First-come based on request-to-server timing; API timeout ใช้ข้อมูลล่าสุดและแสดงสถานะไม่พร้อม; เวลา <= 3 วินาที วัดหลังข้อมูลพร้อมและกรองเสร็จ

## #2 | 2026-10-04 | VS Code / Copilot | /clarify specs/002-route/spec.md (ตามคำตอบทีม)
- AI รายงาน: แก้ข้อกำกวมใน spec.md โดยกำหนด assumption ให้ชัดและปรับ status เป็น Draft v2
- คำตอบหรือการตัดสินใจของทีม: ยอมรับ assumption ที่ AI เดาและให้ใช้เป็นความจริงใน spec ชั่วคราวก่อนวางแผน
- สิ่งที่ AI แก้: ปรับ header status เป็น Draft v2 วันที่ 2026-10-04; เปลี่ยน Q-01 เป็น AS-03 และเพิ่ม AS-02 / AS-04 / AS-05 ในหัวข้อ Open Questions & Assumptions

## #3 | 2026-10-04 | VS Code / Copilot | /plan specs/002-route/spec.md
- AI รายงาน: สร้างแผนงานสำหรับ feature route โดยยึด spec.md เป็น source of truth และจัดกลุ่มงานเป็น model / API & UI / test / review
- คำตอบหรือการตัดสินใจของทีม: ใช้ assumption ชั่วคราวที่เคยตกลงไว้เพื่อเริ่มวางแผน แต่ยังคงเปิดชื่อตัวเลือกเทคโนโลยีให้รอทีมเลือกแน่ชัด
- สิ่งที่ AI เดา: ใช้ Haversine เป็นการคำนวณ radius, First-come เป็นความเหมาะสมสำหรับ concurrent accept ในสภาพแวดล้อมนี้, และค่า 3 วินาทีให้วัดจากเวลาหลังกรองข้อมูลเสร็จสิ้นจน UI แสดงรายการได้
- ผลลัพธ์: สร้าง [specs/002-route/plan.md]( /workspaces/saleng-thampaphat/specs/002-route/plan.md ) พร้อมสรุป summary, tech table, data model, API/UI contract, constraints checklist, AC test plan, และลำดับงาน

## #4 | 2026-10-04 | VS Code / Copilot | /tasks specs/002-route/spec.md
- AI รายงาน: แตก plan เป็น task ย่อย 7 ก้าวตามลำดับการพึ่งพา โดยยึด spec/plan เป็น source of truth และจัดให้แต่ละ task มี FR/AC/ไฟล์/เงื่อนไขเสร็จสิ้นที่ชัดเจน
- คำตอบหรือการตัดสินใจของทีม: ใช้ task เป็นเอกสารให้ทีมตรวจสลับกับ spec ได้ทันที โดยไม่เริ่ม implementation ใด ๆ
- สิ่งที่ AI เดา: เริ่มจาก setup → data model → API → UI → test → acceptance Gherkin และบันทึก assumption ที่ยังต้องยืนยันเป็นสิ่งที่ task ต้องรอ
- ผลลัพธ์: สร้าง [specs/002-route/tasks.md]( /workspaces/saleng-thampaphat/specs/002-route/tasks.md ) พร้อมตารางตรวจ AC และ constraints และสรุป Open Questions/Assumptions ที่ยังต้องแก้ก่อน implementation

## #5 | 2026-10-04 | VS Code / Copilot | แก้ spec/plan/tasks ตามการตัดสินใจของทีม
- AI รายงาน: ปรับเอกสารทั้งหมดให้สอดคล้องกับ stack ที่ทีมเลือก: Frontend React + Vite + Tailwind, Backend FastAPI, Database PostgreSQL
- คำตอบหรือการตัดสินใจของทีม: ใช้ stack ดังกล่าวเป็นทางเลือกที่ชัดเจนสำหรับ feature route และบันทึกไว้ใน spec.md, plan.md และ tasks.md
- สิ่งที่ AI แก้: เพิ่ม AS-06 ใน spec.md เพื่อระบุ stack ที่เลือก; ปรับ plan.md ให้แสดง stack และโครงสร้างโปรเจกต์เริ่มต้น; ปรับ tasks.md ให้ชี้ไปที่ apps/web, apps/api และ database setup ที่สอดคล้องกัน

## #6 | 2026-10-04 | VS Code / Copilot | /implement T-01 specs/002-route/tasks.md
- AI รายงาน: สร้างโครงโปรเจกต์เพื่อให้ feature route มี frontend/backend/database starter ที่ใช้งานได้ทันทีตาม stack ที่ตัดสินใจแล้ว
- คำตอบหรือการตัดสินใจของทีม: ใช้ task T-01 เป็นงานแรกและตรวจว่าเป็น task พร้อมทำก่อนเริ่ม implement
- สิ่งที่ AI แก้: สร้าง apps/web (React + Vite + Tailwind), apps/api (FastAPI), docker-compose.yml และ postgres/init.sql, พร้อมปรับ README.md ให้มีคำสั่งรัน
- ผลทดสอบ: npm run build ใน apps/web สำเร็จ; python -m compileall apps/api สำเร็จ; curl http://127.0.0.1:8000/health คืนค่า {"status":"ok"}
- สิ่งที่ AI เกือบเดาแต่ไม่ต้องเดา: ไม่มี เพราะ task นี้ไม่มี Open Question ที่ต้องเดาเพิ่มเติม; สถานะ T-01 ถูกอัปเดตเป็น "เสร็จ รอทีมตรวจ"

## #7 | 2026-10-04 | VS Code / Copilot | /implement T-02 specs/002-route/tasks.md
- AI รายงาน: ปรับโมเดลข้อมูลหลักของ backend ให้สอดคล้องกับข้อกำหนดความเป็นส่วนตัวและชนวน concurrent accept: เพิ่ม model สำหรับ request status history และ seller profile พร้อมใช้ dict-based request records อย่างสม่ำเสมอ
- ไฟล์ที่สร้างหรือแก้: apps/api/main.py
- ผล test: PYTHONPATH=. pytest tests/test_route_features.py -q -> 6 passed in 0.70s
- สิ่งที่ AI เกือบต้องเดาแต่ถามแทน: ไม่มี เพราะ task นี้ไม่มี Open Question ใดที่ต้องเดาเพิ่มเติม; ได้ตรวจแล้วว่าความซ้ำซ้อนของ model ให้ใช้คีย์ dict-backed records และ history structure เหมาะสมตาม spec
- ข้อสรุป: task T-02 มีสถานะ "เสร็จ รอทีมตรวจ" และไม่ทำ task ขั้นถัดไปโดยอัตโนมัติตามกติกา

## #8 | 2026-10-04 | VS Code / Copilot | /implement T-03 specs/002-route/tasks.md
- AI รายงาน: ทำให้ระยะทางที่ API ส่งกลับมาคำนวณจากพิกัดซาเล้งเดียวกับที่ใช้กรองรายการและเรียงลำดับ พร้อมครอบคลุมกรณีขอบเชิงตัวเลขของ Haversine
- ไฟล์ที่สร้างหรือแก้: apps/api/main.py, apps/api/tests/test_route_features.py, specs/002-route/tasks.md
- ผล test: `cd apps/api && PYTHONPATH=. pytest tests/test_route_features.py -q` -> 8 passed in 2.53s; Problems ตรวจ apps/api ทั้งสองไฟล์ไม่พบข้อผิดพลาด
- REQ-CON-002: endpoint nearby ใช้การคำนวณ Haversine ภายในและไม่เรียก Maps API จึงไม่ใช้ quota ของ Maps API ในการกรองรายการ
- สิ่งที่ AI เกือบต้องเดาแต่ถามแทน: ไม่ได้เพิ่มการตรวจช่วง latitude/longitude เพราะ spec และ plan ไม่กำหนดพฤติกรรมสำหรับพิกัดนอกช่วง; ใช้ validation ตัวเลขของ FastAPI ตามที่มีอยู่
- ข้อสรุป: task T-03 มีสถานะ "เสร็จ รอทีมตรวจ"; ไม่ได้เริ่ม T-04

## #9 | 2026-10-04 | VS Code / Copilot | /implement T-04 specs/002-route/tasks.md
- AI รายงาน: คงการล็อกการรับงานแบบ first-come ให้มีผู้ชนะเพียงรายเดียว เก็บประวัติ transition เมื่อรับงานสำเร็จเท่านั้น และตรวจการเปิดเผยที่อยู่หลังรับงาน
- ไฟล์ที่สร้างหรือแก้: apps/api/main.py, apps/api/tests/test_route_features.py, specs/002-route/tasks.md
- ผล test: `cd apps/api && PYTHONPATH=. pytest tests/test_route_features.py -q` -> 9 passed in 1.03s; Problems ตรวจ apps/api ทั้งสองไฟล์ไม่พบข้อผิดพลาด
- REQ-BR-002: ส่วน critical section ของ accept ใช้ ACCEPT_LOCK ป้องกันการรับซ้ำ และเพิ่ม history เฉพาะคำขอที่เปลี่ยนสถานะได้
- REQ-SEC-002: รายละเอียดที่อยู่ถูกซ่อนก่อนรับงานและ API เปิดเผยหลังสถานะเป็น “มีผู้รับงานแล้ว”
- ข้อจำกัด: REQUESTS และ status history ยังเป็น in-memory ตาม scaffold ปัจจุบัน ไม่ใช่การบันทึก PostgreSQL แบบถาวร
- สิ่งที่ AI เกือบต้องเดาแต่ถามแทน: ไม่ได้เปลี่ยนแนวทาง concurrency ไปเป็น distributed database lock เพราะ plan ระบุ lock และสภาพแวดล้อมทดสอบปัจจุบันใช้ in-memory request store
- ข้อสรุป: task T-04 มีสถานะ "เสร็จ รอทีมตรวจ"; ยังไม่ได้เริ่ม T-05 ถึง T-07 ในรอบนี้ตามขอบเขต /implement ครั้งละหนึ่ง task

## #10 | 2026-10-04 | VS Code / Copilot | /implement T-05 specs/002-route/tasks.md
- AI รายงาน: สร้างหน้ารายการงานและหน้ารายละเอียดที่อ่าน mock API แสดงเฉพาะงานในรัศมี เรียงตามระยะทาง แสดงประเภท/ราคา และปกปิดบ้านเลขที่ก่อนรับงาน
- ไฟล์ที่สร้างหรือแก้: apps/web/src/App.jsx, apps/web/src/routeApi.js, apps/web/src/AC-04-01.test.js, specs/002-route/tasks.md
- ผล test: `node --test src/AC-04-01.test.js` -> 4 passed; `npm run lint` ผ่าน; `npm run build` ผ่าน; ตรวจหน้า browser เห็นรายการ 2 งาน เรียง 0.25 กม. ก่อน 0.83 กม. และเห็นที่อยู่หลังรับงาน
- REQ-FN-002: `getNearbyRequests` คัดกรองในรัศมีไม่เกิน 5 กม. และเรียงตามระยะ Haversine; หน้าแสดงรายการงาน
- REQ-FN-001: หน้ารายการและรายละเอียดแสดงประเภทขยะและราคาประเมิน/ราคากลางอ้างอิงตามค่าเดียวที่มีในสัญญาข้อมูล
- REQ-SEC-002: mock API ส่งที่อยู่/บ้านเลขที่แบบปกปิดก่อนสถานะรับงาน และ UI แสดงข้อมูลจริงหลังรับงานสำเร็จ
- REQ-QA-002: test ของ mock API ตรวจเวลาการโหลดต่ำกว่า 3 วินาที; ตรวจหน้า browser ยืนยันการ render และ flow ได้
- สิ่งที่ AI เกือบต้องเดาแต่ถามแทน: ไม่สร้างช่วงราคาแยกจาก `estimated_price` เพราะ spec/สัญญา API มีเฉพาะฟิลด์นี้; ข้อมูล mock ยังเป็น client-side และไม่ใช่การยืนยันความปลอดภัยระดับ production
- ข้อสรุป: task T-05 มีสถานะ "เสร็จ รอทีมตรวจ"; ยังไม่ได้เริ่ม T-06 หรือ T-07
