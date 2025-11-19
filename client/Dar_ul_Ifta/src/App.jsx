import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// API Base URL - Change this to your backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // if using Vite

function App() {
  // State Management
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [resolvers] = useState([
    'محمد دین', 'محمد زید', 'محمد احمد', 'محمد', 
    'علی منظور', 'عبد القدیر', 'انعام اللہ خان', 'صاحب علی', 
    'احمد حسین', 'زریاب خان', 'محمد اویس', 'محمد شہاب خان', 'محمد سلیمان'
  ]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    entryNumber: '',
    date: new Date().toISOString().split('T')[0],
    resolver: '',
    status: 'pending'
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    resolver: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/questions`);
      setQuestions(response.data);
      setFilteredQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('خرابی: سوالات لوڈ نہیں ہو سکے');
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
      console.error('Error fetching stats:', error);
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
      return 'FAT-001';
    }
    const lastNumber = questions.reduce((max, q) => {
      const num = parseInt(q.entryNumber.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `FAT-${(lastNumber + 1).toString().padStart(3, '0')}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open add modal
  const openAddModal = () => {
    setNewQuestion({
      title: '',
      entryNumber: generateEntryNumber(),
      date: new Date().toISOString().split('T')[0],
      resolver: '',
      status: 'pending'
    });
    setShowAddModal(true);
  };

  // Close add modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewQuestion({
      title: '',
      entryNumber: '',
      date: new Date().toISOString().split('T')[0],
      resolver: '',
      status: 'pending'
    });
  };

  // Add new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.title || !newQuestion.resolver) {
      alert('براہ کرم تمام ضروری فیلڈز کو پُر کریں');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/questions`, newQuestion);
      alert('سوال کامیابی سے شامل کر دیا گیا ہے');
      closeAddModal();
      await fetchQuestions();
      await fetchStats();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('خرابی: سوال شامل نہیں ہو سکا - ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id) => {
    if (window.confirm('کیا آپ واقعی اس سوال کو حذف کرنا چاہتے ہیں؟')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/questions/${id}`);
        await fetchQuestions();
        await fetchStats();
        alert('سوال کامیابی سے حذف کر دیا گیا ہے');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('خرابی: سوال حذف نہیں ہو سکا');
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
      const response = await axios.post(`${API_URL}/questions/filter`, filters);
      setFilteredQuestions(response.data);
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('خرابی: فلٹرز لاگو نہیں ہو سکے');
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      resolver: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setFilteredQuestions(questions);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ur-PK', options);
  };

  // Get status text and class
  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending':
        return { text: 'زیر التواء', class: 'status-pending' };
      case 'in-progress':
        return { text: 'جاری ہے', class: 'status-in-progress' };
      case 'completed':
        return { text: 'مکمل شدہ', class: 'status-completed' };
      default:
        return { text: status, class: '' };
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
            <div className="col-md-6 text-md-end">
              <div style={{display: 'flex', justifyContent: 'end'}}>
                <img 
                  id="header-logo" 
                  src="/logo.jpg" 
                  alt="لوگو" 
                  style={{width: '100px', height: '100px', objectFit: 'contain'}}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container my-4">
        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Statistics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.total}</div>
              <div className="stats-label">کل سوالات</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.pending}</div>
              <div className="stats-label">زیر التواء</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.completed}</div>
              <div className="stats-label">مکمل شدہ</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card">
              <div className="stats-number">{stats.inProgress}</div>
              <div className="stats-label">جاری ہیں</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="status-filter" className="form-label">حیثیت کے لحاظ سے فلٹر کریں</label>
              <select 
                className="form-select" 
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">تمام سوالات</option>
                <option value="pending">زیر التواء</option>
                <option value="in-progress">جاری ہیں</option>
                <option value="completed">مکمل شدہ</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="resolver-filter" className="form-label">حل کرنے والے کے لحاظ سے فلٹر کریں</label>
              <select 
                className="form-select" 
                id="resolver-filter"
                name="resolver"
                value={filters.resolver}
                onChange={handleFilterChange}
              >
                <option value="all">تمام حل کرنے والے</option>
                {resolvers.map((resolver, index) => (
                  <option key={index} value={resolver}>{resolver}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="date-from" className="form-label">تاریخ سے</label>
              <input 
                type="date" 
                className="form-control" 
                id="date-from"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="date-to" className="form-label">تاریخ تک</label>
              <input 
                type="date" 
                className="form-control" 
                id="date-to"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 text-center">
              <button 
                className="btn btn-primary me-2" 
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? 'لوڈ ہو رہا ہے...' : 'فلٹرز لاگو کریں'}
              </button>
              <button 
                className="btn btn-outline-secondary" 
                onClick={resetFilters}
                disabled={loading}
              >
                فلٹرز ری سیٹ کریں
              </button>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="fas fa-list me-2"></i>سوالات کی فہرست</span>
            <button 
              className="btn btn-light btn-sm" 
              onClick={openAddModal}
              disabled={loading}
            >
              <i className="fas fa-plus me-1"></i>نیا سوال شامل کریں
            </button>
          </div>
          <div className="card-body">
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">لوڈ ہو رہا ہے...</span>
                </div>
              </div>
            )}
            
            {!loading && (
              <div className="table-responsive">
                <table className="table table-hover">
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
                          کوئی سوال دستیاب نہیں ہے
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((question) => {
                        const statusInfo = getStatusInfo(question.status);
                        return (
                          <tr key={question._id}>
                            <td>{question.entryNumber}</td>
                            <td>{question.title}</td>
                            <td>{formatDate(question.date)}</td>
                            <td>{question.resolver}</td>
                            <td>
                              <span className={`badge ${statusInfo.class}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleViewQuestion(question)}
                                disabled={loading}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteQuestion(question._id)}
                                disabled={loading}
                              >
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

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">نیا سوال شامل کریں</h5>
                <button type="button" className="btn-close" onClick={closeAddModal}></button>
              </div>
              <form onSubmit={handleAddQuestion}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="question-title" className="form-label">سوال کا عنوان *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="question-title"
                      name="title"
                      value={newQuestion.title}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="entry-number" className="form-label">اندراج نمبر</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="entry-number"
                      name="entryNumber"
                      value={newQuestion.entryNumber}
                      readOnly 
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="question-date" className="form-label">تاریخ</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="question-date"
                      name="date"
                      value={newQuestion.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="modal-resolver" className="form-label">حل کرنے والا *</label>
                    <select 
                      className="form-select" 
                      id="modal-resolver"
                      name="resolver"
                      value={newQuestion.resolver}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">حل کرنے والے کا انتخاب کریں</option>
                      {resolvers.map((resolver, index) => (
                        <option key={index} value={resolver}>{resolver}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="question-status" className="form-label">حیثیت</label>
                    <select 
                      className="form-select" 
                      id="question-status"
                      name="status"
                      value={newQuestion.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pending">زیر التواء</option>
                      <option value="in-progress">جاری ہے</option>
                      <option value="completed">مکمل شدہ</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeAddModal}
                    disabled={loading}
                  >
                    منسوخ کریں
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'محفوظ ہو رہا ہے...' : 'محفوظ کریں'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {showDetailModal && selectedQuestion && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">سوال کی تفصیلات</h5>
                <button type="button" className="btn-close" onClick={closeDetailModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>اندراج نمبر:</strong> <span>{selectedQuestion.entryNumber}</span>
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
                  <span className={`badge ${getStatusInfo(selectedQuestion.status).class} ms-2`}>
                    {getStatusInfo(selectedQuestion.status).text}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>شامل کرنے کی تاریخ:</strong> 
                  <span>{new Date(selectedQuestion.createdAt).toLocaleDateString('ur-PK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                {selectedQuestion.updatedAt && (
                  <div className="mb-3">
                    <strong>آخری تبدیلی:</strong> 
                    <span>{new Date(selectedQuestion.updatedAt).toLocaleDateString('ur-PK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeDetailModal}
                >
                  بند کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container text-center">
          <p className="mb-0">دار الافتاء سوالات مینجمنٹ سسٹم &copy; {new Date().getFullYear()}</p>
          <p className="mb-0" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
            <i className="fas fa-server me-1"></i>
            Backend Status: {loading ? 'متصل ہو رہا ہے...' : 'متصل'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;