import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

export default function App() {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadGames(), loadReviews()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  async function loadGames() {
    try {
      const res = await axios.get(`${API_URL}/games`);
      setGames(res.data || []);
    } catch (err) {
      console.error('Error cargando juegos:', err.message);
    }
  }

  async function loadReviews() {
    try {
      const res = await axios.get(`${API_URL}/reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error cargando reseñas:', err.message);
    }
  }

  async function addGame(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(`${API_URL}/games`, {
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
      await loadGames();
    } catch (err) {
      console.error('Error creando juego:', err.message);
    }
  }

  async function deleteGame(id) {
    if (!window.confirm('¿Eliminar juego?')) return;
    try {
      await axios.delete(`${API_URL}/games/${id}`);
      await loadGames();
      await loadReviews();
    } catch (err) {
      console.error('Error eliminando juego:', err.message);
    }
  }

  async function addReview(gameId) {
    const rating = prompt('Calificación (1-5):');
    if (!rating || rating < 1 || rating > 5) {
      alert('Calificación inválida');
      return;
    }
    const reviewText = prompt('Tu reseña:') || '';
    try {
      await axios.post(`${API_URL}/reviews`, {
        game_id: gameId,
        rating: parseInt(rating),
        review_text: reviewText
      });
      await loadReviews();
      alert('¡Reseña agregada!');
    } catch (err) {
      console.error('Error agregando reseña:', err.message);
    }
  }

  const totalGames = games.length;
  const completedGames = games.filter(g => g.status === 'completed').length;
  const totalReviews = reviews.length;

  return (
    <div className="App">
      <header>
        <h1>🎮 GameTracker</h1>
        <p>Gestiona tu biblioteca de juegos</p>
      </header>

      <main>
        <section style={{ marginBottom: 20 }}>
          <h2>Estadísticas</h2>
          <div style={{ display: 'flex', gap: 12, fontSize: 16 }}>
            <div>📊 Total juegos: {totalGames}</div>
            <div>✅ Completados: {completedGames}</div>
            <div>⭐ Reseñas: {totalReviews}</div>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h2>Agregar juego</h2>
          <form onSubmit={addGame} style={{ marginBottom: 12 }}>
            <input
              placeholder="Título (requerido)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ padding: 8, marginRight: 8 }}
            />
            <input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ padding: 8, marginRight: 8 }}
            />
            <button type="submit" style={{ padding: 8 }}>Agregar</button>
          </form>
        </section>

        <section>
          <h2>Juegos</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : games.length === 0 ? (
            <p>No hay juegos aún.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {games.map(g => (
                <li key={g.id} style={{ marginBottom: 12, padding: 12, border: '1px solid #ccc', borderRadius: 4 }}>
                  <strong>{g.title}</strong>
                  {g.description ? ` — ${g.description}` : ''}
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => addReview(g.id)} style={{ marginRight: 8 }}>
                    ⭐ Reseñar
                    </button>
                    <button onClick={() => deleteGame(g.id)} style={{ background: '#ff6b6b' }}>
                    🗑️ Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

