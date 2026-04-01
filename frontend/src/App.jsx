import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // 1. Состояния для форм и данных
  const [allDebtors, setAllDebtors] = useState([]); // Весь список для низа страницы
  const [searchTerm, setSearchTerm] = useState(''); // Текст поиска
  const [searchResult, setSearchResult] = useState(null); // Результат поиска
  const [loading, setLoading] = useState(false);

  // Состояние для формы добавления
  const [formData, setFormData] = useState({
    name: '',
    reason: '',
    amount: '',
    currency: 'UZS',
    date: '' // Пользователь выберет сам в календаре
  });

  // 2. Функция загрузки ВСЕХ данных
  const fetchAllData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/all/');
      if (response.ok) {
        const data = await response.json();
        setAllDebtors(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки общего списка:", error);
    }
  };

  // 3. Автозапуск при открытии сайта
  useEffect(() => {
    fetchAllData();
  }, []);

  // 4. Функция поиска
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

  // 5. Функция добавления записи
  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.date) {
      alert("Заполните имя, сумму и выберите дату!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/add-debt/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Запись успешно сохранена!");
        setFormData({ name: '', amount: '', currency: 'UZS', date: '' }); // Чистим форму
        fetchAllData(); // СРАЗУ обновляем список внизу
        
        if (searchTerm && formData.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          handleSearch();
        }
      } else {
        alert("Ошибка сервера при сохранении");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      <h2 className="text-center mb-5 fw-bold text-primary">CashApp</h2>

      {/* БЛОК 1: ДОБАВЛЕНИЕ */}
      <div className="card shadow-sm border-success mb-5">
        <div className="card-header bg-success text-white fw-bold">Новая запись</div>
        <div className="card-body">
          <form className="row g-3 justify-content-between" onSubmit={handleAddDebt}>
            <div className="col-md-4">
              <label className="form-label small">Имя</label>
              <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="" />
            </div>
            <div className="col-md-4">
          <label className="form-label small">Причина долга</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.reason} 
              onChange={(e) => setFormData({...formData, reason: e.target.value})} 
            />
          </div>
            <div className="col-md-4">
              <label className="form-label small">Сумма</label>
              <input type="number" className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="" />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Валюта</label>
              <select className="form-select" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                <option value="UZS">UZS</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Дата</label>
              <input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success px-5">Записать в базу</button>
            </div>
          </form>
        </div>
      </div>

      {/* БЛОК 2: ПОИСК */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="input-group shadow-sm">
            <input type="text" className="form-control" placeholder="Введите имя..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="btn btn-primary px-4" onClick={handleSearch}>{loading ? '...' : 'Найти'}</button>
          </div>
        </div>
      </div>

      {/* Результат поиска */}
      {searchResult && searchResult !== "not_found" && (
        <div className="alert alert-info border-primary mb-5 shadow-sm">
          <h4>История: {searchResult.name}</h4>
          <hr />
          {searchResult.debts.map((d, i) => (
            <div key={i} className="d-flex justify-content-between border-bottom py-1">
              <span>{d.date}</span>
              <span className="fw-bold">{d.amount} {d.currency}</span>
            </div>
          ))}
        </div>
      )}

      {searchResult === "not_found" && <div className="alert alert-warning text-center">Ничего не найдено</div>}

      <hr className="my-5" />

      {/* БЛОК 3: ОБЩИЙ СПИСОК */}
      <div className="debt-table-container">
        <h3 className="debt-table-title">Общий список в базе</h3>
        <div className="debt-table-wrapper">
          <table className="debt-table">
            <thead>
              <tr>
                <th>Имя должника</th>
                <th>Все долги (Дата | Сумма)</th>
              </tr>
            </thead>
            <tbody>
              {allDebtors.length > 0 ? (
                allDebtors.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="debtor-cell">
                        <div className="debtor-avatar">
                          {person.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="debtor-name">{person.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="debts-list">
                        {person.debts.map((d, idx) => (
                          <div key={idx} className="debt-item">
                            <span className="debt-date">{d.date}</span>
                            <span className="debt-amount">
                              {d.amount} {d.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">
                    <div className="empty-state">
                      <div className="empty-state-icon">📂</div>
                      <div className="empty-state-title">База данных пока пуста</div>
                      <div className="empty-state-subtitle">Добавьте первый долг выше</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;