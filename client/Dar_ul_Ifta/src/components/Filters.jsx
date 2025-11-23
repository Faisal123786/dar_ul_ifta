import React, { useState } from "react";
import { filter } from "../api";
import { useToast } from "../context/ToastContext";
function Filters({ questions, setFilteredQuestions, showAlert }) {
  const [loading, setLoading] = useState();
  const [filters, setFilters] = useState({
    status: "all",
    resolver: "all",
    dateFrom: "",
    dateTo: "",
  });
  const { showToast } = useToast();

  const [resolvers] = useState([
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
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await filter(filters);
      setFilteredQuestions(response.data);
      showToast(
        ` ${response.data.length} سوالات فلٹر کے مطابق پائے گئے`,
        "success"
      );
    } catch (error) {
      console.error("Error applying filters:", error);
      showToast("  خرابی: فلٹرز لاگو نہیں ہو سک", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      resolver: "all",
      dateFrom: "",
      dateTo: "",
    });
    setFilteredQuestions(questions);
    showToast("تمام فلٹرز ری سیٹ کر دیے گئے ہیں", "success");
  };

  return (
    <div className="filter-section">
      <h5 className=" text-end" style={{ color: "#1e3a8a" }}>
        <i className="fas fa-filter me-2"></i>سوالات پر فلٹر لگائیں
      </h5>
      <div className="row g-3">
        <div className="col-md-2">
          <label htmlFor="status-filter" className="form-label">
            حیثیت کے لحاظ سے
          </label>
          <select
            className="form-select"
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">تمام حیثیتیں</option>
            <option value="pending">زیر التواء</option>
            <option value="in-progress">جاری ہیں</option>
            <option value="completed">مکمل شدہ</option>
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="resolver-filter" className="form-label">
            حل کرنے والے کے لحاظ سے
          </label>
          <select
            className="form-select"
            id="resolver-filter"
            name="resolver"
            value={filters.resolver}
            onChange={handleFilterChange}
          >
            <option value="all">تمام حل کرنے والے</option>
            {resolvers.map((resolver, index) => (
              <option key={index} value={resolver}>
                {resolver}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label htmlFor="date-from" className="form-label">
            تاریخ سے
          </label>
          <input
            type="date"
            className="form-control"
            id="date-from"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-2">
          <label htmlFor="date-to" className="form-label">
            تاریخ تک
          </label>
          <input
            type="date"
            className="form-control"
            id="date-to"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
          />
        </div>
        <div className="col-md-4">
          <div
            style={{
              display: "flex",
              gap: "2px",
              width: "100%",
              alignItems: "center",
              justifyContent: "end",
              marginTop: "32px",
            }}
          >
            <button
              className="btn btn-outline-danger bg-danger text-white"
              style={{width:"100%"}}
              onClick={resetFilters}
              disabled={loading}
            >
              <i className="fas fa-redo me-2"></i>
              فلٹرز ری سیٹ کریں
            </button>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#2c5aa0" }}
              onClick={applyFilters}
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin me-2"></i>
              ) : (
                <i className="fas fa-search me-2"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;
