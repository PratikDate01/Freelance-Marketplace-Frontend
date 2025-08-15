import React, { useState, useEffect } from 'react';
import { Users, Gift, Copy, Share2, DollarSign, Trophy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import PageHeader from '../components/PageHeader';
import axios from 'axios';
import { toast } from 'react-toastify';

const Referrals = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    thisMonth: 0
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch referral code and stats
      const response = await axios.get('/api/users/referrals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setReferralCode(response.data.referralCode || generateReferralCode());
      setReferralStats(response.data.stats || referralStats);
      setReferralHistory(response.data.history || []);
      
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Generate a mock referral code for demonstration
      setReferralCode(generateReferralCode());
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    const name = user?.name || 'USER';
    const randomNum = Math.floor(Math.random() * 1000);
    return `${name.substring(0, 3).toUpperCase()}${randomNum}`;
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy referral link');
    });
  };

  const shareReferral = async () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    const shareData = {
      title: 'Join CodeHire - Freelance Marketplace',
      text: `Join CodeHire using my referral link and we both get rewards!`,
      url: referralLink
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying link
      copyReferralLink();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Refer Friends & Earn"
        subtitle="Invite friends to join CodeHire and earn rewards together"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referral data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* How it Works */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">How Referrals Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">1. Share Your Link</h3>
                    <p className="text-blue-100">Share your unique referral link with friends and colleagues</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">2. They Join</h3>
                    <p className="text-blue-100">Your friends sign up and complete their first transaction</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">3. You Both Earn</h3>
                    <p className="text-blue-100">You get $10 and they get $5 credit when they complete their first order</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{referralStats.totalReferrals}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(referralStats.totalEarnings)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(referralStats.thisMonth)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(referralStats.pendingEarnings)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link Section */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Referral Link</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg">
                      {referralCode}
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Link
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 break-all">
                      {referralLink}
                    </div>
                    <button
                      onClick={shareReferral}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Share on social media</h4>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=Join CodeHire using my referral link and we both get rewards!&url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Referral History */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Referral History</h3>
              
              {referralHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h4>
                  <p className="text-gray-600 mb-6">
                    Start sharing your referral link to earn rewards when friends join!
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Referral Link
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Friend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reward
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {referralHistory.map((referral) => (
                        <tr key={referral.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {referral.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {referral.name || 'Anonymous User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {referral.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(referral.joinDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              referral.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : referral.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {referral.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.reward ? formatCurrency(referral.reward) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3">Referral Program Terms</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You earn $10 for each successful referral when they complete their first order</li>
                <li>• Your friend gets $5 credit when they sign up using your referral link</li>
                <li>• Referral rewards are credited within 7 days of the referred user's first transaction</li>
                <li>• Self-referrals and fraudulent activities are not allowed</li>
                <li>• CodeHire reserves the right to modify or terminate the referral program at any time</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;