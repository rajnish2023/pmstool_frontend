import React from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CRow,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHome } from '@coreui/icons'
import { FaRegFrownOpen } from 'react-icons/fa'

const Page404 = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <CCard className="shadow-lg border-0 rounded-4">
              <CCardHeader className="bg-danger text-white text-center p-5">
                <h1 className="display-2 mb-3">404</h1>
                <p className="lead mb-0">Oops! You{"'"}re lost.</p>
              </CCardHeader>
              <CCardBody className="text-center p-5">
                {/* Frown Face Icon */}
                <div className="mb-4">
                  <FaRegFrownOpen className="text-warning" size={90} />
                </div>
                <p className="text-muted mb-4">
                  We couldn't find the page you're looking for. But don't worry, it's just a small detour. You can always go back to the homepage.
                </p>

                {/* Home Button */}
                <CButton
                  href="/"
                  color="primary"
                  size="lg"
                  className="rounded-pill shadow-lg"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0px 10px 15px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <CIcon icon={cilHome} className="me-2" />
                  Back to Home
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page404
