import React, { useState, useEffect } from 'react';
import Context from '../../context';
import './wallet.scss';

interface WalletProps {
  onClose: () => void;
  defaultTab?: 'deposit' | 'withdraw' | 'history';
}

export default function Wallet({ onClose, defaultTab = 'deposit' }: WalletProps) {
  const { userInfo, update, state } = React.useContext(Context);
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'history'>(defaultTab);
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [payConfig, setPayConfig] = useState<any>(null);
  const [step, setStep] = useState<1 | 2>(1); // deposit step 1: show QR, step 2: enter UTR

  const token = localStorage.getItem('aviator_token');

  const showMsg = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  useEffect(() => {
    fetchPayConfig();
  }, []);

  useEffect(() => {
    if (tab === 'history') {
      fetchTransactions();
      fetchDepositHistory();
    }
  }, [tab]);

  const fetchPayConfig = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/wallet/payment-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPayConfig(data.data);
    } catch {}
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch {}
  };

  const fetchDepositHistory = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/wallet/my-deposits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDepositHistory(data.data);
    } catch {}
  };

  const handleDepositSubmit = async () => {
    if (!amount || Number(amount) < (payConfig?.minDeposit || 100)) {
      showMsg(`Minimum deposit ₹${payConfig?.minDeposit || 100}`, 'error'); return;
    }
    setStep(2);
  };

  const handleUTRSubmit = async () => {
    if (!utrNumber || utrNumber.trim().length < 6) {
      showMsg('Enter valid UTR/reference number', 'error'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/wallet/deposit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), utrNumber }),
      });
      const data = await res.json();
      if (data.error) { showMsg(data.error, 'error'); }
      else {
        showMsg('✅ Deposit request submitted! Balance will be added within 30 minutes.', 'success');
        setAmount(''); setUtrNumber(''); setStep(1);
      }
    } catch { showMsg('Connection failed', 'error'); }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) < (payConfig?.minWithdraw || 200)) {
      showMsg(`Minimum withdrawal ₹${payConfig?.minWithdraw || 200}`, 'error'); return;
    }
    if (!upiId || !upiId.includes('@')) {
      showMsg('Enter valid UPI ID (e.g. name@paytm)', 'error'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), upiId }),
      });
      const data = await res.json();
      if (data.error) { showMsg(data.error, 'error'); }
      else {
        showMsg('✅ Withdrawal request submitted! Will be processed within 24 hours.', 'success');
        // Update balance
        const attrs = { ...state };
        attrs.userInfo = { ...attrs.userInfo, balance: data.balance };
        update(attrs);
        setAmount(''); setUpiId('');
      }
    } catch { showMsg('Connection failed', 'error'); }
    setLoading(false);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  // Generate UPI payment link
  const upiLink = payConfig ? `upi://pay?pa=${payConfig.upiId}&pn=${encodeURIComponent(payConfig.upiName)}&am=${amount}&cu=INR` : '';

  return (
    <div className="wallet-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="wallet-header">
          <div className="wallet-title">💰 Wallet</div>
          <div className="wallet-balance">
            Balance: <span>₹{Number(userInfo?.balance || 0).toFixed(2)}</span>
          </div>
          <button className="wallet-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="wallet-tabs">
          {(['deposit', 'withdraw', 'history'] as const).map(t => (
            <button key={t} className={`wallet-tab ${tab === t ? 'active' : ''}`}
              onClick={() => { setTab(t); setStep(1); }}>
              {t === 'deposit' ? '⬆️ Deposit' : t === 'withdraw' ? '⬇️ Withdraw' : '📋 History'}
            </button>
          ))}
        </div>

        {msg && <div className={`wallet-msg ${msg.type}`}>{msg.text}</div>}

        {/* ── DEPOSIT ── */}
        {tab === 'deposit' && (
          <div className="wallet-form">
            {step === 1 ? (
              <>
                <div className="deposit-info">
                  <p>Send money via UPI to the address below, then submit the UTR number.</p>
                </div>

                {/* UPI Details */}
                <div className="upi-box">
                  {payConfig?.qrImageUrl ? (
                    <img src={payConfig.qrImageUrl} alt="QR Code" className="qr-image" />
                  ) : (
                    <div className="qr-placeholder">
                      <div className="qr-icon">📱</div>
                      <div className="qr-text">QR Code</div>
                      <div className="qr-sub">(Admin will set QR image)</div>
                    </div>
                  )}
                  <div className="upi-details">
                    <div className="upi-label">UPI ID</div>
                    <div className="upi-id-row">
                      <span className="upi-id">{payConfig?.upiId || 'Loading...'}</span>
                      <button className="copy-btn" onClick={() => {
                        navigator.clipboard.writeText(payConfig?.upiId || '');
                        showMsg('UPI ID copied!', 'info');
                      }}>Copy</button>
                    </div>
                    <div className="upi-name">{payConfig?.upiName}</div>
                  </div>
                </div>

                {/* Amount selection */}
                <div className="wallet-field">
                  <label>Enter Amount (₹)</label>
                  <div className="quick-amounts">
                    {quickAmounts.map(q => (
                      <button key={q} className={`quick-btn ${amount === String(q) ? 'active' : ''}`}
                        onClick={() => setAmount(String(q))}>₹{q}</button>
                    ))}
                  </div>
                  <input type="number"
                    placeholder={`Min ₹${payConfig?.minDeposit || 100} — Max ₹${payConfig?.maxDeposit || 100000}`}
                    value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                {amount && Number(amount) >= (payConfig?.minDeposit || 100) && (
                  <a href={upiLink} className="upi-pay-btn">
                    📲 Pay ₹{amount} via UPI App
                  </a>
                )}

                <button className="wallet-action-btn deposit" onClick={handleDepositSubmit}>
                  I've Made the Payment →
                </button>
              </>
            ) : (
              <>
                <div className="step2-header">
                  <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                  <div className="step2-title">Enter Payment Reference</div>
                </div>

                <div className="step2-info">
                  <div className="step2-amount">Deposit Amount: <strong>₹{amount}</strong></div>
                  <p>Enter the UTR number or reference ID from your UPI payment receipt.</p>
                </div>

                <div className="wallet-field">
                  <label>UTR / Reference Number</label>
                  <input type="text" placeholder="e.g. 123456789012 (from UPI receipt)"
                    value={utrNumber} onChange={e => setUtrNumber(e.target.value)} />
                </div>

                <div className="utr-help">
                  <strong>Where to find UTR?</strong>
                  <ul>
                    <li>Open your UPI app (PhonePe/GPay/Paytm)</li>
                    <li>Go to transaction history</li>
                    <li>Open the payment to {payConfig?.upiName}</li>
                    <li>Copy the UTR / Transaction ID</li>
                  </ul>
                </div>

                <button className="wallet-action-btn deposit" onClick={handleUTRSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Deposit Request'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── WITHDRAW ── */}
        {tab === 'withdraw' && (
          <div className="wallet-form">
            <div className="withdraw-balance">
              Available: <strong>₹{Number(userInfo?.balance || 0).toFixed(2)}</strong>
            </div>

            <div className="wallet-field">
              <label>Withdrawal Amount (₹)</label>
              <div className="quick-amounts">
                {[200, 500, 1000, 2000, 5000].map(q => (
                  <button key={q} className={`quick-btn ${amount === String(q) ? 'active' : ''}`}
                    onClick={() => setAmount(String(q))}>₹{q}</button>
                ))}
              </div>
              <input type="number"
                placeholder={`Min ₹${payConfig?.minWithdraw || 200}`}
                value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <div className="wallet-field">
              <label>Your UPI ID</label>
              <input type="text" placeholder="yourname@paytm / yourname@ybl"
                value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>

            <div className="withdraw-note">
              ⏱ Processing time: within 24 hours<br />
              ✅ Amount will be sent directly to your UPI ID<br />
              ❗ Minimum withdrawal: ₹{payConfig?.minWithdraw || 200}
            </div>

            <button className="wallet-action-btn withdraw" onClick={handleWithdraw} disabled={loading}>
              {loading ? 'Submitting...' : `Request Withdrawal of ₹${amount || '0'}`}
            </button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div className="wallet-history">
            {/* Deposit requests status */}
            {depositHistory.length > 0 && (
              <>
                <div className="hist-section-title">Deposit Requests</div>
                {depositHistory.slice(0, 5).map((d: any) => (
                  <div key={d.id} className="tx-item">
                    <div className="tx-left">
                      <span className="tx-icon">⬆️</span>
                      <div>
                        <div className="tx-note">Deposit (UTR: {d.utrNumber})</div>
                        <div className="tx-date">{new Date(d.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="tx-right">
                      <div className="tx-amount pos">+₹{d.amount}</div>
                      <div className={`tx-status ${d.status}`}>{d.status}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="hist-section-title">Transactions</div>
            {transactions.length === 0 ? (
              <div className="no-tx">No transactions yet</div>
            ) : transactions.map((tx: any) => (
              <div key={tx.id} className="tx-item">
                <div className="tx-left">
                  <span className="tx-icon">
                    {tx.type === 'deposit' || tx.type === 'admin_credit' ? '⬆️' : tx.type === 'withdraw' ? '⬇️' : '🎁'}
                  </span>
                  <div>
                    <div className="tx-note">{tx.note}</div>
                    <div className="tx-date">{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="tx-right">
                  <div className={`tx-amount ${tx.type === 'withdraw' ? 'neg' : 'pos'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}₹{tx.amount}
                  </div>
                  <div className={`tx-status ${tx.status}`}>{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
