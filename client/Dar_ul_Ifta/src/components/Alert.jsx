import React from "react";

function AlertMessage({message, type }) {

  if (!type && !message) return null;

  return (
    <div
      className={`alert ${
        type="error" ? "alert-danger" : "alert-success"
      } alert-dismissible fade show custom-alert`}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i
          className={`fas ${
            type="error" ? "fa-exclamation-triangle" : "fa-check-circle"
          } me-2`}
        ></i>
        <div className="flex-grow-1">{message}</div>
      </div>

      <button
        type="button"
        className="btn-close"
        aria-label="Close"
      ></button>
    </div>
  );
}

export default AlertMessage;
