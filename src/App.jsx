import React, { useState, useEffect } from 'react';
import data from './data.json';
import './App.css';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: 1-10, 1: 11-20, 2: 21-30

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;
  const todayStr = now.toISOString().split('T')[0];
  const todayData = data.find(d => d.date === todayStr);

  let nextTime = null;
  let event = '';
  let ramadanDay = '';
  let normalDate = '';

  if (todayData) {
    const sahriTime = new Date(`${todayData.date}T${todayData.sahri_end}:00`);
    const iftarTime = new Date(`${todayData.date}T${todayData.iftar}:00`);

    if (now < sahriTime) {
      nextTime = sahriTime;
      event = 'সাহরি শেষ';
    } else if (now < iftarTime) {
      nextTime = iftarTime;
      event = 'ইফতার';
    } else {
      // Next day sahri
      const nextDayData = data.find(d => d.ramadan === todayData.ramadan + 1);
      if (nextDayData) {
        nextTime = new Date(`${nextDayData.date}T${nextDayData.sahri_end}:00`);
        event = 'সাহরি শেষ';
      }
    }
    ramadanDay = `রমজান ${toBengaliDigits(todayData.ramadan.toString())}`;
    normalDate = new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  }

  let progress = 0;
  if (todayData) {
    const sahriTime = new Date(`${todayData.date}T${todayData.sahri_end}:00`);
    const iftarTime = new Date(`${todayData.date}T${todayData.iftar}:00`);

    if (now < sahriTime) {
      // Before sahri, progress 0
      progress = 0;
    } else if (now < iftarTime) {
      // During fasting, progress from sahri to iftar
      const total = iftarTime - sahriTime;
      const elapsed = now - sahriTime;
      progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    } else {
      // After iftar, before next sahri
      const nextDayData = data.find(d => d.ramadan === todayData.ramadan + 1);
      if (nextDayData) {
        const nextSahriTime = new Date(`${nextDayData.date}T${nextDayData.sahri_end}:00`);
        const total = nextSahriTime - iftarTime;
        const elapsed = now - iftarTime;
        progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      } else {
        progress = 100;
      }
    }
  }

  const timeLeft = nextTime ? Math.max(0, nextTime - now) : 0;
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const timeLeftStr = toBengaliDigits(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

  const currentTimeStr = toBengaliDigits(now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const nextTimeStr = nextTime ? toBengaliDigits(nextTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })) : 'নেই';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="buttons">
          <button onClick={toggleFullscreen} className="fullscreen-btn">
            {isFullscreen ? 'এক্সিট ফুলস্ক্রিন' : 'ফুলস্ক্রিন'}
          </button>
          <button onClick={() => setShowModal(true)} className="calendar-btn">
            ক্যালেন্ডার দেখুন
          </button>
        </div>
      </div>
      <div className="info">
        <div className="info-item">
          <h3>রমজান তারিখ</h3>
          <p>{ramadanDay}</p>
        </div>
        <div className="info-item">
          <h3>সাধারণ তারিখ</h3>
          <p>{normalDate}</p>
        </div>
        <div className="info-item">
          <h3>বর্তমান সময়</h3>
          <p>{currentTimeStr}</p>
        </div>
        <div className="info-item">
          <h3>পরবর্তী ইভেন্ট</h3>
          <p>{event} - {nextTimeStr}</p>
        </div>
      </div>
      <div className={`timer-container ${timeLeft <= 0 ? 'end' : timeLeft <= 60000 ? 'pulse' : ''}`}>
        {timeLeft > 0 ? timeLeftStr : 'সময় শেষ!'}
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>রমজান ক্যালেন্ডার ২০২৬</h2>
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                রহমত (১-১০)
              </button>
              <button
                className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                মাগফিরাত (১১-২০)
              </button>
              <button
                className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                নাজাত (২১-৩০)
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>রমজান</th>
                  <th>তারিখ</th>
                  <th>সাহরি শেষ</th>
                  <th>ইফতার</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(activeTab * 10, (activeTab + 1) * 10).map(day => (
                  <tr key={day.ramadan}>
                    <td>{toBengaliDigits(day.ramadan.toString())}</td>
                    <td>{day.date}</td>
                    <td>{day.sahri_end}</td>
                    <td>{day.iftar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="close-btn" onClick={() => setShowModal(false)}>বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;