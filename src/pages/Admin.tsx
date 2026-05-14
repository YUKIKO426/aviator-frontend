import React, { useState, useEffect } from 'react';
import './admin.scss';

const API = 'http://localhost:5001/api/admin';

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [authHeader, setAuthHeader] = useState<any>({});
  const [tab, setTab] = useState<'stats'|'deposits'|'withdrawals'|'users'|'settings'|'email'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payConfig, setPayConfig] = useState<any>({});
  const [emailConfig, setEmailConfig] = useState<any>({ emailUser:'', emailPass:'', emailFromName:'Aviator Game' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok'|'err'>('ok');
  const [filter, setFilter] = useState('pending');
  const [userFilter, setUserFilter] = useState<'all'|'inactive'|'balance'>('all');
  const [emailModal, setEmailModal] = useState<any>(null);
  const [bulkEmail, setBulkEmail] = useState({ subject:'', message:'' });
  const [emailForm, setEmailForm] = useState({ subject:'', message:'' });

  const headers = { ...authHeader, 'Content-Type': 'application/json' };

  const showMsg = (m: string, type: 'ok'|'err' = 'ok') => {
    setMsg(m); setMsgType(type); setTimeout(() => setMsg(''), 4000);
  };

  const login = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success) {
        setAuthHeader({ username: creds.username, password: creds.password });
        setLoggedIn(true);
      } else showMsg(data.error || 'Login failed', 'err');
    } catch { showMsg('Connection failed', 'err'); }
  };

  const fetchAll = async () => {
    try {
      const [s, d, w, u] = await Promise.all([
        fetch(`${API}/stats`, { headers: authHeader }).then(r => r.json()),
        fetch(`${API}/deposits`, { headers: authHeader }).then(r => r.json()),
        fetch(`${API}/withdrawals`, { headers: authHeader }).then(r => r.json()),
        fetch(`${API}/users`, { headers: authHeader }).then(r => r.json()),
      ]);
      if (s.success) setStats(s.data);
      if (d.success) setDeposits(d.data);
      if (w.success) setWithdrawals(w.data);
      if (u.success) setUsers(u.data);

      // Fetch configs
      const [pc, ec] = await Promise.all([
        fetch(`${API}/payment-config`, { headers: authHeader }).then(r => r.json()),
        fetch(`${API}/email-config`, { headers: authHeader }).then(r => r.json()),
      ]);
      if (pc.success) setPayConfig(pc.data);
      if (ec.success) setEmailConfig(ec.data);
    } catch {}
  };

  useEffect(() => { if (loggedIn) { fetchAll(); const t = setInterval(fetchAll, 30000); return () => clearInterval(t); } }, [loggedIn]);

  const approveDeposit = async (id: string) => {
    const r = await fetch(`${API}/deposits/${id}/approve`, { method:'POST', headers });
    const d = await r.json();
    d.success ? showMsg('✅ ' + d.message) : showMsg(d.error, 'err');
    fetchAll();
  };

  const rejectDeposit = async (id: string) => {
    const reason = window.prompt('Reason (optional):') || 'Rejected';
    const r = await fetch(`${API}/deposits/${id}/reject`, { method:'POST', headers, body: JSON.stringify({ reason }) });
    const d = await r.json();
    d.success ? showMsg('Deposit rejected') : showMsg(d.error, 'err');
    fetchAll();
  };

  const approveWithdraw = async (id: string) => {
    const r = await fetch(`${API}/withdrawals/${id}/approve`, { method:'POST', headers });
    const d = await r.json();
    d.success ? showMsg('✅ Withdrawal approved') : showMsg(d.error, 'err');
    fetchAll();
  };

  const rejectWithdraw = async (id: string) => {
    const reason = window.prompt('Reason:') || 'Rejected';
    const r = await fetch(`${API}/withdrawals/${id}/reject`, { method:'POST', headers, body: JSON.stringify({ reason }) });
    const d = await r.json();
    d.success ? showMsg('Withdrawal rejected & refunded') : showMsg(d.error, 'err');
    fetchAll();
  };

  const addBalance = async (userId: string, username: string) => {
    const amount = window.prompt(`Add balance to ${username} (₹):`);
    if (!amount || isNaN(Number(amount))) return;
    const note = window.prompt('Note:') || 'Admin credit';
    const r = await fetch(`${API}/users/${userId}/add-balance`, { method:'POST', headers, body: JSON.stringify({ amount: Number(amount), note }) });
    const d = await r.json();
    d.success ? showMsg(`✅ ₹${amount} added to ${username}`) : showMsg(d.error, 'err');
    fetchAll();
  };

  const refundUser = async (userId: string, username: string, balance: number) => {
    if (!window.confirm(`Refund ₹${balance} from ${username}'s account?`)) return;
    const r = await fetch(`${API}/users/${userId}/refund`, { method:'POST', headers });
    const d = await r.json();
    d.success ? showMsg(`✅ ₹${d.refunded} refunded from ${username}`) : showMsg(d.error, 'err');
    fetchAll();
  };

  const sendEmail = async () => {
    if (!emailModal) return;
    const r = await fetch(`${API}/users/${emailModal.userId}/send-email`, {
      method:'POST', headers,
      body: JSON.stringify(emailForm),
    });
    const d = await r.json();
    if (d.success) { showMsg('✅ ' + d.message); setEmailModal(null); }
    else showMsg(d.error, 'err');
  };

  const sendBulkEmail = async () => {
    const r = await fetch(`${API}/users/send-bulk-email`, {
      method:'POST', headers,
      body: JSON.stringify(bulkEmail),
    });
    const d = await r.json();
    d.success ? showMsg('✅ ' + d.message) : showMsg(d.error, 'err');
  };

  const saveSettings = async () => {
    const [r1, r2] = await Promise.all([
      fetch(`${API}/payment-config`, { method:'POST', headers, body: JSON.stringify(payConfig) }),
      fetch(`${API}/email-config`, { method:'POST', headers, body: JSON.stringify(emailConfig) }),
    ]);
    showMsg('✅ Settings saved!');
  };

  const filteredUsers = users.filter(u => {
    if (userFilter === 'inactive') return u.isInactive;
    if (userFilter === 'balance') return u.balance > 0;
    return true;
  });

  const pendingDep = deposits.filter(d => d.status === 'pending').length;
  const pendingWith = withdrawals.filter(w => w.status === 'pending').length;

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="admin-logo">🛡️ Admin Panel</div>
          <h2>Login</h2>
          {msg && <div className="admin-error">{msg}</div>}
          <input type="text" placeholder="Username" value={creds.username}
            onChange={e => setCreds({ ...creds, username: e.target.value })} />
          <input type="password" placeholder="Password" value={creds.password}
            onChange={e => setCreds({ ...creds, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && login()} />
          <button onClick={login}>Login</button>
          <div className="admin-hint">Default: admin / admin123</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-brand">🛡️ Admin</div>
        {[
          { key:'stats',       label:'📊 Dashboard' },
          { key:'deposits',    label:`⬆️ Deposits ${pendingDep > 0 ? `(${pendingDep})` : ''}` },
          { key:'withdrawals', label:`⬇️ Withdrawals ${pendingWith > 0 ? `(${pendingWith})` : ''}` },
          { key:'users',       label:`👥 Users (${users.length})` },
          { key:'email',       label:'📧 Bulk Email' },
          { key:'settings',    label:'⚙️ Settings' },
        ].map(t => (
          <button key={t.key} className={`admin-nav-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
        <button className="admin-logout" onClick={() => setLoggedIn(false)}>🚪 Logout</button>
      </div>

      {/* Main */}
      <div className="admin-main">
        {msg && <div className={`admin-toast ${msgType}`}>{msg}</div>}

        {/* Email Modal */}
        {emailModal && (
          <div className="email-modal-overlay" onClick={() => setEmailModal(null)}>
            <div className="email-modal" onClick={e => e.stopPropagation()}>
              <div className="email-modal-header">
                <span>📧 Email to {emailModal.username}</span>
                <button onClick={() => setEmailModal(null)}>×</button>
              </div>
              <div className="email-modal-body">
                <div className="em-to">To: <strong>{emailModal.email}</strong></div>
                {emailModal.balance > 0 && (
                  <div className="em-balance">Balance: ₹{emailModal.balance.toFixed(2)}</div>
                )}
                <input className="em-input" placeholder="Subject"
                  value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} />
                <textarea className="em-textarea" placeholder="Write your message here..."
                  rows={6} value={emailForm.message}
                  onChange={e => setEmailForm({ ...emailForm, message: e.target.value })} />
                <div className="em-templates">
                  <span>Quick templates:</span>
                  <button onClick={() => setEmailForm({ subject: 'We miss you!', message: `Hi ${emailModal.username}, we noticed you haven't played in a while. Come back and try your luck! Your account balance is waiting for you.` })}>
                    Inactive reminder
                  </button>
                  <button onClick={() => setEmailForm({ subject: 'Your balance is waiting', message: `Hi ${emailModal.username}, you have ₹${emailModal.balance?.toFixed(2)} in your account. Login and play today!` })}>
                    Balance reminder
                  </button>
                </div>
                <button className="em-send-btn" onClick={sendEmail}>Send Email</button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {tab === 'stats' && stats && (
          <div>
            <h1>Dashboard</h1>
            <div className="stat-cards">
              {[
                { label:'Total Users', val:stats.totalUsers, icon:'👥' },
                { label:'Total Balance', val:`₹${stats.totalBalance}`, icon:'💰' },
                { label:'Total Deposited', val:`₹${stats.totalDeposited}`, icon:'⬆️' },
                { label:'Total Withdrawn', val:`₹${stats.totalWithdrawn}`, icon:'⬇️' },
                { label:'Pending Deposits', val:stats.pendingDeposits, icon:'⏳', alert:stats.pendingDeposits > 0 },
                { label:'Pending Withdrawals', val:stats.pendingWithdraws, icon:'⏳', alert:stats.pendingWithdraws > 0 },
                { label:'Inactive Users', val:stats.inactiveUsers || 0, icon:'😴', alert:(stats.inactiveUsers || 0) > 0 },
                { label:'Total Bets', val:stats.totalBets, icon:'🎯' },
              ].map((s, i) => (
                <div key={i} className={`stat-card ${s.alert ? 'alert' : ''}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deposits */}
        {tab === 'deposits' && (
          <div>
            <div className="admin-page-header">
              <h1>Deposit Requests</h1>
              <div className="filter-btns">
                {['pending','approved','rejected','all'].map(f => (
                  <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <button className="refresh-btn" onClick={fetchAll}>🔄</button>
            </div>
            <div className="admin-table">
              <div className="table-head" style={{gridTemplateColumns:'1.2fr 0.8fr 1.5fr 1.2fr 0.8fr 1.5fr'}}>
                <span>User</span><span>Amount</span><span>UTR</span><span>Time</span><span>Status</span><span>Actions</span>
              </div>
              {deposits.filter(d => filter==='all'||d.status===filter).map(d => (
                <div key={d.id} className={`table-row ${d.status}`} style={{gridTemplateColumns:'1.2fr 0.8fr 1.5fr 1.2fr 0.8fr 1.5fr'}}>
                  <span className="td-user">{d.userName}</span>
                  <span className="td-amount">₹{d.amount}</span>
                  <span className="td-utr">{d.utrNumber}</span>
                  <span className="td-time">{new Date(d.createdAt).toLocaleString()}</span>
                  <span className={`td-status ${d.status}`}>{d.status}</span>
                  <span className="td-actions">
                    {d.status==='pending' && <>
                      <button className="approve-btn" onClick={() => approveDeposit(d.id)}>✅</button>
                      <button className="reject-btn" onClick={() => rejectDeposit(d.id)}>❌</button>
                    </>}
                    {d.status!=='pending' && <span className="done-label">{d.status}</span>}
                  </span>
                </div>
              ))}
              {deposits.filter(d => filter==='all'||d.status===filter).length===0 && <div className="no-data">No {filter} requests</div>}
            </div>
          </div>
        )}

        {/* Withdrawals */}
        {tab === 'withdrawals' && (
          <div>
            <div className="admin-page-header">
              <h1>Withdrawal Requests</h1>
              <div className="filter-btns">
                {['pending','approved','rejected','all'].map(f => (
                  <button key={f} className={`filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <button className="refresh-btn" onClick={fetchAll}>🔄</button>
            </div>
            <div className="admin-table">
              <div className="table-head" style={{gridTemplateColumns:'1.2fr 0.8fr 1.5fr 1.2fr 0.8fr 1.5fr'}}>
                <span>User</span><span>Amount</span><span>UPI ID</span><span>Time</span><span>Status</span><span>Actions</span>
              </div>
              {withdrawals.filter(w => filter==='all'||w.status===filter).map(w => (
                <div key={w.id} className={`table-row ${w.status}`} style={{gridTemplateColumns:'1.2fr 0.8fr 1.5fr 1.2fr 0.8fr 1.5fr'}}>
                  <span className="td-user">{w.userName}</span>
                  <span className="td-amount">₹{w.amount}</span>
                  <span className="td-utr">{w.upiId}</span>
                  <span className="td-time">{new Date(w.createdAt).toLocaleString()}</span>
                  <span className={`td-status ${w.status}`}>{w.status}</span>
                  <span className="td-actions">
                    {w.status==='pending' && <>
                      <button className="approve-btn" onClick={() => approveWithdraw(w.id)}>✅ Sent</button>
                      <button className="reject-btn" onClick={() => rejectWithdraw(w.id)}>❌</button>
                    </>}
                    {w.status!=='pending' && <span className="done-label">{w.status}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div className="admin-page-header">
              <h1>Users</h1>
              <div className="filter-btns">
                {[
                  { key:'all', label:'All' },
                  { key:'inactive', label:`😴 Inactive (${users.filter(u=>u.isInactive).length})` },
                  { key:'balance', label:`💰 Has Balance (${users.filter(u=>u.balance>0).length})` },
                ].map(f => (
                  <button key={f.key} className={`filter-btn ${userFilter===f.key?'active':''}`}
                    onClick={() => setUserFilter(f.key as any)}>{f.label}</button>
                ))}
              </div>
              <button className="refresh-btn" onClick={fetchAll}>🔄</button>
            </div>

            <div className="admin-table">
              <div className="table-head users-grid">
                <span>Username</span><span>Email</span><span>Mobile</span>
                <span>Password</span><span>Balance</span><span>Last Active</span><span>Actions</span>
              </div>
              {filteredUsers.map(u => (
                <div key={u.userId} className={`table-row users-grid ${u.isInactive ? 'inactive-row' : ''}`}>
                  <span className="td-user">
                    {u.username}
                    {u.isInactive && <span className="inactive-badge">inactive</span>}
                  </span>
                  <span className="td-email">{u.email}</span>
                  <span className="td-mobile">{u.mobile || '—'}</span>
                  <span className="td-password" style={{color:'#fbbf24',fontFamily:'monospace',fontSize:'11px'}}>{u.plainPassword || '—'}</span>
                  <span className="td-amount">₹{Number(u.balance).toFixed(2)}</span>
                  <span className="td-time">
                    {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}
                  </span>
                  <span className="td-actions">
                    <button className="approve-btn" onClick={() => {
                      setEmailModal(u);
                      setEmailForm({ subject: '', message: '' });
                    }} title="Send Email">📧</button>
                    <button className="approve-btn" onClick={() => addBalance(u.userId, u.username)}
                      title="Add Balance">+₹</button>
                    {u.balance > 0 && (
                      <button className="reject-btn" onClick={() => refundUser(u.userId, u.username, u.balance)}
                        title="Refund Balance">↩️</button>
                    )}
                  </span>
                </div>
              ))}
              {filteredUsers.length === 0 && <div className="no-data">No users found</div>}
            </div>
          </div>
        )}

        {/* Bulk Email */}
        {tab === 'email' && (
          <div className="admin-settings">
            <h1>📧 Bulk Email to Inactive Users</h1>
            <div className="settings-form">
              <p style={{color:'#888',fontSize:'13px',marginBottom:'16px'}}>
                Send email to all users who haven't played in 7+ days. ({users.filter(u=>u.isInactive).length} inactive users)
              </p>
              <div className="sf-field">
                <label>Subject</label>
                <input value={bulkEmail.subject}
                  onChange={e => setBulkEmail({ ...bulkEmail, subject: e.target.value })}
                  placeholder="We miss you at Aviator!" />
              </div>
              <div className="sf-field">
                <label>Message</label>
                <textarea rows={6} style={{width:'100%',background:'#0f0f1a',border:'1px solid #2a2a4a',borderRadius:'8px',padding:'10px 14px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box',resize:'vertical'}}
                  value={bulkEmail.message}
                  onChange={e => setBulkEmail({ ...bulkEmail, message: e.target.value })}
                  placeholder="Write your message..." />
              </div>
              <div className="em-templates" style={{marginBottom:'16px'}}>
                <span style={{color:'#666',fontSize:'12px'}}>Quick templates:</span>
                <button onClick={() => setBulkEmail({ subject:'We miss you at Aviator! 🎮', message:'Hi there! We noticed you haven\'t played in a while. Come back and experience the thrill of Aviator! Your account is ready and waiting.' })}>
                  Inactive reminder
                </button>
                <button onClick={() => setBulkEmail({ subject:'Your balance is waiting! 💰', message:'Hi! You have an unclaimed balance in your Aviator account. Login today and use it to win big!' })}>
                  Balance reminder
                </button>
              </div>
              <button className="save-btn" onClick={sendBulkEmail}>
                📤 Send to All Inactive Users
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="admin-settings">
            <h1>Settings</h1>
            <div className="settings-form">
              <h3 style={{color:'#aaa',marginBottom:'16px'}}>💳 Payment Settings</h3>
              <div className="sf-field">
                <label>Your UPI ID</label>
                <input value={payConfig.upiId||''} onChange={e => setPayConfig({...payConfig,upiId:e.target.value})} placeholder="yourname@upi" />
              </div>
              <div className="sf-field">
                <label>Display Name</label>
                <input value={payConfig.upiName||''} onChange={e => setPayConfig({...payConfig,upiName:e.target.value})} placeholder="Aviator Games" />
              </div>
              <div className="sf-field">
                <label>QR Code Image URL</label>
                <input value={payConfig.qrImageUrl||''} onChange={e => setPayConfig({...payConfig,qrImageUrl:e.target.value})} placeholder="https://..." />
                {payConfig.qrImageUrl && <img src={payConfig.qrImageUrl} alt="QR" className="qr-preview" />}
              </div>
              <div className="sf-row">
                <div className="sf-field">
                  <label>Min Deposit (₹)</label>
                  <input type="number" value={payConfig.minDeposit||100} onChange={e => setPayConfig({...payConfig,minDeposit:Number(e.target.value)})} />
                </div>
                <div className="sf-field">
                  <label>Max Deposit (₹)</label>
                  <input type="number" value={payConfig.maxDeposit||100000} onChange={e => setPayConfig({...payConfig,maxDeposit:Number(e.target.value)})} />
                </div>
              </div>

              <h3 style={{color:'#aaa',margin:'24px 0 16px'}}>📧 Email Settings (Gmail)</h3>
              <div className="sf-field">
                <label>Gmail Address</label>
                <input value={emailConfig.emailUser||''} onChange={e => setEmailConfig({...emailConfig,emailUser:e.target.value})} placeholder="your@gmail.com" />
              </div>
              <div className="sf-field">
                <label>Gmail App Password</label>
                <input type="password" value={emailConfig.emailPass||''} onChange={e => setEmailConfig({...emailConfig,emailPass:e.target.value})} placeholder="16-digit app password" />
                <div style={{color:'#666',fontSize:'11px',marginTop:'4px'}}>
                  Get from: Google Account → Security → 2-Step Verification → App Passwords
                </div>
              </div>
              <div className="sf-field">
                <label>Sender Name</label>
                <input value={emailConfig.emailFromName||''} onChange={e => setEmailConfig({...emailConfig,emailFromName:e.target.value})} placeholder="Aviator Game" />
              </div>

              <button className="save-btn" onClick={saveSettings}>💾 Save All Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
