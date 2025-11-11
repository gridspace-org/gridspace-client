"use client";

import { ChevronDown, Eye, Pause, Play, Users as UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import adminApiService, { User } from "@/services/adminApi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'user' | 'host' | 'admin' | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'suspended' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      
      const response = await adminApiService.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await adminApiService.suspendUser(userId, {
        reason: 'other',
        details: 'Suspended by admin',
      });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to suspend user');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await adminApiService.reactivateUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reactivate user');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRoleDisplay = (role: string) => {
    if (role === 'user') return 'Guest';
    if (role === 'host') return 'Host';
    if (role === 'admin') return 'Admin';
    return role;
  };

  const handleRoleFilterChange = (role: 'user' | 'host' | 'admin' | 'all') => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: 'active' | 'suspended' | 'all') => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  return (
    <section className="flex flex-col items-start gap-6 w-full">
      {/* Header row */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-6">
            <div className="w-6 h-6 grid place-items-center rotate-180">
              {/* Back arrow visual (matches figma sizing) */}
              <div className="w-6 h-6 rounded" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] font-bold text-[#002F5B]">Users Management</h1>
              <p className="text-[14px] md:text-[18px] leading-[17px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">
                Manage Host and Guest accounts and permissions
              </p>
            </div>
          </div>

          {/* Filters - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleFilterChange(e.target.value as any)}
              className="flex items-center justify-between gap-[95px] w-[208px] h-[50px] px-2.5 border border-[#D8D8D9] rounded-[8px] bg-white text-[16px] text-[#121212] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002F5B]"
            >
              <option value="all">All Types</option>
              <option value="user">Guest</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value as any)}
              className="flex items-center justify-between gap-[75px] w-[208px] h-[50px] px-2.5 border border-[#D8D8D9] rounded-[8px] bg-white text-[16px] text-[#121212] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002F5B]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Filters - Mobile */}
        <div className="flex md:hidden gap-3 w-full">
          <select
            value={selectedRole}
            onChange={(e) => handleRoleFilterChange(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-[#D8D8D9] rounded-lg bg-white text-[14px] text-[#121212] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002F5B]"
          >
            <option value="all">All Types</option>
            <option value="user">Guest</option>
            <option value="host">Host</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-[#D8D8D9] rounded-lg bg-white text-[14px] text-[#121212] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#002F5B]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users table card */}
      <div className="w-full bg-white rounded-md shadow-[0px_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F5B]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-[16px] text-[#B91C1C]">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-[#002F5B] text-white rounded-lg hover:bg-[#003d75]"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <UsersIcon className="w-16 h-16 text-[#D1D5DB]" />
            <h3 className="text-[20px] font-semibold text-[#002F5B]">No Users Found</h3>
            <p className="text-[16px] text-[#686767] text-center max-w-md">
              There are no users matching your current filters. Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#D1D5DB]">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#D1D5DB]">
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">User</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Type</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Status</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Joined</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Phone</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                    {/* User */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1 min-w-[200px]">
                        <span className="text-[16px] font-medium text-[#121212] tracking-[-0.25px]">{user.fullname}</span>
                        <span className="text-[14px] text-[#6F6F6F] tracking-[-0.25px]">{user.email}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-3">
                      <div className="inline-flex items-center px-[9px] py-[7px] rounded-full border border-[#D1D5DB] text-[14px] text-[#121212] bg-white">
                        {getRoleDisplay(user.role)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3">
                      {!user.suspension?.isSuspended ? (
                        <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#DCFCE7] rounded-full">
                          <span className="text-[12px] text-[#166534]">Active</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#FEE2E2] rounded-full">
                          <span className="text-[12px] text-[#B91C1C]">Suspended</span>
                        </div>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="py-4 px-3">
                      <span className="text-[16px] text-[#686767]">{formatDate(user.createdAt)}</span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-3">
                      <span className="text-[16px] text-[#121212]">{user.phoneNumber || 'N/A'}</span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-4">
                        <button className="w-6 h-6 flex items-center justify-center" aria-label="View">
                          <Eye className="w-6 h-6 text-[#002F5B]" />
                        </button>
                        {!user.suspension?.isSuspended ? (
                          <button
                            onClick={() => handleSuspend(user._id)}
                            className="w-6 h-6 flex items-center justify-center"
                            aria-label="Suspend"
                          >
                            <Pause className="w-6 h-6 text-[#B91C1C]" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user._id)}
                            className="w-6 h-6 flex items-center justify-center"
                            aria-label="Activate"
                          >
                            <Play className="w-6 h-6 text-[#166534]" />
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
    </section>
  );
}


