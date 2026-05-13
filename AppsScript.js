// --- ตั้งค่าความปลอดภัยผ่าน Script Properties ---
// วิธีตั้งค่า: ในหน้า Apps Script ให้ไปที่ รูปเฟือง (Project Settings) -> เลื่อนลงล่างสุด -> Script Properties 
// -> กด Edit -> Add row ดังนี้:
// 1. Property: FOLDER_ID , Value: (ID ของโฟลเดอร์ Google Drive)

const props = PropertiesService.getScriptProperties();
const FOLDER_ID = props.getProperty('FOLDER_ID'); 

// ฟังก์ชันช่วยดึง ID และสร้าง Direct Link ที่เสถียรขึ้น (ใช้ googleusercontent)
function getDirectLink(url) {
  if (!url) return "";
  
  // ดึง ID จากลิงก์ Google Drive ทุกรูปแบบ
  const regex = /(?:id=|\/d\/|lh3\.googleusercontent\.com\/d\/|uc\?id=)([a-zA-Z0-9_-]{25,})/;
  const match = url.match(regex);
  const id = match ? match[1] : null;

  if (id) {
    // ใช้รูปแบบ Thumbnail ซึ่งเสถียรกว่าและโหลดได้แน่นอนกว่าสำหรับรูป Preview
    return "https://drive.google.com/thumbnail?id=" + id + "&sz=w800";
  }
  return url;
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // --- กรณีสั่ง "ลบ" ข้อมูล ---
    if (data.action === "delete") {
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const titleToDelete = data.title;
      const folderIdToDelete = data.folderId || null;
      
      // หา index ของคอลัมน์ต่างๆ
      const titleColIdx = headers.indexOf("ชื่อแบบฝึกหัด");
      const folderIdColIdx = headers.indexOf("Folder ID");

      // 1. ลบโฟลเดอร์ใน Google Drive (ใช้ Folder ID ถ้ามี เพื่อความแม่นยำ)
      try {
        if (folderIdToDelete) {
          // ลบแบบแม่นยำด้วย Folder ID
          const folder = DriveApp.getFolderById(folderIdToDelete);
          folder.setTrashed(true);
        } else {
          // Fallback: ลบด้วยชื่อ (สำหรับข้อมูลเก่าที่ยังไม่มี Folder ID)
          const mainFolder = DriveApp.getFolderById(FOLDER_ID);
          const subFolders = mainFolder.getFoldersByName(titleToDelete);
          while (subFolders.hasNext()) {
            const folder = subFolders.next();
            folder.setTrashed(true);
          }
        }
      } catch (e) {
        console.log("Error deleting folder: " + e.message);
      }

      // 2. ลบแถวใน Google Sheet
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][titleColIdx] === titleToDelete) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ 
            status: "success", 
            message: "ลบข้อมูลและย้ายโฟลเดอร์ไปถังขยะเรียบร้อย" 
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "ไม่พบข้อมูลที่ต้องการลบ" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- กรณีบันทึกข้อมูลใหม่ ---
    const title = data.title;
    const exerciseGroup = data.exerciseGroup || ""; 
    const exerciseLevel = data.exerciseLevel || "";
    const language = data.language;
    const storagePath = data.storagePath;
    const description = data.description;
    const date = new Date();
    
    let imageUrl = "";
    let answerUrls = [];
    let fileUrls = [];
    let subFolderId = ""; // เก็บ Folder ID สำหรับการลบที่แม่นยำ
    
    const mainFolder = DriveApp.getFolderById(FOLDER_ID);
    
    // สร้างโฟลเดอร์ย่อยตามชื่อแบบฝึกหัด (ถ้ายังไม่มี)
    let folder;
    const subFolders = mainFolder.getFoldersByName(title);
    if (subFolders.hasNext()) {
      folder = subFolders.next();
    } else {
      folder = mainFolder.createFolder(title);
    }
    subFolderId = folder.getId();
    
    if (data.image && data.imageName) {
      const imageBlob = Utilities.newBlob(Utilities.base64Decode(data.image.split(",")[1]), data.imageType, data.imageName);
      const imageFile = folder.createFile(imageBlob);
      imageFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = getDirectLink(imageFile.getUrl());
    }

    if (data.answerImages && Array.isArray(data.answerImages)) {
      data.answerImages.forEach(img => {
        if (img.data && img.name) {
          const blob = Utilities.newBlob(Utilities.base64Decode(img.data.split(",")[1]), img.type, img.name);
          const file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          answerUrls.push(getDirectLink(file.getUrl()));
        }
      });
    }
    
    if (data.exerciseFiles && Array.isArray(data.exerciseFiles)) {
      data.exerciseFiles.forEach(f => {
        if (f.data && f.name) {
          const blob = Utilities.newBlob(Utilities.base64Decode(f.data.split(",")[1]), f.type, f.name);
          const file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          fileUrls.push(file.getUrl());
        }
      });
    }
    
    // ตั้งค่า Header (รวม Folder ID)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["วันที่", "ชื่อแบบฝึกหัด", "กลุ่มแบบฝึกหัด", "ระดับแบบฝึกหัด", "ภาษา", "Path/Link", "คำอธิบาย", "ลิงก์รูปภาพ", "ลิงก์แผ่นเฉลย", "ลิงก์ไฟล์", "Folder ID"]);
    }
    
    sheet.appendRow([
      date, 
      title, 
      exerciseGroup, 
      exerciseLevel,
      language, 
      storagePath, 
      description, 
      imageUrl, 
      answerUrls.join("|"), 
      fileUrls.join("|"),
      subFolderId
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกข้อมูลเรียบร้อย" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 1) {
      const headers = data[0];
      const result = [];
      for(let i=1; i<data.length; i++) {
        let obj = {};
        for(let j=0; j<headers.length; j++) {
           let val = data[i][j];
           if (val instanceof Date) val = val.toISOString();
           
           // แปลงลิงก์รูปภาพให้เป็น Direct Link เผื่อกรณีข้อมูลเก่าที่บันทึกผิด
           // สร้าง Key ที่มาตรฐานสำหรับ Frontend (Normalize)
           const headerNorm = headers[j].toString().trim();
           let key = headers[j];
           
           if (headerNorm === "ลิงก์รูปภาพ" || headerNorm === "ลิงค์รูปภาพ") {
             key = "ลิงก์รูปภาพ";
             val = getDirectLink(val);
           } else if (headerNorm === "ลิงก์แผ่นเฉลย" || headerNorm === "ลิงค์แผ่นเฉลย") {
             key = "ลิงก์แผ่นเฉลย";
             if (val) {
               const urls = val.split("|");
               val = urls.map(u => getDirectLink(u)).join("|");
             }
           } else if (headerNorm === "ลิงก์ไฟล์" || headerNorm === "ลิงค์ไฟล์") {
             key = "ลิงก์ไฟล์";
           } else if (headerNorm === "กลุ่มแบบฝึกหัด" || headerNorm === "กลุ่ม" || headerNorm === "กลุ่มแบบฝึก") {
             key = "กลุ่มแบบฝึกหัด";
           } else if (headerNorm === "ระดับแบบฝึกหัด" || headerNorm === "ระดับ" || headerNorm === "Level") {
             key = "ระดับแบบฝึกหัด";
           }
           
           obj[key] = val;
        }
        result.push(obj);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: result })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
