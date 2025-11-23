import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchQuestions, fetchStats } from "../api";
import QuestionFormModal from "./QuestionFormModal";
import Filters from "./Filters";
import { useToast } from "../context/ToastContext";
import { deleteQuestion } from "../api";
import QuestionDetailModal from "./QuestionDetailModal";

function DeleteQuestionModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>سوال حذف کریں</h2>
        <p style={styles.content}>
          کیا آپ واقعی اس سوال کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا
          سکتا۔
        </p>
        <div style={styles.actions}>
          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.cancel }}
            disabled={loading}
          >
            منسوخ کریں
          </button>
          <button
            onClick={onConfirm}
            style={{ ...styles.button, ...styles.delete }}
            disabled={loading}
          >
            {loading ? "حذف ہو رہا ہے..." : "حذف کریں"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsTable({ onChange }) {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    entryNumber: "",
    date: new Date().toISOString().split("T")[0],
    resolver: "",
    status: "pending",
  });

  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB");
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetchQuestions();
        setQuestions(response.data || []);
        setFilteredQuestions(response.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [onChange]);

  const generateEntryNumber = () => {
    if (questions.length === 0) return "FAT-001";

    const lastNumber = questions.reduce((max, q) => {
      if (!q.entryNumber) return max;
      const parts = q.entryNumber.split("-");
      const num = parseInt(parts[1] || 0);
      return num > max ? num : max;
    }, 0);

    return `FAT-${(lastNumber + 1).toString().padStart(3, "0")}`;
  };

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

  const handleDeleteQuestion = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await deleteQuestion(deleteId);

      const updated = await fetchQuestions();
      setQuestions(updated.data);
      setFilteredQuestions(updated.data);

      await fetchStats();

      showToast("سوال کامیابی سے حذف کر دیا گیا ہے", "success");
      onChange?.();
    } catch (error) {
      console.error("Error deleting question:", error);
      showToast("خرابی: سوال حذف نہیں ہو سکا", "error");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowDetailModal(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "زیر التواء", class: "bg-warning text-dark" };
      case "in-progress":
        return { text: "جاری ہے", class: "bg-info text-dark" };
      case "completed":
        return { text: "مکمل شدہ", class: "bg-success" };
      default:
        return { text: status, class: "bg-secondary" };
    }
  };

  return (
    <>
      <Filters
        questions={questions}
        setFilteredQuestions={setFilteredQuestions}
      />
      <div className="row">
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-light btn-sm p-2 text-white "
            style={{ backgroundColor: "#2c5aa0", width:"100%" }}
            onClick={openAddModal}
            disabled={loading}
          >
            <i className="fas fa-plus me-1"></i>
            نیا سوال شامل کریں
          </button>
        </div>
        <div className="col-md-10"></div>
      </div>

      <div className="card-body">
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">لوڈ ہو رہا ہے...</span>
            </div>
            <p className="mt-2 text-primary">
              ڈیٹا لوڈ ہو رہا ہے، براہ کرم انتظار کریں...
            </p>
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
                          <span className={`badge ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleViewQuestion(question)}
                            disabled={loading}
                            title="تفصیلات دیکھیں"
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteQuestion(question._id)}
                            disabled={loading}
                            title="سوال حذف کریں"
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

      <QuestionFormModal
        setShowAddModal={setShowAddModal}
        showAddModal={showAddModal}
        entryNumber={generateEntryNumber()}
        onChange={onChange}
      />

      <DeleteQuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        loading={loading}
      />

      <QuestionDetailModal
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        setShowDetailModal={setShowDetailModal}
        showDetailModal={showDetailModal}
        onChange={onChange}
      />
    </>
  );
}

export default QuestionsTable;

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(17, 35, 64, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    direction: "rtl",
  },
  title: {
    marginBottom: "15px",
    color: "red",
  },
  content: {
    marginBottom: "25px",
    fontSize: "16px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    cursor: "pointer",
    minWidth: "100px",
  },
  cancel: {
    backgroundColor: "#e0e0e0",
    border: "none",
    color: "#333",
  },
  delete: {
    backgroundColor: "red",
    border: "none",
    color: "#fff",
  },
};
