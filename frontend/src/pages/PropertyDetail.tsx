import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

export default function PropertyDetail() {
  const { id } = useParams();
  const [prop, setProp] = useState<any>(null);
  useEffect(() => {
    if (!id) return;
    API.get('/properties/' + id).then(r => setProp(r.data)).catch(() => setProp(null));
  }, [id]);
  if (!prop) return <div className="p-6">Loading...</div>;
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold">{prop.title}</h1>
      <div className="mt-2">{prop.city} — €{prop.rentPerMonth}/mo</div>
      <p className="mt-4">{prop.description}</p>
    </div>
  );
}
