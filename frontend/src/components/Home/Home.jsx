import { Link } from 'react-router-dom';
import OpenModalButton from '../OpenModalButton';
import SignupFormModal from '../SignupFormModal';
import './Home.css';
import { useSelector } from 'react-redux';

function Home() {
    const tempSrc = "https://secure.meetupstatic.com/next/images/indexPage/irl_event.svg?w=828";
    const sessionUser = useSelector(state => state.session.user);

    return (
       <div className="home-container">
        <div className="hero">
            <div>
                <h1>The people platform—Where interests become friendships</h1>
                <p>Whatever your interest, from hiking and reading to networking and skill sharing, there are thousands of people who share it on Meetup. Events are happening every day—sign up to join the fun.</p>
            </div>
            <div>
                <img src="https://secure.meetupstatic.com/next/images/indexPage/irl_event.svg?w=828" alt="People on a bike" />
            </div>
        </div>
        <section>
            <div className='title'>
                <h2>How Venyou Works</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className='links-wrapper'>
                <div className='link-box'>
                    <img className='link-img' src={tempSrc} alt="High Five" />
                    <Link to='/groups'>See all groups</Link>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
                <div className='link-box'>
                    <img className='link-img' src={tempSrc} alt="Ticket" />
                    <Link to='/events'>Find an event</Link>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
                <div className='link-box'>
                    <img className='link-img' src={tempSrc} alt="Group" />
                    { sessionUser
                        ?   <Link to='/groups/new'>Start a new group</Link>
                        :   <Link className='disabled'>Start a new group</Link>
                    }
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>
            {
                !sessionUser && <OpenModalButton
                buttonText="Join Venyou"
                modalComponent={<SignupFormModal />}
              />
            }
        </section>
       </div>
    );
}

export default Home;