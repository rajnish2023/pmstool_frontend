import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CCloseButton,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { AppSidebarNav } from './AppSidebarNav';
import navigation from '../_nav';
import { getUserProfile } from '../api/api';
import { logo } from 'src/assets/brand/logo';
import { sygnet } from 'src/assets/brand/sygnet';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const [filteredNav, setFilteredNav] = useState([]);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchUserProfile = async (token) => {
      try {
        const userProfile = await getUserProfile(token); // Fetch user profile
        const userRole = userProfile.data.role; // Ensure this is a string (e.g., "1")
        console.log('User Role:', userRole); // Debugging the role

        // Filter the navigation based on the user's role
        const filteredItems = filterNavByRole(navigation, userRole);
        setFilteredNav(filteredItems);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile(token);
  }, [token]);
  
  const filterNavByRole = (navItems, role) => {
    return navItems.filter((item) => {
      if (item.showForRoles && !item.showForRoles.includes(Number(role))) { // Convert role to number for comparison
        return false;
      }
      if (item.items) {
        item.items = filterNavByRole(item.items, role); // Recursive filtering
        return item.items.length > 0;
      }
      return true;
    });
  };

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/dashboard">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={60} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={60} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={filteredNav} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
