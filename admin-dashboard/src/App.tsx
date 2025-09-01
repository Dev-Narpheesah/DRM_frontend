import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Bell, Search, Settings, User } from 'lucide-react'

const revenueData = [
  { name: 'Oct', us: 22912, eu: 18045, asia: 14230 },
  { name: 'Nov', us: 17650, eu: 15410, asia: 12050 },
  { name: 'Dec', us: 40055, eu: 28000, asia: 19030 },
]

const subscriberData = [
  { name: 'Sun', value: 3200 },
  { name: 'Mon', value: 4120 },
  { name: 'Tue', value: 8874 },
  { name: 'Wed', value: 5120 },
  { name: 'Thu', value: 4320 },
  { name: 'Fri', value: 3760 },
  { name: 'Sat', value: 2980 },
]

function StatCard({ title, value, delta }: { title: string; value: string; delta?: string }) {
  return (
    <div className="card p-4">
      <div className="muted text-xs font-medium">{title}</div>
      <div className="mt-2 flex items-end gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {delta && <div className="rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">{delta}</div>}
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="h-full">
      <div className="grid h-full grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-[rgb(var(--border))] bg-white p-4 md:block">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600" />
            <div className="text-lg font-semibold">Nexus</div>
          </div>
          <nav className="space-y-1 text-sm">
            <div className="muted mb-2 px-2 text-xs">GENERAL</div>
            {['Dashboard', 'Payment', 'Customers', 'Message'].map((item) => (
              <a key={item} className="block rounded-md px-3 py-2 hover:bg-slate-50" href="#">
                {item}
              </a>
            ))}
            <div className="muted mb-2 mt-4 px-2 text-xs">TOOLS</div>
            {['Product', 'Invoice', 'Analytics', 'Automation'].map((item) => (
              <a key={item} className="block rounded-md px-3 py-2 hover:bg-slate-50" href="#">
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="p-4 md:p-6">
          {/* Topbar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-lg font-semibold">Dashboard</div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-white px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-slate-500" />
                <input className="h-6 w-56 outline-none placeholder:text-slate-400" placeholder="Search" />
              </div>
              <button className="btn" aria-label="notifications"><Bell className="h-4 w-4" /></button>
              <button className="btn" aria-label="settings"><Settings className="h-4 w-4" /></button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white"><User className="h-4 w-4" /></div>
            </div>
          </div>

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Page Views" value="12,450" delta=" +5.3%" />
            <StatCard title="Total Revenue" value="$363.95" delta="-3.4%" />
            <StatCard title="Bounce Rate" value="86.5%" />
            <StatCard title="Total Subscriber" value="24,473" delta=" +7.9%" />
          </div>

          {/* Charts and widgets grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card col-span-2 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">Sales Overview</div>
                <div className="muted text-xs">Oct - Dec</div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid stroke="#eef2f7" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ stroke: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="us" stroke="#4f46e5" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="eu" stroke="#22c55e" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="asia" stroke="#06b6d4" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold">Total Subscriber</div>
                <div className="muted text-xs">This Week</div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subscriberData}>
                    <CartesianGrid vertical={false} stroke="#eef2f7" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Lower grid: pie/table placeholders */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-4">
              <div className="mb-2 font-semibold">Sales Distribution</div>
              <div className="muted text-sm">Coming soon</div>
            </div>
            <div className="card col-span-2 p-4">
              <div className="mb-2 font-semibold">List of Integration</div>
              <div className="muted text-sm">Stripe, Zapier, Slack ...</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
