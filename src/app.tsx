import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Header from './components/Header/index';
import Main from './components/Main/index';
import Support from './components/Support/index';

function isLoggedIn() {
  return !!localStorage.getItem('aviator_token');
}

function GamePage() {
  return (
    <div className="app-root">
      <Header />
      <Main />
      <Support
        telegramLink="https://t.me/yourusername"
        instagramLink="https://instagram.com/yourusername"
        whatsappNumber="919999999999"
      />
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={
        <ProtectedRoute>
          <GamePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}