import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';

function XoxGameComponent() {
  const [games, setGames] = useState([]);
  const [mark, setMark] = useState("X");
  const [message, setMessage] = useState("");
  const [isGameFinish, setIsGameFinish] = useState(false);

  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    setGames(["", "", "", "", "", "", "", "", ""]);
    setIsGameFinish(false);
    setMark("X");
    setMessage("Hamle Sırası: X");
  };

  const isGameOver = (newGames) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (
        newGames[a] !== "" &&
        newGames[a] === newGames[b] &&
        newGames[a] === newGames[c]
      ) {
        return true;
      }
    }
    return false;
  };

  const isMoveFinish = (newGames) => {
    for (let i = 0; i < newGames.length; i++) {
      if (newGames[i] === "") {
        return false;
      }
    }
    return true;
  };

  const markGame = (index) => {
    if (!isGameFinish) {
      const newGames = [...games];
      if (newGames[index] === "") {
        newGames[index] = mark;
        setGames(newGames);

        if (isGameOver(newGames)) {
          setIsGameFinish(true);
          setMessage("Oyunu " + mark + " kazandı!");
          return;
        }

        if (isMoveFinish(newGames)) {
          setIsGameFinish(true);
          setMessage("Oyun Berabere");
          return;
        }

        const nextMark = mark === "X" ? "O" : "X";
        setMark(nextMark);
        setMessage("Hamle Sırası: " + nextMark);
      }
    }
  };

  return (
    <div className="container text-center">
      <h1>XOX Game</h1>
      <h2 className="alert alert-warning">{message}</h2>
      <button onClick={newGame} className="btn btn-outline-primary w-100 mb-2">
        Yeni Oyun
      </button>
      <div className="row">
        {games.map((game, index) => (
          <div
            key={index}
            className="col-4 border p-5 fs-1 box"
            onClick={() => markGame(index)}
          >
            {game}
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<XoxGameComponent />);
reportWebVitals();
