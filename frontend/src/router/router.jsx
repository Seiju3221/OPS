import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import AboutUs from "../pages/miniPage/AboutUs";
import ContactUs from "../pages/miniPage/ContactUs";
import SingleArticle from "../pages/articles/singleArticle/SingleArticle";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import AdminLayout from "../pages/admin/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import ManagePosts from "../pages/admin/post/ManagePosts";
import ManageUser from "../pages/admin/user/ManageUser";
import PrivateRouter from "./PrivateRouter";
import UpdatePost from "../pages/admin/post/UpdatePost";
import ForgotPassword from "../pages/user/ForgotPassword";
import WritePost from "../pages/writer/WritePost";
import PrivacyPolicy from "../pages/miniPage/PrivacyPolicy";
import TermsOfService from "../pages/miniPage/TermsOfService";
import ProfileManagement from "../pages/common/ProfileManagement";
import WriterDashboard from "../pages/writer/WriterDashboard";
import UpdatePostWriter from "../pages/writer/UpdatePostWriter";
import Articles from "../pages/articles/Articles";
import SubscriptionConfirmed from "../utils/SubscriptionConfirmed";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <PrivateRouter><Home /></PrivateRouter>,
      },
      {
        path: "/articles",
        element: <PrivateRouter><Articles /></PrivateRouter>,
      },
      {
        path: "/about-us",
        element: <PrivateRouter><AboutUs /></PrivateRouter>,
      },
      {
        path: "/contact-us",
        element: <PrivateRouter><ContactUs /></PrivateRouter>,
      },
      {
        path: "/articles/:id",
        element: <PrivateRouter><SingleArticle /></PrivateRouter>,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/write-post",
        element: <WritePost />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      },
      {
        path: "/profile",
        element: <ProfileManagement />,
      },
      {
        path: "/writer-dashboard",
        element: <WriterDashboard />,
      },
      {
        path: "/update-post/:id",
        element: <UpdatePostWriter />,
      },
      {
        path: "/confirm-subscription",
        element: <SubscriptionConfirmed />,
      },
      {
        path: "dashboard",
        element: <AdminLayout />,
        children: [
          {
            path: '',
            element: <Dashboard />
          },
          {
            path: 'manage-items',
            element: <PrivateRouter><ManagePosts /></PrivateRouter>
          },
          {
            path: 'users',
            element: <PrivateRouter><ManageUser /></PrivateRouter>
          },
          {
            path: 'update-items/:id',
            element: <PrivateRouter><UpdatePost /></PrivateRouter>
          },
        ]
      },
    ]
  },
]);

export default router;