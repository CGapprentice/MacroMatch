import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'

import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignInPage from './pages/SigninPage.jsx'

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
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App;