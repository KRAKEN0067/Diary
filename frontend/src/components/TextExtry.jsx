import React, { useEffect } from "react";
import { useState } from "react";

const TextEntry = ({ day, month, year, onClose }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const monthMap = new Map([
  ["january", 1],
  ["february", 2],
  ["march", 3],
  ["april", 4],
  ["may", 5],
  ["june", 6],
  ["july", 7],
  ["august", 8],
  ["september", 9],
  ["october", 10],
  ["november", 11],
  ["december", 12],
]);

  const formattedDate = `${year}-${String(monthMap.get(month)).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  useEffect(()=>{
    fetch(`/api/get_content/?date=${formattedDate}`)
    .then(res=>res.json())
    .then(data=>{
      setText(data.content || "");
    });
  },[formattedDate]);

  const handleSave = async() => {
    // if (!text.trim()) return;
    setLoading(true);

    await fetch("/api/save_content/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: formattedDate,
        content: text,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Saved:", result);
        setLoading(false);
        onClose();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
      onClose();
      window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 max-w-screen max-h-screen">
      <div className="bg-white w-full max-w-1/2 h-3/4 rounded-none shadow-2xl p-6 flex flex-col">
        
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Diary Entry</h2>
          <p className="text-sm text-gray-500">
            {day} {month} {year}
          </p>
        </div>

        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="6"
          placeholder="Write your thoughts here..."
          className="w-full h-full border border-gray-300 rounded-lg p-3
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     resize-none"
        />

        
        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700
                       hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white
                       hover:bg-indigo-700 transition disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEntry;
