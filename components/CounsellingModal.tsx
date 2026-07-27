'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Loader2, MessageSquare, Download } from 'lucide-react';

interface SelectedCollegeItem {
  college_id?: string | number;
  college_name?: string;
  name?: string;
  state_name?: string;
  state?: string;
  city_name?: string;
  city?: string;
  college_type?: string;
  closest_cutoff?: number;
  best_chance?: string;
  counsellingDetail?: any;
}

interface CounsellingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'counselling' | 'handbook';
}

export default function CounsellingModal({ isOpen, onClose, mode = 'counselling' }: CounsellingModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // Auto-filled read-only values from localStorage for WhatsApp message payload
  const [rank, setRank] = useState('AIR 106');
  const [examType, setExamType] = useState('NEET UG');
  const [course, setCourse] = useState('MBBS');
  const [category, setCategory] = useState('General / All Categories');
  const [preferredStates, setPreferredStates] = useState('KA ( KA means Karnataka )');

  const [selectedColleges, setSelectedColleges] = useState<SelectedCollegeItem[]>([]);
  const [favColleges, setFavColleges] = useState<string[]>([]);
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [generatedWaUrl, setGeneratedWaUrl] = useState('');

  const isHandbook = mode === 'handbook';

  // Read data from localStorage whenever modal opens
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    try {
      const storedRank = localStorage.getItem('predict_rank');
      const storedExamType = localStorage.getItem('predict_examType');
      const storedCourse = localStorage.getItem('predict_course');
      const storedCategory = localStorage.getItem('predict_category');
      const storedStates = localStorage.getItem('predict_states');
      const storedColleges = localStorage.getItem('selectCollege') || localStorage.getItem('selectedColleges');

      if (storedRank) {
        setRank(storedRank.startsWith('AIR') ? storedRank : `AIR ${storedRank}`);
      } else {
        setRank('AIR 106');
      }

      if (storedExamType) {
        setExamType(storedExamType.replace(/_/g, ' '));
      } else {
        setExamType('NEET UG');
      }

      if (storedCourse && storedCourse !== 'ALL') {
        setCourse(storedCourse);
      } else {
        setCourse('MBBS');
      }

      if (storedCategory && storedCategory !== 'ALL') {
        setCategory(storedCategory === 'UR' ? 'General (UR)' : storedCategory);
      } else {
        setCategory('General / All Categories');
      }

      if (storedStates) {
        try {
          const parsed = JSON.parse(storedStates);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const hasKA = parsed.includes('KA') || parsed.includes('Karnataka');
            setPreferredStates(hasKA ? 'KA ( KA means Karnataka )' : parsed.join(', '));
          } else {
            setPreferredStates('KA ( KA means Karnataka )');
          }
        } catch {
          setPreferredStates('KA ( KA means Karnataka )');
        }
      } else {
        setPreferredStates('KA ( KA means Karnataka )');
      }

      if (storedColleges) {
        try {
          const parsedColleges = JSON.parse(storedColleges);
          if (Array.isArray(parsedColleges)) {
            setSelectedColleges(parsedColleges);
            const collegeNames = parsedColleges.map(
              (c: any) => c.college_name || c.name || 'Medical College'
            );
            setFavColleges(collegeNames);
          }
        } catch {}
      }
    } catch (e) {
      console.error('Error reading localStorage in CounsellingModal:', e);
    }
  }, [isOpen]);

  // Lock background page scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSuccess(false);
      setError('');
      setGeneratedWaUrl('');
      setLoading(false);
    }, 300);
  };

  const formatWhatsAppMessage = () => {
    if (isHandbook) {
      let msg = `Requesting Free NEET UG Counselling Handbook\n\n`;
      msg += `Student Name: ${name || 'Student'}\n`;
      msg += `Course: ${course || 'MBBS'}\n`;
      msg += `Target State: Karnataka (KA)\n`;
      msg += `Please send the complete PDF Counselling Guide to my WhatsApp number.`;
      return msg;
    }

    let msg = `This is your counselling kit\n\n`;
    msg += `NEET All India Rank : ${rank || 'AIR 106'}\n`;
    msg += `NEET Exam : ${examType || 'NEET UG'}\n`;
    msg += `Course : ${course || 'MBBS'}\n`;
    msg += `Category : ${category || 'General / All Categories'}\n`;
    msg += `Preferred States : ${preferredStates || 'KA ( KA means Karnataka )'}\n\n`;

    if (selectedColleges.length > 0) {
      msg += `Selected Colleges & Counselling Timeline Details:\n\n`;
      selectedColleges.forEach((c: any, i: number) => {
        const cName = c.college_name || c.name || `College ${i + 1}`;
        const cState = c.state_name || c.state || 'Karnataka';
        const cCity = c.city_name || c.city || '';
        const cType = c.college_type || c.type || 'Government';
        const cutoff = c.closest_cutoff ? `AIR ~${c.closest_cutoff.toLocaleString('en-IN')}` : 'TBA';
        const chance = c.best_chance || 'High';

        msg += `${i + 1}. ${cName}${cCity ? ` (${cCity}, ${cState})` : ` (${cState})`}\n`;
        msg += `   • Type: ${cType} | Closing Cutoff: ${cutoff} | Chance: ${chance}\n`;

        const detail = c.counsellingDetail;
        if (detail && Array.isArray(detail.events) && detail.events.length > 0) {
          msg += `   • Counselling Timeline & Schedule:\n`;
          detail.events.forEach((ev: any) => {
            const startDate = ev.startDate || ev.date || 'TBA';
            const endDate = ev.endDate ? ` to ${ev.endDate}` : '';
            const status = ev.status ? ` [${ev.status.toUpperCase()}]` : '';
            msg += `     - ${ev.event || ev.stage || 'Phase'}: ${startDate}${endDate}${status}\n`;
            if (ev.additionalDetails) {
              msg += `       Info: ${ev.additionalDetails}\n`;
            }
          });
        }
        msg += `\n`;
      });
    } else if (favColleges.length > 0) {
      msg += `Selected Colleges:\n`;
      favColleges.forEach((cName, i) => {
        msg += `${i + 1}. ${cName}\n`;
      });
    } else {
      msg += `Selected Colleges : Karnataka Premier Medical & Dental Colleges\n`;
    }

    if (name) msg += `\nStudent Name: ${name}`;

    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedMessage = formatWhatsAppMessage();

    // Clean phone number (digits only)
    let cleanMobile = (mobile || '').replace(/\D/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = `91${cleanMobile}`;
    }

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(formattedMessage)}`;
    setGeneratedWaUrl(waUrl);

    try {
      // 1. Submit lead to expert-help backend
      await fetch('/api/expert-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: mobile,
          email,
          course,
          score: rank,
          exam: examType,
          category,
          states: preferredStates,
          colleges: favColleges.length > 0 ? favColleges : selectedColleges.map(c => c.college_name || c.name),
          message: formattedMessage,
          requestType: isHandbook ? 'Handbook Download' : 'Counselling Kit Alert'
        }),
      });

      // 2. Log request to whatsapp API endpoint (invokes WATI template message)
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: mobile,
          email,
          rank,
          exam: examType,
          course,
          category,
          states: preferredStates,
          colleges: selectedColleges,
          messageText: formattedMessage
        }),
      });

      // 3. Open WhatsApp link directly for immediate user delivery
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto overscroll-contain"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-lg md:max-w-xl my-auto bg-[#090d16] text-white rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col overflow-hidden motion-reduce:animate-none animate-in zoom-in-95 duration-200"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
      >
        {/* ===== FIXED HEADER ===== */}
        <div className="relative shrink-0 px-5 sm:px-7 md:px-8 pt-5 sm:pt-7 md:pt-8 pb-3 border-b border-slate-800/60 bg-[#090d16] z-10">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {!success && (
            <div className="text-center pr-8">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase mb-2">
                {isHandbook ? <Download className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {isHandbook ? 'Free NEET Handbook' : 'WhatsApp Counselling Alert'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug break-words">
                {isHandbook ? 'Download Free NEET Counselling Guide' : 'Get Your Counselling Kit on WhatsApp'}
              </h2>
            </div>
          )}
        </div>

        {/* ===== SCROLLABLE CONTENT ===== */}
        {success ? (
          <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-5 sm:px-7 md:px-8 py-6 sm:py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h4 className="font-extrabold text-white text-xl sm:text-2xl">
              {isHandbook ? 'Handbook Sent!' : 'Counselling Kit Ready!'}
            </h4>

            <p className="text-sm text-slate-300 font-semibold max-w-md mx-auto leading-relaxed">
              {isHandbook
                ? `Your free NEET UG Counselling Handbook guide has been sent to your WhatsApp number ${mobile}!`
                : `Your personalized NEET Counselling Kit & College Timelines have been sent to your WhatsApp number ${mobile}!`}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {generatedWaUrl && (
                <a
                  href={generatedWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Open WhatsApp Chat
                </a>
              )}

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 px-5 sm:px-7 md:px-8 py-4 space-y-4 text-left">
              
              {/* Full Name */}
              <div>
                <label htmlFor="ccm-name" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  id="ccm-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl bg-[#0b0f19] border border-slate-800 px-4 py-3 text-base sm:text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* WhatsApp + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ccm-mobile" className="block text-xs font-bold text-slate-300 mb-1.5">
                    WhatsApp Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="ccm-mobile"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl bg-[#0b0f19] border border-slate-800 px-4 py-3 text-base sm:text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="ccm-email" className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="ccm-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl bg-[#0b0f19] border border-slate-800 px-4 py-3 text-base sm:text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Handbook vs Counselling Specific Fields */}
              {isHandbook ? (
                <div>
                  <label htmlFor="ccm-course-select" className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target NEET Course
                  </label>
                  <div className="relative">
                    <select
                      id="ccm-course-select"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full rounded-xl bg-[#0b0f19] border border-slate-800 px-4 py-3 text-base sm:text-sm text-white outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="MBBS">MBBS</option>
                      <option value="BDS">BDS</option>
                      <option value="MD/MS">MD/MS</option>
                      <option value="MDS">MDS</option>
                      <option value="BAMS">BAMS</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Course + Rank + State (Disabled / Read-only Auto-filled Fields) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        NEET Course
                      </label>
                      <input
                        type="text"
                        value={course}
                        readOnly
                        tabIndex={-1}
                        className="w-full rounded-xl bg-[#080b12] border border-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-300 outline-none cursor-not-allowed select-none opacity-90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        NEET Rank / Marks
                      </label>
                      <input
                        type="text"
                        value={rank}
                        readOnly
                        tabIndex={-1}
                        className="w-full rounded-xl bg-[#080b12] border border-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-300 outline-none cursor-not-allowed select-none opacity-90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">
                        Target State
                      </label>
                      <input
                        type="text"
                        value="Karnataka (KA)"
                        readOnly
                        tabIndex={-1}
                        className="w-full rounded-xl bg-[#080b12] border border-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-emerald-400 outline-none cursor-not-allowed select-none opacity-90"
                      />
                    </div>
                  </div>

                  {/* Selected Colleges Display List (Read-only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Selected Counselling Medical Colleges ({favColleges.length})
                      </label>
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                        Auto-filled from Predictor
                      </span>
                    </div>

                    {favColleges.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800">
                        {favColleges.map((col, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-xs font-bold select-none"
                          >
                            <span>{i + 1}. {col}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800 text-xs text-slate-400 font-semibold text-center">
                        Karnataka Top Government &amp; Private Medical Colleges (All)
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Consent */}
              <div className="pt-1 pb-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-[#0b0f19] text-emerald-600 focus:ring-0 accent-emerald-600 shrink-0"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed font-medium">
                    I agree to receive {isHandbook ? 'the Free Counselling Handbook' : 'my personalized Counselling Kit'} on WhatsApp (<span className="text-emerald-400 font-bold">{mobile || 'your number'}</span>) &amp; Email.
                  </span>
                </label>
              </div>

            </div>

            {/* ===== FIXED FOOTER ===== */}
            <div className="shrink-0 px-5 sm:px-7 md:px-8 pt-3 pb-5 sm:pb-7 md:pb-8 border-t border-slate-800/60 bg-[#090d16]">
              {error && <p className="text-xs text-rose-400 font-bold break-words mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {isHandbook ? 'Preparing Guide...' : 'Preparing Counselling Kit...'}
                  </span>
                ) : (
                  <>
                    {isHandbook ? <Download className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    {isHandbook ? 'Download Free Guide' : 'Alert my counselling window on WhatsApp'}
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                Instant delivery to your WhatsApp number. No spam.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}