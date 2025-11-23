import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Header from "./components/Header";
import Stats from "./components/Stats";
import QuestionFormModal from "./components/QuestionFormModal";
import QuestionDetailModal from "./components/QuestionDetailModal";
import Footer from "./components/Footer";
import QuestionsTable from "./components/QuestionsTable";
import Filters from "./components/Filters";

function App() {
    const [refreshStats, setRefreshStats] = useState(false);
  return (
    <div className="App" dir="rtl">
      <Header />
      <div className="container mt-5 flex-grow-1">
        <Stats refresh={refreshStats} />
        <QuestionsTable onChange={() => setRefreshStats(prev => !prev)}/>
      </div>
      <Footer />
    </div>
  );
}

export default App;
