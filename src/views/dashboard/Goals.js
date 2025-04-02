import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CAlert, CFormInput, CFormSelect, CModal, CModalHeader, CModalBody, CModalFooter, CProgress, CSpinner } from '@coreui/react';
import { FaPlus } from 'react-icons/fa';
import { getUser, getGoals, CreateGoal, updateGoal } from '../../api/api';
import './dashboard.css';

const EmployeeGoalSetting = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [targets, setTargets] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [targetValue, setTargetValue] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const getLastDateOfMonth = (date) => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);  
    return lastDay;
  };

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(1);  
    setSelectedMonth(currentDate);  
  }, []);  

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUser();
      if (Array.isArray(response.data)) {
        setAllUsers(response.data);
        filterUsersByDepartment(response.data, selectedDepartment);
      } else {
        setError((prev) => ({ ...prev, general: 'Unexpected data format. Users should be an array.' }));
      }
    } catch (error) {
      setError((prev) => ({ ...prev, general: 'Error fetching users. Please try again later.' }));
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      
      const response = await getGoals(selectedMonth);  
      if (Array.isArray(response.data)) {
        setTargets(response.data);
        setFilteredTargets(response.data);  
      } else {
        setError((prev) => ({ ...prev, general: 'Unexpected data format. Goals should be an array.' }));
      }
    } catch (error) {
      setError((prev) => ({ ...prev, general: 'Error fetching goals. Please try again later.' }));
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsersByDepartment = (allUsers, departmentId) => {
    if (departmentId) {
      const filteredUsers = allUsers.filter(user => user.department === departmentId);
      setUsers(filteredUsers);
    } else {
      setUsers(allUsers);
    }
  };

  const filterGoals = () => {
    let filtered = targets;

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter((goal) => goal.userId?.department === selectedDepartment);
    }

    // Filter by month
    if (selectedMonth) {
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      filtered = filtered.filter((goal) => {
        const goalDueDate = new Date(goal.dueDate);
        return goalDueDate >= startOfMonth && goalDueDate <= endOfMonth;
      });
    }

    setFilteredTargets(filtered);
  };

   // Fetch goals when the selectedMonth changes
   useEffect(() => {
    if (selectedMonth) {
      setLoading(true);
      fetchGoals();
      setLoading(false);
    }
  }, [selectedMonth]);   

  useEffect(() => {
    fetchUsers();   
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchGoals();
  }, []);

  useEffect(() => {
    filterUsersByDepartment(allUsers, selectedDepartment);
  }, [selectedDepartment, allUsers]);

  useEffect(() => {
    filterGoals();
  }, [selectedDepartment, selectedMonth]);

  const handleTargetSubmit = async () => {
    const newError = {};

    if (!selectedUser) newError.selectedUser = 'Please select an employee.';
    if (!targetTitle) newError.targetTitle = 'Please enter a target title.';
    if (!dueDate) newError.dueDate = 'Please select a due date.';
    if (!targetValue) newError.targetValue = 'Please enter a target value.';

    if (Object.keys(newError).length === 0) {
      const newTarget = {
        userId: selectedUser,
        targetTitle,
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        targetValue,
        status: status || 'Pending',
      };

      setLoading(true);

      try {
        await CreateGoal(newTarget);
        fetchGoals();
        setTargetTitle('');
        setDueDate(null);
        setStartDate(null);
        setTargetValue('');
        setStatus('Pending');
        setModalVisible(false);
      } catch (error) {
        setError((prev) => ({ ...prev, general: 'Failed to create the goal. Please try again.' }));
        console.error('Error creating goal:', error);
      }
      finally {
        setLoading(false);  
      }
    } else {
      setError(newError);
    }
  };

  const handleViewGoal = (goal) => {
    setCurrentGoal(goal);
    setTargetTitle(goal.targetTitle);
    setStartDate(new Date(goal.startDate));
    setDueDate(new Date(goal.dueDate));
    setTargetValue(goal.targetValue);
    setStatus(goal.status);
    setViewModalVisible(true);
  };

  const handleGoalUpdate = async () => {
    setLoading(true);
    const updatedGoal = {
      ...currentGoal,
      targetTitle,
      dueDate: dueDate.toISOString(),
      startDate: startDate.toISOString(),
      targetValue,
      status,
    };

    const newError = {};

    if (!targetTitle) newError.targetTitle = 'Please enter a target title.';
    if (!dueDate) newError.dueDate = 'Please select a due date.';
    if (!startDate) newError.startDate = 'Please select a start date';
    if (!targetValue) newError.targetValue = 'Please enter a target value.';

    if (Object.keys(newError).length === 0) {
      try {
        await updateGoal(updatedGoal);
        setTargets(targets.map((goal) => (goal._id === updatedGoal._id ? updatedGoal : goal)));
        setViewModalVisible(false);
        setLoading(false);
      } catch (error) {
        setError((prev) => ({ ...prev, general: 'Failed to update the goal. Please try again.' }));
        console.error('Error updating goal:', error);
      }
    } else {
      setError(newError);
    }
  };

  return (
    <div>
      {loading && (
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
                <strong className="fs-4">View Employee Goal</strong>
              </div>
              <CButton color="primary" onClick={() => setModalVisible(true)}>
                <FaPlus /> Create Goal
              </CButton>
            </CCardHeader>

            <CCardBody>
              {/* Filters Section */}
              <CRow className="mb-4 d-flex align-items-center">
                <CCol md={6} className="d-flex align-items-center mb-3 mb-md-0">
                  <label className="me-3 text-muted" style={{ fontSize: '14px', fontWeight: '500' }}>Department</label>
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
                </CCol>

                <CCol md={6} className="d-flex align-items-center">
                  <label className="me-3 text-muted" style={{ fontSize: '14px', fontWeight: '500' }}>Month</label>
                  <DatePicker
                    selected={selectedMonth}
                    onChange={(date) => setSelectedMonth(date)}  
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    className="form-control shadow-sm"
                    placeholderText="Select Month"
                    style={{
                      borderRadius: '8px',
                      borderColor: '#ddd',
                      paddingLeft: '10px',
                      fontSize: '14px',
                    }}
                  />
                </CCol>
              </CRow>

              {/* Display filtered goals */}
              {filteredTargets.length > 0 ? (
                <div className="row">
                  <div className="col-md-12 mb-4">
                    <div className="border p-2 rounded">
                      <div className="mt-3">
                        <table className="table table-striped table-bordered">
                          <thead className="table-light">
                            <tr style={{ fontSize: '13px' }}>
                              <th>Employee Name</th>
                              <th>Title</th>
                              <th>Due Date</th>
                              <th>Value</th>
                              <th>Total Count</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTargets.map((target, index) => (
                              <tr style={{ fontSize: '13px' }} key={index}>
                                <td>{target.userId?.username || 'Unknown'}</td>
                                <td>{target.targetTitle || 'Untitled'}</td>
                                <td>{target.dueDate ? new Date(target.dueDate).toLocaleDateString() : 'Not Set'}</td>
                                <td>{Math.round(target.targetValue || 0)}</td>
                                <td>{target.remainingTargetValue} / {target.targetValue}</td>
                                <td>
                                  <CButton color="info" variant="outline" onClick={() => handleViewGoal(target)}>
                                    View Goal
                                  </CButton>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <CCol>
                  <CCardBody className="text-center">
                    <h5>No goals set yet.</h5>
                  </CCardBody>
                </CCol>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
       {/* Modal for Create Target */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
              <CModalHeader onClose={() => setModalVisible(false)}>
                <strong>Create Goal</strong>
              </CModalHeader>
              <CModalBody>
                {error.general && <CAlert color="danger">{error.general}</CAlert>}
                 
                  <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Department</label>
                             </CCol>
                             <CCol md={8}>
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
                                 onChange={(e) => {
                                   setSelectedDepartment(e.target.value);
                                   setSelectedUser('');
                                 }}
                               />
                             </CCol>
                           </CRow>
                 
                           {/* User Selection */}
                           <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Employee</label>
                             </CCol>
                             <CCol md={8}>
                               <select
                                 className="form-select"
                                 value={selectedUser}
                                 onChange={(e) => setSelectedUser(e.target.value)}
                                 disabled={!selectedDepartment}
                               >
                                 <option value="">Select Employee</option>
                                 {users.map((user) => (
                                   <option key={user._id} value={user._id}>
                                     {user.username}
                                   </option>
                                 ))}
                               </select>
                               {error.selectedUser && <div className="text-danger">{error.selectedUser}</div>}
                             </CCol>
                           </CRow>
                 
                           {/* Target Title */}
                           <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Title</label>
                             </CCol>
                             <CCol md={8}>
                               <CFormInput
                                 type="text"
                                 placeholder="Target Title"
                                 value={targetTitle}
                                 onChange={(e) => setTargetTitle(e.target.value)}
                               />
                               {error.targetTitle && <div className="text-danger">{error.targetTitle}</div>}
                             </CCol>
                           </CRow>
                 
                           {/* Start Date */}
                           <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Start Date</label>
                             </CCol>
                             <CCol md={8}>
                               <DatePicker
                                 selected={startDate}
                                 onChange={(date) => {
                                   setStartDate(date);
                                    
                                   if (date) {
                                     const lastDateOfMonth = getLastDateOfMonth(date);
                                     setDueDate(lastDateOfMonth);
                                   }
                                 }}
                                 placeholderText="Select Start Date"
                                 className="form-control"
                               />
                             </CCol>
                           </CRow>
                 
                           {/* Due Date */}
                           <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Due Date</label>
                             </CCol>
                             <CCol md={8}>
                               <DatePicker
                                 selected={dueDate}
                                 onChange={(date) => setDueDate(date)}
                                 placeholderText="Select Due Date"
                                 className="form-control date-picker"
                               />
                               {error.dueDate && <div className="text-danger">{error.dueDate}</div>}
                             </CCol>
                           </CRow>
                 
                           {/* Target Value */}
                           <CRow className="mb-3">
                             <CCol md={4}>
                               <label>Target Value</label>
                             </CCol>
                             <CCol md={8}>
                               <CFormInput
                                 type="number"
                                 placeholder="Enter Goal Value"
                                 value={targetValue}
                                 onChange={(e) => setTargetValue(e.target.value)}
                               />
                               {error.targetValue && <div className="text-danger">{error.targetValue}</div>}
                             </CCol>
                           </CRow>
                         </CModalBody>
                         <CModalFooter>
                           <CButton color="secondary" onClick={() => setModalVisible(false)}>
                             Cancel
                           </CButton>
                           <CButton color="primary" onClick={handleTargetSubmit}>
                             <FaPlus /> Create Goal
                           </CButton>
                         </CModalFooter>
                       </CModal>
                 
      
            {/* Modal for Edit Goal */}
               <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
                     <CModalHeader onClose={() => setViewModalVisible(false)}>
                       <strong>Edit Goal</strong>
                     </CModalHeader>
                     <CModalBody>
                       {error.general && <CAlert color="danger">{error.general}</CAlert>}
             
                       {/* Goal Update Form */}
                       <CRow className="mb-3">
                         <CCol md={4}>
                           <label>Title</label>
                         </CCol>
                         <CCol md={8}>
                           <CFormInput
                             type="text"
                             placeholder="Goal Title"
                             value={targetTitle}
                             onChange={(e) => setTargetTitle(e.target.value)}
                           />
                         </CCol>
                       </CRow>
             
                       {/* Start Date */}
                       <CRow className="mb-3">
                         <CCol md={4}>
                           <label>Start Date</label>
                         </CCol>
                         <CCol md={8}>
                           <DatePicker
                             selected={startDate}
                             onChange={(date) => setStartDate(date)}
                             className="form-control"
                           />
                         </CCol>
                       </CRow>
             
                       {/* Due Date */}
                       <CRow className="mb-3">
                         <CCol md={4}>
                           <label>Due Date</label>
                         </CCol>
                         <CCol md={8}>
                           <DatePicker
                             selected={dueDate}
                             onChange={(date) => setDueDate(date)}
                             className="form-control"
                           />
                         </CCol>
                       </CRow>
             
                       {/* Target Value */}
                       <CRow className="mb-3">
                         <CCol md={4}>
                           <label>Target Value</label>
                         </CCol>
                         <CCol md={8}>
                           <CFormInput
                             type="number"
                             placeholder="Target Value"
                             value={targetValue}
                             onChange={(e) => setTargetValue(e.target.value)}
                           />
                         </CCol>
                       </CRow>
                     </CModalBody>
                     <CModalFooter>
                       <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
                         Cancel
                       </CButton>
                       <CButton color="primary" onClick={handleGoalUpdate}>
                         Update Goal
                       </CButton>
                     </CModalFooter>
                   </CModal>
    </div>
  );
};

export default EmployeeGoalSetting;
