"use client";

import { Activity, Heart, Moon, Wind } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock data for charts
const heartRateData = [
  { time: "00:00", value: 0 }, { time: "04:00", value: 0 },
  { time: "08:00", value: 0 }, { time: "12:00", value: 0 },
  { time: "16:00", value: 0 }, { time: "20:00", value: 0 },
];

const sleepData = [
  { day: "Mon", hours: 0 }, { day: "Tue", hours: 0 },
  { day: "Wed", hours: 0 }, { day: "Thu", hours: 0 },
  { day: "Fri", hours: 0 }, { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 },
];

export default function MyHealthTab({ user }: { user: any }) {
  const isConnected = false; // Mock state

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Health</h2>
          <p className="text-sm text-gray-400 mt-1">Live metrics from your RoboDoc Band</p>
        </div>
        
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${isConnected ? "bg-green-900/50 text-green-400 border border-green-500/50" : "bg-neutral-900 text-gray-400 border border-neutral-700"}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></div>
          {isConnected ? "Band Connected" : "Not Paired"}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Heart className="w-6 h-6 text-neon-red" />}
          title="Heart Rate"
          value={isConnected ? "72" : "0"}
          unit="bpm"
          trend={isConnected ? "+2 bpm" : "--"}
          trendUp={true}
        />
        <StatCard 
          icon={<Moon className="w-6 h-6 text-neon-red" />}
          title="Sleep"
          value={isConnected ? "7h 12m" : "0h 0m"}
          unit="avg"
          trend={isConnected ? "+15 min" : "--"}
          trendUp={true}
        />
        <StatCard 
          icon={<Wind className="w-6 h-6 text-neon-red" />}
          title="Blood Oxygen"
          value={isConnected ? "98" : "0"}
          unit="%"
          trend={isConnected ? "Stable" : "--"}
          trendUp={true}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heart Rate Chart */}
        <div className="bg-neutral-900 p-6 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)]">
          <h3 className="font-bold text-white mb-6">Heart Rate Trend (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heartRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #ff3366', boxShadow: '0 4px 6px -1px rgba(255,51,102, 0.2)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ff3366" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Chart */}
        <div className="bg-neutral-900 p-6 rounded-3xl border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)]">
          <h3 className="font-bold text-white mb-6">Sleep Duration (7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #ff3366', boxShadow: '0 4px 6px -1px rgba(255,51,102, 0.2)' }}
                  cursor={{ fill: '#222' }}
                />
                <Bar dataKey="hours" fill="#ff3366" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Connection Prompt */}
      {!isConnected && (
        <div className="mt-8 bg-black rounded-2xl p-6 text-center border border-neon-red/30 shadow-[0_0_15px_rgba(255,51,102,0.1)]">
          <Activity className="w-10 h-10 text-neon-red mx-auto mb-3" />
          <h4 className="font-bold text-white mb-2">Connect Your RoboDoc Band</h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Pair your device to start syncing real-time heart rate, SpO2, and sleep data automatically.
          </p>
          <button className="px-6 py-2 bg-neon-red text-white rounded-lg text-sm font-bold hover:bg-neon-red/80 transition-colors shadow-[0_0_10px_rgba(255,51,102,0.4)]">
            Set up device
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, unit, trend, trendUp }: any) {
  return (
    <div className="bg-neutral-900 p-6 rounded-3xl border border-neon-red/30 shadow-[0_0_10px_rgba(255,51,102,0.05)] flex flex-col justify-between hover:shadow-[0_0_15px_rgba(255,51,102,0.2)] hover:border-neon-red/60 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-black border border-neon-red/50 flex items-center justify-center shadow-[0_0_10px_rgba(255,51,102,0.2)]">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${trendUp && trend !== "--" ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-neutral-800 text-gray-400 border border-neutral-700'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-gray-400 text-sm font-medium mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className="text-sm font-medium text-neon-red">{unit}</span>
        </div>
      </div>
    </div>
  );
}
