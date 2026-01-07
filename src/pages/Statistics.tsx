import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, Share2, TrendingUp, Award } from 'lucide-react';
import { statisticsApi, AllActiveUsersStats, DualRoleUsersStats, LendersOnlyStats, SystemStatisticsSummary } from '../services/api';

interface StatisticsPageProps {
  // Optional props for styling or configuration
}

export default function StatisticsPage(props: StatisticsPageProps) {
  // State Management
  const [summary, setSummary] = useState<SystemStatisticsSummary | null>(null);
  const [allActiveUsers, setAllActiveUsers] = useState<AllActiveUsersStats[]>([]);
  const [dualRoleUsers, setDualRoleUsers] = useState<DualRoleUsersStats[]>([]);
  const [lendersOnly, setLendersOnly] = useState<LendersOnlyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'union' | 'intersect' | 'except'>('summary');

  // Load Statistics
  useEffect(() => {
    const loadStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, allActiveData, dualRoleData, lendersOnlyData] = await Promise.all([
          statisticsApi.getSystemSummary(),
          statisticsApi.getAllActiveUsers(),
          statisticsApi.getDualRoleUsers(),
          statisticsApi.getLendersOnly(),
        ]);

        setSummary(summaryData);
        setAllActiveUsers(allActiveData);
        setDualRoleUsers(dualRoleData);
        setLendersOnly(lendersOnlyData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'İstatistikler yüklenemedi';
        setError(errorMessage);
        console.error('Hata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold">Hata: {error}</p>
      </div>
    );
  }

  // Data for charts
  const activityTypeData = allActiveUsers.reduce((acc, user) => {
    const existing = acc.find(item => item.name === user.activity_type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: user.activity_type === 'Borrower' ? 'Kiraçı' : 'Kiralayan', value: 1, color: user.activity_type === 'Borrower' ? '#3b82f6' : '#10b981' });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; color: string }>);

  const summaryChartData = summary ? [
    { name: 'Kullanıcı', value: summary.total_users, color: '#8b5cf6' },
    { name: 'Alet', value: summary.total_tools, color: '#f59e0b' },
    { name: 'Rezervasyon', value: summary.total_reservations, color: '#06b6d4' },
    { name: 'Yorum', value: summary.total_reviews, color: '#ef4444' },
  ] : [];

  const TabButton = ({ id, label, active }: { id: 'summary' | 'union' | 'intersect' | 'except'; label: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<any>; label: string; value: string | number; color: string }) => (
    <div className={`bg-${color}-50 border-l-4 border-${color}-500 p-4 rounded-lg`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`text-${color}-600`} size={24} />
        <p className="text-gray-600 font-medium">{label}</p>
      </div>
      <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Sistem İstatistikleri</h1>
        <p className="text-gray-600">UNION, INTERSECT ve EXCEPT set operatörleriyle filtrelenen veriler</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
        <TabButton id="summary" label="Genel Özet" active={activeTab === 'summary'} />
        <TabButton id="union" label="UNION - Tüm Aktif" active={activeTab === 'union'} />
        <TabButton id="intersect" label="INTERSECT - Çift Rol" active={activeTab === 'intersect'} />
        <TabButton id="except" label="EXCEPT - Sadece Kiralayan" active={activeTab === 'except'} />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Toplam Kullanıcı" value={summary.total_users} color="blue" />
            <StatCard icon={Share2} label="Toplam Alet" value={summary.total_tools} color="amber" />
            <StatCard icon={TrendingUp} label="Toplam Rezervasyon" value={summary.total_reservations} color="cyan" />
            <StatCard icon={Award} label="Toplam Yorum" value={summary.total_reviews} color="red" />
          </div>

          {/* User Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <p className="text-gray-600 font-medium mb-2">Aktif Kiraçı</p>
              <p className="text-3xl font-bold text-blue-700">{summary.active_borrowers}</p>
              <p className="text-sm text-gray-500 mt-2">Başkasından alet kiralayan</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-gray-600 font-medium mb-2">Aktif Kiralayan</p>
              <p className="text-3xl font-bold text-green-700">{summary.active_lenders}</p>
              <p className="text-sm text-gray-500 mt-2">Aletini paylaşan</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <p className="text-gray-600 font-medium mb-2">Ortalama Alet/Kişi</p>
              <p className="text-3xl font-bold text-purple-700">{summary.avg_tools_per_owner?.toFixed(2) || 0}</p>
              <p className="text-sm text-gray-500 mt-2">Sahip başına alet</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistem Aktiviteleri</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {summaryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            {activityTypeData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Kullanıcı Aktivite Türü</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={activityTypeData} cx="50%" cy="50%" labelLine={false} label={{ key: 'name', fill: '#333' }} outerRadius={100} fill="#8884d8" dataKey="value">
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UNION - All Active Users */}
      {activeTab === 'union' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">UNION Operatörü</h3>
            <p className="text-blue-700 text-sm">
              Bu sorgu, RESERVOIR tablosunda (kiraçı) VEYA TOOL tablosunda (kiralayan) olan TÜM kullanıcıları gösterir.
              Yani sistem içinde aktif olan hem kiraçı hem kiralayan tüm kullanıcılar.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h4 className="font-semibold text-gray-800">Toplam {allActiveUsers.length} Aktif Kullanıcı</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı Adı</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Aktivite Türü</th>
                  </tr>
                </thead>
                <tbody>
                  {allActiveUsers.length > 0 ? (
                    allActiveUsers.map((user) => (
                      <tr key={`${user.user_id}-${user.activity_type}`} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{user.user_id}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{user.user_name}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                            user.activity_type === 'Borrower' ? 'bg-blue-500' : 'bg-green-500'
                          }`}>
                            {user.activity_type === 'Borrower' ? 'Kiraçı' : 'Kiralayan'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Aktif kullanıcı yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INTERSECT - Dual Role Users */}
      {activeTab === 'intersect' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h3 className="font-semibold text-purple-900 mb-2">INTERSECT Operatörü</h3>
            <p className="text-purple-700 text-sm">
              Bu sorgu, HEM RESERVATION tablosunda (kiraçı) HEM DE TOOL tablosunda (kiralayan) olan
              kullanıcıları gösterir. Yani hem başkasından alet kiralayan hem kendi aletini paylaşan
              çift rol sahibi kullanıcılar.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h4 className="font-semibold text-gray-800">Toplam {dualRoleUsers.length} Çift Rol Kullanıcı</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı Adı</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {dualRoleUsers.length > 0 ? (
                    dualRoleUsers.map((user) => (
                      <tr key={user.user_id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{user.user_id}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{user.user_name}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className="px-3 py-1 rounded-full text-white text-xs font-medium bg-purple-500">
                            Çift Rol
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Çift rol kullanıcı yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXCEPT - Lenders Only */}
      {activeTab === 'except' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <h3 className="font-semibold text-orange-900 mb-2">EXCEPT Operatörü</h3>
            <p className="text-orange-700 text-sm">
              Bu sorgu, TOOL tablosunda (kiralayan) OLAN ama RESERVATION tablosunda (kiraçı)
              OLMAYAN kullanıcıları gösterir. Yani sadece alet paylaşan ama kendisi hiç başkasından
              alet kiralanamayan kullanıcılar.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h4 className="font-semibold text-gray-800">Toplam {lendersOnly.length} Sadece Kiralayan</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Kullanıcı Adı</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {lendersOnly.length > 0 ? (
                    lendersOnly.map((user) => (
                      <tr key={user.user_id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{user.user_id}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{user.user_name}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className="px-3 py-1 rounded-full text-white text-xs font-medium bg-orange-500">
                            Sadece Kiralayan
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Sadece kiralayan kullanıcı yok
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
