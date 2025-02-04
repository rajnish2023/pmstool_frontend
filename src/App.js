import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Pages
const Login = React.lazy(() => import('./views/pages/user/Login'))
const ForgotPassword = React.lazy(() => import('./views/pages/user/ForgotPassword')) 
const ResetPassword = React.lazy(() => import('./views/pages/user/ResetPassword'));

const page404 = React.lazy(() => import('./views/pages/page404/Page404'))   

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('dynamics-square-pms-tool')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) 

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/forgot-password" name="Forgot Password Page" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" name="Reset Password" element={<ResetPassword />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
