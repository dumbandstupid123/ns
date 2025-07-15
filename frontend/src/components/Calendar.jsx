import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, toDate } from 'date-fns';
import './Calendar.css';

const MinimalistCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="calendar-header-pro">
      <button onClick={prevMonth} className="calendar-nav-btn">
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="calendar-month-year">
        {format(currentMonth, 'MMMM yyyy')}
      </div>
      <button onClick={nextMonth} className="calendar-nav-btn">
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = [];
    const dateFormat = "EEEEE";
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="day-of-week" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days-of-week-grid">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const today = new Date();

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            className={`calendar-day-cell ${
              !isSameMonth(day, monthStart)
                ? "disabled"
                : isSameDay(day, selectedDate)
                ? "selected"
                : isSameDay(day, today) 
                ? "today" 
                : ""
            }`}
            key={day}
            onClick={() => setSelectedDate(toDate(cloneDay))}
          >
            <span className="day-number">{format(day, "d")}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="calendar-row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
    <div className="calendar-widget-pro">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
};

export default MinimalistCalendar;
