import React, { useEffect, useRef, useState } from "react";

const months = [
  { name: "January", icon: "ac_unit", color: "text-rose-400" },
  { name: "February", icon: "snowing", color: "text-rose-500" },
  { name: "March", icon: "potted_plant", color: "text-blue-400" },
  { name: "April", icon: "local_florist", color: "text-pink-400" },
  { name: "May", icon: "sunny", color: "text-orange-400" },
  { name: "June", icon: "light_mode", color: "text-cyan-400" },
  { name: "July", icon: "waves", color: "text-purple-400" },
  { name: "August", icon: "icecream", color: "text-sky-400" },
  { name: "September", icon: "eco", color: "text-amber-500" },
  { name: "October", icon: "celebration", color: "text-green-400" },
  { name: "November", icon: "checkroom", color: "text-orange-500" },
  { name: "December", icon: "holiday_village", color: "text-yellow-600" }
];

const HiringCalendar = () => {
  const [calendarData, setCalendarData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/hiring-calendar")
      .then((res) => res.json())
      .then((data) => {
        setCalendarData(data.calendar || {});
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedMonth && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMonth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#e0f2fe] px-8 py-10 text-gray-800 animate-fadeIn">

      {/* PAGE TITLE */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold mb-4 text-black">
          Hiring Calendar 2026
        </h1>

        <p className="text-lg font-semibold text-gray-700">
          Discover peak hiring seasons and prepare at the right time.
        </p>

        <p className="text-base font-medium text-gray-600 mt-2">
          Click on a month to see companies hiring.
        </p>
      </div>

      {/* MONTH GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {months.map((month) => (
          <button
            key={month.name}
            onClick={() => setSelectedMonth(month.name)}
            className={`bg-white/80 backdrop-blur-md px-3 py-7 rounded-2xl shadow-md border 
              transition-all duration-300 ease-out
              hover:shadow-xl hover:-translate-y-1
              ${
                selectedMonth === month.name
                  ? "scale-105 shadow-2xl border-indigo-300 bg-gradient-to-br from-white to-indigo-50"
                  : ""
              }`}
          >
            <div className="flex flex-col items-center gap-4">
              <span
                className={`material-symbols-outlined text-5xl ${month.color}`}
              >
                {month.icon}
              </span>

              <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
                {month.name}
              </h2>
            </div>
          </button>
        ))}
      </div>

      {/* COMPANY DETAILS */}
      {selectedMonth && (
        <div ref={detailsRef} className="mt-24 max-w-4xl mx-auto">

          <h2 className="text-3xl font-extrabold text-center mb-3 text-black">
            {selectedMonth} Hiring
          </h2>

          <div className="w-24 h-1 bg-indigo-300 mx-auto mb-10 rounded-full"></div>

          {calendarData[selectedMonth] &&
          calendarData[selectedMonth].length > 0 ? (
            <div className="space-y-6">
              {calendarData[selectedMonth].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-lg border 
                  flex justify-between items-center
                  transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <p className="font-bold text-xl">
                      {item.company}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.category}
                    </p>
                  </div>

                  <span className="px-4 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold shadow-sm">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No hiring data available.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HiringCalendar;
