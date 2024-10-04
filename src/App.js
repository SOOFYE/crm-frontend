import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import {NextUIProvider} from "@nextui-org/react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import PhoneTest from './pages/Agent-Calling/PhoneTest';
import CallButton from './pages/Agent-Calling/CallButton';

function App() {
  return (
    <NextUIProvider>
     <PhoneTest/> 
      {/* <CallButton/> */}
      <Router>
        {/* Global components like Navbar, Footer, etc., can be added here */}
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </NextUIProvider>
  );
}

export default App;
