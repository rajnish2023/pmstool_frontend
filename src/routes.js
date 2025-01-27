import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const TodayTasks = React.lazy(() => import('./views/dashboard/TodayTasks'))
const ViewAllTasks = React.lazy(() => import('./views/dashboard/ViewAllTasks'))

const Tasks = React.lazy(() => import('./views/dashboard/Tasks'))

//Users
const Register = React.lazy(() => import('./views/pages/user/Register'))
const UserProfile = React.lazy(() => import('./views/pages/user/Profile'))
const UserChangePassword = React.lazy(() => import('./views/pages/user/ChangePassword'))
const Users = React.lazy(() => import('./views/pages/user/Users'))

//page
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))

import PrivateRoute from './PrivateRoute';

const routes = [
  { path: '/today-tasks', name: 'Today Tasks', element: <PrivateRoute element={TodayTasks} allowedRoles={['2', '3']} /> },
  { path: '/view-all-tasks', name: 'View All Tasks', element: <PrivateRoute element={ViewAllTasks} allowedRoles={['2', '3']} /> },
  { path: '/dashboard', name: 'Dashboard', element: <PrivateRoute element={Dashboard} allowedRoles={['2']} /> },
  { path: '/user-register', name: 'User Register', element: <PrivateRoute element={Register} allowedRoles={['1']} /> },
  { path: '/user-profile', name: 'User Profile', element: <PrivateRoute element={UserProfile} allowedRoles={['1', '2', '3']} /> },
  { path: '/user-change-password', name: 'User Change Password', element: <PrivateRoute element={UserChangePassword} allowedRoles={['1', '2', '3']} /> },
  { path: '/users', name: 'Users', element: <PrivateRoute element={Users} allowedRoles={['1']} /> },
  { path: '/404', name: 'Page 404', element: Page404, allowedRoles: [] },
  { path: '/tasks/:status', name: 'View All Tasks by Status', element: <PrivateRoute element={Tasks} allowedRoles={['2','3']} /> },
    
]

export default routes
