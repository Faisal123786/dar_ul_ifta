import React, { useEffect, useState } from "react";
import { fetchStats } from "../api";

function Stats({ refresh }) {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatHandler = async () => {
      try {
        setLoading(true);
        const response = await fetchStats();
        setStats({
          total: response?.data?.total || 0,
          pending: response?.data?.pending || 0,
          inProgress: response?.data?.inProgress || 0,
          completed: response?.data?.completed || 0,
        });
        setError("");
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStatHandler();
  }, [refresh]);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div className="row mb-5">
      <div className="col-lg-3 col-md-6 mb-3 ">
        <div
          className="card stats-card "
          style={{ borderTop: "10px solid rgb(108 117 125)" }}
        >
          <div className="stats-number text-secondary">
            {stats.total}
          </div>
          <div className="stats-label">
            <i className="fas fa-list-alt me-1 text-secondary"></i>
            کل سوالات
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div
          className="card stats-card"
          style={{ borderTop: "10px solid rgb(255 193 7)" }}
        >
          <div className="stats-number text-warning">{stats.pending}</div>
          <div className="stats-label">
            <i className="fas fa-hourglass-half me-1 text-warning"></i>زیر التواء
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div
          className="card stats-card"
          style={{ borderTop: "10px solid rgb(25 135 84)" }}
        >
          <div className="stats-number text-success">{stats.completed}</div>
          <div className="stats-label">
            <i className="fas fa-check-circle me-1 text-success"></i>مکمل شدہ
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div
          className="card stats-card"
          style={{ borderTop: "10px solid rgb(13 202 240)" }}
        >
          <div className="stats-number text-info">{stats.inProgress}</div>
          <div className="stats-label">
            <i className="fas fa-sync-alt me-1 text-info"></i>جاری ہیں
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
