'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Calendar,
  Building2,
  Hash,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  paymentType: string;
  amount: number;
  paymentYear: number;
  semester: string | null;
  bankName: string;
  transactionId: string;
  paymentDate: string;
  receiptUrl: string;
  status: string;
  verifiedBy: number | null;
  verifierName: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface PaymentDues {
  currentYear: number;
  requiredAmount: number;
  paidAmount: number;
  dueAmount: number;
  isPaid: boolean;
  paymentsForYear: Payment[];
}

export default function PaymentsPage() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [paymentDues, setPaymentDues] = useState<PaymentDues[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Form state for new payment
  const [formData, setFormData] = useState({
    paymentType: 'yearly',
    amount: '',
    paymentYear: new Date().getFullYear(),
    semester: '',
    bankName: '',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else {
        setInitialLoadComplete(true);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (token && initialLoadComplete) {
      fetchPaymentDues();
      fetchPaymentHistory();
    }
  }, [token, initialLoadComplete]);

  const fetchPaymentDues = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://192.168.0.116:8000/api/payments/all-dues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentDues(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load payment dues');
      }
    } catch (err) {
      console.error('Error fetching payment dues:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('http://192.168.0.116:8000/api/payments/my-payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching payment history:', errorData.message);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openPaymentModal = (year: number) => {
    setSelectedYear(year);
    setFormData({
      ...formData,
      paymentYear: year
    });
    setShowPaymentModal(true);
    setError('');
    setSuccess('');
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedYear(null);
    setFormData({
      paymentType: 'yearly',
      amount: '',
      paymentYear: new Date().getFullYear(),
      semester: '',
      bankName: '',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setReceiptFile(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!receiptFile) {
      setError('Please upload a payment receipt');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('paymentType', formData.paymentType);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('paymentYear', formData.paymentYear.toString());
      if (formData.semester) formDataToSend.append('semester', formData.semester);
      formDataToSend.append('bankName', formData.bankName);
      formDataToSend.append('transactionId', formData.transactionId);
      formDataToSend.append('paymentDate', formData.paymentDate);
      if (formData.notes) formDataToSend.append('notes', formData.notes);
      formDataToSend.append('receiptFile', receiptFile);

      const response = await fetch('http://192.168.0.116:8000/api/payments/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Payment submitted successfully! Waiting for verification.');
        
        // Refresh data
        fetchPaymentDues();
        fetchPaymentHistory();
        
        // Close modal after short delay
        setTimeout(() => {
          closePaymentModal();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit payment');
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(`An error occurred while submitting payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  // Show loading state while checking authentication
  if (authLoading || !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hall Fee Payments</h1>
          <p className="text-gray-600">Manage your yearly hall fee payments and view payment history</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Status */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Status</h2>
            
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : paymentDues.length > 0 ? (
              <div className="space-y-4">
                {paymentDues.map((yearDues) => (
                  <div key={yearDues.currentYear} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    yearDues.isPaid ? 'border-green-500' : 'border-yellow-500'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Year {yearDues.currentYear}
                      </h3>
                      {yearDues.isPaid ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Due
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Required:</span>
                        <span className="font-semibold text-gray-900">৳{yearDues.requiredAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-green-600">৳{yearDues.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Due:</span>
                        <span className="font-semibold text-red-600">৳{yearDues.dueAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {!yearDues.isPaid && (
                      <button
                        onClick={() => openPaymentModal(yearDues.currentYear)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Pay Now
                      </button>
                    )}

                    {/* Show recent payments for this year */}
                    {yearDues.paymentsForYear.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">Recent Payments:</p>
                        {yearDues.paymentsForYear.slice(0, 2).map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>৳{payment.amount.toLocaleString()}</span>
                            {getStatusBadge(payment.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">No payment information available</p>
              </div>
            )}
          </div>

          {/* Right Column - Payment History */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
            
            {payments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payment history found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">৳{payment.amount.toLocaleString()}</h3>
                          <p className="text-xs text-gray-600">{payment.paymentYear} - {payment.paymentType}</p>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Building2 className="w-3 h-3 mr-2" />
                        <span className="text-xs">{payment.bankName}</span>
                      </div>
                      <div className="flex items-center">
                        <Hash className="w-3 h-3 mr-2" />
                        <span className="text-xs">Scroll: {payment.transactionId}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        <span className="text-xs">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {payment.status === 'verified' && payment.verifierName && (
                      <div className="p-2 bg-green-50 rounded text-xs text-green-800 mb-2">
                        <CheckCircle className="w-3 h-3 inline-block mr-1" />
                        Verified by {payment.verifierName}
                      </div>
                    )}

                    {payment.rejectionReason && (
                      <div className="p-2 bg-red-50 rounded text-xs text-red-800 mb-2">
                        <XCircle className="w-3 h-3 inline-block mr-1" />
                        {payment.rejectionReason}
                      </div>
                    )}

                    <a
                      href={`http://192.168.0.116:8000/${payment.receiptUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      View Receipt
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Upload Payment Receipt - Year {selectedYear}
                </h3>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Type
                      </label>
                      <select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="yearly">Yearly Fee</option>
                        <option value="admission">Admission Fee</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (৳)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="15000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Year
                      </label>
                      <input
                        type="number"
                        name="paymentYear"
                        value={formData.paymentYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester (Optional)
                      </label>
                      <input
                        type="text"
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Spring 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Select Bank</option>
                        <option value="Agrani Bank PLC">Agrani Bank PLC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scroll No.
                      </label>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="SCR123456789"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receipt Upload
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                      {receiptFile && (
                        <p className="mt-1 text-xs text-gray-600">Selected: {receiptFile.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Any additional information..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closePaymentModal}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
