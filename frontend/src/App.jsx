import Signup from "./components/signup.jsx"
import Login from "./components/login.jsx"
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import NotFound from "./components/404.jsx";
import Home from "./components/home.jsx";
import Toast from "./components/toast.jsx";

export const UserContext = createContext(undefined);
export const NotificationContext = createContext(undefined);


function App() {
  const [refreshUser, setrRefreshUser] = useState(false)
  const [refreshVideos, setrRefreshVideos] = useState(false)
  const [notification, setNotification] = useState(null)

  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial render
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    // Load user from localStorage on initial render
    const storedToken = localStorage.getItem("token");
    return storedToken ? storedToken : null;
  });

  const [summary, setSummary] = useState([])
  const [keyInsights, setKeyInsights] = useState([])

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    setUser(JSON.parse(storedUser))
    setToken(storedToken)
  }, [refreshUser])

  //close notification 
  const closeNotification = () => {
    setNotification(null)
  }

  return (
    <>
      <NotificationContext.Provider value={{
        notification,
        setNotification,
        closeNotification
      }}>
      <UserContext.Provider value={{
        user, 
        setUser, 
        token, 
        setToken, 
        summary, 
        setSummary, 
        keyInsights, 
        setKeyInsights,
        refreshUser,
        setrRefreshUser,
        refreshVideos, 
        setrRefreshVideos
      }}>
          <Router>
            <Navbar user={user}/>
            <Routes>
              <Route path="/" element={ <Home />} />
              <Route path="/login" element={<Login user={user}/>} />
              <Route path="/signup" element={<Signup user={user}/>} />
              <Route path="*" element={ <NotFound /> } />
            </Routes>
            <Footer />
            {notification && <Toast message={notification.message} type={notification.type} onClose={notification.onClose}/>}
          </Router>
      </UserContext.Provider>
      </NotificationContext.Provider>
    </>
  )
}

export default App
