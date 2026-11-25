import { useState, useEffect } from "react";
import PageComponent from "../components/PageComponent";
import { useStateContext } from '../contexts/ContextProvider';
import axiosClient from "../axios";
import Bottom from "./Bottom";
import WindEffect from "../components/WindEffect";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Registration of Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function AdminContacts() {
  const { currentUser, showToast } = useStateContext();
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("messages");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // States for statistics
  const [statsPeriod, setStatsPeriod] = useState('week');
  const [chaptersStats, setChaptersStats] = useState({ labels: [], data: [] });
  const [usersStats, setUsersStats] = useState({ labels: [], data: [] });
  const [authorsStats, setAuthorsStats] = useState({ labels: [], data: [], total: 0 });

  // States for user list
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersListTitle, setUsersListTitle] = useState('');
  const [loadingUsersList, setLoadingUsersList] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      return;
    }
    if (activeTab === 'messages') {
      loadContacts();
    } else if (activeTab === 'users' && currentUser.role === 'admin') {
      loadUsers();
    } else if (activeTab === 'statistics' && currentUser.role === 'admin') {
      loadStatistics();
    }
  }, [currentUser, filter, activeTab, statsPeriod]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/contacts', {
        params: { status: filter !== 'all' ? filter : undefined }
      });
      setContacts(data);
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axiosClient.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      const { data } = await axiosClient.get('/admin/statistics', {
        params: { period: statsPeriod }
      });
      console.log('Statistics data:', data);
      setChaptersStats(data.chapters || { labels: [], data: [] });
      setUsersStats(data.users || { labels: [], data: [] });
      setAuthorsStats(data.authors || { labels: [], data: [], total: 0 });
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to load statistics", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  // Function to load users by type
  const loadUsersByType = async (type, label) => {
    setLoadingUsersList(true);
    setShowUsersModal(true);
    setUsersListTitle(label);
    
    try {
      const { data } = await axiosClient.get('/admin/users-by-type', {
        params: { type }
      });
      setUsersList(data);
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to load users", "error");
      setUsersList([]);
    } finally {
      setLoadingUsersList(false);
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'moderator' ? 'user' : 'moderator';
    try {
      await axiosClient.put(`/admin/users/${userId}/role`, { role: newRole });
      if (showToast) showToast(`Role changed`, "success");
      loadUsers();
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to change role", "error");
    }
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axiosClient.delete(`/admin/users/${userToDelete.id}`);
      if (showToast) showToast(`User ${userToDelete.name} deleted`, "success");
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
      // Update the list in the modal window
      if (showUsersModal) {
        const type = usersListTitle.includes('with books') ? 'with_books' : 'without_books';
        loadUsersByType(type, usersListTitle);
      }
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to delete user", "error");
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const openContact = async (contact) => {
    try {
      const { data } = await axiosClient.get(`/admin/contacts/${contact.id}`);
      setSelectedContact(data);
      setReplyText("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      if (showToast) showToast("Please enter a reply", "error");
      return;
    }
    
    setReplying(true);
    try {
      await axiosClient.post(`/admin/contacts/${selectedContact.id}/reply`, {
        reply: replyText
      });
      if (showToast) showToast("Reply sent", "success");
      setSelectedContact(null);
      loadContacts();
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to send reply", "error");
    } finally {
      setReplying(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await axiosClient.delete(`/admin/contacts/${id}`);
      if (showToast) showToast("Message deleted", "success");
      if (selectedContact?.id === id) setSelectedContact(null);
      loadContacts();
    } catch (error) {
      console.error("Error:", error);
      if (showToast) showToast("Failed to delete message", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">New</span>;
      case 'read': return <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Read</span>;
      case 'replied': return <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Replied</span>;
      default: return null;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">Admin</span>;
      case 'moderator': return <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">Moderator</span>;
      default: return <span className="bg-gray-600 text-white px-2 py-0.5 rounded text-xs">User</span>;
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    return (
      <>
        <WindEffect />
        <PageComponent title="Admin Panel" buttons="">
          <div className="text-center py-20 text-white">Access denied</div>
          <Bottom />
        </PageComponent>
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  // Chart settings
  const chartOptions = (label, color) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9ca3af',
          stepSize: 1
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  });

  // Pie chart settings
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    onClick: function(event, elements) {
      if (elements.length > 0) {
        const index = elements[0].index;
        const labels = this.data.labels;
        const label = labels[index];
        
        if (label === 'Have books') {
          loadUsersByType('with_books', 'Users with books');
        } else if (label === 'No books') {
          loadUsersByType('without_books', 'Users without books');
        }
      }
    }
  };

  const chaptersChartData = {
    labels: chaptersStats.labels || [],
    datasets: [
      {
        label: 'Uploaded chapters',
        data: chaptersStats.data || [],
        borderColor: '#ffc400',
        backgroundColor: 'rgba(255, 196, 0, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffc400',
        pointBorderColor: '#ffc400',
        pointHoverRadius: 6,
      }
    ]
  };

  const usersChartData = {
    labels: usersStats.labels || [],
    datasets: [
      {
        label: 'New accounts',
        data: usersStats.data || [],
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: '#4ade80',
        pointHoverRadius: 6,
      }
    ]
  };

  // Data for pie chart
  const pieChartData = {
    labels: authorsStats.labels || ['Have books', 'No books'],
    datasets: [
      {
        data: authorsStats.data || [0, 0],
        backgroundColor: ['#4ade80', '#ef4444'],
        borderColor: ['#1a1a1a', '#1a1a1a'],
        borderWidth: 2,
      }
    ]
  };

  return (
    <>
      <WindEffect />
      <PageComponent title="Admin Panel" buttons="">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-t-lg transition ${
                activeTab === "messages" 
                  ? 'bg-black text-white font-bold' 
                  : 'bg-[#ffc400] text-black hover:bg-black hover:text-[#ffc400] font-bold'
              }`}
            >
              Messages
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-t-lg transition ${
                  activeTab === "users" 
                    ? 'bg-black text-white font-bold' 
                    : 'bg-[#ffc400] text-black hover:bg-black hover:text-[#ffc400] font-bold'
                }`}
              >
                Users
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("statistics")}
                className={`px-4 py-2 rounded-t-lg transition ${
                  activeTab === "statistics" 
                    ? 'bg-black text-white font-bold' 
                    : 'bg-[#ffc400] text-black hover:bg-black hover:text-[#ffc400] font-bold'
                }`}
              >
                Statistics
              </button>
            )}
          </div>

          {activeTab === "messages" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-black">
              <div className="bg-black">
                <div className="p-4 bg-black">
                  <h2 className="text-white font-bold">
                    {selectedContact ? 'Message details' : 'Select a message'}
                  </h2>
                </div>
                <div className="p-4">
                  {selectedContact ? (
                    <>
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">From:</p>
                        <p className="text-white font-medium">{selectedContact.name}</p>
                        <p className="text-gray-400 text-sm">{selectedContact.email}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Message:</p>
                        <p className="text-white mt-1 whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>
                      {selectedContact.admin_reply && (
                        <div className="mb-4 p-3 bg-[#0c3200] rounded-lg">
                          <p className="text-[#ffc400] text-sm mb-1">Your reply:</p>
                          <p className="text-white text-sm">{selectedContact.admin_reply}</p>
                        </div>
                      )}
                      <div className="mb-4">
                        <label className="block text-white text-sm mb-2">Reply:</label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows="4"
                          placeholder="Write a reply..."
                          className="w-full p-2 rounded-lg bg-[#2a2a2a] text-white border border-gray-700 focus:border-[#ffc400] outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={sendReply}
                          disabled={replying}
                          className={`flex-1 py-2 rounded-lg font-bold transition ${
                            replying ? 'bg-gray-600' : 'bg-[#ffc400] text-black hover:bg-[#e6b000]'
                          }`}
                        >
                          {replying ? "Sending..." : "Send reply"}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteContact(selectedContact.id)}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-gray-400">
                      Click on a message to view details
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#1a1a1a] overflow-hidden">
                <div className="p-4 border-b border-gray-800 bg-black">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white font-bold">Messages ({contacts.length})</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-[#ffc400] text-black' : 'bg-gray-700 text-white'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilter("new")}
                        className={`px-3 py-1 rounded text-sm ${filter === 'new' ? 'bg-[#ffc400] text-black' : 'bg-gray-700 text-white'}`}
                      >
                        New
                      </button>
                      <button
                        onClick={() => setFilter("replied")}
                        className={`px-3 py-1 rounded text-sm ${filter === 'replied' ? 'bg-[#ffc400] text-black' : 'bg-gray-700 text-white'}`}
                      >
                        Replied
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[600px] overflow-y-auto bg-black">
                  {loading ? (
                    <div className="text-center py-10 text-white">Loading...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No messages</div>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => openContact(contact)}
                        className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-[#252525] transition ${
                          selectedContact?.id === contact.id ? 'bg-[#252525]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-medium">{contact.name}</p>
                            <p className="text-gray-400 text-sm">{contact.email}</p>
                          </div>
                          {getStatusBadge(contact.status)}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{contact.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(contact.created_at).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && isAdmin && (
            <div className="bg-[#1a1a1a] overflow-hidden">
              <div className="p-4 bg-black">
                <h2 className="text-white font-bold">Users ({users.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-white">ID</th>
                      <th className="px-4 py-3 text-left text-white">Name</th>
                      <th className="px-4 py-3 text-left text-white">Email</th>
                      <th className="px-4 py-3 text-left text-white">Role</th>
                      <th className="px-4 py-3 text-left text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-white">Loading...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-gray-400">No users</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-[#252525] transition">
                          <td className="px-4 py-3 text-white">{user.id}</td>
                          <td className="px-4 py-3 text-white"><Link to={`/profile/${user.id}`}>{user.name}</Link></td>
                          <td className="px-4 py-3 text-gray-400">{user.email}</td>
                          <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => toggleUserRole(user.id, user.role)}
                                  className="px-3 py-1 rounded text-sm bg-[#ffc400] text-black hover:bg-[#e6b000] transition font-bold"
                                >
                                  Change
                                </button>
                              )}
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="px-3 py-1 rounded text-sm bg-red-600 text-white hover:bg-red-700 transition font-bold"
                                >
                                  Delete
                                </button>
                              )}
                              {user.role === 'admin' && user.id === currentUser.id && (
                                <span className="text-gray-500 text-sm">This is you</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "statistics" && isAdmin && (
            <div className="bg-[#1a1a1a] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-xl">Statistics</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatsPeriod('week')}
                    className={`px-4 py-2 rounded font-bold transition ${
                      statsPeriod === 'week' 
                        ? 'bg-[#ffc400] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setStatsPeriod('month')}
                    className={`px-4 py-2 rounded font-bold transition ${
                      statsPeriod === 'month' 
                        ? 'bg-[#ffc400] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setStatsPeriod('year')}
                    className={`px-4 py-2 rounded font-bold transition ${
                      statsPeriod === 'year' 
                        ? 'bg-[#ffc400] text-black' 
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>

              {loadingStats ? (
                <div className="text-center py-20 text-white">Loading statistics...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Uploaded chapters chart */}
                    <div className="bg-black p-4 rounded-lg">
                      <h3 className="text-white font-bold text-lg mb-4 text-center">
                        Uploaded chapters
                      </h3>
                      <div className="h-[300px]">
                        <Line 
                          data={chaptersChartData} 
                          options={chartOptions('Uploaded chapters', '#ffc400')}
                        />
                      </div>
                    </div>

                    {/* New accounts chart */}
                    <div className="bg-black p-4 rounded-lg">
                      <h3 className="text-white font-bold text-lg mb-4 text-center">
                        New accounts
                      </h3>
                      <div className="h-[300px]">
                        <Line 
                          data={usersChartData} 
                          options={chartOptions('New accounts', '#4ade80')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pie chart - authors */}
                  <div className="mt-6 bg-black p-4 rounded-lg">
                    <h3 className="text-white font-bold text-lg mb-4 text-center">
                      Author ratio
                      <span className="text-sm font-normal text-gray-400 block">
                        (Click on a sector or number to view the list)
                      </span>
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      <div className="w-full md:w-1/2 h-[350px] cursor-pointer">
                        <Pie data={pieChartData} options={pieOptions} />
                      </div>
                      <div className="w-full md:w-1/2 text-white">
                        <div className="bg-[#1a1a1a] p-4 rounded-lg">
                          <p className="text-center text-lg font-bold mb-4">Author statistics</p>
                          <div className="space-y-3">
                            <div 
                              className="flex justify-between items-center border-b border-gray-700 pb-2 cursor-pointer hover:bg-[#252525] p-2 rounded transition"
                              onClick={() => loadUsersByType('with_books', 'Authors')}
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                Authors
                              </span>
                              <span className="text-green-400 font-bold hover:text-[#ffc400] transition">
                                {authorsStats.data?.[0] || 0} →
                              </span>
                            </div>
                            <div 
                              className="flex justify-between items-center border-b border-gray-700 pb-2 cursor-pointer hover:bg-[#252525] p-2 rounded transition"
                              onClick={() => loadUsersByType('without_books', 'Readers')}
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                Readers
                              </span>
                              <span className="text-red-400 font-bold hover:text-[#ffc400] transition">
                                {authorsStats.data?.[1] || 0} →
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-bold">Total users</span>
                              <span className="text-[#ffc400] font-bold">{authorsStats.total || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <Bottom />
      </PageComponent>

      {/* Delete confirmation modal window */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 relative">
            <h2 className="text-xl font-bold text-[#ffc400] text-center mb-4">
              Delete confirmation
            </h2>
            <p className="text-white text-center mb-6">
              Are you sure you want to delete user <br />
              <span className="text-[#ffc400] font-bold">{userToDelete.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={deleteUser}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Yes, delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User list modal window */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col relative">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-[#1a1a1a] rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#ffc400]">
                {usersListTitle} ({usersList.length})
              </h2>
              <button
                onClick={() => setShowUsersModal(false)}
                className="text-white hover:text-[#ffc400] text-2xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {loadingUsersList ? (
                <div className="text-center py-10 text-white">Loading...</div>
              ) : usersList.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No users</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-white">ID</th>
                        <th className="px-4 py-3 text-left text-white">Name</th>
                        <th className="px-4 py-3 text-left text-white">Email</th>
                        <th className="px-4 py-3 text-left text-white">Role</th>
                        <th className="px-4 py-3 text-left text-white">Books</th>
                        <th className="px-4 py-3 text-left text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((user) => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-[#252525] transition">
                          <td className="px-4 py-3 text-white">{user.id}</td>
                          <td className="px-4 py-3 text-white">
                            <Link to={`/profile/${user.id}`} className="hover:text-[#ffc400] transition">
                              {user.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{user.email}</td>
                          <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                          <td className="px-4 py-3 text-white text-center">{user.books_count || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {user.role !== 'admin' && (
                                <button
                                  onClick={() => {
                                    toggleUserRole(user.id, user.role);
                                    // Update the list
                                    const type = usersListTitle.includes('with books') ? 'with_books' : 'without_books';
                                    setTimeout(() => loadUsersByType(type, usersListTitle), 500);
                                  }}
                                  className="px-2 py-1 rounded text-xs bg-[#ffc400] text-black hover:bg-[#e6b000] transition font-bold"
                                >
                                  Change role
                                </button>
                              )}
                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setShowDeleteModal(true);
                                  }}
                                  className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition font-bold"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}