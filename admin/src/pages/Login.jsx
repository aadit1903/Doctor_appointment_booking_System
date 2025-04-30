import React, { useContext, useState } from 'react';
import axios from 'axios';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { toast } from 'react-toastify';
import { FaUserShield, FaUserMd } from 'react-icons/fa';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const endpoint = state === 'Admin' ? '/api/admin/login' : '/api/doctor/login';
      const { data } = await axios.post(backendUrl + endpoint, { email, password });
      if (data.success) {
        state === 'Admin' ? setAToken(data.token) : setDToken(data.token);
        localStorage.setItem(state === 'Admin' ? 'aToken' : 'dToken', data.token);
        toast.success(`${state} logged in successfully`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.background}>
        <div style={styles.shape1}></div>
        <div style={styles.shape2}></div>
      </div>
      <form onSubmit={onSubmitHandler} style={styles.form}>
        <h3 style={styles.title}>{state} Login</h3>
        <div style={styles.icon}>
          {state === 'Admin' ? <FaUserShield size={40} /> : <FaUserMd size={40} />}
        </div>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Log In</button>

        <p style={styles.switchText}>
          {state === 'Admin' ? 'Doctor Login?' : 'Admin Login?'}
          <span onClick={() => setState(state === 'Admin' ? 'Doctor' : 'Admin')} style={styles.switchLink}> Click here</span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#080710',
    minHeight: '100vh',
    position: 'relative',
  },
  background: {
    width: '430px',
    height: '520px',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    left: '50%',
    top: '50%',
  },
  shape1: {
    height: '200px',
    width: '200px',
    position: 'absolute',
    borderRadius: '50%',
    background: 'linear-gradient(#1845ad, #23a2f6)',
    left: '-80px',
    top: '-80px',
  },
  shape2: {
    height: '200px',
    width: '200px',
    position: 'absolute',
    borderRadius: '50%',
    background: 'linear-gradient(to right, #ff512f, #f09819)',
    right: '-30px',
    bottom: '-80px',
  },
  form: {
    height: 'auto',
    width: '400px',
    backgroundColor: 'rgba(255,255,255,0.13)',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
    borderRadius: '10px',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255,255,255,0.1)',
    boxShadow: '0 0 40px rgba(8,7,16,0.6)',
    padding: '40px 35px',
    color: 'white',
  },
  title: {
    fontSize: '32px',
    fontWeight: '500',
    lineHeight: '42px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  icon: {
    textAlign: 'center',
    marginBottom: '20px',
    color: 'white',
  },
  label: {
    display: 'block',
    marginTop: '20px',
    fontSize: '16px',
    fontWeight: '500',
  },
  input: {
    display: 'block',
    height: '50px',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: '3px',
    padding: '0 10px',
    marginTop: '8px',
    fontSize: '14px',
    fontWeight: '300',
    color: 'white',
    border: 'none',
    outline: 'none',
  },
  button: {
    marginTop: '30px',
    width: '100%',
    backgroundColor: '#ffffff',
    color: '#080710',
    padding: '15px 0',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
  },
  switchLink: {
    color: '#23a2f6',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginLeft: '5px',
  },
};

export default Login;
