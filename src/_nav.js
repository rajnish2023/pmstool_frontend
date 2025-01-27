import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,

  cilTask,
  
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'



const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    showForRoles: [2],
     
  },
  {
    component: CNavGroup,
    name: 'Staff Management',
    to: '/buttons',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    showForRoles: [1],
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/users',
      }
    ],
  },

  //  {
  //   component: CNavItem,
  //   name: 'Assigned Tasks',
  //   to: '/today-tasks',
  //   icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  //   showForRoles: [3],
  // },

  {
    component: CNavGroup,
    name: 'All Tasks',
    to: '/view-all-tasks',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    showForRoles: [3],
    
    items: [
      {
        component: CNavItem,
        name: 'Inprogress',
        to: '/tasks/in-progress',
        
      },
      {
        component: CNavItem,
        name: 'ToDo',
        to: '/tasks/pending',
      },
      {
        component: CNavItem,
        name: 'Completed',
        to: '/tasks/completed',
      }
    ],
  },

  
  
]

export default _nav
