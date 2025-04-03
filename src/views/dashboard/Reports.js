import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getUser, getTaskswithUserId } from '../../api/api';
import {
  CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CAlert,
  CInputGroup, CFormInput, COffcanvas, COffcanvasHeader, COffcanvasBody, CSpinner, CFormSelect
} from '@coreui/react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import './dashboard.css';

const Reports = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [completionStatus, setCompletionStatus] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [error, setError] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loadingTask, setLoadingTask] = useState(false);

  const presetDateRanges = [
    { label: "Today", range: [new Date(), new Date()] },
    { label: "Yesterday", range: [new Date(Date.now() - 86400000), new Date(Date.now() - 86400000)] },
    { label: "Last 7 Days", range: [new Date(Date.now() - 7 * 86400000), new Date()] },
    { label: "Last 30 Days", range: [new Date(Date.now() - 30 * 86400000), new Date()] }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await getUser();
      if (Array.isArray(userData.data)) {
        setUsers(userData.data);
      } else {
        setError('Unexpected data format. Users should be an array.');
      }
    } catch (error) {
      setError('Error fetching users. Please try again later.');
      console.error('Error fetching users', error);
    }
  };

  const fetchTasksByUser = async (userId) => {
    setLoadingTask(true);
    try {
      const taskData = await getTaskswithUserId(userId);
      if (taskData.data) {
        setTasks(taskData.data);
      }
      setLoadingTask(false);
    } catch (error) {
      setTasks([]);
      setError('No tasks found for selected user');
      setLoadingTask(false);
      console.error('Error fetching tasks', error);
    }
  };

  const handleUserFilterChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);

    setSearchTerm('');
    setSelectedBoard('');
    setCompletionStatus('');
    setDateRange([null, null]);
    setError('');

    if (userId) {
      fetchTasksByUser(userId);
    } else {
      setTasks([]);
    }
  };

  const filteredUsers = useMemo(() => {
    // Filter users by selected department
    if (selectedDepartment) {
      return users.filter(user => user.department === selectedDepartment);
    }
    return users;
  }, [users, selectedDepartment]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBoard) {
      filtered = filtered.filter((task) => task.board.title === selectedBoard);
    }

    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((task) => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= new Date(dateRange[0]) && dueDate <= new Date(dateRange[1]);
      });
    }

    if (completionStatus) {
      filtered = filtered.filter((task) =>
        completionStatus === 'completed' ? task.progress === 100 : task.progress < 100
      );
    }

    if (taskStatus) {
      filtered = filtered.filter((task) => task.status === taskStatus);
    }
    setShowFilterPanel(false);
    return filtered;
  }, [tasks, searchTerm, selectedBoard, dateRange, completionStatus, taskStatus]);

  const groupTasksByBoard = (tasks) => {
    return tasks.reduce((acc, task) => {
      const boardTitle = task.board.title;
      if (!acc[boardTitle]) {
        acc[boardTitle] = [];
      }
      acc[boardTitle].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByBoard(filteredTasks);

  return (
    <div>
      {loadingTask && (
        <div className="loading-overlay">
          <div className="loading-content">
            <CSpinner color="primary" size="lg" />
            <p>Please wait, your request is processing...</p>
          </div>
        </div>
      )}

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <strong className="fs-4">View Report</strong>
              </div>
              <div className="d-flex align-items-center">
                {/* Department Filter */}
                <CInputGroup className="rounded-pill me-3" style={{ width: '250px' }}>
                  <CFormSelect
                    name="department"
                    options={[
                      'Select Department',
                      { label: 'Content Writer', value: '1' },
                      { label: 'Data Entry', value: '2' },
                      { label: 'Developer', value: '3' },
                      { label: 'Graphic Designer', value: '4' },
                      { label: 'PPC', value: '5' },
                      { label: 'Seo Executive', value: '6' },
                      { label: 'Social Media', value: '7' },
                    ]}
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="form-control shadow-sm"
                    style={{ borderRadius: '8px', borderColor: '#ddd' }}
                  />
                </CInputGroup>

                {/* Employee Filter */}
                <CInputGroup className="rounded-pill me-3" style={{ width: '250px' }}>
                  <select
                    className="form-select"
                    value={selectedUser}
                    onChange={handleUserFilterChange}
                    aria-label="Employee Filter"
                  >
                    <option value="">Filter by Employee</option>
                    {filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </CInputGroup>
                <CButton color="info" onClick={() => setShowFilterPanel(true)}>
                  <FaFilter /> Apply Filter
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}
              {Object.keys(groupedTasks).length > 0 ? (
                <div className="row">
                  {Object.entries(groupedTasks).map(([boardTitle, tasks]) => (
                    <div key={boardTitle} className="col-md-12 mb-4">
                      <div className="border p-2 rounded">
                        <div
                          className="d-flex justify-content-between align-items-center"
                          style={{ padding: '10px', borderBottom: '1px solid #ddd' }}
                        >
                          <span className="h6 mb-0">{boardTitle}</span>
                        </div>
                        <div className="mt-3">
                          <table className="table table-striped table-bordered">
                            <thead className="table-light">
                              <tr style={{ fontSize: '13px' }}>
                                <th style={{ width: '400px' }}>Task Title</th>
                                <th style={{ width: '400px' }}>Description</th>
                                <th>Due Date</th>
                                <th>Priority</th>
                                <th>Progress</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tasks.map((task) => (
                                <tr key={task._id} style={{ fontSize: '13px' }}>
                                  <td>{task.title}</td>
                                  <td>{task.description}</td>
                                  <td>{task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : 'Not Set'}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        task.priority === 'high'
                                          ? 'bg-danger'
                                          : task.priority === 'medium'
                                          ? 'bg-warning'
                                          : 'bg-success'
                                      }`}
                                    >
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  </td>
                                  <td>{Math.round(task.progress)}%</td>
                                  <td>
                                    {task.progress < 100 ? (
                                      <span className="badge bg-warning">Incomplete</span>
                                    ) : (
                                      <span className="badge bg-success">Complete</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CCol>
                  <CCardBody className="text-center">
                    <h5>Select User to get Report</h5>
                  </CCardBody>
                </CCol>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Offcanvas for Filters */}
      <COffcanvas
        placement="end"
        visible={showFilterPanel}
        onHide={() => setShowFilterPanel(false)}
        className="custom-offcanvas"
      >
        <COffcanvasHeader closeButton>
          <h5 className="fw-bold">Filter Options</h5>
        </COffcanvasHeader>
        <COffcanvasBody>
          {/* Board Filter */}
          <div className="filter-section">
            <label className="custom-label mb-2">Select Board</label>
            <CInputGroup className="mb-4">
              <select
                className="form-select"
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                aria-label="Board Filter"
              >
                <option value="">Filter by Board</option>
                {[...new Set(tasks.map((task) => task.board.title))].map((boardTitle) => (
                  <option key={boardTitle} value={boardTitle}>
                    {boardTitle}
                  </option>
                ))}
              </select>
            </CInputGroup>
          </div>

          {/* Date Range Filter */}
          <div className="filter-section">
            <label className="custom-label mb-2">Select Date Range</label>
            <div className="d-flex justify-content-between align-items-start gap-3">
              {/* Preset Buttons */}
              <div className="d-flex flex-column gap-2">
                {presetDateRanges.map(({ label, range }) => (
                  <button
                    key={label}
                    className="btn btn-outline-primary filter-btn"
                    onClick={() => setDateRange(range)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {/* Custom Date Picker */}
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
                isClearable
                placeholderText="Select Custom Range"
                className="form-control custom-date-picker"
              />
            </div>
          </div>

          {/* Completion Status Filter */}
          <div className="filter-section pt-3">
            <label className="custom-label mb-2">Filter by Completion</label>
            <CInputGroup className="mb-4">
              <select
                className="form-select"
                value={completionStatus}
                onChange={(e) => setCompletionStatus(e.target.value)}
                aria-label="Completion Status Filter"
              >
                <option value="">Filter by Completion</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Incomplete</option>
              </select>
            </CInputGroup>
          </div>

          {/* Apply Filter Button */}
          <div className="d-flex justify-content-end">
            <CButton color="primary" onClick={() => setShowFilterPanel(false)}>
              Apply Filter
            </CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </div>
  );
};

export default Reports;
