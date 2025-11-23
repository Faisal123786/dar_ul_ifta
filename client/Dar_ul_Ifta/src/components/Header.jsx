import React from "react";

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="logo-container">
              <h1 className="logo">
                <i className="fas fa-mosque me-2"></i> دار الافتاء جامعة الحسنين
              </h1>
            </div>
            <p className="mb-0">اندراج رجسٹر برائے استفتاءات</p>
          </div>
          <div className="col-md-6 text-md-end">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <img
                id="header-logo"
                src="/WhatsApp Image 2025-11-19 at 01.59.11_887827a7.jpg"
                alt="جامعہ کا لوگو"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
