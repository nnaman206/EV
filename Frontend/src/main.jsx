import React from 'react'; // ✅ Import React for JSX to work
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // ✅ Import BrowserRouter
import './index.css';
import App from './App.jsx';
import Layout from './Layout.jsx';
import HomePage from './HomePage.jsx';
import RegisterAdmin from './Component.Admin/Register_Admin.jsx';
import RegisterUser from './Component.user/Register_user.jsx';
import LoginUser from './Component.user/Login_user.jsx'; // ✅ Import LoginUser component
import Sign_In from './Component.Admin/Sign_In.jsx';
 

const router=createBrowserRouter([
  {
    path: '/',
    element:<Layout/>,
    children:[
      {path:"",
        element:<HomePage/>
      },
      {
        path:"/register-admin",
        element:<RegisterAdmin/>
      },
      {
        path:"/register-user",
        element:<RegisterUser/>

      },
      {
        path:"/login-user",
        element:<LoginUser/>
      },
      {
        path:"/sign-in",
        element:<Sign_In/>
      }
      
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <RouterProvider router={router}/>
  </React.StrictMode>
);
