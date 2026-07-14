import { useMemo } from 'react';
import { Clock, User, AlertTriangle } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

export default function TimelineView({ appointments, staffList, filterDate }) {
  // Use selected date or today
  const targetDateStr = filterDate || new Date().toISOString().split('T')[0];
  const targetDate = new Date(targetDateStr);

  // Constants
  const startHour = 8;
  const endHour = 22;
  const totalHours = endHour - startHour;

  // Filter appointments for the target date and valid staff
  const dailyAppointments = useMemo(() => {
    return appointments.filter(app => {
      if (app.status === 'CANCELLED') return false;
      const appDate = new Date(app.startAt).toISOString().split('T')[0];
      return appDate === targetDateStr && app.staff;
    });
  }, [appointments, targetDateStr]);

  // Group by staff
  const groupedAppointments = useMemo(() => {
    const groups = {};
    staffList.forEach(staff => {
      groups[staff.id] = { staff, appointments: [] };
    });
    
    dailyAppointments.forEach(app => {
      if (groups[app.staff.id]) {
        groups[app.staff.id].appointments.push(app);
      }
    });
    
    // Only return staff who have appointments or we just return all?
    // Returning all staff helps see who is free.
    return Object.values(groups);
  }, [dailyAppointments, staffList]);

  // Helper to calculate left and width
  const calculatePosition = (startAt, endAt) => {
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    
    const startMinsFrom8 = (startDate.getHours() - startHour) * 60 + startDate.getMinutes();
    const durationMins = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    
    // Clamp to timeline boundaries
    const safeStartMins = Math.max(0, startMinsFrom8);
    const safeDurationMins = Math.min(durationMins, (totalHours * 60) - safeStartMins);
    
    const leftPercent = (safeStartMins / (totalHours * 60)) * 100;
    const widthPercent = (safeDurationMins / (totalHours * 60)) * 100;
    
    return { left: `${leftPercent}%`, width: `${widthPercent}%` };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-400 border-amber-500 text-amber-950';
      case 'CONFIRMED': return 'bg-blue-400 border-blue-500 text-blue-950';
      case 'CHECKED_IN': return 'bg-emerald-500 border-emerald-600 text-white';
      case 'COMPLETED': return 'bg-gray-400 border-gray-500 text-white';
      default: return 'bg-gray-200 border-gray-300 text-gray-700';
    }
  };

  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  if (staffList.length === 0) {
    return <div className="p-8 text-center text-gray-500">Vui lòng chọn chi nhánh để xem lưới thời gian.</div>;
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-premium-xl border border-emerald-100/20 overflow-hidden custom-scrollbar overflow-x-auto p-6">
      <div className="min-w-[900px]">
        
        {/* Header: Time axis */}
        <div className="flex ml-48 border-b border-gray-200 mb-2 relative h-8">
          {hours.map(hour => (
            <div key={hour} className="absolute text-[10px] font-black text-gray-400 uppercase tracking-widest -translate-x-1/2" style={{ left: `${((hour - startHour) / totalHours) * 100}%` }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Rows: Staff */}
        <div className="space-y-4">
          {groupedAppointments.map(group => (
            <div key={group.staff.id} className="flex relative items-center h-16 group/row">
              {/* Staff Info (Sticky left if we want, but simple for now) */}
              <div className="w-48 shrink-0 pr-4 flex items-center space-x-3 bg-white z-10 border-r border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                  {group.staff.user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <p className="font-bold text-gray-900 text-sm truncate" title={group.staff.user?.fullName}>{group.staff.user?.fullName}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{group.staff.title}</p>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="flex-1 h-full relative bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100/50">
                {/* Background Grid Lines */}
                {hours.slice(0, -1).map(hour => (
                  <div key={hour} className="absolute top-0 bottom-0 border-l border-dashed border-gray-200/50" style={{ left: `${((hour - startHour) / totalHours) * 100}%` }} />
                ))}

                {/* Appointments Blocks */}
                {group.appointments.map(app => {
                  const pos = calculatePosition(app.startAt, app.endAt);
                  const isRunningLate = app.status === 'CHECKED_IN' && new Date() > new Date(app.endAt);
                  const isDelayed = (app.status === 'PENDING' || app.status === 'CONFIRMED') && new Date() > new Date(app.startAt);
                  const hasWarning = isRunningLate || isDelayed;

                  return (
                    <div 
                      key={app.id}
                      className={`absolute top-2 bottom-2 rounded-lg border flex flex-col justify-center px-2 overflow-hidden shadow-sm cursor-pointer hover:scale-[1.02] transition-transform duration-200 z-20 ${getStatusColor(app.status)} ${hasWarning ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}
                      style={{ left: pos.left, width: pos.width }}
                      data-tooltip-id={`tooltip-${app.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-wider truncate leading-tight flex-1">
                          {app.customer?.fullName}
                        </p>
                        {hasWarning && <AlertTriangle className="w-3 h-3 text-rose-500 ml-1 shrink-0" />}
                      </div>
                      <p className="text-[9px] opacity-90 truncate mt-0.5">
                        {app.services?.[0]?.serviceName}
                      </p>
                      <Tooltip id={`tooltip-${app.id}`} place="top" className="z-50 !bg-gray-900 !rounded-xl !p-3">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-sm">{app.customer?.fullName}</p>
                          <p className="text-gray-300 text-xs">{app.services?.[0]?.serviceName}</p>
                          <div className="flex items-center text-gold text-xs mt-2 font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(app.startAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(app.endAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <p className="text-xs text-emerald-400 font-bold mt-1 uppercase">Trạng thái: {app.status}</p>
                          {isRunningLate && <p className="text-xs text-rose-400 font-bold mt-1">⚠️ Đang bị lố giờ dự kiến</p>}
                          {isDelayed && <p className="text-xs text-rose-400 font-bold mt-1">⚠️ Lịch hẹn đang bị trễ so với giờ đặt</p>}
                        </div>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
