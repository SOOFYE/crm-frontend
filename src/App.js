import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import {NextUIProvider} from "@nextui-org/react";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <NextUIProvider>
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
