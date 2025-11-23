import React, { useState, useEffect } from "react";
import { updateQuestion,fetchQuestions } from "../api";
import { useToast } from "../context/ToastContext";
function QuestionDetailModal({
  selectedQuestion,
  setSelectedQuestion,
  setShowDetailModal,
  showDetailModal,
  onChange
}) {
  const [editableQuestion, setEditableQuestion] = useState(null);
  const { showToast } = useToast();
  useEffect(() => {
    if (selectedQuestion) {
      setEditableQuestion({ ...selectedQuestion });
    }
  }, [selectedQuestion]);

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

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestion(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!editableQuestion?._id) {
        showToast("سوال کی شناخت موجود نہیں ہے۔", "error");
        return;
      }

      await updateQuestion(editableQuestion._id, editableQuestion);
      await fetchQuestions();
      onChange();
      showToast("سوال کامیابی کے ساتھ اپ ڈیٹ ہو گیا ہے۔", "success");
      closeDetailModal();
    } catch (error) {
      showToast("سوال اپ ڈیٹ نہیں ہو سکا۔ دوبارہ کوشش کریں۔", "error");
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "نامعلوم";
    return new Date(dateString).toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {showDetailModal && editableQuestion && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(17, 35, 64, 0.8)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header text-white" style={{ background: "linear-gradient(to left, #2c5aa0 0%, #1e3a8a 100%)"}}>
                <h5 className="modal-title text-white">
                  <i className="fas fa-edit me-2"></i>سوال کی تفصیلات
                </h5>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">اندراج نمبر:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editableQuestion.entryNumber}
                        readOnly
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        حل کرنے والا:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="resolver"
                        value={editableQuestion.resolver}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">حیثیت:</label>
                      <select
                        className="form-select"
                        name="status"
                        value={editableQuestion.status}
                        onChange={handleChange}
                      >
                        <option value="pending">زیر التواء</option>
                        <option value="in-progress">جاری ہے</option>
                        <option value="completed">مکمل شدہ</option>
                      </select>
                      <span
                        className={`badge mt-2 ${
                          getStatusInfo(editableQuestion.status).class
                        }`}
                      >
                        {getStatusInfo(editableQuestion.status).text}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">عنوان:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={editableQuestion.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">تاریخ:</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={
                          editableQuestion.date
                            ? editableQuestion.date.split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3 small text-muted">
                      <strong>شامل کرنے کی تاریخ:</strong>{" "}
                      <span>{formatDateTime(editableQuestion.createdAt)}</span>
                    </div>

                    {editableQuestion.updatedAt && (
                      <div className="mb-3 small text-muted">
                        <strong>آخری تبدیلی:</strong>{" "}
                        <span>
                          {formatDateTime(editableQuestion.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDetailModal}
                >
                  <i className="fas fa-window-close me-2"></i>بند کریں
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{backgroundColor:"#2c5aa0"}}
                  onClick={handleSave}
                >
                  <i className="fas fa-save me-2"></i>محفوظ کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionDetailModal;
