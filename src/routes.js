import React from 'react'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const TodayTasks = React.lazy(() => import('./views/dashboard/TodayTasks'))
const ViewAllTasks = React.lazy(() => import('./views/dashboard/ViewAllTasks'))
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
 
//Users
const Register = React.lazy(() => import('./views/pages/user/Register'))
const UserProfile = React.lazy(() => import('./views/pages/user/Profile'))
const UserChangePassword = React.lazy(() => import('./views/pages/user/ChangePassword'))
const Users = React.lazy(() => import('./views/pages/user/Users'))

//Roles
const Roles = React.lazy(() => import('./views/pages/roles/Roles'))


//tasks
const Task = React.lazy(() => import('./views/pages/tasks/Board'))
const BoardAll = React.lazy(() => import('./views/pages/tasks/AllBoards'))
const BoardDetails = React.lazy(() => import('./views/pages/tasks/BoardDetails'))



//Boards
const AllAuthBoards = React.lazy(() => import('./views/pages/board/allboardlist'))


//staff
const StaffDashboard = React.lazy(() => import('./views/pages/tasks/StaffDashboard'))


//page
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))

import PrivateRoute from './PrivateRoute';

const routes = [
  { path: '/', exact: true, name: 'Home', element: <PrivateRoute element={DefaultLayout} /> },
  // { path: '/', exact: true, name: 'Home', element: <PrivateRoute element={Dashboard} /> },
  { path: '/today-tasks', name: 'Today Tasks', element: <PrivateRoute element={TodayTasks} /> },
  { path: '/view-all-tasks', name: 'View All Tasks', element: <PrivateRoute element={ViewAllTasks} /> },
  { path: '/dashboard', name: 'Dashboard', element: <PrivateRoute element={Dashboard} /> },
  { path: '/user-register', name: 'User Register', element: <PrivateRoute element={Register} /> },
  { path: '/user-profile', name: 'User Profile', element: <PrivateRoute element={UserProfile} /> },
  { path: '/user-change-password', name: 'User Change Password', element: <PrivateRoute element={UserChangePassword} /> },
  { path: '/users', name: 'Users', element: <PrivateRoute element={Users} /> },
  { path: '/roles', name: 'Roles', element: <PrivateRoute element={Roles} /> },
  { path: '/tasks', name: 'Tasks', element: <PrivateRoute element={Task} /> },
  { path: '/all-boards', name: 'All Boards', element: <PrivateRoute element={BoardAll} /> },
  { path: '/board-details/:slug', name: 'Board Details', element: <PrivateRoute element={BoardDetails} /> },
  { path: '/staff-dashboard', name: 'Staff Dashboard', element: <PrivateRoute element={StaffDashboard} /> },


  { path: '/auth-boards', name: 'Auth Boards', element: <PrivateRoute element={AllAuthBoards} /> },
   
  { path: '/404', name: 'Page 404', element: <PrivateRoute element={Page404} /> },
]

export default routes
