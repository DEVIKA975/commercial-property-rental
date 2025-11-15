import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [propsList, setPropsList] = useState<any[]>([]);
  useEffect(() => {
    API.get('/properties').then(r => setPropsList(r.data)).catch(() => setPropsList([]));
  }, []);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commercial Properties</h1>
        <Link to="/login" className="text-sm underline">Login</Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {propsList.map(p => (
          <div key={p.id} className="border p-4 rounded shadow">
            <div className="h-40 bg-gray-100 mb-2 flex items-center justify-center">Image</div>
            <h2 className="font-semibold">{p.title}</h2>
            <div className="text-sm text-gray-600">{p.city} — €{p.rentPerMonth}/mo</div>
            <p className="mt-2 text-sm">{p.description}</p>
            <Link to={`/property/${p.id}`} className="mt-3 inline-block text-blue-600">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
