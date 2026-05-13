import { useState } from 'react';
import { Save, Upload, FileText, CheckCircle2, X, Trash2, Eye } from 'lucide-react';
import { saveExercise } from '../services/api';

export default function FormPage() {
  const [formData, setFormData] = useState({
    title: '',
    exerciseGroup: '',
    language: '',
    exerciseLevel: 'พื้นฐาน (Basic)',
    storagePath: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [answerImages, setAnswerImages] = useState([]);
  const [exerciseFiles, setExerciseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = {
          data: reader.result,
          name: file.name,
          type: file.type
        };

        if (type === 'image') {
          setImage(fileData);
        } else if (type === 'answer') {
          setAnswerImages(prev => {
            if (prev.length >= 3) return prev; // ปรับเป็น 3 รูป
            return [...prev, fileData];
          });
        } else if (type === 'file') {
          setExerciseFiles(prev => [...prev, fileData]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  };

  const removeFile = (index, type) => {
    if (type === 'answer') {
      setAnswerImages(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'file') {
      setExerciseFiles(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'image') {
      setImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      ...formData,
      category: '', // ส่งค่าว่างไปแทนที่
      image: image?.data || '',
      imageName: image?.name || '',
      imageType: image?.type || '',
      answerImages: answerImages,
      exerciseFiles: exerciseFiles,
    };

    const result = await saveExercise(payload);
    
    if (result.status === 'success') {
      setStatus({ type: 'success', message: 'บันทึกข้อมูลเรียบร้อยแล้ว!' });
      setFormData({ title: '', exerciseGroup: '', language: '', exerciseLevel: 'พื้นฐาน (Basic)', storagePath: '', description: '' });
      setImage(null);
      setAnswerImages([]);
      setExerciseFiles([]);
    } else {
      setStatus({ type: 'error', message: 'เกิดข้อผิดพลาด: ' + result.message });
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h1 className="page-title">Add New Exercise</h1>
      
      {status && (
        <div className={`badge ${status.type === 'error' ? 'danger' : ''}`} style={{ backgroundColor: status.type === 'error' ? 'var(--danger-color)' : 'var(--success-color)', width: '100%', marginBottom: '1rem', textAlign: 'center' }}>
          {status.message}
        </div>
      )}

      {previewUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setPreviewUrl(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={previewUrl} alt="Full Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
            <button style={{ position: 'absolute', top: '-40px', right: '-40px', background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }} onClick={() => setPreviewUrl(null)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Exercise Title</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. ธรรมชาติรอบตัว"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Exercise Group</label>
            <select 
              className="form-control"
              value={formData.exerciseGroup}
              onChange={(e) => setFormData({...formData, exerciseGroup: e.target.value})}
              required
            >
              <option value="">เลือกกลุ่มแบบฝึกหัด</option>
              <option value="กลุ่มนิทาน (5BOI) A1">กลุ่มนิทาน (5BOI) A1</option>
              <option value="กลุ่มสารคดี/ข่าว (5BOI) A1">กลุ่มสารคดี/ข่าว (5BOI) A1</option>
              <option value="กลุ่มสารคดี/ข่าว A2">กลุ่มสารคดี/ข่าว A2</option>
              <option value="ใบอ่านบทความ">ใบอ่านบทความ</option>
              <option value="คิดจัดกลุ่ม/MakeNote">คิดจัดกลุ่ม/MakeNote</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Language</label>
            <select 
              className="form-control"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              required
            >
              <option value="">Select Language</option>
              <option value="ภาษาไทย">ภาษาไทย</option>
              <option value="ภาษาอังกฤษ">ภาษาอังกฤษ</option>
              <option value="ทั้ง 2 ภาษา">ทั้ง 2 ภาษา</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Exercise Level / Type (ระดับแบบฝึกหัด)</label>
          <select 
            className="form-control"
            value={formData.exerciseLevel}
            onChange={(e) => setFormData({...formData, exerciseLevel: e.target.value})}
            required
          >
            <option value="พื้นฐาน (Basic)">พื้นฐาน (Basic)</option>
            <option value="สูง (Advanced)">สูง (Advanced)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Storage Path / Link (Optional)</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Google Drive Link หรือ Path ภายในเครื่อง"
            value={formData.storagePath}
            onChange={(e) => setFormData({...formData, storagePath: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-control" 
            rows="2" 
            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับแบบฝึกหัดนี้..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
          {/* Main Image */}
          <div className="form-group">
            <label className="form-label">Example Image</label>
            <div className="file-drop-area" style={{ position: 'relative', minHeight: '140px', padding: '0.5rem' }}>
              <input type="file" hidden accept="image/*" id="main-image" onChange={(e) => handleFileChange(e, 'image')} />
              {image ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <img src={image.data} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setPreviewUrl(image.data)} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0} onClick={() => setPreviewUrl(image.data)}>
                      <Eye size={20} color="white" />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.65rem', margin: '0.4rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>{image.name}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <label htmlFor="main-image" style={{ flex: 1, textAlign: 'center', background: '#f0f0f0', padding: '4px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}>Change</label>
                    <button type="button" onClick={() => removeFile(0, 'image')} style={{ flex: 1, background: '#fff0f0', border: 'none', color: 'var(--danger-color)', padding: '4px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={12} style={{ marginRight: '4px' }} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="main-image" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={28} style={{ color: 'var(--primary-color)' }} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click to upload Main Image</p>
                </label>
              )}
            </div>
          </div>

          {/* Answer Sheets (Max 3) */}
          <div className="form-group">
            <label className="form-label">Answer Sheets ({answerImages.length}/3)</label>
            <div className="file-drop-area" style={{ borderColor: '#6ed097', minHeight: '140px', padding: '0.5rem' }}>
              <input type="file" hidden accept="image/*" id="answer-image" multiple onChange={(e) => handleFileChange(e, 'answer')} disabled={answerImages.length >= 3} />
              
              {answerImages.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                  {answerImages.map((img, i) => (
                    <div key={i} style={{ textAlign: 'center', width: '45%', position: 'relative', border: '1px solid #eee', padding: '4px', borderRadius: '4px' }}>
                      <img src={img.data} alt={`Answer ${i+1}`} style={{ maxWidth: '100%', maxHeight: '45px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setPreviewUrl(img.data)} />
                      <button type="button" onClick={() => removeFile(i, 'answer')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger-color)', border: 'none', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {answerImages.length < 3 && (
                    <label htmlFor="answer-image" style={{ cursor: 'pointer', width: '45%', height: '55px', border: '1px dashed #6ed097', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={20} style={{ color: '#6ed097' }} />
                    </label>
                  )}
                </div>
              ) : (
                <label htmlFor="answer-image" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={28} style={{ color: '#6ed097' }} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Max 3 images</p>
                </label>
              )}
            </div>
          </div>

          {/* Exercise Files (Multiple) */}
          <div className="form-group">
            <label className="form-label">Exercise Files ({exerciseFiles.length})</label>
            <div className="file-drop-area" style={{ minHeight: '140px', padding: '0.5rem' }}>
              <input type="file" hidden id="exercise-file" multiple onChange={(e) => handleFileChange(e, 'file')} />
              
              {exerciseFiles.length > 0 ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, maxHeight: '90px', overflowY: 'auto', textAlign: 'left' }}>
                    {exerciseFiles.map((file, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', padding: '4px', marginBottom: '4px', background: '#f8f9fa', borderRadius: '4px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>{file.name}</span>
                        <Trash2 size={12} style={{ color: 'var(--danger-color)', cursor: 'pointer' }} onClick={() => removeFile(i, 'file')} />
                      </div>
                    ))}
                  </div>
                  <label htmlFor="exercise-file" style={{ cursor: 'pointer', display: 'block', textAlign: 'center', marginTop: '0.5rem', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    + Add more files
                  </label>
                </div>
              ) : (
                <label htmlFor="exercise-file" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={28} style={{ color: 'var(--primary-color)' }} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>PDF / Doc / Image</p>
                </label>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ height: '3.5rem', fontSize: '1.1rem' }}>
          {loading ? <div className="spinner"></div> : <><Save size={24} /> Save Exercise</>}
        </button>
      </form>
    </div>
  );
}
