import { useEffect, useState } from "react";
import TextExtry from "./TextExtry";
import { ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const Calendar = () => {
  const [isopen, setisopen] = useState(false);
  const [selectedday, setselectedday] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);

  const handleblockclick = (day) => {
    if (day === 0) return;
    setselectedday(day);
    setisopen(true);
  };

  const closemodal = () => {
    setselectedday(null);
    setisopen(false);
  };
  const [data, setData] = useState(null);

  useEffect(() => {
    // Use the Django JSON endpoint (proxied in Vite config)
    fetch("/api/calendar/")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setCurrentMonth(json.month);
        setCurrentYear(json.year);
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  }, []);

  if (!data) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  const { day_today, month, year, calendar, entry_dates } = data;

  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const monthNameToNum = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  const handleNextMonth = () => {
    let monthIndex = months.indexOf(currentMonth.toLowerCase());
    let year = currentYear;

    monthIndex += 1;

    if (monthIndex === 12) {
      monthIndex = 0;
      year += 1;
    }

    const nextMonthName = months[monthIndex];
    const nextMonthNum = monthNameToNum[nextMonthName];

    fetch("/api/calendar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: nextMonthNum,
        year: year,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setCurrentMonth(json.month);
        setCurrentYear(json.year);
      });
  };

  const handlePrevMonth = () => {
    let monthIndex = months.indexOf(currentMonth.toLowerCase());
    let year = currentYear;

    monthIndex -= 1;

    if (monthIndex < 0) {
      monthIndex = 11;
      year -= 1;
    }

    const prevMonthName = months[monthIndex];
    const prevMonthNum = monthNameToNum[prevMonthName];

    fetch("/api/calendar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: prevMonthNum,
        year: year,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setCurrentMonth(json.month);
        setCurrentYear(json.year);
      });
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between w-full px-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft size={32} />
        </button>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowRight size={32} />
        </button>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{month}</h1>
        <h2 className="text-lg text-gray-500">{year}</h2>
      </div>

      <table className="max-h-full w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 text-center">Mon</th>
            <th className="py-2 text-center">Tue</th>
            <th className="py-2 text-center">Wed</th>
            <th className="py-2 text-center">Thu</th>
            <th className="py-2 text-center">Fri</th>
            <th className="py-2 text-center text-red-500">Sat</th>
            <th className="py-2 text-center text-red-500">Sun</th>
          </tr>
        </thead>

        <tbody>
          {calendar.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => (
                <td
                  key={di}
                  onClick={() => handleblockclick(day)}
                  className={`border-2 h-24  hover:bg-blue-400 border-blue-800 relative
                    ${day === 0 ? "bg-gray-50" : ""}
                    ${entry_dates.includes(day) ? "bg-indigo-100" : ""}
                    ${day === day_today ? "bg-indigo-400 text-white" : ""}`}
                >
                  <div className="w-full h-full p-4  flex items-center justify-center text-2xl">
                    {day !== 0 && day}
                  </div>
                  {entry_dates.includes(day) && (
                    <div className="absolute top-1 right-1">
                      <p className="w-2 h-2 bg-red-500 rounded-full"></p>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {isopen && (
        <TextExtry
          day={selectedday}
          month={month}
          year={year}
          onClose={closemodal}
        />
      )}
    </div>
  );
};

export default Calendar;
