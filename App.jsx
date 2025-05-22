import React, { useState, useEffect, useCallback } from "react"
import Die from "./components/Die"
import Leaderboard from "./components/Leaderboard"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"

const STORAGE_KEY = 'tenzies-leaderboard';

// Custom error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <div role="alert">Something went wrong. Please refresh the page.</div>;
        }
        return this.props.children;
    }
}

export default function App() {
    const [activeTab, setActiveTab] = useState('game');
    const [dice, setDice] = useState(() => allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [rolls, setRolls] = useState(0);
    const [playerName, setPlayerName] = useState(() => {
        return localStorage.getItem('tenzies-player-name') || '';
    });
    const [scores, setScores] = useState(() => {
        const savedScores = localStorage.getItem(STORAGE_KEY);
        return savedScores ? JSON.parse(savedScores) : [];
    });
    const [bestScore, setBestScore] = useState(() => {
        const saved = localStorage.getItem('tenzies-best-score');
        return saved ? parseInt(saved, 10) : null;
    });

    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld);
        const firstValue = dice[0].value;
        const allSameValue = dice.every(die => die.value === firstValue);

        if (allHeld && allSameValue && !tenzies) {
            setTenzies(true);
            if (!bestScore || rolls < bestScore) {
                setBestScore(rolls);
                localStorage.setItem('tenzies-best-score', rolls.toString());
            }
            
            // Add score to leaderboard
            const newScore = {
                id: nanoid(),
                name: playerName || 'Anonymous',
                rolls,
                date: new Date().toISOString()
            };
            
            setScores(prevScores => {
                const uniqueScores = [
                    ...prevScores.filter(score => 
                        // Filter out any potential duplicates (same name and rolls)
                        !(score.name === newScore.name && score.rolls === newScore.rolls)
                    ),
                    newScore
                ]
                .sort((a, b) => a.rolls - b.rolls)
                .slice(0, 10); // Keep only top 10 scores
                
                localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueScores));
                return uniqueScores;
            });
        }
    }, [dice, rolls, bestScore, playerName, tenzies]);
  

    

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
/**
 * Challenge: Allow the user to play a new game when the
 * button is clicked and they've already won
 */
    
    const rollDice = useCallback(() => {
        if (tenzies) {
            setDice(allNewDice());
            setTenzies(false);
            setRolls(0);
            return;
        }

        setDice(oldDice => oldDice.map(die => 
            die.isHeld ? die : generateNewDie()
        ));
        setRolls(prev => prev + 1);
    }, [tenzies]);
    
    const holdDice = useCallback((id) => {
        if (!tenzies) {
            setDice(oldDice => oldDice.map(die => 
                die.id === id ? {...die, isHeld: !die.isHeld} : die
            ));
        }
    }, [tenzies]);
    
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            id={die.id}
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ));
    
    const clearScores = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
            setScores([]);
            localStorage.removeItem(STORAGE_KEY);
            setBestScore(null);
            localStorage.removeItem('tenzies-best-score');
        }
    }, []);

    return (
        <ErrorBoundary>
            <main>
                {tenzies && (
                    <Confetti 
                        width={windowSize.width}
                        height={windowSize.height}
                        recycle={false}
                        numberOfPieces={200}
                    />
                )}
                <h1 className="title">Tenzies</h1>
                
                <div className="tabs" role="tablist">
                    <button 
                        className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
                        onClick={() => setActiveTab('game')}
                        role="tab"
                        aria-selected={activeTab === 'game'}
                        aria-controls="game-panel"
                    >
                        Game
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                        role="tab"
                        aria-selected={activeTab === 'leaderboard'}
                        aria-controls="leaderboard-panel"
                    >
                        Leaderboard
                    </button>
                </div>

                {activeTab === 'game' ? (
                    <>
                        <p className="instructions" role="doc-subtitle">
                            Roll until all dice are the same. 
                            Click each die to freeze it at its current value between rolls.
                        </p>
                        <div className="player-name">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={playerName}
                                onChange={(e) => {
                                    setPlayerName(e.target.value);
                                    localStorage.setItem('tenzies-player-name', e.target.value);
                                }}
                                aria-label="Player name"
                            />
                        </div>
                        <div className="stats">
                            <p>Rolls: {rolls}</p>
                            {bestScore && <p>Best Score: {bestScore}</p>}
                        </div>
                        <div 
                            className="dice-container"
                            role="grid"
                            aria-label="Dice grid"
                        >
                            {diceElements}
                        </div>
                        <button 
                            className="roll-dice" 
                            onClick={rollDice}
                            aria-label={tenzies ? "Start new game" : "Roll dice"}
                        >
                            {tenzies ? "New Game" : "Roll"}
                        </button>
                    </>
                ) : (
                    <Leaderboard 
                        scores={scores} 
                        onClear={clearScores}
                    />
                )}
            </main>
        </ErrorBoundary>
    )
}