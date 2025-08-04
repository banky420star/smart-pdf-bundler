import React from 'react';
import { Toaster } from 'react-hot-toast';
import SimpleUI from './components/SimpleUI';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <SimpleUI />
    </>
  );
}

export default App;
