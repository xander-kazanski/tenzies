import React from "react"
import Die from "./components/Die"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"

export default function App() {

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    
    React.useEffect(() => {
      let allHeld = true;
      let allSameValue = true;
      const firstValue = dice[0].value;
  
      for (let i = 0; i < dice.length; i++) {
          if (!dice[i].isHeld) {
              allHeld = false;
          }
          if (dice[i].value !== firstValue) {
              allSameValue = false;
          }
          if (!allHeld && !allSameValue) break; // Exit early if condition is false
      }
  
      if (allHeld && allSameValue) {
          setTenzies(true);
          console.log("You won!");
      }
  }, [dice]);
  

    

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
    
    function rollDice() {
        if (tenzies) {
            setDice(allNewDice())
            setTenzies(false)
            return
        }

        setDice(oldDice => {
          const newDice = [...oldDice];
          for (let i = 0; i < newDice.length; i++) {
            if (!newDice[i].isHeld) {
              newDice[i] = generateNewDie()
            }
          }
          return newDice;
        })

    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <main>
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {tenzies ? "New Game" : "Roll"}
            </button>
        </main>
    )
}