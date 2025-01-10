import {React,useState,useEffect} from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { getUserProfile} from '../../api/api'

import { Link } from 'react-router-dom'
 





const AppHeaderDropdown = () => {
  const [userDetails, setuserDetails] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUserProfile = async (token) => {
      try {
        const response = await getUserProfile(token);
        setuserDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
    fetchUserProfile(token);
  }, []);


const UserLogout = () => {
  if (window.confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    navigate('/login');
  }
}
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar size="md" style={{borderRadius: '50%', backgroundColor: '#5856d6', color: '#fff'}}>
        {userDetails.username ? `${userDetails.username.charAt(0).toUpperCase()}${userDetails.username.charAt(userDetails.username.length - 1).toUpperCase()}` : ''}
        </CAvatar>
         
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem>
          <Link to="/user-profile" style={{textDecoration:"none",color:"#252b36f2"}}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
          </Link>
        </CDropdownItem>
        <CDropdownItem>
        <Link to="/user-change-password" style={{textDecoration:"none",color:"#252b36f2"}}>
          <CIcon icon={cilSettings} className="me-2" />
          Change Password
          </Link>
        </CDropdownItem>
        
        <CDropdownDivider />
        <CDropdownItem href="#"  onClick={UserLogout}>
          <CIcon icon={cilLockLocked} className="me-2"/>
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
