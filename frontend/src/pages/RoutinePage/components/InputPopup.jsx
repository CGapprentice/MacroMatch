import styles from "./InputPopup.module.css"
import { useState } from 'react'
import DayPopup from "./DayPopup.jsx"


function InputPopup({selected, setSelected, duration, setDuration, speed, setSpeed, distance, setDistance, highIntensity,setHighIntensity, lowIntensity, setLowIntensity, restTime, setRestTime, exercise, setExercise, addingExercise, setAddingExercise, notes, setNotes, exercisePerRound, setExercisePerRound, reps, setReps, sets, setSets, durationUnit, setDurationUnit, speedUnit, setSpeedUnit, distanceUnit, setDistanceUnit, highIntensityUnit, setHighIntensityUnit, lowIntensityUnit, setLowIntensityUnit, restTimeUnit, setRestTimeUnit}){

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

    const handleDurationUnit = (event)=>{
        setDurationUnit(event.target.value);
    }

    const handleSpeedUnit = (event) =>{
        setSpeedUnit(event.target.value);
    }

    const handleDistanceUnit = (event) =>{
        setDistanceUnit(event.target.value);
    }

    const handleHighIntensityUnit = (event) =>{
        setHighIntensityUnit(event.target.value);
    }

    const handleLowIntensityUnit = (event) =>{
        setLowIntensityUnit(event.target.value);
    }

    const handleRestTimeUnit= (event)=>{
        setRestTimeUnit(event.target.value);
    }
    

    return(
        <div className={styles.workoutOptions}>
            <div className={styles.typeofWorkout}>
                <div>
                    <label className={styles.spacebetweentypes} htmlFor="choiceofWorkout"><h4>Types of workout</h4></label>
                        <select id="choiceofWorkout" value={selected} onChange={handleChange}>
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
                                    <div className={styles.timeform}>
                                        <input
                                            type="number"
                                            id="timeduration"
                                            value= {duration ?? ""}
                                            onChange={e=> setDuration(e.target.value)}
                                        />
                                        <label htmlFor="timedurationUnit" className={styles.timeduration}>
                                            <select id="timedurationUnit" value={durationUnit} onChange={handleDurationUnit}>
                                                <option value="minutes">minutes</option>
                                                <option value="hours"> hours</option>
                                                <option value="hour"> hour</option>
                                            </select>
                                        </label>
                                    </div>
                                    <label htmlFor="speed" className={styles.speedSection}> Speed:</label>
                                    <div className={styles.speedForm}>
                                        <input
                                            type="number"
                                            id="speed"
                                            value={speed ?? ""}
                                            onChange={e=>setSpeed(e.target.value)}
                                        />
                                        <label htmlFor="speedUnit" className={styles.speedunit}>
                                            <select id="speedUnit" value={speedUnit} onChange={handleSpeedUnit}>
                                                <option value="mph">mph</option>
                                                <option value="km/h">km/h</option>
                                                <option value="min/km">min/km</option>
                                                <option value="min/mile">min/mile</option>
                                            </select>
                                        </label>
                                    </div>
                                
                                    <label htmlFor="distance">Distance:</label>
                                    <div className={styles.distanceForm}>
                                        <input
                                            type="number"
                                            id="distance"
                                            value={distance ?? ""}
                                            onChange={(e)=>setDistance(e.target.value)}
                                        />
                                        <label id="distanceunit">
                                            <select id="distanceunit" value={distanceUnit} onChange={handleDistanceUnit}>
                                                <option value="miles">miles</option>
                                                <option value="kilometers">kilometers</option>
                                            </select>
                                        </label>

                                    </div>
                                   


                                </form>
                            </div>
                        )
                    
                    : selected === "HIIT" || selected === "Cardio intervals" ?
                        (
                        <div className={styles.HITIntervalworkout}>
                            <div className={styles.leftExercisePerRound}>
                                <label htmlFor="exerciseperround"><b>Exercise per round</b></label>
                                <textarea
                                    name="exercise notes"
                                    id="exerciseperround"
                                    value={exercisePerRound}
                                onChange={(e)=>setExercisePerRound(e.target.value)}
                                placeholder="Enter exercise per round"
                            />
                            </div>
                            <div className={styles.rightExercisePerRound}>
                                <form>
                                    <label htmlFor="timeDuration">Total Duration:</label>
                                    <div className={styles.timeform}>
                                        <input
                                            type="number"
                                            id="timeDuration"
                                            value={duration ?? ""}
                                            onChange={e =>setDuration(e.target.value)}
                                        />
                                        <label htmlFor="timeUnit">
                                            <select id="timeUnit" value={durationUnit}onChange={handleDurationUnit}>
                                                <option value="minutes">minutes</option>
                                                <option value="hours">hours</option>
                                                <option value="hour">hour</option>
                                            </select>
                                        </label>
                                    </div>
                                    
                                    <label htmlFor="highIntensityTime"> High intensity time:</label>
                                    <div className={styles.highform}>
                                        <input
                                            type="text"
                                            id="highIntensityTime"
                                            value={highIntensity ?? ""}
                                            onChange={(e) => setHighIntensity(e.target.value)}
                                        />
                                        <label htmlFor="highIntensity">
                                            <select id="highIntensity" value={highIntensityUnit} onChange={handleHighIntensityUnit}>
                                                <option value="seconds">seconds</option>
                                                <option value="minutes">minutes</option>
                                            </select>

                                        </label>
                                    </div>
                                    
                                    <label htmlFor="lowIntensityTime">Low intensity time:</label>
                                    <div className={styles.lowform}>
                                        <input
                                            type="text"
                                            id="lowIntensityTime"
                                            value={lowIntensity ?? ""}
                                            onChange={(e)=> setLowIntensity(e.target.value)}
                                        />
                                        <label id="lowIntensity">
                                            <select id="lowIntensity" value={lowIntensityUnit} onChange={handleLowIntensityUnit}>
                                                <option value="seconds">seconds</option>
                                                <option value="minutes">minutes</option>
                                            </select>
                                        </label>
                                    </div>
                                    
                                    <label htmlFor="restTime">Rest Time:</label>
                                    <div className={styles.restform}>
                                        <input
                                            type="text"
                                            id="restTime"
                                            value={restTime ?? ""}
                                            onChange={(e)=> setRestTime(e.target.value)}
                                        />
                                        <label id="rest">
                                            <select id="rest" value={restTimeUnit} onChange={handleRestTimeUnit}>
                                                <option value="seconds">seconds</option>
                                                <option value="minutes">minutes</option>
                                            </select>
                                        </label>
                                    </div>
                                    

                                </form>
                            </div>
                        </div>
                        )
                    : selected === "Strength" ?
                    (
                        <div className={styles.strengthExercise}>
                            <label htmlFor="eachExercise"><b>Exercise:</b></label>
                            <input
                                type="text"
                                id="eachExercise"
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
                            <label htmlFor="totaltime"><b>Total Duration: </b></label>
                            <div className={styles.totaltime}>
                                <input
                                    type="number"
                                    id="totaltime"
                                    value={duration ?? ""}
                                    onChange={(e)=>setDuration(e.target.value)}
                                />
                                <label htmlFor="time">
                                    <select id="time" value={durationUnit} onChange={handleDurationUnit}>
                                        <option value="minutes">minutes</option>
                                        <option value="hours">hours</option>
                                        <option value="hour">hour</option>
                                    </select>
                                </label>
                            </div>
                            
                            <label htmlFor="notes"><b>Notes</b></label>
                            <textarea
                                name="notes"
                                id="notes"
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