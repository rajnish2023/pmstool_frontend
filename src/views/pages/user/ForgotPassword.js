import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  CRow 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cibGmail } from '@coreui/icons';
import { forgotPassword } from '../../../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await forgotPassword({ email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred');
      setMessage('');
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
                    <h4 className="text-center font-weight-bold mb-4 text-dark">Forgot Password</h4>
                    <p className="text-center text-muted mb-4">Enter your registered email to receive a password reset link.</p>

                    {message && <div className="alert alert-success text-center">{message}</div>}
                    {error && <div className="alert alert-danger text-center">{error}</div>}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cibGmail} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Enter email"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="shadow-sm border-0"
                        style={{
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#007bff"} 
                        onBlur={(e) => e.target.style.borderColor = "transparent"}  
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={12}>
                        <CButton
                          color="primary"
                          className="w-100 px-4 py-3 rounded-3 text-white"
                          style={{ fontSize: '16px', transition: '0.3s ease' }}
                          type="submit"
                        >
                          Send Link
                        </CButton>
                      </CCol>
                    </CRow>

                    <CRow className="mt-4">
                      <CCol xs={12} className="text-center">
                        <Link to="/login">
                          <CButton color="link" className="px-0 text-muted">
                            Back to Login
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

export default ForgotPassword;
