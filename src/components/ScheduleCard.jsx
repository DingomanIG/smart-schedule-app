import { useState } from 'react';
import { Clock, MapPin, Check, GripVertical } from 'lucide-react';

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const CATEGORY_STYLES = {
  개인: 'bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300',
  업무: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  건강: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  학습: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  기타: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function ScheduleCard({
  title,
  time,
  location,
  category = '개인',
  priority = 'medium',
  completed = false,
  onToggleComplete,
  onDragStart,
  onDragEnd,
}) {
  const [isCompleted, setIsCompleted] = useState(completed);

  const handleToggle = () => {
    const next = !isCompleted;
    setIsCompleted(next);
    onToggleComplete?.(next);
  };

  const priorityBar = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.기타;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        group flex w-[380px] h-[140px] rounded-2xl overflow-hidden
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        shadow-sm hover:shadow-md
        hover:scale-[1.02] transition-all duration-200 cursor-grab active:cursor-grabbing
      `}
    >
      {/* Priority Bar */}
      <div className={`w-[5px] shrink-0 ${priorityBar}`} />

      {/* Drag Handle */}
      <div className="flex items-center justify-center w-6 shrink-0">
        <GripVertical
          size={16}
          className="text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 py-3.5 pr-4 pl-1 gap-2 min-w-0">
        {/* Top: Badge + Checkbox */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryStyle}`}
          >
            {category}
          </span>

          <button
            type="button"
            onClick={handleToggle}
            className={`
              w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0 transition-colors
              ${isCompleted
                ? 'bg-blue-500 text-white'
                : 'border-2 border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400'
              }
            `}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>
        </div>

        {/* Title */}
        <p
          className={`text-[17px] font-bold truncate ${
            isCompleted
              ? 'text-gray-400 dark:text-slate-500 line-through'
              : 'text-gray-800 dark:text-slate-100'
          }`}
        >
          {title}
        </p>

        {/* Time + Location */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {time && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <Clock size={14} className="shrink-0" />
              <span className="text-[13px] truncate">{time}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <MapPin size={14} className="shrink-0" />
              <span className="text-[13px] truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
