import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';

interface CardsByType {
  type: string;
  count: number;
}

interface GrievancesByType {
  type: string;
  count: number;
}

interface AllocationVsDistribution {
  commodity: string;
  allocated: number;
  distributed: number;
}

interface MonthlyTrend {
  month: string;
  distributions: number;
}

interface DistrictData {
  district: string;
  totalCards: number;
  coveragePercent: number;
  pendingRequests: number;
  openGrievances: number;
}

interface DashboardData {
  totalRationCards: number;
  distributionCoverage: number;
  pendingFamilyRequests: number;
  openGrievances: number;
  cardsByType: CardsByType[];
  grievancesByType: GrievancesByType[];
  allocationVsDistribution: AllocationVsDistribution[];
  monthlyTrend: MonthlyTrend[];
  districtData: DistrictData[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4'];

const renderPieLabel = ({ name, percent }: { name?: string; percent?: number }) =>
  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;

const OfficerDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/officer-dashboard/')
      .then(({ data: d }) => {
        setData({
          totalRationCards: d.totalRationCards ?? 0,
          distributionCoverage: d.distributionCoverage ?? 0,
          pendingFamilyRequests: d.pendingFamilyRequests ?? 0,
          openGrievances: d.openGrievances ?? 0,
          cardsByType: d.cardsByType ?? [],
          grievancesByType: d.grievancesByType ?? [],
          allocationVsDistribution: d.allocationVsDistribution ?? [],
          monthlyTrend: d.monthlyTrend ?? [],
          districtData: d.districtData ?? [],
        });
        setError(null);
      })
      .catch((err: any) => {
        const msg = err.response?.data?.message;
        setError(msg || 'Failed to load officer dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading officer dashboard..." />;
  if (!data) return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-lg mx-auto">
      <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Unable to Load Dashboard</h2>
      <p className="text-gray-500 text-sm">{error || 'Something went wrong. Please try again later.'}</p>
    </div>
  );

  const StatCard = ({ title, value, color, subtitle }: { title: string; value: string | number; color: string; subtitle?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Officer Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Ration Cards" value={data.totalRationCards} color="border-primary-500" />
        <StatCard
          title="Distribution Coverage"
          value={`${data.distributionCoverage}%`}
          color="border-green-500"
        />
        <StatCard title="Pending Family Requests" value={data.pendingFamilyRequests} color="border-yellow-500" />
        <StatCard title="Open Grievances" value={data.openGrievances} color="border-red-500" />
      </div>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 1. Bar Chart: Cards by Type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cards by Type</h2>
          {data.cardsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cardsByType} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Cards" radius={[4, 4, 0, 0]}>
                  {data.cardsByType.map((_entry, idx) => (
                    <Cell key={`card-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No card data available</div>
          )}
        </div>

        {/* 2. Pie Chart: Grievances by Type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Grievances by Type</h2>
          {data.grievancesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.grievancesByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderPieLabel}
                >
                  {data.grievancesByType.map((_entry, idx) => (
                    <Cell key={`griev-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No grievance data available</div>
          )}
        </div>

        {/* 3. Bar Chart: Allocation vs Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Allocation vs Distribution</h2>
          {data.allocationVsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.allocationVsDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commodity" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="allocated" name="Allocated" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="distributed" name="Distributed" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No allocation data available</div>
          )}
        </div>

        {/* 4. Line Chart: Monthly Distribution Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Distribution Trend</h2>
          {data.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="distributions"
                  name="Distributions"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">No trend data available</div>
          )}
        </div>
      </div>

      {/* District-wise Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">District-wise Overview</h2>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {data.districtData.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No district data available yet.</div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">District</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Cards</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Coverage %</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pending Requests</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Open Grievances</th>
              </tr>
            </thead>
            <tbody>
              {data.districtData.map((d) => (
                <tr
                  key={d.district}
                  onClick={() => setExpandedDistrict(expandedDistrict === d.district ? null : d.district)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{d.district}</td>
                  <td className="px-4 py-3 text-gray-600">{d.totalCards}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                        <div
                          className={`h-2 rounded-full ${
                            d.coveragePercent >= 80 ? 'bg-green-500' : d.coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, d.coveragePercent)}%` }}
                        />
                      </div>
                      <span className="text-gray-600 text-xs">{d.coveragePercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${d.pendingRequests > 0 ? 'text-yellow-600 font-medium' : 'text-gray-600'}`}>
                      {d.pendingRequests}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${d.openGrievances > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {d.openGrievances}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {data.districtData.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No district data available yet.</div>
          ) : data.districtData.map((d) => (
            <div
              key={d.district}
              onClick={() => setExpandedDistrict(expandedDistrict === d.district ? null : d.district)}
              className="p-4 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{d.district}</span>
                <span className="text-xs text-gray-500">{d.totalCards} cards</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      d.coveragePercent >= 80 ? 'bg-green-500' : d.coveragePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, d.coveragePercent)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{d.coveragePercent}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Pending: {d.pendingRequests}</span>
                <span>Grievances: {d.openGrievances}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
