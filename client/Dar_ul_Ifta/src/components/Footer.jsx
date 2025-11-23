import React, { useState } from "react";

function Footer() {
  const [loading, setLoading] = useState(false);
  return (
    <footer className="footer mt-auto">
      <div className="container text-center">
        <p className="mb-1">
          دار الافتاء سوالات مینجمنٹ سسٹم &copy; {new Date().getFullYear()}
        </p>
        <p className="mb-0" style={{ fontSize: "0.85rem" }}>
          <i className="fas fa-server me-1"></i>
          بیک اینڈ کی حیثیت: **{loading ? "متصل ہو رہا ہے..." : "متصل"}**
        </p>
      </div>
    </footer>
  );
}

export default Footer;
