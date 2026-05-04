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
        phone: '',
        email: '',
        password: '',
        role: 'PASSENGER',
        licenceNumber: '',
        vehiclePlate: '',
        agreeToTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSignUp = async (e) => {
        e.preventDefault()
        try {
            const res = await Axios.post(`${API}/api/auth/register`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                licenceNumber: formData.role === 'DRIVER' ? formData.licenceNumber : null,
                vehiclePlate: formData.role === 'DRIVER' ? formData.vehiclePlate : null,
            }, { withCredentials: true })

            // On success, backend returns token directly — store and redirect
            localStorage.setItem("user", JSON.stringify(res.data));
            localStorage.setItem("token", res.data.token);
            navigate("/login")
        } catch(err) {
            setNotification({
                message: err.response?.data?.message || "Registration failed",
                type: "error",
                onClose: closeNotification
            })
        }
    }

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
                                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500">
                                    <option value="PASSENGER">Passenger</option>
                                    <option value="DRIVER">Driver</option>
                                </select>
                            </div>

                            {/* Driver-only fields */}
                            {formData.role === 'DRIVER' && (
                                <div className="mb-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="licenceNumber" className="block text-sm font-medium text-gray-700 mb-1">Licence Number</label>
                                        <input type="text" id="licenceNumber" name="licenceNumber" value={formData.licenceNumber} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                                    </div>
                                    <div>
                                        <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate</label>
                                        <input type="text" id="vehiclePlate" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} id="password" name="password"
                                        value={formData.password} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                                        className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded" required />
                                    <span className="ml-2 text-sm text-gray-600">
                                        I agree to the <a href="#" className="text-lime-600 hover:text-lime-800">Terms of Service</a> and <a href="#" className="text-lime-600 hover:text-lime-800">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            <button type="submit"
                                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out">
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