import styles from "./InputPopup.module.css"
import { useState } from 'react'
import DayPopup from "./DayPopup.jsx"


function InputPopup({selected, setSelected, duration, setDuration, speed, setSpeed, distance, setDistance, highIntensity,setHighIntensity, lowIntensity, setLowIntensity, restTime, setRestTime, exercise, setExercise, addingExercise, setAddingExercise, notes, setNotes, excercisePerRound, setExercisePerRound, reps, setReps, sets, setSets }){

    function onClickRep(){
        setReps(reps+1);
    }

    function onClickSet(){
        setSets(sets+1);
    }

    function removeRep(){
        setReps(reps > 0 ? reps-1 : 0);
    }
    
    function removeSet(){
        setSets(sets > 0 ? sets-1 : 0);
    }

    function addExercise(){
        if(addingExercise.trim() !== ''){
            setExercise([...exercise, {name: addingExercise, sets: sets, reps: reps}]);
            setAddingExercise('');
            setSets(0);
            setReps(0);
        }
    }

 

    const handleChange = (event)=>{
        setSelected(event.target.value);
    };

    

    return(
        <div className={styles.workoutOptions}>
            <div className={styles.typeofWorkout}>
                <div>
                    <label className={styles.spacebetweentypes} htmlFor="choiceofWorkout"><h4>Types of workout</h4></label>
                        <select id="choiceofWorkout"  onChange={handleChange}>
                        <option value="Walking">Walking</option>
                        <option value="Running">Running</option>
                        <option value="Cycling">Cycling</option>
                        <option value="Swimming">Swimming</option>
                        <option value="Elliptical">Elliptical</option>
                        <option value="Treadmill">Treadmill</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Cardio intervals">Cardio Intervals</option>
                        <option value="Strength"> Strength</option>
                        <option value="Yoga">Yoga</option>
                        <option value="Pilates">Pilates</option>
                </select>

                </div>
                
                
            
                {selected === "Walking" || selected === "Running" || selected === "Cycling" || selected === "Swimming" || selected === "Elliptical" || selected === "Treadmill" ?
                    
                        (
                            <div className={styles.cardioformat}>

                                <form className={styles.cardioSelect}>
                                    <label htmlFor="timeduration">Total Duration:</label>
                                    <input
                                        type="text"
                                        placeholder="(hh:mm:ss)"
                                        value= {duration}
                                        onChange={e=> setDuration(e.target.value)}
                                    />
                                    <label htmlFor="Speed"> Speed:</label>
                                    <input
                                        type="text"
                                        value={speed}
                                        onChange={e=>setSpeed(e.target.value)}
                                    />
                                    <label htmlFor="Distance">Distance:</label>
                                    <input
                                        type="text"
                                        value={distance}
                                        onChange={(e)=>setDistance(e.target.value)}
                                    />

                                </form>
                            </div>
                        )
                    
                    : selected === "HIIT" || selected === "Cardio intervals" ?
                        (
                        <div className={styles.HITIntervalworkout}>
                            <div className={styles.leftExercisePerRound}>
                                <label><b>Exercise per round</b></label>
                                <textarea
                                    name="exercise notes"
                                    value={excercisePerRound}
                                onChange={(e)=>setExercisePerRound(e.target.value)}
                                placeholder="Enter exercise per round"
                            />
                            </div>
                            <div className={styles.rightExercisePerRound}>
                                <form>
                                    <label htmlFor="time duration">Total Duration:</label>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={e =>setDuration(e.target.value)}
                                    />
                                    <label htmlFor="High intensity time"> High intensity time:</label>
                                    <input
                                        type="text"
                                        value={highIntensity}
                                        onChange={(e) => setHighIntensity(e.target.value)}
                                    />
                                    <label htmlFor="Low intensity time">Low intensity time:</label>
                                    <input
                                        type="text"
                                        value={lowIntensity}
                                        onChange={(e)=> setLowIntensity(e.target.value)}
                                    />
                                    <label htmlFor="Rest time">Rest Time:</label>
                                    <input
                                        type="text"
                                        value={restTime}
                                        onChange={(e)=> setRestTime(e.target.value)}
                                    />

                                </form>
                            </div>
                        </div>
                        )
                    : selected === "Strength" ?
                    (
                        <div className={styles.strengthExercise}>
                            <label><b>Exercise:</b></label>
                            <input
                                type="text"
                                value={addingExercise}
                                onChange={(e)=> setAddingExercise(e.target.value)}
                            />
                            <div className={styles.setReps}>
                                <div className={styles.repSection}>
                                    <div>
                                        <p><b>Reps</b></p>
                                        <div className={styles.repBox}>
                                            <button className={styles.minus} onClick={removeRep}>-</button>
                                            {reps}
                                            <button className={styles.plus} onClick={onClickRep}>+</button>
                                        </div>
                                    </div>
                                    <div>
                                        <p><b>Sets</b></p>
                                        <div className={styles.setBox}>
                                            <button className={styles.minus} onClick={removeSet}>-</button>
                                            {sets}
                                            <button className={styles.plus} onClick={onClickSet}>+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.addExerciseButton}>
                                <button className={styles.addExercise} onClick={addExercise}>+ add</button> 
                            </div>
                            <ul>
                                {exercise.map((ex,idx) => (
                                    <li key={idx}> {ex.name} (reps: {ex.reps} sets: {ex.sets})</li>
                                ))}
                            </ul>
                            
                        </div>
                    )
                    : selected === "Yoga" || selected==="Pilates" ?(
                        <div className={styles.yogasection}>
                            <label><b>Total Duration: </b></label>
                            <input
                                type="text"
                                value={duration}
                                onChange={(e)=>setDuration(e.target.value)}
                            />
                            <label><b>Notes</b></label>
                            <textarea
                                name="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter what was done:"
                            />
                        </div>
                    )
                    : null
                    }
                </div>
            </div>
    )
}

export default InputPopup