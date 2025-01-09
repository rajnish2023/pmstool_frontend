import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';
import { getUserProfile, loginUser } from '../../../api/api';

import './userstyle.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate the token by calling the getUserProfile API
      const validateToken = async () => {
        try {
          const response = await getUserProfile(token);
          // If the token is valid, navigate to the dashboard
          if (response.status === 200) {
            navigate('/dashboard');
          }
        } catch (err) {
          // If token is invalid, clear it and remain on the login page
          localStorage.removeItem('token');
        }
      };

      validateToken();
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      const token = response.data.token;

      // Save token to localStorage
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light-gradient">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={4}>
            <CCardGroup>
              <CCard className="shadow-lg border-0 rounded-5 p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h4 className="text-center font-weight-bold mb-4 text-dark">Login</h4>
                    <p className="text-center text-muted mb-4">Sign in to your account</p>

                    {error && <p className="text-danger text-center">{error}</p>}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow-sm border-0"
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="shadow-sm border-0"
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={12}>
                        <CButton
                          type="submit"
                          color="primary"
                          className="w-100 px-4 py-3 rounded-3 text-white"
                          style={{ fontSize: '16px', transition: '0.3s ease' }}
                        >
                          Login
                        </CButton>
                      </CCol>
                    </CRow>

                    <CRow className="mt-4">
                      <CCol xs={12} className="text-center">
                        <Link to="/forgot-password">
                          <CButton color="link" className="px-0 text-muted">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
