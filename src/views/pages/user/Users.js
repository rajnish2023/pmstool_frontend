import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CButton,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CContainer,
  CForm,
} from '@coreui/react';
import { getUser, registerUser, updateUser,updateUserStatus } from '../../../api/api';

import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    role: '',
    department: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUser();
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const roleMapping = {
    '1': 'Admin',
    '2': 'Manager',
    '3': 'Staff',
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      repeatPassword: '',
      role: '',
      department: '',
    });
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setCurrentUser(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.repeatPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await registerUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        department: newUser.department,
      });

      setUsers([...users, { ...newUser, _id: new Date().getTime().toString() }]); // Simulate the new user
      setFilteredUsers([...filteredUsers, { ...newUser, _id: new Date().getTime().toString() }]);
      alert('User registered successfully');
      closeCreateModal();
      console.log(response.data);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await updateUser(currentUser);

      setUsers(users.map(user => (user._id === currentUser._id ? currentUser : user)));
      setFilteredUsers(filteredUsers.map(user => (user._id === currentUser._id ? currentUser : user)));
      alert('User updated successfully');
      closeEditModal();
      console.log(response.data);
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (user) => {
    const updatedUser = { ...user, status: !user.status };
    try {
     const response =  await updateUserStatus(token, updatedUser);
      console.log(response);
      setUsers(users.map(u => (u._id === user._id ? updatedUser : u)));
      setFilteredUsers(filteredUsers.map(u => (u._id === user._id ? updatedUser : u)));
       
    } catch (error) {
      console.error('Status update error:', error);
      alert('Status update failed');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-lg">
          <CCardHeader style={{ backgroundColor: '#5e6d77', color: '#fff', padding: '15px' }}>
            <strong>All Users</strong>
            {/* Search Input on the right side */}
            <div style={{ float: 'right', width: '250px' }}>
              <CFormInput
                type="text"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ borderRadius: '20px', padding: '8px', backgroundColor: '#f4f7fa' }}
              />
            </div>
          </CCardHeader>
          <CCardBody style={{ padding: '30px' }}>
            {error ? (
              <div className="alert alert-danger">Error: {error}</div>
            ) : (
              <>
                <div className="mb-4">
                  <CButton
                    color="primary"
                    onClick={openCreateModal}
                    style={{
                      borderRadius: '20px',
                      fontSize: '16px',
                      backgroundColor: '#4e73df',
                      borderColor: '#4e73df',
                    }}
                  >
                    + Create User
                  </CButton>
                </div>
                <CTable striped hover responsive style={{ borderRadius: '10px' }}>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                      {/* <CTableHeaderCell scope="col">Status</CTableHeaderCell> */}
                      <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredUsers.map((user, index) => (
                      <CTableRow key={user._id}>
                        <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{roleMapping[user.role]}</CTableDataCell>
                        {/* <CTableDataCell>
                        <CFormSwitch
                        id="status"
                        name="status"
                        checked={user.status === "active"}
                        onChange={() => handleStatusChange(user)}  
                        />
                        </CTableDataCell> */}

                        <CTableDataCell>
                          <CButton
                            color="info"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                            style={{
                              borderRadius: '20px',
                              fontSize: '14px',
                              padding: '5px 15px',
                              borderColor: '#17a2b8',
                            }}
                          >
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Create User Modal */}
      <CModal visible={createModalVisible} onClose={closeCreateModal} size="lg">
        <CModalHeader>
          <strong>Create User</strong>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleCreateSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
              <CFormInput
                name="username"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>@</CInputGroupText>
              <CFormInput
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
              <CFormSelect
                name="role"
                options={[
                  'Select Role',
                  { label: 'Admin', value: '1' },
                  { label: 'Manager', value: '2' },
                  { label: 'Staff', value: '3' },
                ]}
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
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
                  { lable: 'Sales Executive', value: '8'},
                  { label: 'Sales Manager', value: '9'},
                  { label: 'Digital Marketing Manager' , value: '10'},
                  { label: 'UI Designer' , value: '11'}
                ]}
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
              <CFormInput
                type="password"
                name="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
              <CFormInput
                type="password"
                name="repeatPassword"
                placeholder="Repeat Password"
                value={newUser.repeatPassword}
                onChange={(e) => setNewUser({ ...newUser, repeatPassword: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
            <div className="d-grid mb-3">
              <CButton color="primary" type="submit" style={{ borderRadius: '20px' }}>
                Create Account
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeCreateModal} style={{ borderRadius: '20px' }}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit User Modal */}
      {currentUser && (
        <CModal visible={editModalVisible} onClose={closeEditModal} size="lg">
          <CModalHeader>
            <strong>Edit User</strong>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleEditSubmit}>
              <CInputGroup className="mb-3">
                <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                <CFormInput
                  name="username"
                  placeholder="Username"
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                  style={{ borderRadius: '10px', padding: '10px' }}
                />
              </CInputGroup>
              <CInputGroup className="mb-3">
                <CInputGroupText>@</CInputGroupText>
                <CFormInput
                  name="email"
                  placeholder="Email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  style={{ borderRadius: '10px', padding: '10px' }}
                />
              </CInputGroup>
              <CInputGroup className="mb-3">
                <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                <CFormSelect
                  name="role"
                  options={[
                    'Select Role',
                    { label: 'Admin', value: '1' },
                    { label: 'Manager', value: '2' },
                    { label: 'Staff', value: '3' },
                  ]}
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  style={{ borderRadius: '10px', padding: '10px' }}
                />
              </CInputGroup>
              <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
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
                  { lable: 'Sales Executive', value: '8'},
                  { label: 'Sales Manager', value: '9'},
                  { label: 'Digital Marketing Manager' , value: '10'},
                  { label: 'UI Designer' , value: '11'}
                ]}
              
                value={currentUser.department}
                onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })}
                style={{ borderRadius: '10px', padding: '10px' }}
              />
            </CInputGroup>
              <div className="d-grid mb-3">
                <CButton color="primary" type="submit" style={{ borderRadius: '20px' }}>
                  Update User
                </CButton>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeEditModal} style={{ borderRadius: '20px' }}>
              Cancel
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CRow>
  );
};

export default AllUsers;
