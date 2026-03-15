import { useState } from 'react';
import { Heart, Calendar, CheckCircle, Info, ShieldCheck, Loader2, Clock } from 'lucide-react';
import api from '../services/api';
import ParticleBackground from '../components/common/ParticleBackground';

const TODAY = new Date().toISOString().split('T')[0];

const isWeekend = (dateStr) => {
    const day = new Date(dateStr + 'T00:00:00.000Z').getUTCDay();
    return day === 0 || day === 6;
};

const MentalHealth = () => {
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTimings, setShowTimings] = useState(false);

    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState('');

    const [bookingData, setBookingData] = useState({
        studentId: '',
        email: '',
        appointmentDate: '',
        slotTime: '',
        reason: 'anxiety',
    });

    const handleDateChange = async (dateStr) => {
        setBookingData((prev) => ({ ...prev, appointmentDate: dateStr, slotTime: '' }));
        setSlots([]);
        setSlotsError('');
        if (!dateStr) return;
        if (isWeekend(dateStr)) {
            setSlotsError('Counseling is not available on weekends. Please choose a weekday (Mon–Fri).');
            return;
        }
        setSlotsLoading(true);
        try {
            const res = await api.get(`/admin/appointments/slots?date=${dateStr}`);
            setSlots(res.data.data.slots);
        } catch (err) {
            setSlotsError(err.response?.data?.error || 'Could not load available slots. Please try again.');
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bookingData.slotTime) {
            setSlotsError('Please select a time slot before confirming.');
            return;
        }
        setIsSubmitting(true);
        setSlotsError('');
        try {
            await api.post('/admin/appointments', bookingData);
            setBookingSuccess(true);
            setTimeout(() => {
                setIsBooking(false);
                setBookingSuccess(false);
                setBookingData({ studentId: '', email: '', appointmentDate: '', slotTime: '', reason: 'anxiety' });
                setSlots([]);
                setSlotsError('');
            }, 3000);
        } catch (err) {
            setSlotsError(err.response?.data?.error || 'System error. Please call the hotline for immediate assistance.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsBooking(false);
        setSlots([]);
        setSlotsError('');
        setBookingData({ studentId: '', email: '', appointmentDate: '', slotTime: '', reason: 'anxiety' });
    };

    return (
        <div className="pt-24 md:pt-32 pb-20 px-4 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
            <ParticleBackground variant="low" />
            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                
                {/* ── Hero Section ───────────────────────────────────── */}
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        Confidential Support
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        Priority: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">Your Wellbeing</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
                        Access dedicated mental health resources, anonymous counseling, and professional support tailored for the student journey.
                    </p>
                    <div className="pt-4">
                        <button 
                            onClick={() => setIsBooking(true)}
                            className="btn-primary !bg-rose-600 hover:!bg-rose-700 !px-10 !py-4 !rounded-xl !text-base group shadow-sm"
                        >
                            Request Private Session
                            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* ── Walk-In Counseling ────────────────────────────── */}
                <div className="card-base p-8 md:p-12 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mt-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center border border-rose-100 dark:border-rose-800/50 flex-shrink-0">
                                <Info className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Walk-In Counseling</h3>
                                <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xl text-base leading-relaxed">
                                    Need immediate support? Drop by our campus center for same-day triage and consultation. No prior appointment is necessary.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4 shrink-0">
                            <button 
                                className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                                onClick={() => setShowTimings(!showTimings)}
                            >
                                <Calendar className="w-5 h-5" />
                                {showTimings ? 'Hide Timings' : 'View Timings'}
                            </button>
                        </div>
                    </div>
                    {showTimings && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between animate-in fade-in slide-in-from-top-4 relative z-10 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Operating Hours</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monday - Friday: 9:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-primary/10 dark:bg-brand-secondary/20 rounded-lg flex items-center justify-center shrink-0">
                                    <Info className="w-5 h-5 text-brand-primary dark:text-brand-secondary" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Location</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student Wellness Center, Room 204</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Booking Modal ─────────────────────────────────────── */}
            {isBooking && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeModal} />
                    <div className="card-base w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl">
                        {bookingSuccess ? (
                            <div className="p-12 text-center space-y-6 animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                                    <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Request Received</h3>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">A counselor will reach out to you via email within 2 hours. Hang in there.</p>
                                </div>
                                <div className="pt-4 flex justify-center gap-3">
                                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg">Confirmed</div>
                                    <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 dark:text-brand-secondary text-xs font-bold uppercase tracking-wider rounded-lg">Private</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-sm">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Private Session</h3>
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Counseling Intake Form</p>
                                        </div>
                                    </div>
                                    <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 ml-1">Student ID</label>
                                                <input
                                                    required
                                                    className="input-base text-sm"
                                                    placeholder="e.g. STU882910"
                                                    value={bookingData.studentId}
                                                    onChange={e => setBookingData({ ...bookingData, studentId: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 ml-1">Student Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    className="input-base text-sm"
                                                    placeholder="e.g. alex@university.edu"
                                                    value={bookingData.email}
                                                    onChange={e => setBookingData({ ...bookingData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 ml-1">Preferred Date <span className="normal-case font-medium text-slate-400">(Mon–Fri)</span></label>
                                                <input
                                                    required
                                                    type="date"
                                                    min={TODAY}
                                                    className="input-base text-sm"
                                                    value={bookingData.appointmentDate}
                                                    onChange={e => handleDateChange(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 ml-1">Primary Concern</label>
                                                <select
                                                    className="input-base text-sm"
                                                    value={bookingData.reason}
                                                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                                                >
                                                    <option value="anxiety">Academic Anxiety</option>
                                                    <option value="personal">Personal Wellbeing</option>
                                                    <option value="stress">General Stress</option>
                                                    <option value="other">Other Concerns</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* ── Slot Grid ─────────────────────────────────── */}
                                        {bookingData.appointmentDate && !isWeekend(bookingData.appointmentDate) && (
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Available Time Slots <span className="normal-case font-medium text-slate-400">(9 AM – 4 PM)</span>
                                                </label>
                                                {slotsLoading ? (
                                                    <div className="flex items-center justify-center gap-2 py-6 text-slate-500 dark:text-slate-400 text-sm">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Loading slots…
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {slots.map(slot => (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                disabled={!slot.available}
                                                                onClick={() => slot.available && setBookingData(prev => ({ ...prev, slotTime: slot.time }))}
                                                                className={`py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-0.5 ${
                                                                    !slot.available
                                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-400 dark:text-red-500 cursor-not-allowed'
                                                                        : bookingData.slotTime === slot.time
                                                                        ? 'bg-rose-600 border-rose-600 text-white shadow-md scale-105'
                                                                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer'
                                                                }`}
                                                            >
                                                                {slot.label}
                                                                {!slot.available && (
                                                                    <span className="text-[9px] font-semibold opacity-70 tracking-wide">Booked</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── Error / info message ─────────────────────── */}
                                        {slotsError && (
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-medium">
                                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                                {slotsError}
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !bookingData.slotTime}
                                                className="btn-primary w-full !bg-rose-600 hover:!bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed !py-4 rounded-xl text-base shadow-sm"
                                            >
                                                {isSubmitting ? 'Securing Channel…' : 'Secure My Appointment'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            Your privacy is our highest priority
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentalHealth;
