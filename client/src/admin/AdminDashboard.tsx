import { useState } from 'react'

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'buses', label: 'Bus Management', icon: '🚌' },
    { id: 'routes', label: 'Route Management', icon: '🛣️' },
    { id: 'bookings', label: 'Booking Management', icon: '🎫' },
    { id: 'users', label: 'User Management', icon: '👥' },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-accent transition-colors ${
                activeSection === item.id ? 'bg-accent border-r-4 border-primary' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card shadow-sm p-6">
          <h2 className="text-3xl font-semibold text-foreground">
            {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h2>
        </header>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Buses</h3>
              <p className="text-3xl font-bold text-primary">45</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tickets Sold Today</h3>
              <p className="text-3xl font-bold text-green-600">127</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Today's Revenue</h3>
              <p className="text-3xl font-bold text-blue-600">$2,540</p>
            </div>
          </div>

          {/* Content based on active section */}
          <div className="mt-8">
            {activeSection === 'dashboard' && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Bus B001 has departed</span>
                    <span className="text-muted-foreground">2 minutes ago</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>New booking from John Doe</span>
                    <span className="text-muted-foreground">5 minutes ago</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Bus B003 has arrived at destination</span>
                    <span className="text-muted-foreground">10 minutes ago</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeSection !== 'dashboard' && (
              <div className="bg-card p-6 rounded-lg shadow">
                <p className="text-muted-foreground">
                  Content for {menuItems.find(item => item.id === activeSection)?.label} 
                  will be developed here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}