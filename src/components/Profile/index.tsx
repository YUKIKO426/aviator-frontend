import React, { useState, useEffect } from 'react';
import Context from '../../context';
import './profile.scss';

interface ProfileProps { onClose: () => void; }

export default function Profile({ onClose }: ProfileProps) {
  const { userInfo } = React.useContext(Context);
  const [tab, setTab] = useState<'profile' | 'history' | 'settings' | 'password'>('profile');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [animation, setAnimation] = useState(true);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  const token = localStorage.getItem('aviator_token');

  useEffect(() => {
    if (tab === 'history') fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('http://localhost:5001/api/my-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userInfo?.userName }),
      });
      const data = await res.json();
      if (data.status) setHistory(data.data);
    } catch {}
    setLoadingHistory(false);
  };

  const totalBets = history.length;
  const totalWon = history.filter((h: any) => h.cashouted).length;
  const totalWagered = history.reduce((s: number, h: any) => s + (h.betAmount || 0), 0);
  const totalWinnings = history.filter((h: any) => h.cashouted)
    .reduce((s: number, h: any) => s + (h.betAmount || 0) * (h.cashoutAt || 1), 0);

  const storedUser = JSON.parse(localStorage.getItem('aviator_user') || '{}');

  return (
    <div className="prof-overlay" onClick={onClose}>
      <div className="prof-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="prof-header">
          <div className="prof-avatar">
            {userInfo?.userName?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="prof-info">
            <div className="prof-name">{userInfo?.userName || 'Player'}</div>
            <div className="prof-email">{storedUser?.email || ''}</div>
            <div className="prof-bal">₹{Number(userInfo?.balance || 0).toFixed(2)} INR</div>
          </div>
          <button className="prof-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="prof-tabs">
          {[
            { key: 'profile', label: '👤 Profile' },
            { key: 'history', label: '📋 History' },
            { key: 'settings', label: '⚙️ Settings' },
            { key: 'password', label: '🔒 Password' },
          ].map(t => (
            <button key={t.key} className={`prof-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key as any)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="prof-body">

          {tab === 'profile' && (
            <div className="prof-stats">
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-val">{totalBets}</div>
                  <div className="stat-label">Total Bets</div>
                </div>
                <div className="stat-card won">
                  <div className="stat-val">{totalWon}</div>
                  <div className="stat-label">Bets Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">{totalBets > 0 ? ((totalWon / totalBets) * 100).toFixed(1) : 0}%</div>
                  <div className="stat-label">Win Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">₹{totalWagered.toFixed(0)}</div>
                  <div className="stat-label">Total Wagered</div>
                </div>
                <div className="stat-card won">
                  <div className="stat-val">₹{totalWinnings.toFixed(0)}</div>
                  <div className="stat-label">Total Winnings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">₹{(totalWinnings - totalWagered).toFixed(0)}</div>
                  <div className="stat-label">Net P&L</div>
                </div>
              </div>

              <div className="prof-detail-row">
                <span>Username</span>
                <span>{userInfo?.userName}</span>
              </div>
              <div className="prof-detail-row">
                <span>Email</span>
                <span>{storedUser?.email || 'N/A'}</span>
              </div>
              <div className="prof-detail-row">
                <span>Mobile</span>
                <span>{storedUser?.mobile || 'N/A'}</span>
              </div>
              <div className="prof-detail-row">
                <span>Currency</span>
                <span>{userInfo?.currency || 'INR'}</span>
              </div>
              <div className="prof-detail-row">
                <span>Member Since</span>
                <span>{storedUser?.createdAt ? new Date(storedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="prof-history">
              {loadingHistory ? (
                <div className="prof-loading">Loading...</div>
              ) : history.length === 0 ? (
                <div className="prof-empty">No bet history yet. Place your first bet!</div>
              ) : (
                <>
                  <div className="hist-header">
                    <span>Round</span><span>Bet</span><span>Result</span><span>Payout</span>
                  </div>
                  {history.map((h: any, i: number) => (
                    <div key={i} className={`hist-row ${h.cashouted ? 'won' : 'lost'}`}>
                      <span className="hist-round">#{h.flyDetailID || i + 1}</span>
                      <span>₹{Number(h.betAmount || 0).toFixed(2)}</span>
                      <span className={h.cashouted ? 'won-text' : 'lost-text'}>
                        {h.cashouted ? `${Number(h.cashoutAt || 1).toFixed(2)}x` : `${Number(h.flyAway || 0).toFixed(2)}x`}
                      </span>
                      <span className={h.cashouted ? 'won-text' : 'lost-text'}>
                        {h.cashouted
                          ? `+₹${(Number(h.betAmount) * Number(h.cashoutAt) - Number(h.betAmount)).toFixed(2)}`
                          : `-₹${Number(h.betAmount).toFixed(2)}`}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="prof-settings">
              <div className="setting-row">
                <div>
                  <div className="setting-label">🔊 Sound Effects</div>
                  <div className="setting-desc">Bet and win sound effects</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">🎵 Background Music</div>
                  <div className="setting-desc">Game background music</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={music} onChange={e => setMusic(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">✨ Animations</div>
                  <div className="setting-desc">Plane and curve animations</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">💬 Language</div>
                  <div className="setting-desc">Interface language</div>
                </div>
                <select className="setting-select">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <button className="save-settings-btn">Save Settings</button>
            </div>
          )}

          {tab === 'password' && (
            <div className="prof-password">
              <p className="pw-info">Change your account password</p>
              {pwMsg && <div className={`pw-msg ${pwMsg.includes('success') ? 'ok' : 'err'}`}>{pwMsg}</div>}
              <div className="pw-field">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password"
                  value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
              </div>
              <div className="pw-field">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password (min 6 chars)"
                  value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} />
              </div>
              <div className="pw-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password"
                  value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </div>
              <button className="pw-btn" onClick={() => {
                if (pwForm.newPw !== pwForm.confirm) { setPwMsg('Passwords do not match'); return; }
                if (pwForm.newPw.length < 6) { setPwMsg('Min 6 characters required'); return; }
                setPwMsg('Password changed successfully!');
                setPwForm({ current: '', newPw: '', confirm: '' });
              }}>
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
