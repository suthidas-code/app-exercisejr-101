# BFA Exercise Space 101

ระบบจัดการและคลังแบบฝึกหัด Mind Map ที่พัฒนาด้วย React + Vite และเชื่อมต่อฐานข้อมูลผ่าน Google Apps Script (Spreadsheet & Drive)

## 🚀 ฟีเจอร์เด่น
- **Gallery/List View:** สลับโหมดการแสดงผลแบบตารางหรือรายการได้ตามความต้องการ
- **Dynamic Filtering:** ค้นหาและกรองแบบฝึกหัดตามกลุ่ม (Group) และระดับ (Level) ได้อย่างรวดเร็ว
- **Level Classification:** แบ่งระดับแบบฝึกหัดเป็น พื้นฐาน (Basic) และ สูง (Advanced)
- **Direct Link Previews:** ระบบดึงรูปตัวอย่างจาก Google Drive มาแสดงผลได้อย่างเสถียร
- **Cloud Storage:** บันทึกข้อมูลลงใน Google Sheets และเก็บไฟล์รูปภาพ/PDF ไว้ใน Google Drive

## 🛠️ เทคโนโลยีที่ใช้
- **Frontend:** React 19, Vite, Lucide React (Icons), React Router
- **Backend:** Google Apps Script (GAS)
- **Database:** Google Sheets
- **File Storage:** Google Drive

## 📦 การติดตั้งและรันในเครื่อง
1. Clone repository นี้
2. รันคำสั่ง `npm install` เพื่อติดตั้ง dependencies
3. สร้างไฟล์ `.env` และระบุ `VITE_SCRIPT_URL=(URL ของ Apps Script ที่ Deploy แล้ว)`
4. รันโปรเจกต์ด้วย `npm run dev`

---
*พัฒนาโดย Antigravity AI Assistant*
