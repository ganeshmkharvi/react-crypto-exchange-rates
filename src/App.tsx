import React from 'react';
import logo from './logo.svg';
import './App.css';
import CryptoExchangePrices from "./components/crypto-exchange-prices";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
         <CryptoExchangePrices></CryptoExchangePrices>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
