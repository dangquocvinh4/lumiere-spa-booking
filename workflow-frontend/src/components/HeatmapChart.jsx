import { useState, useEffect } from 'react';
import api from '../api/axios';
import { LoadingSpinner, ErrorMessage } from './UI';
import { Tooltip } from 'react-tooltip';

export default function HeatmapChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/admin/dashboard/heatmap');
        setData(res.data.data);
      } catch (err) {
        setError('Không thể tải dữ liệu mật độ lịch hẹn.');
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;

  const days = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 7, label: 'CN' }
  ];
  
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21

  // Find max count to scale colors
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getColor = (count) => {
    if (count === 0) return 'bg-emerald-50/50';
    const intensity = count / maxCount;
    if (intensity < 0.3) return 'bg-emerald-200';
    if (intensity < 0.6) return 'bg-emerald-400';
    if (intensity < 0.9) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-premium-lg border border-emerald-100/20 w-full overflow-x-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-serif font-black text-emerald-950">Mật độ khách hàng (Heatmap)</h3>
        <p className="text-xs text-emerald-700/60 font-bold uppercase tracking-widest mt-1">
          Dựa trên số lượng lịch hẹn theo khung giờ và ngày trong tuần
        </p>
      </div>

      <div className="min-w-[700px]">
        {/* Header: Hours */}
        <div className="flex ml-16 mb-2">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-center text-[10px] font-black text-emerald-800/40 uppercase">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Rows: Days */}
        <div className="space-y-2">
          {days.map(day => (
            <div key={day.value} className="flex items-center">
              <div className="w-16 text-[10px] font-black text-emerald-950 uppercase tracking-widest">
                {day.label}
              </div>
              <div className="flex flex-1 gap-1">
                {hours.map(hour => {
                  const cellData = data.find(d => d.day === day.value && d.hour === hour);
                  const count = cellData ? cellData.count : 0;
                  const tooltipId = `heatmap-${day.value}-${hour}`;
                  
                  return (
                    <div 
                      key={hour}
                      data-tooltip-id={tooltipId}
                      className={`flex-1 h-10 rounded-lg transition-all duration-300 cursor-pointer border border-white hover:border-gold hover:scale-110 relative z-10 ${getColor(count)}`}
                    >
                      <Tooltip id={tooltipId} className="!bg-emerald-950 !text-white !rounded-xl !text-xs font-bold !px-4 !py-2 z-50">
                        {day.label} lúc {hour}:00<br/>
                        <span className="text-gold">{count} lịch hẹn</span>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end mt-6 space-x-2 text-[9px] font-black uppercase tracking-widest text-emerald-700/60">
        <span>Thấp</span>
        <div className="w-4 h-4 rounded bg-emerald-50/50"></div>
        <div className="w-4 h-4 rounded bg-emerald-200"></div>
        <div className="w-4 h-4 rounded bg-emerald-400"></div>
        <div className="w-4 h-4 rounded bg-emerald-600"></div>
        <div className="w-4 h-4 rounded bg-emerald-800"></div>
        <span>Cao</span>
      </div>
    </div>
  );
}
