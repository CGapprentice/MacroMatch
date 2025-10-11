import React from 'react'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignInPage from './pages/SigninPage.jsx'
import { Calculator, UserProvider } from './components/index.js'
import UserSettingsPage from './pages/UserSettingPage/UserSettingsPage.jsx'
import RoutinePage from './pages/RoutinePage/RoutinePage.jsx'
import './main.css'


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/loginpage',
    element: <LoginPage />
  },
  {
    path: '/signinpage',
    element: <SignInPage />
  },
  {
    path: '/calculatorpage',
    element: <UserProvider><Calculator /></UserProvider>
  }
  ,{
    path: '/usersettingspage',
    element: <UserSettingsPage />
  },
  {
    path: '/routinepage',
    element: <RoutinePage />
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App;