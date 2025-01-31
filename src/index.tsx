import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './Main.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import GamePage from './pages/GamePage.tsx';
import HowToPlay from './pages/HowToPlay.tsx';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <React.StrictMode>
        <Main />
      </React.StrictMode>
    )
  },
  {
    path: "/play",
    element: (
      <React.StrictMode>
        <GamePage />
      </React.StrictMode>
    )
  },
  {
    path: "/howtoplay",
    element: (
      <React.StrictMode>
        <HowToPlay />
      </React.StrictMode>
    )
  }
]);

root.render((
  <RouterProvider router={router} />
))
