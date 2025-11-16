import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

export default function PropertyDetail() {
  const { id } = useParams();
  const [prop, setProp] = useState<any>(null);
  useEffect(() => {
    if (!id) return;
    API.get('/properties/' + id).then(r => setProp(r.data)).catch(()=>setProp(null));
  }, [id]);
  if (!prop) return <div className="p-6">Loading...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-sm text-gray-600">← Back</Link>
      <h1 className="text-2xl font-bold mt-4">{prop.title}</h1>
      <div className="text-gray-700 mt-2">{prop.city} • €{prop.rentPerMonth}/mo</div>
      <p className="mt-4 text-gray-800">{prop.description}</p>
      <div className="mt-6">
        <button className="px-4 py-2 bg-gray-800 text-white rounded">Contact Owner</button>
      </div>
    </div>
  );
}
