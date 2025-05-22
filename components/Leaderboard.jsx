import React from 'react';

const Leaderboard = ({ scores, onClear }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <h2>Top Scores</h2>
                {scores.length > 0 && (
                    <button
                        className="clear-scores"
                        onClick={onClear}
                        aria-label="Clear all scores"
                    >
                        Clear Scores
                    </button>
                )}
            </div>
            
            {scores.length === 0 ? (
                <p className="no-scores">No scores yet. Be the first to play!</p>
            ) : (                <div className="scores-list">
                    {scores.map((score, index) => (
                        <div 
                            key={score.id} 
                            className="score-item"
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className={`rank rank-${index + 1}`}>{index + 1}</div>
                            <div className="score-details">
                                <div className="player-name">
                                    {score.name || 'Anonymous'}
                                </div>
                                <div className="score-value">
                                    {score.rolls} {score.rolls === 1 ? 'roll' : 'rolls'}
                                </div>
                                <div className="score-date">
                                    {formatDate(score.date)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
