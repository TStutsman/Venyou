import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import CreateGroup from './components/CreateGroup';
import EventShow from './components/EventShow';
import GroupShow from './components/GroupShow';
import Home from './components/Home';
import ListIndex from './components/ListIndex';
import Navigation from './components/Navigation';
import { Modal } from './context/Modal';
import * as sessionActions from './store/session';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/groups',
        element: <ListIndex type={'group'} />
      },
      {
        path: '/groups/new',
        element: <CreateGroup />
      },
      {
        path: '/groups/:groupId',
        element: <GroupShow />
      },
      {
        path: '/events',
        element: <ListIndex type={'event'} />
      },
      {
        path: '/events/:eventId',
        element: <EventShow />
      }
      // {
      //   path: 'login',
      //   element: <LoginFormPage />
      // },
      // {
      //   path: 'signup',
      //   element: <SignupFormPage />
      // }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
