import React, { memo } from "react"

const Die = memo(function Dice({ value, isHeld, holdDice, id }) {
    const styles = {
        backgroundColor: isHeld ? "#59E391" : "white"
    }
    return (
        <button 
            className="die-face" 
            style={styles}
            onClick={holdDice}
            aria-label={`Die with value ${value}${isHeld ? ', held' : ''}`}
            aria-pressed={isHeld}
            type="button"
        >
            <span className="die-num">{value}</span>
        </button>
    )
}, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value && 
           prevProps.isHeld === nextProps.isHeld;
})

export default Die;