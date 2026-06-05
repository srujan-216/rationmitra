import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface CommodityEntitlement {
  name: string;
  entitledQty: number;
  rate: number;
  unit: string;
}

interface EntitlementData {
  rationCardId: string;
  cardNumber: string;
  cardType: string;
  headOfFamily: string;
  activeMembers: number;
  alreadyDistributed: boolean;
  monthYear: string;
  entitlements: CommodityEntitlement[];
}

interface DistributionResult {
  digitalSignatureHash: string;
  ticket: string;
}

const RecordDistribution = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entitlement, setEntitlement] = useState<EntitlementData | null>(null);
  const [distributedQtys, setDistributedQtys] = useState<Record<string, number>>({});
  const [verificationMethod, setVerificationMethod] = useState<string>('face');
  const [remarks, setRemarks] = useState('');
  const [result, setResult] = useState<DistributionResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkEntitlement = async () => {
    if (!cardNumber.trim()) {
      toast.error('Please enter a ration card number');
      return;
    }
    setLoading(true);
    setEntitlement(null);
    setResult(null);
    setCheckError(null);
    try {
      const { data } = await api.get(`/distributions/check-entitlement/${cardNumber.trim()}`);
      setEntitlement(data);
      const qtys: Record<string, number> = {};
      data.entitlements?.forEach((e: CommodityEntitlement) => {
        qtys[e.name] = e.entitledQty;
      });
      setDistributedQtys(qtys);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to check entitlement';
      setCheckError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (commodityId: string, value: number, max: number) => {
    setDistributedQtys((prev) => ({
      ...prev,
      [commodityId]: Math.min(Math.max(0, value), max),
    }));
  };

  const recordDistribution = async () => {
    if (!entitlement) return;
    setSubmitting(true);
    try {
      const commodities = entitlement.entitlements.map((e) => ({
        name: e.name,
        distributedQty: distributedQtys[e.name] ?? 0,
      }));
      const { data } = await api.post('/distributions/record', {
        cardNumber: entitlement.cardNumber,
        commodities,
        verificationMethod,
        remarks,
      });
      setResult({ digitalSignatureHash: data.digitalSignatureHash, ticket: data.ticket });
      toast.success('Distribution recorded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record distribution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Record Distribution</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ration Card Number</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkEntitlement()}
            placeholder="Enter ration card number"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
          <button
            onClick={checkEntitlement}
            disabled={loading}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Entitlement'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Checking entitlement..." />}

      {/* Check Error */}
      {checkError && !loading && !entitlement && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-red-400">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Entitlement Check Failed</h3>
              <p className="text-sm text-red-700 mt-1">{checkError}</p>
              <p className="text-xs text-gray-500 mt-2">Please verify the ration card number and try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Entitlement Info */}
      {entitlement && !loading && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Card Type</p>
              <p className="text-lg font-semibold text-gray-800">{entitlement.cardType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Head of Family</p>
              <p className="text-lg font-semibold text-gray-800">{entitlement.headOfFamily}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Members</p>
              <p className="text-lg font-semibold text-gray-800">{entitlement.activeMembers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Month</p>
              <p className="text-lg font-semibold text-gray-800">{entitlement.monthYear}</p>
            </div>
          </div>

          {entitlement.alreadyDistributed ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold text-lg">Already distributed for this month</p>
            </div>
          ) : (
            <>
              {/* Entitlements Table */}
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Monthly Entitlements</h2>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Commodity</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Entitled Qty</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Distributed Qty</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Rate</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entitlement.entitlements.map((item) => (
                      <tr key={item.name} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-gray-600">{item.entitledQty} {item.unit}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={item.entitledQty}
                            value={distributedQtys[item.name] ?? 0}
                            onChange={(e) =>
                              handleQtyChange(item.name, Number(e.target.value), item.entitledQty)
                            }
                            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600">Rs. {item.rate}</td>
                        <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Verification & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Method</label>
                  <select
                    value={verificationMethod}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="face">Face Recognition</option>
                    <option value="aadhaar">Aadhaar Verification</option>
                    <option value="manual">Manual Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    placeholder="Optional remarks..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                  />
                </div>
              </div>

              <button
                onClick={recordDistribution}
                disabled={submitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Record Distribution'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-3">Distribution Recorded Successfully</h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Digital Signature Hash</p>
              <p className="font-mono text-sm bg-white rounded px-3 py-2 border border-green-200 break-all">
                {result.digitalSignatureHash}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ticket</p>
              <p className="font-mono text-sm bg-white rounded px-3 py-2 border border-green-200">
                {result.ticket}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordDistribution;
