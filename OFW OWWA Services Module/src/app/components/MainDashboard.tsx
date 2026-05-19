import { 
  Users,
  FolderKanban,
  FolderOpen,
  AlertCircle
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from "recharts";

export function MainDashboard() {

  /* EMPTY DATA */
  const monthlyData: any[] = [];
  const programData: any[] = [];

  const NoData = () => (
    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
      No data available
    </div>
  );

  /* CARDS (NO FAKE DATA) */
 const stats = [
  {
    label: "Total Clients",
    value: 0,
    sub: "All registered clients",
    extra: "+0% this month",
    icon: Users,
    color: "border-l-blue-500 bg-blue-50 text-blue-600"
  },
  {
    label: "Active Clients",
    value: 0,
    sub: "Currently active",
    extra: "0% of total",
    icon: FolderKanban,
    color: "border-l-green-500 bg-green-50 text-green-600"
  },
  {
    label: "New Registrations",
    value: 0,
    sub: "Recent intake",
    extra: "+0 this week",
    icon: FolderOpen,
    color: "border-l-purple-500 bg-purple-50 text-purple-600"
  },
  {
    label: "Total Assisted",
    value: 0,
    sub: "Aid distribution",
    extra: "0% received aid",
    icon: AlertCircle,
    color: "border-l-orange-500 bg-orange-50 text-orange-600"
  }
];

  return (
    <div className="h-full bg-[#f8f9fb] overflow-y-auto">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 py-8">

        {/* HEADER (UNCHANGED) */}
        <div className="mb-8">
          <h1 className="text-[32px] text-[#1a1d29] mb-2">
            Dashboard
          </h1>
          <p className="text-[15px] text-[#6b7280]">
            Welcome back, let's manage your jurisdiction • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((s, i) => {
            const Icon = s.icon;

            return (
              <Card
                key={i}
                className={`h-[110px] border-l-4 ${s.color.split(" ")[0]} bg-white rounded-xl shadow-sm`}
              >
                <CardContent className="p-4">

                  <div className="flex items-center justify-between">
                    <Icon className={`size-5 ${s.color.split(" ")[2]}`} />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {s.label}
                  </p>

                  <p className="text-xl font-semibold text-gray-900">
                    {s.value}
                  </p>

                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CHARTS (NO DATA KEPT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className="lg:col-span-2">
            <Card className="relative">
              <CardContent className="p-6 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cases" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <NoData />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="relative">
              <CardContent className="p-6 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={programData} dataKey="value" />
                  </PieChart>
                </ResponsiveContainer>
                <NoData />
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}