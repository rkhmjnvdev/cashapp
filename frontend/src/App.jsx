const API_URL = "https://cashapp-smzh.onrender.com";
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CashApp from '../public/tr-cashapp-logo.png';

function App() {
  // --- 1. СОСТОЯНИЯ АВТОРИЗАЦИИ ---
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const APP_PASSWORD = "1981"; 

  // --- 2. ОСТАЛЬНЫЕ СОСТОЯНИЯ ---
  const [allDebtors, setAllDebtors] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchResult, setSearchResult] = useState(null); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    reason: '',
    amount: '',
    currency: 'UZS',
    date: '' 
  });

  // --- 3. ФУНКЦИИ ЛОГИКИ ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      alert("Неверный пароль!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  const calculateTotal = (debts, currency) => {
    const total = debts
      .filter(d => d.currency === currency)
      .reduce((sum, current) => sum + Number(current.amount), 0);
    return Number(total); // Убирает .00 для итоговых сумм
  };
const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split('-');
  return `${day}.${month}.${year}`;
};
  const fetchAllData = async () => {
    try {
      const response = await fetch('https://cashapp-smzh.onrender.com');
      if (response.ok) {
        const data = await response.json();
        setAllDebtors(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/search/?name=${searchTerm}`);
      const data = await response.json();
      if (data.length > 0) {
        setSearchResult(data[0]);
      } else {
        setSearchResult("not_found");
      }
    } catch (error) {
      console.error("Ошибка поиска:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.date) {
      alert("Заполните поля!");
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/add-debt/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Успешно!");
        setFormData({ name: '', reason: '', amount: '', currency: 'UZS', date: '' }); 
        fetchAllData(); 
        if (searchTerm && formData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          handleSearch();
        }
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  // --- ЭКРАН ВХОДА ---
  if (!isAuthenticated) {
    return (
      <div className="login-wrapper d-flex align-items-center justify-content-center">
        <div className="card p-4 shadow-lg text-center" style={{ width: '350px', borderRadius: '20px' }}>
          <img src={CashApp} alt="Logo" style={{ width: '80px', margin: '0 auto 20px' }} />
          <h3 className="mb-4 fw-bold" style={{ color: '#10b981' }}>Вход в CashApp</h3>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="form-control mb-3 text-center" 
              placeholder="Введите пароль"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ letterSpacing: '5px' }}
              autoFocus
            />
            <button type="submit" className="btn btn-success w-100 fw-bold">Войти</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="custom-navbar">
        <div className="nav-side"></div>
        <div className="nav-center d-flex align-items-center">
          <img className='head-logo' src={CashApp} alt="CashApp Logo" />
          <h3 className='cashapp-logo mb-0 ms-2'>CashApp</h3>
        </div>
        <div className="nav-side d-flex justify-content-end align-items-center px-3">
          <button onClick={handleLogout} className="logout-icon-btn" title="Выйти">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      <div className="container-fluid py-5 content-container">
        {/* ДОБАВЛЕНИЕ */}
        <div className="card shadow-sm border-success mb-5 mx-auto" style={{maxWidth: '1000px'}}>
          <div className="card-header bg-success text-white fw-bold">Новая запись</div>
          <div className="card-body p-4">
            <form className="row g-3 justify-content-center" onSubmit={handleAddDebt}>
              <div className="col-md-4">
                <label className="form-label small fw-bold">ИМЯ</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">ПРИЧИНА ДОЛГА</label>
                <input type="text" className="form-control" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">СУММА</label>
                <input type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="col-md-3 mt-3">
                <label className="form-label small text-center d-block fw-bold">ВАЛЮТА</label>
                <select className="form-select" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                  <option value="UZS">UZS</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="col-md-3 mt-3">
                <label className="form-label small text-center d-block fw-bold">ДАТА</label>
                <input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="col-12 text-center mt-4">
                <button type="submit" className="btn btn-success px-5 fw-bold">Записать в базу</button>
              </div>
            </form>
          </div>
        </div>

        {/* ПОИСК */}
        <div className="row mb-5">
          <div className="col-md-6 mx-auto">
            <div className="input-group shadow-sm">
              <input type="text" className="form-control" placeholder="Поиск по имени..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button className="btn btn-primary px-4" onClick={handleSearch}>{loading ? '...' : 'Найти'}</button>
            </div>
          </div>
        </div>

        {/* РЕЗУЛЬТАТЫ ПОИСКА */}
        {searchResult && searchResult !== "not_found" && (
          <div className="alert alert-info border-primary mb-5 shadow-sm mx-auto" style={{maxWidth: '1000px'}}>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="fw-bold m-0">История: {searchResult.name}</h4>
              <div className="d-flex gap-2">
                 {calculateTotal(searchResult.debts, 'UZS') > 0 && <span className="badge bg-success">{calculateTotal(searchResult.debts, 'UZS').toLocaleString()} UZS</span>}
                 {calculateTotal(searchResult.debts, 'USD') > 0 && <span className="badge bg-primary">{calculateTotal(searchResult.debts, 'USD').toLocaleString()} USD</span>}
              </div>
            </div>
            <hr />
            {searchResult.debts.map((d, i) => (
              <div key={i} className="d-flex justify-content-between border-bottom py-2">
                <div>
                  <span className="fw-bold text-dark">{formatDate(d.date)}</span>
                  <div className="small text-muted">{d.reason || "Без причины"}</div>
                </div>
                {/* ИСПРАВЛЕНО ТУТ: Добавлен Number() */}
                <span className="fw-bold text-primary">{Number(d.amount)} {d.currency}</span>
              </div>
            ))}
          </div>
        )}

        {/* ТАБЛИЦА */}
        <div className="debt-table-container mx-auto" style={{maxWidth: '1100px'}}>
          <h3 className="debt-table-title text-center mb-4">Общий список в базе</h3>
          <div className="debt-table-wrapper shadow-sm rounded bg-white">
            <table className="debt-table w-100">
<thead>
  <tr>
    <th style={{width: '33%'}}>Имя должника</th>
    <th style={{width: '67%'}}>
      <div className="d-flex justify-content-between px-3">
        <span>Дата</span>
        <span>Причина</span>
        <span className="pe-4">Сумма</span>
      </div>
    </th>
  </tr>
</thead>
              <tbody>
                {allDebtors.map((person) => (
                  <tr key={person.id}>
                    <td className="align-middle">
                      <div className="debtor-cell px-3">
                        <div className="debtor-avatar">{person.name.charAt(0).toUpperCase()}</div>
                        <div className="d-flex flex-column">
                          <span className="debtor-name">{person.name}</span>
                          <div className="debtor-summary mt-2">
                            {calculateTotal(person.debts, 'UZS') > 0 && (
                              <div className="total-badge total-uzs" style={{fontSize: '0.7rem', color: '#10b981'}}>
                                <b>Итого:</b> {calculateTotal(person.debts, 'UZS').toLocaleString()} UZS
                              </div>
                            )}
                            {calculateTotal(person.debts, 'USD') > 0 && (
                              <div className="total-badge total-usd" style={{fontSize: '0.7rem', color: '#667eea'}}>
                                <b>Итого:</b> {calculateTotal(person.debts, 'USD').toLocaleString()} USD
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="debts-list">
                        {person.debts.map((d, idx) => (
                          <div key={idx} className="debt-item d-flex justify-content-between align-items-center border-bottom py-1 px-2">
                            <span className="debt-date small">{formatDate(d.date)}</span>
                            <span className="small text-muted text-truncate mx-2" style={{maxWidth: '200px'}}>{d.reason}</span>
                            {/* ИСПРАВЛЕНО ТУТ: Добавлен Number() */}
                            <span className="debt-amount fw-bold">{Number(d.amount)} {d.currency}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content text-center py-4">
          <div className="social-links mb-3">
            <a href="https://t.me/rakhimjanov07" target="_blank" rel="noreferrer" className="social-icon mx-3"><i className="fab fa-telegram-plane"></i></a>
            <a href="https://github.com/rkhmjnv_dev" target="_blank" rel="noreferrer" className="social-icon mx-3"><i className="fab fa-github"></i></a>
            <a href="https://instagram.com/rakhimjanovv07" target="_blank" rel="noreferrer" className="social-icon mx-3"><i className="fab fa-instagram"></i></a>
          </div>
          <p className="made-by">Made by Jakhongir</p>
        </div>
      </footer>
    </div>
  );
}

export default App;