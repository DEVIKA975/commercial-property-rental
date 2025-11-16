import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [propsList, setPropsList] = useState<any[]>([]);
  useEffect(() => {
    API.get('/properties').then(r => setPropsList(r.data)).catch(() => setPropsList([]));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Commercial Properties</h1>
          <Link to="/login" className="text-sm text-gray-700">Login</Link>
        </header>

        <div className="mb-4">
          <input placeholder="Search by city, type, or keyword" className="w-full p-3 border rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {propsList.map(p => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <div className="h-40 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">Image</div>
              <h2 className="font-semibold text-lg">{p.title}</h2>
              <div className="text-sm text-gray-600">{p.city} • €{p.rentPerMonth}/mo • {p.sizeSqm} m²</div>
              <p className="mt-2 text-sm text-gray-700">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <Link to={`/property/${p.id}`} className="text-blue-600 text-sm">View</Link>
                <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
