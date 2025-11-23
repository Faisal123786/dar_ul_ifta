import React, { createContext, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  
  const showToast = (message, type = "success", options = {}) => {
    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "info":
        toast.info(message, options);
        break;
      case "warn":
      case "warning":
        toast.warn(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
