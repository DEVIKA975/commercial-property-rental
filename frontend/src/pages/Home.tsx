import React, { useEffect, useState } from 'react';

export default function Home() {
  const [propsList, setPropsList] = useState<any[]>([]);
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/properties')
      .then(r => r.json())
      .then(setPropsList)
      .catch(() => setPropsList([]));
  }, []);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Commercial Properties for Rent</h1>
      <p>Sample frontend (Vite + React). Click an item to view details (not implemented).</p>
      <div>
        {propsList.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, margin: 8 }}>
            <strong>{p.title}</strong>
            <div>{p.city} — €{p.rentPerMonth}/mo — {p.sizeSqm} m²</div>
            <div>{p.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
