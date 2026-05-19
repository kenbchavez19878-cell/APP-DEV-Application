import { LayoutDashboard, Users, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { OFWServicesDashboard } from "./OFWServicesDashboard";
import { OFWProfiling } from "./OFWProfilingEnhanced";
import { OWWAOfficerOrganization } from "./OWWAOfficerOrganizationEnhanced";

export function OFWServices() {
  const [activeSubModule, setActiveSubModule] = useState("dashboard");

  const subModules = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ofw-profiling", label: "OFW Profiling", icon: Users },
    { id: "owwa-officers", label: "OWWA Officer Organization", icon: Building2 },
  ];

  const renderContent = () => {
    switch (activeSubModule) {
      case "dashboard":
        return <OFWServicesDashboard />;
      case "ofw-profiling":
        return <OFWProfiling />;
      case "owwa-officers":
        return <OWWAOfficerOrganization />;
      default:
        return <OFWServicesDashboard />;
    }
  };

  // Get the title based on active module
  const getTitle = () => {
    switch (activeSubModule) {
      case "dashboard":
        return "OFW / OWWA Services Dashboard";
      case "ofw-profiling":
        return "OFW Profiling";
      case "owwa-officers":
        return "OWWA Officer Organization";
      default:
        return "OFW / OWWA Services Dashboard";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Title */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-5">
        <h1 className="text-2xl sm:text-3xl text-gray-900">{getTitle()}</h1>
      </div>

      {/* Sub-module Navigation - Below Title */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex gap-3 justify-start flex-wrap">
            {subModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeSubModule === module.id;
              
              return (
                <Button
                  key={module.id}
                  onClick={() => setActiveSubModule(module.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{module.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}