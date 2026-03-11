import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Upload, Search, Sparkles, LogOut, User } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8005';

const isNew = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
};

const SKILL_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
];

const SkeletonCard = () => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 animate-pulse">
    <div className="flex justify-between mb-6">
      <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
      <div className="w-20 h-6 bg-slate-200 rounded-full" />
    </div>
    <div className="h-6 bg-slate-200 rounded-full w-3/4 mb-3" />
    <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-6" />
    <div className="flex gap-2 mb-6">
      <div className="h-7 w-20 bg-slate-100 rounded-full" />
      <div className="h-7 w-16 bg-slate-100 rounded-full" />
    </div>
    <div className="h-12 bg-slate-200 rounded-2xl" />
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white ${colors}`}
      style={{ animation: 'slideUp 0.3s ease' }}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  );
};

const AIModal = ({ job, matchData, onClose }) => {
  if (!job) return null;
  const md = matchData?.[job.id];
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
        style={{ animation: 'modalIn 0.25s ease' }}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xl transition-colors">×</button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>✦</div>
          <div>
            <p className="text-xs font-black text-violet-600 uppercase tracking-widest">AI Analizi</p>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.company}</p>
          </div>
        </div>
        {md ? (
          <>
            <div className="bg-slate-50 rounded-2xl p-5 mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-600">CV Uyum Skoru</span>
                <span className="font-black text-2xl text-slate-900">%{md.score}</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${md.score}%`,
                    background: md.score >= 90 ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                      : md.score >= 70 ? 'linear-gradient(90deg,#10b981,#059669)'
                        : 'linear-gradient(90deg,#3b82f6,#6366f1)'
                  }} />
              </div>
            </div>
            {md.matched?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">✓ Güçlü Yönlerin</p>
                <div className="flex flex-wrap gap-2">
                  {md.matched.map((s, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {md.missing?.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">⚠ Geliştirmen Gerekenler</p>
                <div className="flex flex-wrap gap-2">
                  {md.missing.map((s, i) => (
                    <span key={i} className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <p className="text-5xl mb-3">📄</p>
            <p className="font-semibold">AI analizi için önce CV yükle.</p>
          </div>
        )}
        <a href={job.url} target="_blank" rel="noreferrer"
          className="block w-full text-center bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-colors mt-2">
          İlana Başvur →
        </a>
      </div>
    </div>
  );
};

const JobCard = ({ job, matchData, index, onAnalyze, isBestMatch }) => {
  const md = matchData?.[job.id];
  const skills = job.skills ? job.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const jobIsNew = isNew(job.created_at);

  return (
    <div className="group relative bg-white border border-slate-200/60 p-8 rounded-[2rem] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all duration-500 flex flex-col justify-between"
      style={{ animation: 'fadeSlideUp 0.4s ease both', animationDelay: `${index * 60}ms` }}>
      {isBestMatch && (
        <div className="absolute -top-3 left-8 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg animate-bounce uppercase tracking-widest z-10">
          Best Match 🔥
        </div>
      )}
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <Briefcase size={26} />
          </div>
          <div className="flex items-center gap-2">
            {jobIsNew && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Yeni</span>
            )}
            {md && (
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${md.score >= 90 ? 'bg-amber-400 text-amber-950' :
                md.score >= 70 ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                {md.score >= 90 && '✦ '}%{md.score}
              </span>
            )}
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-all ${job.source?.toLowerCase().includes('indeed')
              ? 'border-blue-200 text-blue-600 bg-blue-50'
              : 'border-slate-200 text-slate-400 bg-white'}`}>
              {job.source || 'İlan'}
            </span>
          </div>
        </div>
        <h3 className="text-[19px] font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-normal line-clamp-2 break-words">
          {job.title}
        </h3>
        <p className="text-slate-500 font-semibold text-sm mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
          {job.company}
        </p>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-4">
          <MapPin size={13} className="text-blue-500" />
          {job.location || 'Uzaktan'}
        </div>
        {md && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400">CV Uyumu</span>
              <span className="text-slate-700">%{md.score}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${md.score}%`,
                  background: md.score >= 90 ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                    : md.score >= 70 ? 'linear-gradient(90deg,#10b981,#059669)'
                      : 'linear-gradient(90deg,#3b82f6,#6366f1)'
                }} />
            </div>
          </div>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {skills.slice(0, 4).map((skill, i) => (
              <span key={i} className={`text-xs font-bold px-3 py-1 rounded-full border border-transparent ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>{skill}</span>
            ))}
            {skills.length > 4 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-400">+{skills.length - 4}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <a href={job.url} target="_blank" rel="noreferrer"
          className="flex-[4] text-center bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-tight">
          İlana Başvur
        </a>
        <button onClick={() => onAnalyze(job)}
          className="flex-1 bg-slate-50 border border-slate-200 text-slate-400 py-3.5 rounded-2xl font-bold text-sm hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-1">
          AI <Sparkles size={14} />
        </button>
      </div>
    </div>
  );
};

// ── Login / Register Sayfası ─────────────────────────────
const AuthPage = ({ onLogin, showToast }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { showToast('Email ve şifre zorunlu.', 'error'); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        await axios.post(`${API_BASE}/auth/register`, { email, password, full_name: fullName });
        showToast('Kayıt başarılı! Giriş yapılıyor...', 'success');
      }
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const res = await axios.post(`${API_BASE}/auth/login`, formData);
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      onLogin(token, email);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center px-4">
      <div className="w-full max-w-md" style={{ animation: 'fadeSlideUp 0.5s ease' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Sparkles size={28} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 font-syne">JobNest <span className="text-blue-600 italic">AI</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Yapay zeka destekli iş arama platformu</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl">
            <button onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
              Giriş Yap
            </button>
            <button onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${mode === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>
              Kayıt Ol
            </button>
          </div>

          {mode === 'register' && (
            <div className="mb-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Ad Soyad</label>
              <input type="text" placeholder="Mustafa Özbezek" value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
            <input type="email" placeholder="ornek@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="mb-6">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Şifre</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-black text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}>
            {loading ? '⟳ Yükleniyor...' : mode === 'login' ? 'Giriş Yap →' : 'Kayıt Ol →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Ana App ───────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [matchData, setMatchData] = useState({});
  const [cvLoading, setCvLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [bestMatchId, setBestMatchId] = useState(null);
  const [cvStatus, setCvStatus] = useState(null);
  const [detectedProfession, setDetectedProfession] = useState(null);
  const [matchCount, setMatchCount] = useState(0);
  const fileRef = useRef();

  const showToast = (message, type = 'info') => setToast({ message, type });

  const handleLogin = (newToken, email) => {
    setToken(newToken);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserEmail('');
    setMatchData({});
    setCvStatus(null);
  };

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/jobs/`)
      .then(res => { setJobs(res.data); setLoading(false); })
      .catch(() => { showToast('İlanlar yüklenemedi.', 'error'); setLoading(false); });
  }, [token]);

  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) { showToast('Sadece PDF yükleyin.', 'error'); return; }

    setCvLoading(true);
    setCvStatus('analyzing');
    setDetectedProfession(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE}/match/upload-cv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 300000,
      });

      const newMatchData = {};
      let topScore = 0, topId = null;

      res.data.matches?.forEach(m => {
        const score = parseFloat(m.match_score?.replace('%', '') || 0);
        newMatchData[m.job_id] = { score, matched: m.matched_skills || [], missing: [] };
        if (score > topScore) { topScore = score; topId = m.job_id; }
      });

      setMatchData(newMatchData);
      setBestMatchId(topId);
      setDetectedProfession(res.data.detected_profession || null);
      setMatchCount(res.data.matches?.length || 0);
      setCvStatus('done');

      const jobsRes = await axios.get(`${API_BASE}/jobs/`);
      setJobs(jobsRes.data);

      showToast(`Analiz tamam! ${res.data.matches?.length || 0} eşleşme bulundu.`, 'success');
    } catch {
      showToast('CV yüklenirken hata oluştu.', 'error');
      setCvStatus(null);
    } finally {
      setCvLoading(false);
      e.target.value = '';
    }
  };

  const sortedAndFiltered = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = jobs.filter(job => {
      const matchesSearch = !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.skills?.toLowerCase().includes(q);
      const matchesLocation = !locationFilter ||
        job.location?.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });

    if (Object.keys(matchData).length === 0) {
      return [...filtered].sort((a, b) => b.id - a.id);
    }

    return [...filtered].sort((a, b) => {
      const scoreA = matchData[a.id]?.score || 0;
      const scoreB = matchData[b.id]?.score || 0;
      return scoreB - scoreA;
    });
  }, [jobs, search, locationFilter, matchData]);

  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].slice(0, 8);

  if (!token) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
          * { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
          h1,h2,h3,.font-syne { font-family: 'Syne', sans-serif; }
          @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <AuthPage onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        h1,h2,h3,.font-syne { font-family: 'Syne', sans-serif; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:3.2rem; }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      {cvStatus === 'analyzing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,15,35,0.88)', backdropFilter: 'blur(14px)' }}>
          <div className="text-center px-8" style={{ animation: 'fadeSlideUp 0.4s ease' }}>
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500"
                style={{ animation: 'spin 1s linear infinite' }} />
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-violet-400"
                style={{ animation: 'spin 0.8s linear infinite reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
            </div>
            <h2 className="text-white text-4xl font-black font-syne mb-3">AI Analiz Ediyor...</h2>
            <p className="text-indigo-300 font-medium text-lg mb-1">CV'n okunuyor, mesleğin tespit ediliyor</p>
            <p className="text-slate-400 text-sm mb-8">Kariyer.net + Indeed taranıyor, lütfen bekle</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                  style={{ animation: `bounce 1s ease ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f0f4ff]">
        <nav className="sticky top-0 z-30 border-b border-white/60"
          style={{ background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                <Sparkles size={18} />
              </div>
              <span className="text-xl font-black tracking-tight font-syne">
                JobNest <span className="text-blue-600 italic">AI</span>
              </span>
              {jobs.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-full">{jobs.length} ilan</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <User size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{userEmail || 'Kullanıcı'}</span>
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={cvLoading}
                className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 20px rgba(79,70,229,0.35)' }}>
                {cvLoading
                  ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Analiz...</>
                  : <><Upload size={16} /> CV Analiz Et</>}
              </button>
              <button onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all">
                <LogOut size={16} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} />
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <header className="mb-8" style={{ animation: 'fadeSlideUp 0.5s ease both' }}>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight font-syne">
              Kariyer Yolculuğunu <br /><span className="text-blue-600">Optimize Et.</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2">Yapay zeka senin için piyasayı taradı.</p>
          </header>

          {cvStatus === 'done' && detectedProfession && (
            <div className="mb-8 rounded-3xl p-6 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', animation: 'fadeSlideUp 0.5s ease' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🎯</div>
                <div>
                  <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">AI Meslek Tespiti</p>
                  <h3 className="text-white text-2xl font-black font-syne">{detectedProfession} tespit edildi!</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-2xl px-6 py-3 text-center">
                  <p className="text-white text-3xl font-black font-syne">{jobs.length}</p>
                  <p className="text-indigo-200 text-xs font-bold mt-0.5">ilan tarandı</p>
                </div>
                <div className="bg-white/20 rounded-2xl px-6 py-3 text-center">
                  <p className="text-white text-3xl font-black font-syne">{matchCount}</p>
                  <p className="text-indigo-200 text-xs font-bold mt-0.5">eşleşme bulundu</p>
                </div>
                <button onClick={() => setCvStatus(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xl transition-colors">×</button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6" style={{ animation: 'fadeSlideUp 0.5s ease 0.1s both' }}>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Pozisyon, şirket veya teknoloji ara..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm" />
            </div>
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm min-w-44">
              <option value="">Tüm Konumlar</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : sortedAndFiltered.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  matchData={matchData}
                  index={i}
                  onAnalyze={setActiveModal}
                  isBestMatch={job.id === bestMatchId}
                />
              ))
            }
          </div>
        </main>
      </div>

      {activeModal && <AIModal job={activeModal} matchData={matchData} onClose={() => setActiveModal(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}