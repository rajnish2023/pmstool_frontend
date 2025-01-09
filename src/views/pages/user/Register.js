import React, { useState } from 'react';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CFormSelect, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { registerUser } from '../../../api/api';
 
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    role: ''
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
 
  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.repeatPassword) {
      alert('Passwords do not match');
      return;
    }
 
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      alert('User registered successfully');
      console.log(response.data);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };
 
  return (
    <div className="bg-body-tertiary min-vh-80 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h4 className="text-center">Register</h4>
                  <p className="text-body-secondary">Create account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput name="username" placeholder="Username" autoComplete="username" value={formData.username} onChange={handleChange} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput name="email" placeholder="Emailid" autoComplete="email" value={formData.email} onChange={handleChange} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormSelect name="role" aria-label="" options={['Select Role', { label: 'Admin', value: '1' }, { label: 'Manager', value: '2' }, { label: 'Staff', value: '3' },]} value={formData.role} onChange={handleChange} />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput type="password" name="password" placeholder="Password" autoComplete="new-password" value={formData.password} onChange={handleChange} />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput type="password" name="repeatPassword" placeholder="Repeat password" autoComplete="new-password" value={formData.repeatPassword} onChange={handleChange} />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="primary" type="submit">Create Account</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};
 
export default Register;
