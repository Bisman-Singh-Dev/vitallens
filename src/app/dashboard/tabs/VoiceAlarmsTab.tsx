"use client";

import { useState, useEffect } from "react";
import { AlarmClock, Plus, Trash2, Clock, Calendar } from "lucide-react";

export type Alarm = {
  id: string;
  time: string; // HH:MM format
  days: string[]; // ["Mon", "Tue"] or ["Everyday"]
  message: string;
  isActive: boolean;
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function VoiceAlarmsTab() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTime, setNewTime] = useState("08:00");
  const [newMessage, setNewMessage] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Everyday"]);

  useEffect(() => {
    const saved = localStorage.getItem("roboDocAlarms");
    if (saved) {
      setAlarms(JSON.parse(saved));
    }
  }, []);

  const saveAlarms = (updated: Alarm[]) => {
    setAlarms(updated);
    localStorage.setItem("roboDocAlarms", JSON.stringify(updated));
  };

  const toggleDay = (day: string) => {
    if (day === "Everyday") {
      setSelectedDays(["Everyday"]);
      return;
    }
    
    let updated = selectedDays.filter(d => d !== "Everyday");
    if (updated.includes(day)) {
      updated = updated.filter(d => d !== day);
    } else {
      updated.push(day);
    }
    
    if (updated.length === 0) updated = ["Everyday"];
    setSelectedDays(updated);
  };

  const handleAdd = () => {
    if (!newMessage.trim()) return;
    
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      days: selectedDays,
      message: newMessage.trim(),
      isActive: true,
    };
    
    saveAlarms([...alarms, newAlarm]);
    setIsAdding(false);
    setNewMessage("");
    setNewTime("08:00");
    setSelectedDays(["Everyday"]);
  };

  const handleDelete = (id: string) => {
    saveAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleActive = (id: string) => {
    saveAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlarmClock className="w-6 h-6 text-neon-red" />
            Voice Alarms & Reminders
          </h2>
          <p className="text-sm text-gray-400 mt-1">Schedule custom messages for RoboDoc to say out loud.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-red/20 text-neon-red rounded-lg font-medium hover:bg-neon-red/30 transition-colors border border-neon-red/30"
        >
          <Plus className="w-4 h-4" /> New Alarm
        </button>
      </div>

      {isAdding && (
        <div className="bg-neutral-900 border border-neon-red/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,51,102,0.15)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Message to say out loud</label>
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="e.g., Hey! It's time to take your Vitamin D."
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-neon-red outline-none resize-none h-24"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Time (HH:MM)</label>
              <div className="relative">
                <Clock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="time" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-neon-red outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Days</label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => toggleDay("Everyday")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDays.includes("Everyday") ? 'bg-neon-red text-white' : 'bg-black text-gray-400 border border-neutral-800'}`}
                >
                  Everyday
                </button>
                {ALL_DAYS.map(day => (
                  <button 
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDays.includes(day) ? 'bg-neon-red text-white' : 'bg-black text-gray-400 border border-neutral-800'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              disabled={!newMessage.trim()}
              className="px-6 py-2 bg-neon-red text-white rounded-xl shadow-[0_0_15px_rgba(255,51,102,0.4)] hover:bg-neon-red/80 disabled:opacity-50 transition-colors font-medium"
            >
              Save Alarm
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alarms.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-neutral-800 rounded-2xl text-gray-500">
            <AlarmClock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No alarms scheduled yet.</p>
          </div>
        )}
        
        {alarms.map(alarm => (
          <div key={alarm.id} className={`bg-neutral-900 border ${alarm.isActive ? 'border-neon-red/30' : 'border-neutral-800'} rounded-2xl p-5 relative group transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${alarm.isActive ? 'text-white' : 'text-gray-500'}`}>{alarm.time}</h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" /> 
                  {alarm.days.join(", ")}
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={alarm.isActive} onChange={() => toggleActive(alarm.id)} />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-red"></div>
              </label>
            </div>
            
            <div className="bg-black/50 p-3 rounded-xl border border-neutral-800">
              <p className={`text-sm italic ${alarm.isActive ? 'text-gray-300' : 'text-gray-600'}`}>"{alarm.message}"</p>
            </div>
            
            <button 
              onClick={() => handleDelete(alarm.id)}
              className="absolute top-4 right-16 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
