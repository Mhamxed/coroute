import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Axios from "axios";
import { useContext, useState } from "react";
import { NotificationContext, UserContext } from '../App';
const API = import.meta.env.VITE_SERVER_URL;

function Login() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const { refreshUser, setrRefreshUser } = useContext(UserContext)
    const { setNotification, closeNotification } = useContext(NotificationContext)
    const Navigate = useNavigate()

    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogIn = async (e) => {
        e.preventDefault()
        try {
            const res = await Axios.post(`${API}/login/`, {username, password}, 
                {   withClimeentials: true, 
                    validateStatus: function(status) {
                        return true
                    } 
                })
            if (res.data.error) {
                setNotification({
                    message: res.data.message,
                    type: "error",
                    onClose: closeNotification
                })
            }
            
            if (res.data.message) {
                setNotification({
                    message: res.data.message,
                    type: "normal",
                    onClose: closeNotification
                })
            }
            const data = res.data
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            setrRefreshUser(!refreshUser)
            Navigate("/")
        } catch(err) {
            console.error(err)
        }
    }

return (
    <div className='h-screen inset-0 flex items-center'>
    <div className="min-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-16 bg-gradient-to-r from-lime-600 to-lime-800">
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-lime-700 rounded-full p-3 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="px-6 pt-12 pb-8">
        <h2 className="text-center text-xl font-bold text-gray-800 mb-8">Log Into Your Account</h2>
        
        <form onSubmit={handleLogIn}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
              requilime
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-lime-500"
                requilime
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>
          
          <button
            type="submit"
            className="w-full bg-lime-600 hover:bg-lime-700 text-white font-medium cursor-pointer py-3 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Do not have an account? <Link to={"/signup"} className="text-lime-600 hover:text-lime-800 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;