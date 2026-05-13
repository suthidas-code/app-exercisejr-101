import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter,
  ExternalLink, 
  FileText, 
  Download, 
  Trash2, 
  RefreshCw, 
  LayoutGrid, 
  List,
  CheckCircle2 
} from 'lucide-react';
import { getExercises, deleteExercise } from '../services/api';

export default function GalleryPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [viewMode, setViewMode] = useState('gallery');

  const fetchData = async () => {
    setLoading(true);
    const result = await getExercises();
    if (result.status === 'success') {
      setExercises(result.data);
      setError(null);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDelete = async (title, date, folderId) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบแบบฝึกหัด "${title}" และโฟลเดอร์ที่เกี่ยวข้องทั้งหมด?\n\n(ไฟล์จะถูกย้ายไปถังขยะ สามารถกู้คืนได้ภายใน 30 วัน)`)) return;
    
    setDeleting(title);
    const result = await deleteExercise(title, date, folderId);
    
    if (result.status === 'success') {
      setExercises(prev => prev.filter(item => item["ชื่อแบบฝึกหัด"] !== title || item["วันที่"] !== date));
      alert('ลบข้อมูลและย้ายโฟลเดอร์ไปถังขยะเรียบร้อยแล้ว');
    } else {
      alert('เกิดข้อผิดพลาดในการลบ: ' + result.message);
    }
    setDeleting(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueGroups = useMemo(() => {
    const groups = new Set();
    exercises.forEach(item => {
      if (item["กลุ่มแบบฝึกหัด"]) {
        groups.add(item["กลุ่มแบบฝึกหัด"]);
      }
    });
    return Array.from(groups).sort();
  }, [exercises]);

  const groupCounts = useMemo(() => {
    return exercises.reduce((acc, item) => {
      const group = item["กลุ่มแบบฝึกหัด"];
      if (group) {
        acc[group] = (acc[group] || 0) + 1;
      }
      return acc;
    }, {});
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      const matchesSearch = item["ชื่อแบบฝึกหัด"]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'All' || item["กลุ่มแบบฝึกหัด"] === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [exercises, searchTerm, selectedGroup]);

  const truncateText = (text, limit) => {
    if (!text) return "ไม่มีคำอธิบาย";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const isUrl = (str) => {
    return str && (str.startsWith('http://') || str.startsWith('https://'));
  };

  const getDirectImageUrl = (url) => {
    if (!url) return null;
    const regex = /(?:id=|\/d\/|lh3\.googleusercontent\.com\/d\/|uc\?id=|thumbnail\?id=)([a-zA-Z0-9_-]{25,})/;
    const match = url.match(regex);
    const id = match ? match[1] : null;

    if (id) {
      // ใช้ Drive Thumbnail Endpoint เพื่อความเสถียรสูงสุด (รองรับ sz=w800 เพื่อความชัด)
      return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>กำลังโหลดแบบฝึกหัด...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="gallery-toolbar">
        <div className="gallery-toolbar-header">
          <h1 className="page-title" style={{ margin: 0, textAlign: 'left' }}>Exercise Gallery</h1>
          <button className="refresh-btn" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        
        <div className="gallery-toolbar-filters">
          <div className="view-toggle-group" style={{ display: 'flex', gap: '5px', marginRight: '15px' }}>
            <button 
              className={`view-btn ${viewMode === 'gallery' ? 'active' : ''}`} 
              onClick={() => setViewMode('gallery')}
              title="แสดงผลแบบ Gallery"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              title="แสดงผลแบบ List"
            >
              <List size={18} />
            </button>
          </div>

          <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="ค้นหาชื่อแบบฝึกหัด..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <Filter size={18} style={{ color: 'var(--primary-color)' }} />
            <select 
              className="form-control filter-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="All">ทุกกลุ่มแบบฝึกหัด</option>
              {uniqueGroups.filter(g => g !== 'All').map(group => (
                <option key={group} value={group}>
                  {group} ({groupCounts[group] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="gallery-stats">
            <span className="stat-badge total">
              ทั้งหมด: {exercises.length}
            </span>
            {selectedGroup !== 'All' && (
              <span className="stat-badge filtered">
                กลุ่มนี้: {filteredExercises.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="badge danger" style={{ backgroundColor: 'var(--danger-color)', width: '100%', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredExercises.length === 0 && (
        <div className="empty-state">
          <FileText size={48} style={{ color: 'var(--primary-color)', opacity: 0.4, marginBottom: '1rem' }} />
          <p>
            {searchTerm ? `ไม่พบแบบฝึกหัดที่ตรงกับ "${searchTerm}"` : "ยังไม่มีแบบฝึกหัดในระบบ"}
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      <div className={`gallery-grid ${viewMode === 'list' ? 'list-mode' : ''}`}>
        {filteredExercises.map((item, index) => {
          const answerLinks = item["ลิงก์แผ่นเฉลย"] ? item["ลิงก์แผ่นเฉลย"].split("|") : [];
          const fileLinks = item["ลิงก์ไฟล์"] ? item["ลิงก์ไฟล์"].split("|") : [];
          const imageUrl = getDirectImageUrl(item["ลิงก์รูปภาพ"]);

          return (
            <div key={index} className="card item-card">
              {/* Image */}
              <div className="item-image-wrapper">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={item["ชื่อแบบฝึกหัด"]} 
                    className="item-image" 
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/fef3eb/ffb07c?text=No+Preview';
                    }}
                  />
                ) : (
                  <div className="item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fef3eb, #fff5ee)' }}>
                    <FileText size={48} style={{ color: 'var(--primary-color)', opacity: 0.35 }} />
                  </div>
                )}
                <div className="item-image-overlay"></div>
              </div>

              {/* Content */}
              <div className="item-content">
                {/* แสดงกลุ่มแบบฝึกหัด (เช็คหลาย Key เพื่อความปลอดภัย) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.6rem' }}>
                  {(item["กลุ่มแบบฝึกหัด"] || item["กลุ่ม"] || item["Category"]) && (
                    <span className="item-group-badge" style={{ marginBottom: 0 }}>
                      {item["กลุ่มแบบฝึกหัด"] || item["กลุ่ม"] || item["Category"]}
                    </span>
                  )}
                  
                  {(item["ระดับแบบฝึกหัด"] || item["ระดับ"]) && (
                    <span className="item-level-badge">
                      {item["ระดับแบบฝึกหัด"] || item["ระดับ"]}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="item-lang-badge">
                    {item["ภาษา"] || "ไม่ระบุภาษา"}
                  </span>
                </div>
                
                <h3 className="item-title">{item["ชื่อแบบฝึกหัด"]}</h3>
                
                <p className="item-desc">
                  {truncateText(item["คำอธิบาย"], 200)}
                </p>
                
                {item["Path/Link"] && (
                  <div className="item-path-box">
                    <strong style={{ display: 'block', marginBottom: '2px' }}>Path / Link:</strong>
                    {isUrl(item["Path/Link"]) ? (
                      <a href={item["Path/Link"]} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {item["Path/Link"]} <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ wordBreak: 'break-all' }}>{item["Path/Link"]}</span>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="item-actions">
                  {item["ลิงก์รูปภาพ"] && (
                    <a href={item["ลิงก์รูปภาพ"]} target="_blank" rel="noopener noreferrer" className="item-action-btn view">
                      <ExternalLink size={14} /> ดูรูปตัวอย่าง
                    </a>
                  )}

                  {answerLinks.map((link, i) => (
                    <a key={`ans-${i}`} href={link} target="_blank" rel="noopener noreferrer" className="item-action-btn answer">
                      <CheckCircle2 size={14} /> เฉลย {answerLinks.length > 1 ? i + 1 : ''}
                    </a>
                  ))}

                  {fileLinks.map((link, i) => (
                    <a key={`file-${i}`} href={link} target="_blank" rel="noopener noreferrer" className="item-action-btn download">
                      <Download size={14} /> ดาวน์โหลดไฟล์ {fileLinks.length > 1 ? i + 1 : ''}
                    </a>
                  ))}

                  <button 
                    className="item-action-btn delete"
                    onClick={() => handleDelete(item["ชื่อแบบฝึกหัด"], item["วันที่"], item["Folder ID"])}
                    disabled={deleting === item["ชื่อแบบฝึกหัด"]}
                  >
                    {deleting === item["ชื่อแบบฝึกหัด"] ? (
                      <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: 'var(--danger-color)' }}></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                    ลบรายการ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
