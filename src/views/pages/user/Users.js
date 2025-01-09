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
import { getUser, registerUser } from '../../../api/api'; // Assuming registerUser API call

import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false); // State for Create User modal
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    role: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

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
    });
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4 shadow-lg">
          <CCardHeader style={{ backgroundColor: '#323a49d1', color: '#fff', padding: '15px' }}>
            <strong>All Users</strong>
            {/* Search Input on the right side */}
            <div style={{ float: 'right', width: '250px' }}>
              <CFormInput
                type="text"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ borderRadius: '20px', padding: '8px' }}
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
                    style={{ borderRadius: '20px', fontSize: '16px' }}
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
                      <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredUsers.map((user, index) => (
                      <CTableRow key={user._id}>
                        <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{user.email}</CTableDataCell>
                        <CTableDataCell>{roleMapping[user.role]}</CTableDataCell>
                        <CTableDataCell>
                          <CFormSwitch
                            id="status"
                            name="status"
                            labelOn=""
                            labelOff=""
                            defaultChecked={user.status}
                          />
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
        <CModalHeader style={{ backgroundColor: '#323a49', color: '#fff' }}>
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
    </CRow>
  );
};

export default AllUsers;
