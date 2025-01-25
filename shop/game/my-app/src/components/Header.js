import React from "react";

function Header({ tokens }) {
  return (
    <header className="header">
      <h1>Mining Simulator</h1>
      <p>Tokens: {tokens.toFixed(2)}</p>
    </header>
  );
}

export default Header;
