import { Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import useAuth from './hooks/useAuth'; // Assuming a custom hook for auth

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <div className="bg-bgPrimary min-h-screen flex flex-col">
      {isAuthenticated && (
          <Navbar />
        )}
        <div className="flex-grow">
          {isAuthenticated ? (
            <Outlet />
          ) : (
            <Navigate to="/login" replace />
          )}
        </div>

        <footer class="bg-white shadow m-4 ">
        <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a href="https://flowbite.com/" class="hover:underline">OPS</a>. All Rights Reserved.
        </span>
        <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
        </ul>
        </div>
      </footer>

      </div>
    </>
  );
}

export default App;
