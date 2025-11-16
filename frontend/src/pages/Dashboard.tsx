import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [propsList, setPropsList] = useState<any[]>([]);
  const nav = useNavigate();
  useEffect(() => {
    API.get('/auth/me').then(r => {
      // OK
    }).catch(()=>nav('/login'));
    API.get('/properties').then(r => setPropsList(r.data)).catch(()=>setPropsList([]));
  }, []);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4">
        {propsList.map(p => (
          <div key={p.id} className="bg-white border rounded p-3 mb-3 flex justify-between">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">{p.city}</div>
            </div>
            <div className="space-x-2">
              <button className="text-sm underline">Edit</button>
              <button className="text-sm underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
