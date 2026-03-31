import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface ReceiptCommodity {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface ReceiptData {
  _id: string;
  cardNumber: string;
  familyHeadName: string;
  month: number;
  year: number;
  shopName: string;
  commodities: ReceiptCommodity[];
  totalAmount: number;
  verificationMethod: string;
  digitalSignatureHash: string;
  distributedAt: string;
}

const DigitalReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/distributions/receipt/${id}`)
      .then(({ data }) => setReceipt(data))
      .catch(() => toast.error('Failed to load receipt'))
      .finally(() => setLoading(false));
  }, [id]);

  const monthName = (m: number) =>
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1] ?? m;

  if (loading) return <LoadingSpinner message="Loading receipt..." />;
  if (!receipt) return <div className="text-center py-12 text-gray-500">Receipt not found.</div>;

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-card, #receipt-card * { visibility: visible; }
          #receipt-card { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="no-print mb-4">
          <button
            onClick={() => window.print()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Print Receipt
          </button>
        </div>

        <div id="receipt-card" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white text-center py-6 px-4">
            <h1 className="text-xl font-bold">RationMitra - Digital Distribution Receipt</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Card & Family Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Card Number</p>
                <p className="text-sm font-semibold text-gray-800">{receipt.cardNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Family Head Name</p>
                <p className="text-sm font-semibold text-gray-800">{receipt.familyHeadName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Distribution Month/Year</p>
                <p className="text-sm font-semibold text-gray-800">
                  {monthName(receipt.month)} {receipt.year}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Shop Name</p>
                <p className="text-sm font-semibold text-gray-800">{receipt.shopName}</p>
              </div>
            </div>

            {/* Commodities Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Commodity</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Rate</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.commodities.map((c, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-800">{c.name}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{c.qty}</td>
                      <td className="px-4 py-2 text-right text-gray-600">Rs. {c.rate}</td>
                      <td className="px-4 py-2 text-right text-gray-600">Rs. {c.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-800">
                      Total Amount
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-gray-800">
                      Rs. {receipt.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Verification */}
            <div>
              <p className="text-xs text-gray-500">Verification Method</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{receipt.verificationMethod}</p>
            </div>

            {/* Digital Signature */}
            <div>
              <p className="text-xs text-gray-500">Digital Signature Hash</p>
              <p className="font-mono text-xs bg-gray-50 rounded px-3 py-2 border border-gray-200 break-all">
                {receipt.digitalSignatureHash}
              </p>
            </div>

            {/* Date/Time */}
            <div>
              <p className="text-xs text-gray-500">Date/Time of Distribution</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(receipt.distributedAt).toLocaleString()}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-400">
                This is a digitally generated receipt. Verified via blockchain signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalReceipt;
