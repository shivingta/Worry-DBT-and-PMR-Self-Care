import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {DiaryProvider} from './context/DiaryContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DiaryProvider>
      <App />
    </DiaryProvider>
  </StrictMode>,
);

