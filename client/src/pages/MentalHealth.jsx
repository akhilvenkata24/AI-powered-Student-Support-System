import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, CalendarDays, Clock, MessageSquare, CheckCircle2, X } from 'lucide-react';
import { createAppointment, getAppointments } from '../services/api';

const MentalHealth = () => {
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHours, setShowHours] = useState(false);
    
    const [formData, setFormData] = useState({ studentId: '', email: '', reason: '' });
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [dateError, setDateError] = useState('');
    const [bookedTimes, setBookedTimes] = useState([]);

    const resources = [
        { id: 'counseling', icon: CalendarDays, title: 'Schedule Therapy', desc: '30-minute in-person sessions with licensed campus counselors.', color: 'from-violet-500 to-indigo-500', glow: 'rgba(139,92,246,0.35)', cta: 'Book Appointment', ctaStyle: 'btn-primary' },
        { id: 'walkin', icon: Clock, title: 'Walk-In Consultations', desc: 'Walk in Mon–Fri, 1–4 PM at Student Union, Room 302. No appointment needed.', color: 'from-blue-500 to-cyan-400', glow: 'rgba(59,130,246,0.35)', cta: 'View Hours', ctaStyle: 'btn-ghost' },
    ];

    // Fetch booked slots when booking modal opens
    useEffect(() => {
        if (isBooking) {
            getAppointments().then(res => {
                if (res.data) {
                    const booked = res.data.map(app => {
                        const date = new Date(app.appointmentDate);
                        const tzOffset = date.getTimezoneOffset() * 60000;
                        return new Date(date - tzOffset).toISOString().slice(0, 16);
                    });
                    setBookedTimes(booked);
                }
            }).catch(err => console.error("Could not fetch appointments", err));
        }
    }, [isBooking]);

    const getMinDate = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 10);
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setSelectedDate('');
            setSelectedTime('');
            setDateError('');
            return;
        }
        const [year, month, ds] = val.split('-');
        const selectedDateObj = new Date(year, month - 1, ds);
        const day = selectedDateObj.getDay();

        // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
            setDateError('Appointments cannot be booked on weekends.');
            setSelectedDate('');
            setSelectedTime('');
            return;
        }

        setDateError('');
        setSelectedDate(val);
        setSelectedTime('');
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let h = 9; h <= 16; h++) {
            const hour = h.toString().padStart(2, '0');
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (dateError || !selectedDate || !selectedTime) {
            alert(dateError || "Please select a valid date and time slot.");
            return;
        }

        const appointmentDateISO = `${selectedDate}T${selectedTime}`;

        setIsSubmitting(true);
        try {
            await createAppointment({ ...formData, appointmentDate: appointmentDateISO });
            setBookingSuccess(true);
            setTimeout(() => {
                setIsBooking(false);
                setBookingSuccess(false);
                setFormData({ studentId: '', email: '', reason: '' });
                setSelectedDate('');
                setSelectedTime('');
                setDateError('');
            }, 3000);
        } catch (error) {
            const msg = error.response?.data?.message || "Booking failed. Please check if the backend is running.";
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCtaClick = (id) => {
        if (id === 'counseling') {
            setIsBooking(true);
        } else if (id === 'walkin') {
            setShowHours(true);
            setTimeout(() => {
                const hoursSection = document.getElementById('hours');
                hoursSection?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">

            {/* bg blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="float-anim absolute top-0 right-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl" />
                <div className="float-anim-delay absolute bottom-0 left-0 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2"
                        style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899)', boxShadow: '0 8px 30px rgba(244,63,94,0.4)' }}>
                        <HeartPulse className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black font-[Outfit] text-white">Student Wellbeing Center</h1>
                    <p className="text-white/50 max-w-xl mx-auto leading-relaxed">
                        Free, confidential mental health support for every enrolled student. You are not alone.
                    </p>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {resources.map(({ id, icon: Icon, title, desc, color, glow, cta, ctaStyle }) => (
                        <div key={title} className="glass-card p-6 flex flex-col gap-4">
                            <div className={`self-start p-3 rounded-xl bg-gradient-to-br ${color}`}
                                style={{ boxShadow: `0 6px 20px ${glow}` }}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg font-[Outfit]">{title}</h3>
                                <p className="text-white/50 text-sm mt-1 leading-relaxed">{desc}</p>
                            </div>
                            <button 
                                onClick={() => handleCtaClick(id)}
                                className={`${ctaStyle} mt-auto text-sm`}
                            >
                                {cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Hours */}
                {showHours && (
                    <div id="hours" className="glass-card p-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-white font-[Outfit]">Counseling Hours</h4>
                            <button onClick={() => setShowHours(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[['Monday – Thursday', '9 AM – 7 PM'], ['Friday', '9 AM – 5 PM'], ['Saturday', '10 AM – 2 PM'], ['Sunday / Holidays', 'Crisis Line Only']].map(([day, time]) => (
                                <div key={day} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/8">
                                    <Clock className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-white/70 font-medium">{day}</p>
                                        <p className="text-white/40 text-xs">{time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <Link to="/chat" className="btn-ghost text-sm gap-2">
                        <MessageSquare className="w-4 h-4" /> Chat with AI for Resources
                    </Link>
                </div>

            </div>

            {/* Booking Modal */}
            {isBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setIsBooking(false)} />
                    <div className="glass-card w-full max-w-lg relative p-8 animate-in fade-in zoom-in duration-200 hide-scrollbar overflow-y-auto max-h-[90vh]">
                        {bookingSuccess ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Appointment Set!</h3>
                                <p className="text-white/50 text-sm">Check your email for confirmation.</p>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsBooking(false)}
                                    className="absolute top-4 right-4 text-white/40 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <h3 className="text-xl font-black text-white mb-6 font-[Outfit]">Book a Session</h3>
                                <form onSubmit={handleBooking} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1 ml-1">Student ID</label>
                                            <input 
                                                type="text" required className="dark-input !py-2.5 !text-sm" placeholder="e.g. STU882910"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1 ml-1">Contact Email</label>
                                            <input 
                                                type="email" required className="dark-input !py-2.5 !text-sm" placeholder="john@university.edu"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1 ml-1">Reason</label>
                                        <select 
                                            required className="dark-input !py-2.5 !text-sm"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        >
                                            <option value="" className="bg-[#1a1a2e]">Select reason</option>
                                            <option value="Academic Support" className="bg-[#1a1a2e]">Academic Stress</option>
                                            <option value="Personal Wellness" className="bg-[#1a1a2e]">Personal Wellness</option>
                                            <option value="Career Anxiety" className="bg-[#1a1a2e]">Career Anxiety</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1 ml-1">Select Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            className="dark-input !py-2.5 !text-sm"
                                            style={{ colorScheme: 'dark' }} 
                                            min={getMinDate()}
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                        />
                                        {dateError && <p className="text-rose-400 text-xs mt-1.5 ml-1">{dateError}</p>}
                                    </div>

                                    {selectedDate && !dateError && (
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2 ml-1">Available Time Slots</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {generateTimeSlots().map(time => {
                                                    const datetimeStr = `${selectedDate}T${time}`;
                                                    const isBooked = bookedTimes.includes(datetimeStr);
                                                    
                                                    const now = new Date();
                                                    const tzOffset = now.getTimezoneOffset() * 60000;
                                                    const localNow = new Date(now - tzOffset).toISOString().slice(0, 16);
                                                    const isPast = datetimeStr < localNow;

                                                    const isDisabled = isBooked || isPast;

                                                    return (
                                                        <button 
                                                            key={time}
                                                            type="button"
                                                            disabled={isDisabled}
                                                            onClick={() => setSelectedTime(time)}
                                                            className={`py-2 text-xs rounded-xl border transition-colors ${
                                                                isDisabled ? 'bg-white/5 border-rose-500/20 text-rose-400 cursor-not-allowed opacity-50' :
                                                                selectedTime === time ? 'bg-violet-500 border-violet-400 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                        >
                                                            {time}
                                                            {isDisabled && <span className="block text-[8px] uppercase mt-0.5 font-bold">{isBooked ? 'Occupied' : 'Passed'}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {!selectedTime && <p className="text-violet-300 text-xs mt-2 ml-1">Please select a time slot to continue.</p>}
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !!dateError || !selectedTime}
                                        className="w-full btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentalHealth;
