import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({});
  const { closeModal } = useModal();
  const credentialMsg = 'The provided credentials were invalid.';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.message) {
          setError(data.message === 'Invalid credentials' ? { message: credentialMsg } : data);
        }
      });
  };

  const demoClick = () => {
    return dispatch(sessionActions.login({ credential: 'demo@user.io', password: 'password' }))
      .then(closeModal);
  };

  return (
    <div className='login-modal'>
      <h1>Log In</h1>
      {error.message && <p className='error'>{error.message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={credential.length < 4 || password.length < 6}>Log In</button>
      </form>
      <button className='demo' onClick={demoClick}>Log in as Demo User</button>
    </div>
  );
}

export default LoginFormModal;
