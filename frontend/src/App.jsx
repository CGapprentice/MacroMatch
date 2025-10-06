import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import SignInPage from './pages/SignUpPage/SigninPage.jsx'
import { Calculator, UserProvider } from './calculator'
import UserSettingsPage from './pages/UserSettingPage/UserSettingsPage.jsx'
import SpotifyIntegration from './pages/SpotifyIntegration/SpotifyIntegration.jsx'
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
  },{
    path: '/usersettingspage',
    element: <UserSettingsPage />
  },{
    path: '/spotifyintegration',
    element: <SpotifyIntegration />
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App;