import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// API Base URL - Change this to your backend URL
const API_URL = import.meta.env.VITE_API_URL || "https://dar-ul-ifta-xzyf.vercel.app/api"; // if using Vite

function App() {
  // State Management
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [resolvers] = useState(["محمد دین", "محمد زید", "محمد احمد", "محمد", "علی منظور", "عبد القدیر", "انعام اللہ خان", "صاحب علی", "احمد حسین", "زریاب خان", "محمد اویس", "محمد شہاب خان", "محمد سلیمان"]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form states
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    entryNumber: "",
    date: new Date().toISOString().split("T")[0],
    resolver: "",
    status: "pending",
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    resolver: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Helper function to show alerts
  const showAlert = (message, type = "success") => {
    if (type === "success") {
      setSuccessMessage(message);
      setError(null);
    } else {
      setError(message);
      setSuccessMessage(null);
    }
    // Clear alert after 5 seconds
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  };

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(response.data);
      setFilteredQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      showAlert("خرابی: سوالات لوڈ نہیں ہو سکے", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // No alert for stats error to avoid clutter
    }
  };

  // Initial data load
  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, []);

  // Generate next entry number
  const generateEntryNumber = () => {
    if (questions.length === 0) {
      return "FAT-001";
    }
    const lastNumber = questions.reduce((max, q) => {
      // Ensure the entryNumber format is correct before splitting
      const parts = q.entryNumber ? q.entryNumber.split("-") : ["FAT", "0"];
      const num = parseInt(parts[1] || "0");
      return num > max ? num : max;
    }, 0);
    return `FAT-${(lastNumber + 1).toString().padStart(3, "0")}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open add modal
  const openAddModal = () => {
    setNewQuestion({
      title: "",
      entryNumber: generateEntryNumber(),
      date: new Date().toISOString().split("T")[0],
      resolver: "",
      status: "pending",
    });
    setShowAddModal(true);
  };

  // Close add modal
  const closeAddModal = () => {
    setShowAddModal(false);
    // Reset form states upon closing
    setNewQuestion({
      title: "",
      entryNumber: "",
      date: new Date().toISOString().split("T")[0],
      resolver: "",
      status: "pending",
    });
  };

  // Add new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!newQuestion.title || !newQuestion.resolver) {
      showAlert("براہ کرم سوال کا عنوان اور حل کرنے والے کا انتخاب کریں", "error");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/questions`, newQuestion);
      showAlert("سوال کامیابی سے شامل کر دیا گیا ہے", "success");
      closeAddModal();
      await fetchQuestions();
      await fetchStats();
    } catch (error) {
      console.error("Error adding question:", error);
      showAlert("خرابی: سوال شامل نہیں ہو سکا - " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id) => {
    // Using a more modern confirm dialog style
    const isConfirmed = window.confirm("کیا آپ واقعی اس سوال کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔");

    if (isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/questions/${id}`);
        await fetchQuestions();
        await fetchStats();
        showAlert("سوال کامیابی سے حذف کر دیا گیا ہے", "success");
      } catch (error) {
        console.error("Error deleting question:", error);
        showAlert("خرابی: سوال حذف نہیں ہو سکا", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // View question details
  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestion(null);
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      // Directly using the backend filter API
      const response = await axios.post(`${API_URL}/questions/filter`, filters);
      setFilteredQuestions(response.data);
      showAlert(` ${response.data.length} سوالات فلٹر کے مطابق پائے گئے`, "success");
    } catch (error) {
      console.error("Error applying filters:", error);
      showAlert("خرابی: فلٹرز لاگو نہیں ہو سکے", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      resolver: "all",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredQuestions(questions); // Show all questions from the initial fetch
    showAlert("تمام فلٹرز ری سیٹ کر دیے گئے ہیں", "success");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "نامعلوم";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ur-PK", options);
  };

  // Get status text and class
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "زیر التواء", class: "status-pending bg-warning" };
      case "in-progress":
        return { text: "جاری ہے", class: "status-in-progress bg-info" };
      case "completed":
        return { text: "مکمل شدہ", class: "status-completed bg-success" };
      default:
        return { text: status, class: "" };
    }
  };

  return (
    <div className="App" dir="rtl">
      {/* Header */}
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
            {/* Logo on the left (md-end for RTL) */}
            <div className="col-md-6 text-md-end">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {" "}
                {/* Changed to flex-start for visual appeal in RTL */}
                {/* Note: /logo.jpg must be in the public directory */}
                <img id="header-logo" src="/WhatsApp Image 2025-11-19 at 01.59.11_887827a7.jpg" alt="جامعہ کا لوگو" style={{ width: "100px", height: "100px", objectFit: "contain" }} onError={(e) => (e.target.style.display = "none")} />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="container my-5 flex-grow-1">
        {/* Alerts Section */}
        {(error || successMessage) && (
          <div className={`alert ${error ? "alert-danger" : "alert-success"} alert-dismissible fade show custom-alert`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`fas ${error ? "fa-exclamation-triangle" : "fa-check-circle"} me-2`}></i>
              <div className="flex-grow-1">{error || successMessage}</div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
              }}
              aria-label="بند کریں"
            ></button>
          </div>
        )}

        {/* Statistics */}
        <div className="row mb-5">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">
                <i className="fas fa-list-alt me-1"></i>کل سوالات
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.pending}</div>
              <div className="stats-label">
                <i className="fas fa-hourglass-half me-1"></i>زیر التواء
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.completed}</div>
              <div className="stats-label">
                <i className="fas fa-check-circle me-1"></i>مکمل شدہ
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.inProgress}</div>
              <div className="stats-label">
                <i className="fas fa-sync-alt me-1"></i>جاری ہیں
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section mb-5">
          <h5 className="mb-4 text-center" style={{ color: "#1e3a8a" }}>
            <i className="fas fa-filter me-2"></i>سوالات پر فلٹر لگائیں
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="status-filter" className="form-label">
                حیثیت کے لحاظ سے
              </label>
              <select className="form-select" id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="all">تمام حیثیتیں</option>
                <option value="pending">زیر التواء</option>
                <option value="in-progress">جاری ہیں</option>
                <option value="completed">مکمل شدہ</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="resolver-filter" className="form-label">
                حل کرنے والے کے لحاظ سے
              </label>
              <select className="form-select" id="resolver-filter" name="resolver" value={filters.resolver} onChange={handleFilterChange}>
                <option value="all">تمام حل کرنے والے</option>
                {resolvers.map((resolver, index) => (
                  <option key={index} value={resolver}>
                    {resolver}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="date-from" className="form-label">
                تاریخ سے
              </label>
              <input type="date" className="form-control" id="date-from" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <label htmlFor="date-to" className="form-label">
                تاریخ تک
              </label>
              <input type="date" className="form-control" id="date-to" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12 text-center">
              <button className="btn btn-primary me-2 px-4" onClick={applyFilters} disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin me-2"></i> : <i className="fas fa-search me-2"></i>}
                فلٹرز لاگو کریں
              </button>
              <button className="btn btn-outline-secondary px-4" onClick={resetFilters} disabled={loading}>
                <i className="fas fa-redo me-2"></i>
                فلٹرز ری سیٹ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>
              <i className="fas fa-book me-2"></i>اندراج شدہ سوالات کا رجسٹر
            </span>
            <button className="btn btn-light btn-sm bg-primary text-white p-2" onClick={openAddModal} disabled={loading}>
              <i className="fas fa-plus me-1"></i>نیا سوال شامل کریں
            </button>
          </div>
          <div className="card-body">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">لوڈ ہو رہا ہے...</span>
                </div>
                <p className="mt-2 text-primary">ڈیٹا لوڈ ہو رہا ہے، براہ کرم انتظار کریں...</p>
              </div>
            )}

            {!loading && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>اندراج نمبر</th>
                      <th>عنوان</th>
                      <th>تاریخ</th>
                      <th>حل کرنے والا</th>
                      <th>حیثیت</th>
                      <th>عمل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <i className="fas fa-info-circle me-1"></i>
                          کوئی سوال دستیاب نہیں ہے جو موجودہ فلٹرز سے مماثل ہو۔
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => {
                        const statusInfo = getStatusInfo(question.status);
                        return (
                          <tr key={question._id}>
                            <td>
                              <strong>{question.entryNumber}</strong>
                            </td>
                            <td>{question.title}</td>
                            <td>{formatDate(question.date)}</td>
                            <td>{question.resolver}</td>
                            <td>
                              <span className={`badge  ${statusInfo.class}`}>{statusInfo.text}</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleViewQuestion(question)} disabled={loading} title="تفصیلات دیکھیں">
                                <i className="fas fa-eye"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(question._id)} disabled={loading} title="سوال حذف کریں">
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgb(17 35 64) !important" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* Modal Header with improved aesthetics */}
              <div className="modal-header bg-primary text-white" style={{ borderBottom: "none", borderRadius: "5px 5px 0 0" }}>
                <h5 className="modal-title text-white">
                  <i className="fas fa-plus-circle ms-2"></i> {/* Reversed me-2 to ms-2 for proper RTL spacing */}
                  نیا سوال شامل کریں
                </h5>
                {/* Custom Close Button for White Theme */}
              </div>
              <form onSubmit={handleAddQuestion}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="entry-number" className="form-label">
                      اندراج نمبر
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="entry-number"
                      name="entryNumber"
                      value={newQuestion.entryNumber}
                      readOnly
                      dir="ltr" // Important for number/code alignment
                      style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }} // Read-only styling
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="question-title" className="form-label">
                      سوال کا عنوان <span className="text-danger">*</span>
                    </label>
                    <input type="text" className="form-control" id="question-title" name="title" value={newQuestion.title} onChange={handleInputChange} required placeholder="تفصیلی سوال کا عنوان لکھیں" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="question-date" className="form-label">
                      تاریخ
                    </label>
                    <input type="date" className="form-control" id="question-date" name="date" value={newQuestion.date} onChange={handleInputChange} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="modal-resolver" className="form-label">
                      حل کرنے والا <span className="text-danger">*</span>
                    </label>
                    <select className="form-select" id="modal-resolver" name="resolver" value={newQuestion.resolver} onChange={handleInputChange} required>
                      <option value="">حل کرنے والے کا انتخاب کریں</option>
                      {resolvers.map((resolver, index) => (
                        <option key={index} value={resolver}>
                          {resolver}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="question-status" className="form-label">
                      حیثیت
                    </label>
                    <select className="form-select" id="question-status" name="status" value={newQuestion.status} onChange={handleInputChange} required>
                      <option value="pending">زیر التواء</option>
                      <option value="in-progress">جاری ہے</option>
                      <option value="completed">مکمل شدہ</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer with Right Alignment for Buttons */}
                <div className="modal-footer d-flex justify-content-start">
                  {" "}
                  {/* Changed to justify-content-start for RTL right alignment */}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <i className="fas fa-spinner fa-spin ms-2"></i> : <i className="fas fa-save ms-2"></i>}
                    محفوظ کریں
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary me-2" // Added me-2 for separation
                    onClick={closeAddModal}
                    disabled={loading}
                  >
                    <i className="fas fa-times ms-2"></i>منسوخ کریں
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Question Detail Modal */}
      {showDetailModal && selectedQuestion && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <i className="fas fa-info-circle me-2"></i>سوال کی تفصیلات
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeDetailModal} aria-label="بند کریں"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>اندراج نمبر:</strong> <span dir="ltr">{selectedQuestion.entryNumber}</span>
                </div>
                <div className="mb-3">
                  <strong>عنوان:</strong> <span>{selectedQuestion.title}</span>
                </div>
                <div className="mb-3">
                  <strong>تاریخ:</strong> <span>{formatDate(selectedQuestion.date)}</span>
                </div>
                <div className="mb-3">
                  <strong>حل کرنے والا:</strong> <span>{selectedQuestion.resolver}</span>
                </div>
                <div className="mb-3">
                  <strong>حیثیت:</strong>
                  <span className={`badge ${getStatusInfo(selectedQuestion.status).class} ms-2`}>{getStatusInfo(selectedQuestion.status).text}</span>
                </div>
                <hr />
                <div className="mb-3 small text-muted">
                  <strong>شامل کرنے کی تاریخ:</strong>
                  <span>
                    {new Date(selectedQuestion.createdAt).toLocaleDateString("ur-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {selectedQuestion.updatedAt && (
                  <div className="mb-3 small text-muted">
                    <strong>آخری تبدیلی:</strong>
                    <span>
                      {new Date(selectedQuestion.updatedAt).toLocaleDateString("ur-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>
                  <i className="fas fa-window-close me-2"></i>بند کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="footer mt-auto">
        <div className="container text-center">
          <p className="mb-1">دار الافتاء سوالات مینجمنٹ سسٹم &copy; {new Date().getFullYear()}</p>
          <p className="mb-0" style={{ fontSize: "0.85rem" }}>
            <i className="fas fa-server me-1"></i>
            بیک اینڈ کی حیثیت: **{loading ? "متصل ہو رہا ہے..." : "متصل"}**
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
