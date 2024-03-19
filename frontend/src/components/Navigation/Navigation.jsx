import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
      <Link className='logo' to="/">Venyou</Link>
      { isLoaded && (sessionUser ?
        (
          <ProfileButton user={sessionUser} />
        ) : (
          <div>
            <OpenModalButton
              buttonText="Log In"
              modalComponent={<LoginFormModal />}
            />
            {/* <Navlink to="/login">Log In</Navlink> */}
            <OpenModalButton
              buttonText="Sign Up"
              modalComponent={<SignupFormModal />}
            />
            {/* <Navlink to="/signup">Sign Up</Navlink> */}
          </div>
        )
      )}
    </nav>
  );
}

export default Navigation;
