import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Keep click from bubbling up to document and triggering closeMenu
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  const dropdownClass = "profile-dropdown" + (showMenu ? "" : " hidden");
  const caretDirection = showMenu ? 'up' : 'down'

  return (
    <>
      <div className='icon-button' onClick={toggleMenu}>
        <i className="fa-3x fas fa-user-circle" />
        <i className={`fas fa-angle-${caretDirection} light-grey`}></i>
      </div>
      <div className={dropdownClass} ref={dropdownRef}>
        <div className='dropdown-section divider'>
          <p>Hello, { user.firstName }</p>
          <p>{ user.email }</p>
        </div>
        <div className='dropdown-section divider'>
          <Link>Your events</Link>
          <Link to='/groups'>Your groups</Link>
        </div>
        <div className='dropdown-section'>
          <Link>View profile</Link>
          <Link>Settings</Link>
          <Link>Help</Link>
          <Link onClick={logout}>Log out</Link>
        </div>
      </div>
    </>
  );
}

export default ProfileButton;

