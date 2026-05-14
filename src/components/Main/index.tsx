import React, { useState } from "react";
import "./main.scss";
import History from "./history";
import Crash from "../Crash/index";
import Bet from "./bet";
import LiveFeed from "../LiveFeed/index";
import Context from "../../context";

export default function Main() {
  const [addBetPanel, setAddBetPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'previous' | 'top'>('all');
  const { bettedUsers, previousHand } = React.useContext(Context);

  const totalWin = bettedUsers?.filter((u: any) => u.cashouted)
    .reduce((s: number, u: any) => s + Number(u.cashOut || 0), 0) || 0;

  return (
    <div className="av-root">
      {/* Ticker */}
      <LiveFeed />

      {/* History bar */}
      <div className="av-history-bar"><History /></div>

      {/* Main */}
      <div className="av-main">

        {/* LEFT: Bets panel */}
        <div className="av-bets-panel">
          <div className="av-tabs">
            {(['all', 'previous', 'top'] as const).map(t => (
              <button key={t} className={`av-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t === 'all' ? 'All Bets' : t === 'previous' ? 'Previous' : 'Top'}
              </button>
            ))}
          </div>

          {activeTab === 'all' && (
            <div className="av-stats-row">
              <div className="av-stat">
                <span className="av-stat-val">{bettedUsers?.length || 0}/{(bettedUsers?.length || 0) + 28}</span>
                <span className="av-stat-label">Bets</span>
              </div>
              <div className="av-stat">
                <span className="av-stat-val">₹{totalWin.toFixed(0)}</span>
                <span className="av-stat-label">Total win INR</span>
              </div>
            </div>
          )}

          <div className="av-col-header">
            <span>Player</span>
            <span>Bet INR</span>
            <span>x</span>
            <span>Win INR</span>
          </div>

          <div className="av-players-scroll">
            {activeTab === 'all' && (bettedUsers?.length > 0 ? bettedUsers.map((u: any, i: number) => (
              <div key={i} className={`av-player-row ${u.cashouted ? 'cashed' : ''}`}>
                <div className="av-p-avatar-wrap"><span className="av-p-avatar">👤</span></div>
                <span className="av-p-name">{u.name?.slice(0, 10) || 'Player'}</span>
                <span className="av-p-bet">{Number(u.betAmount || 0).toFixed(2)}</span>
                <span className="av-p-mult">{u.cashouted ? `${Number(u.target || 1).toFixed(2)}x` : ''}</span>
                <span className={`av-p-win ${u.cashouted ? 'won' : ''}`}>
                  {u.cashouted ? Number(u.cashOut || 0).toFixed(2) : ''}
                </span>
              </div>
            )) : <div className="av-no-bets">Waiting for bets...</div>)}

            {activeTab === 'previous' && (previousHand?.length > 0 ? previousHand.map((u: any, i: number) => (
              <div key={i} className={`av-player-row ${u.f?.cashouted ? 'cashed' : 'lost'}`}>
                <div className="av-p-avatar-wrap"><span className="av-p-avatar">👤</span></div>
                <span className="av-p-name">{u.userName?.slice(0, 10)}</span>
                <span className="av-p-bet">{Number(u.f?.betAmount || 0).toFixed(2)}</span>
                <span className="av-p-mult">{u.f?.cashouted ? `${Number(u.f?.target || 1).toFixed(2)}x` : ''}</span>
                <span className={`av-p-win ${u.f?.cashouted ? 'won' : 'lost-txt'}`}>
                  {u.f?.cashouted ? Number(u.f?.cashAmount || 0).toFixed(2) : '-'}
                </span>
              </div>
            )) : <div className="av-no-bets">No data yet</div>)}

            {activeTab === 'top' && previousHand?.slice()
              .sort((a: any, b: any) => (b.f?.cashAmount || 0) - (a.f?.cashAmount || 0))
              .slice(0, 20).map((u: any, i: number) => (
              <div key={i} className="av-player-row cashed">
                <div className="av-p-avatar-wrap"><span className="av-p-rank">#{i+1}</span></div>
                <span className="av-p-name">{u.userName?.slice(0, 10)}</span>
                <span className="av-p-bet">{Number(u.f?.betAmount || 0).toFixed(2)}</span>
                <span className="av-p-mult">{u.f?.cashouted ? `${Number(u.f?.target || 1).toFixed(2)}x` : ''}</span>
                <span className="av-p-win won">{u.f?.cashouted ? Number(u.f?.cashAmount || 0).toFixed(2) : ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Canvas + Bet controls */}
        <div className="av-game-area">
          <div className="av-canvas-wrap"><Crash /></div>
          <div className="av-bet-wrap">
            <Bet index="f" add={addBetPanel} setAdd={setAddBetPanel} />
            {addBetPanel && <Bet index="s" add={addBetPanel} setAdd={setAddBetPanel} />}
          </div>
        </div>

      </div>
    </div>
  );
}
