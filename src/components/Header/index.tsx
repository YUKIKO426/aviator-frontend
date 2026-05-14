import React, { useState } from "react";
import Context from "../../context";
import Wallet from "../Wallet/index";
import Profile from "../Profile/index";
import "./header.scss";
import logo from "../../assets/images/logo.svg";

export default function Header() {
  const { userInfo } = React.useContext(Context);
  const [showWallet, setShowWallet] = useState(false);
  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('aviator_token');
    localStorage.removeItem('aviator_user');
    window.location.href = '/login';
  };

  const openDeposit = () => { setWalletTab('deposit'); setShowWallet(true); };
  const openWithdraw = () => { setWalletTab('withdraw'); setShowWallet(true); };

  return (
    <>
      <header className="av-header">
        {/* Logo */}
        <div className="av-logo">
          <img src={logo} alt="Aviator" className="av-logo-img" />
        </div>

        {/* Center: how to play */}
        <div className="av-header-center">
          <button className="av-howto-btn">❓ How to Play</button>
        </div>

        {/* Right: balance + actions */}
        <div className="av-header-right">
          {/* Balance */}
          <div className="av-balance-wrap">
            <span className="av-balance-amount">
              ₹{Number(userInfo?.balance || 0).toFixed(2)}
            </span>
            <span className="av-balance-currency">INR</span>
          </div>

          {/* Deposit */}
          <button className="av-deposit-btn" onClick={openDeposit}>
            <span>+</span> Deposit
          </button>

          {/* Withdraw */}
          <button className="av-withdraw-btn" onClick={openWithdraw}>
            ⬇ Withdraw
          </button>

          {/* Profile */}
          <button className="av-profile-btn" onClick={() => setShowProfile(true)}>
            <div className="av-avatar-circle">
              {userInfo?.userName?.charAt(0)?.toUpperCase() || 'P'}
            </div>
          </button>

          {/* Logout */}
          <button className="av-logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </header>

      {showWallet && (
        <Wallet onClose={() => setShowWallet(false)} defaultTab={walletTab} />
      )}
      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
