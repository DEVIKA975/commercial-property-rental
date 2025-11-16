import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const nav = useNavigate();
  async function submit(e:any){ e.preventDefault(); try{
    const r = await API.post('/auth/login',{ email, password });
    localStorage.setItem('token', r.data.token);
    nav('/');
  } catch (e){ alert('Login failed'); } }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4">Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-gray-800 text-white py-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
}
