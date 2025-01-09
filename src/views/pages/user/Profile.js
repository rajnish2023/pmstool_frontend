import React, { useEffect, useState } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CFormSelect,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import { getUserProfile, updateUserProfile } from '../../../api/api'

const token = localStorage.getItem('token');

const Profile = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        role: ''
    });

    useEffect(() => {
        const fetchUserProfile = async (token) => {
            try {
                const response = await getUserProfile(token);
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile(token);
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Call the update API if necessary
            await updateUserProfile(token, user);
            console.log('User profile updated successfully');
        } catch (error) {
            console.error('Failed to update user profile:', error);
        }
    };

    return (
        <div className="bg-body-tertiary min-vh-90 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={9} lg={7} xl={6}>
                        <CCard className="mx-4">
                            <CCardBody className="p-4">
                                <CForm onSubmit={handleSubmit}>
                                    <p className="text-center">Hi {user.username}</p>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <CIcon icon={cilUser} />
                                        </CInputGroupText>
                                        <CFormInput
                                            placeholder="Username"
                                            autoComplete="username"
                                            value={user.username}
                                            name="username"
                                            onChange={handleChange} // Add the onChange handler here
                                        />
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>@</CInputGroupText>
                                        <CFormInput
                                            placeholder="Email"
                                            autoComplete="email"
                                            value={user.email}
                                            name="email"
                                            onChange={handleChange} // Add the onChange handler here
                                        />
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <CIcon icon={cilUser} />
                                        </CInputGroupText>
                                        {/* <CFormSelect
                                            name="role"
                                            value={user.role}
                                            onChange={handleChange} // Add the onChange handler here
                                        >
                                            <option value="">Select Role</option>
                                            <option value="1">Super Admin</option>
                                            <option value="2">Admin</option>
                                            <option value="3">Manager</option>
                                            <option value="4">Staff</option>
                                        </CFormSelect> */}
                                        <CFormInput
                                           value={
                                            user.role === '1'
                                              ? 'Admin'
                                              : user.role === '2'
                                              ? 'Manager'
                                              : user.role === '3'
                                              ? 'Staff'
                                              : ''
                                          }
                                          readOnly
                                      
                                        />
                                    </CInputGroup>

                                    <div className="d-grid">
                                        <CButton color="primary" type="submit">Update Account</CButton>
                                    </div>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default Profile;
