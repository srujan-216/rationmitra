import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Commodity {
  name: string;
  entitledQty: number;
  distributedQty: number;
  rate: number;
  totalCost: number;
}

interface DistributionRecord {
  _id: string;
  month: number;
  year: number;
  shopName: string;
  totalItems: number;
  verificationMethod: string;
  distributedAt: string;
  commodities: Commodity[];
}

const DistributionHistory = () => {
  const [records, setRecords] = useState<DistributionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/distributions/my-history')
      .then(({ data }) => setRecords(data.distributions ?? data))
      .catch(() => toast.error('Failed to load distribution history'))
      .finally(() => setLoading(false));
  }, []);

  const monthName = (m: number) =>
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] ?? m;

  if (loading) return <LoadingSpinner message="Loading distribution history..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Distribution History</h1>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
          No distribution records found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Month/Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Shop Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total Items</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Verification</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="group">
                    <td colSpan={6} className="p-0">
                      <div
                        onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                        className="grid grid-cols-6 px-4 py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <span className="font-medium text-gray-800">
                          {monthName(record.month)} {record.year}
                        </span>
                        <span className="text-gray-600">{record.shopName}</span>
                        <span className="text-gray-600">{record.totalItems}</span>
                        <span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                            {record.verificationMethod}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          {new Date(record.distributedAt).toLocaleDateString()}
                        </span>
                        <span>
                          <Link
                            to={`/distribution-receipt/${record._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            View Receipt
                          </Link>
                        </span>
                      </div>

                      {expandedId === record._id && record.commodities && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">Commodity</th>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">Entitled</th>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">Distributed</th>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">Rate</th>
                                <th className="text-left px-3 py-2 font-medium text-gray-500">Total Cost</th>
                              </tr>
                            </thead>
                            <tbody>
                              {record.commodities.map((c, idx) => (
                                <tr key={idx} className="border-t border-gray-200">
                                  <td className="px-3 py-2 text-gray-800">{c.name}</td>
                                  <td className="px-3 py-2 text-gray-600">{c.entitledQty}</td>
                                  <td className="px-3 py-2 text-gray-600">{c.distributedQty}</td>
                                  <td className="px-3 py-2 text-gray-600">Rs. {c.rate}</td>
                                  <td className="px-3 py-2 text-gray-600">Rs. {c.totalCost}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {records.map((record) => (
              <div key={record._id}>
                <div
                  onClick={() => setExpandedId(expandedId === record._id ? null : record._id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {monthName(record.month)} {record.year}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                      {record.verificationMethod}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{record.shopName}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{record.totalItems} items</span>
                    <span>{new Date(record.distributedAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/distribution-receipt/${record._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2 inline-block"
                  >
                    View Receipt
                  </Link>
                </div>

                {expandedId === record._id && record.commodities && (
                  <div className="bg-gray-50 px-4 py-3 space-y-2">
                    {record.commodities.map((c, idx) => (
                      <div key={idx} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0">
                        <span className="text-gray-800 font-medium">{c.name}</span>
                        <span className="text-gray-600">
                          {c.distributedQty}/{c.entitledQty} @ Rs. {c.rate} = Rs. {c.totalCost}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionHistory;
