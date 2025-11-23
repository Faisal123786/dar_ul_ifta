import React, { useState } from "react";
import { createQuestion, fetchStats, fetchQuestions } from "../api";
import { useToast } from "../context/ToastContext";

const resolvers = [
  "محمد دین",
  "محمد زید",
  "محمد احمد",
  "محمد",
  "علی منظور",
  "عبد القدیر",
  "انعام اللہ خان",
  "صاحب علی",
  "احمد حسین",
  "زریاب خان",
  "محمد اویس",
  "محمد شہاب خان",
  "محمد سلیمان",
];

function QuestionFormModal({
  showAddModal,
  setShowAddModal,
  entryNumber,
  onChange,
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    entryNumber: "",
    date: new Date().toISOString().split("T")[0],
    resolver: "",
    status: "pending",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewQuestion({
      title: "",
      entryNumber: "",
      date: new Date().toISOString().split("T")[0],
      resolver: "",
      status: "pending",
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!newQuestion.title || !newQuestion.resolver) {
      showToast(
        "براہ کرم سوال کا عنوان اور حل کرنے والے کا انتخاب کریں",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      await createQuestion(newQuestion);
      onChange();
      showToast("سوال کامیابی سے شامل کر دیا گیا ہے", "success");
      closeAddModal();
      await fetchQuestions();
      await fetchStats();
    } catch (error) {
      console.error("Error adding question:", error);
      showToast(
        "خرابی: سوال شامل نہیں ہو سکا - " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {showAddModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(17, 35, 64, 0.8)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{
                  borderBottom: "none",
                  borderRadius: "5px 5px 0 0",
                  background: "linear-gradient(to left, #2c5aa0 0%, #1e3a8a 100%)",
                }}
              >
                <h5 className="modal-title text-white">
                  <i className="fas fa-plus-circle ms-2"></i> نیا سوال شامل کریں
                </h5>
              </div>

              <form onSubmit={handleAddQuestion}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="entry-number" className="form-label">
                          اندراج نمبر
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="entry-number"
                          name="entryNumber"
                          value={entryNumber}
                          readOnly
                          dir="ltr"
                          style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="question-title" className="form-label">
                          سوال کا عنوان <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="question-title"
                          name="title"
                          value={newQuestion.title}
                          onChange={handleInputChange}
                          required
                          placeholder="تفصیلی سوال کا عنوان لکھیں"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="question-date" className="form-label">
                          تاریخ
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="question-date"
                          name="date"
                          value={newQuestion.date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="modal-resolver" className="form-label">
                          حل کرنے والا <span className="text-danger">*</span>
                        </label>
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
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-start">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ backgroundColor: "#2c5aa0" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <i className="fas fa-spinner fa-spin ms-2"></i>
                    ) : (
                      <i className="fas fa-save ms-2"></i>
                    )}
                    محفوظ کریں
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
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
    </div>
  );
}

export default QuestionFormModal;
