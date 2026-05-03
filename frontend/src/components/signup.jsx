import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from "axios";
import { useContext, useState } from "react";
import { NotificationContext } from '../App';
const API = import.meta.env.VITE_SERVER_URL;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setNotification, closeNotification } = useContext(NotificationContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
        const res = Axios.post(`${API}/signup`, { 
            firstname: formData.firstName, 
            lastname: formData.lastName, 
            username: formData.username, 
            password: formData.password 
        })
        const data = res.data
        if (data.message) {
            setNotification({
                message: data.message,
                type: "normal",
                onClose: closeNotification
            })
        }
        navigate("./login")
    } catch(err) {
        console.error(err)
    }
}

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
    <div className="flex justify-center items-center my-5 max-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
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
                <h2 className="text-center text-xl font-bold text-gray-800 mb-8">Create Your Account</h2>
                
                <form onSubmit={handleSignUp}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        requilime
                    />
                    </div>
                    <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                        requilime
                    />
                    </div>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
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
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
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
                
                <div className="mb-6">
                    <label className="flex items-center">
                    <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                        requilime
                    />
                    <span className="ml-2 text-sm text-gray-600">
                        I agree to the <a href="#" className="text-lime-600 hover:text-lime-800">Terms of Service</a> and <a href="#" className="text-lime-600 hover:text-lime-800">Privacy Policy</a>
                    </span>
                    </label>
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out"
                >
                    Sign Up
                </button>
                </form>
                
                <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account? <Link to={"/login"} className="text-lime-600 hover:text-lime-800 font-medium">Log in</Link>
                </p>
                </div>
            </div>
        </div>  
    </div>
    </div>
  );
};

export default Signup;