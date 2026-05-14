import React from "react";
import Context from "../../context";
import './history.scss';

export default function History() {
  const { history } = React.useContext(Context);
  const [showHistory, setShowHistory] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="hbar">
        <div className="hbar-items" ref={containerRef}>
          {history.slice().reverse().map((item, key) => {
            const num = typeof item === 'string' ? parseFloat(item) : item;
            const cls = num < 2 ? 'low' : num <= 10 ? 'mid' : 'high';
            return (
              <span key={key} className={`hbar-item ${cls}`}>
                {Number(item).toFixed(2)}x
              </span>
            );
          })}
        </div>
        <button className="hbar-icon" onClick={() => setShowHistory(!showHistory)}>
          🕐
        </button>
      </div>

      {showHistory && (
        <div className="hpopup">
          <div className="hpopup-header">
            <span>Crash History</span>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="hpopup-body">
            {history.length === 0 ? (
              <div className="hpopup-empty">No rounds yet</div>
            ) : history.slice().reverse().map((item, key) => {
              const num = typeof item === 'string' ? parseFloat(item) : item;
              const cls = num < 2 ? 'low' : num <= 10 ? 'mid' : 'high';
              return (
                <div key={key} className={`hpopup-item ${cls}`}>
                  {Number(item).toFixed(2)}x
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}