import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CButton, CCard, CCardBody, CForm, CFormInput, CRow, CCol, CContainer, CSpinner} from '@coreui/react';
import { ResetPassword } from '../../../api/api';  

import './userstyle.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  useEffect(() => {
    if (!token) {
      navigate('/login');  
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    setLoading(true); 
    e.preventDefault();
  
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setMessage('');
      setLoading(false);  
      return;
    }
  
    try {
      const response = await ResetPassword({ password, token });
      setMessage(response.data.message);
      navigate('/login');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
      setMessage('');
    } finally {
      setLoading(false); 
    }
  };
  
  return (
    <>
    {loading && (
                    <div className="loading-overlay">
                        <div className="loading-content">
                            <CSpinner color="primary" size="lg" />
                            <p>Please wait, Your request is processing...</p>
                        </div>
                    </div>
                )}
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light-gradient">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={4}>
            <CCard className="shadow-lg border-0 rounded-5 p-4">
              <CCardBody>
                <CForm onSubmit={handleSubmit}>
                  <h4 className="text-center font-weight-bold mb-4 text-dark">Reset Your Password</h4>

                  {message && <div className="alert alert-success text-center">{message}</div>}
                  {error && <div className="alert alert-danger text-center">{error}</div>}

                  <CFormInput
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="mb-3"
                    required
                  />

                  <CFormInput
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="mb-3"
                    required
                  />

                  <CRow>
                    <CCol xs={12}>
                      <CButton
                        color="primary"
                        className="w-100 px-4 py-3 rounded-3 text-white"
                        style={{ fontSize: '16px' }}
                        type="submit"
                      >
                        Reset Password
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
    </>
    
  );
};

export default ResetPasswordPage;
