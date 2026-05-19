import { useState } from "react";
import { Bell, LogOut, Building2, LayoutDashboard, Plane, Menu, X, Settings, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MainDashboard } from "./MainDashboard";
import { OFWServices } from "./OFWServices";
import { SettingsEnhanced as SettingsComponent } from "./SettingsEnhanced";
import { NotificationDropdown } from "./NotificationDropdown";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

interface DashboardLayoutProps {
  userRole: string;
  onLogout: () => void;
}

export function DashboardLayout({ userRole, onLogout }: DashboardLayoutProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ofw-services", label: "OFW / OWWA Services", icon: Plane },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="relative bg-[rgba(255,255,255,0.97)] h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="absolute bg-[rgba(255,255,255,0.97)] h-[56px] left-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 right-0 z-20">
        <div className="px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Left Side - Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="size-5" />
            </Button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationDropdown />
            
            <div className="relative flex items-center gap-2 sm:gap-3 border-l pl-2 sm:pl-4">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {userRole.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3.5 text-gray-600 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-50">
                    {/* User Info Header */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-900">{userRole}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Logged in</p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setActiveMenu("settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Settings className="size-3.5 text-gray-600" />
                      <span className="text-xs text-gray-700">Settings</span>
                    </button>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogoutClick();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 transition-colors text-left text-red-600"
                    >
                      <LogOut className="size-3.5" />
                      <span className="text-xs">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:absolute left-0 top-[56px] bottom-0 bg-white border-r border-gray-200 shadow-sm z-30
        transition-all duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'}
      `}>
        <div className="p-4 flex-shrink-0">
          {/* Toggle button for desktop - visible when not on mobile */}
          <div className="hidden lg:flex justify-start mb-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-gray-100"
            >
              <Menu className="size-5" />
            </Button>
          </div>

          {/* Close button for mobile */}
          <div className="flex justify-end lg:hidden mb-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Main Navigation - Scrollable */}
        <nav className="space-y-1 px-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="size-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions - Settings and Logout */}
        <div className="border-t border-gray-200 p-4 space-y-2.5">
          {/* MSWD Label */}
          {!sidebarCollapsed && (
            <div className="px-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">MSWD</p>
            </div>
          )}

          {/* User Role Info */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="size-7 flex-shrink-0">
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {userRole.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{userRole}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-red-600 hover:bg-red-50"
            title={sidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="size-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`absolute top-[56px] right-0 bottom-0 bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'left-0 lg:left-[70px]' : 'left-0 lg:left-[280px]'
      }`}>
        {activeMenu === "dashboard" && (
          <MainDashboard 
            onNavigate={(view) => setActiveMenu(view)} 
            userRole={userRole} 
          />
        )}
        {activeMenu === "ofw-services" && (
          <OFWServices />
        )}
        {activeMenu === "settings" && (
          <SettingsComponent />
        )}
        {activeMenu !== "dashboard" && activeMenu !== "ofw-services" && activeMenu !== "settings" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <p className="text-gray-400 text-lg">Coming Soon</p>
              <p className="text-gray-500 text-sm mt-2">This module is under development</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirm Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}