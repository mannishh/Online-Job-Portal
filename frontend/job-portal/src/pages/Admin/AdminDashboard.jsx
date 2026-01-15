import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Briefcase,
  LogOut,
  CheckCircle,
  XCircle,
  Trash2,
  Ban,
  Unlock,
  Power,
  PowerOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("jobseekers");
  const [loading, setLoading] = useState(false);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") {
      window.location.href = "/admin-login";
      return;
    }
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "jobseekers") {
        const res = await axiosInstance.get(API_PATHS.ADMIN.JOBSEEKERS);
        setJobSeekers(res.data);
      } else if (activeTab === "employers") {
        const res = await axiosInstance.get(API_PATHS.ADMIN.EMPLOYERS);
        setEmployers(res.data);
      } else if (activeTab === "jobs") {
        const res = await axiosInstance.get(API_PATHS.ADMIN.JOBS);
        setJobs(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleJobSeekerStatus = async (id, isActive) => {
    try {
      await axiosInstance.put(API_PATHS.ADMIN.JOBSEEKER_STATUS(id), {
        isActive,
      });
      toast.success(`Job seeker ${isActive ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteJobSeeker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job seeker?"))
      return;
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_JOBSEEKER(id));
      toast.success("Job seeker deleted");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleEmployerBlock = async (id, isBlocked) => {
    try {
      await axiosInstance.put(API_PATHS.ADMIN.EMPLOYER_BLOCK(id), {
        isBlocked,
      });
      toast.success(`Employer ${isBlocked ? "blocked" : "unblocked"}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteEmployer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employer?"))
      return;
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_EMPLOYER(id));
      toast.success("Employer deleted");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleJobApproval = async (id, isApproved) => {
    try {
      await axiosInstance.put(API_PATHS.ADMIN.JOB_APPROVAL(id), {
        isApproved,
      });
      toast.success(`Job ${isApproved ? "approved" : "rejected"}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleJobStatus = async (id, isClosed) => {
    try {
      await axiosInstance.put(API_PATHS.ADMIN.JOB_STATUS(id), { isClosed });
      toast.success(`Job ${isClosed ? "closed" : "activated"}`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_JOB(id));
      toast.success("Job deleted");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const tabs = [
    { id: "jobseekers", label: "Job Seekers", icon: Users },
    { id: "employers", label: "Employers", icon: Building2 },
    { id: "jobs", label: "Jobs", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-pink-500 text-pink-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Job Seekers Tab */}
            {activeTab === "jobseekers" && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Job Seekers ({jobSeekers.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobSeekers.map((seeker) => (
                        <tr key={seeker._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {seeker.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {seeker.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                seeker.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {seeker.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleJobSeekerStatus(seeker._id, !seeker.isActive)
                                }
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                title={seeker.isActive ? "Deactivate" : "Activate"}
                              >
                                {seeker.isActive ? (
                                  <PowerOff className="w-4 h-4" />
                                ) : (
                                  <Power className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteJobSeeker(seeker._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Employers Tab */}
            {activeTab === "employers" && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Employers ({employers.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employers.map((employer) => (
                        <tr key={employer._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employer.companyName || employer.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {employer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                employer.isBlocked
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {employer.isBlocked ? "Blocked" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleEmployerBlock(employer._id, !employer.isBlocked)
                                }
                                className={`p-2 rounded ${
                                  employer.isBlocked
                                    ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                    : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                }`}
                                title={employer.isBlocked ? "Unblock" : "Block"}
                              >
                                {employer.isBlocked ? (
                                  <Unlock className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteEmployer(employer._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Jobs ({jobs.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Approved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {job.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.type} • {job.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {job.company?.companyName || job.company?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                job.isApproved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {job.isApproved ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                job.isClosed
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {job.isClosed ? "Closed" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleJobApproval(job._id, !job.isApproved)
                                }
                                className={`p-2 rounded ${
                                  job.isApproved
                                    ? "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                                    : "text-green-600 hover:text-green-900 hover:bg-green-50"
                                }`}
                                title={job.isApproved ? "Reject" : "Approve"}
                              >
                                {job.isApproved ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleJobStatus(job._id, !job.isClosed)}
                                className={`p-2 rounded ${
                                  job.isClosed
                                    ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                    : "text-red-600 hover:text-red-900 hover:bg-red-50"
                                }`}
                                title={job.isClosed ? "Activate" : "Close"}
                              >
                                {job.isClosed ? (
                                  <Power className="w-4 h-4" />
                                ) : (
                                  <PowerOff className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

