import { Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // Make sure this is the correct path
import HomePage from './HomePage';
import RegisterAdmin from './Component.Admin/Register_Admin';
import RegisterUser from './Component.user/Register_user';
import SignIn from './Component.Admin/Sign_In';
import LoginUser from './Component.user/Login_user';
import AfterAdminLogin from './Component.after.Admin_Login/After_Admin_Login';
import CurrentStage from './Component.after.login/Current_Stage';

function App() {
  return (
    <Routes>
      {/* Parent route that uses Layout */}
      <Route path="/" element={<Layout />}>
        {/* Nested routes rendered inside <Outlet /> */}
        <Route index element={<HomePage />} />
        <Route path="admin" element={<RegisterAdmin />} />
        <Route path="consumer" element={<RegisterUser />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="login-user" element={<LoginUser />} />
        <Route path="dashboard" element={<AfterAdminLogin />} />
        <Route path="stage" element={<CurrentStage />} />
      </Route>
    </Routes>
  );
}

export default App;
