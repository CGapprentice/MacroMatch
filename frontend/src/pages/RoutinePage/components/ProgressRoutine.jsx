import styles from "./ProgressRoutine.module.css"
import { useState } from 'react'
import { motion } from 'framer-motion'

function ProgressRoutine({ setTodayRoutine,currentDay,totalDays, routineToday, setCompleteRoutine, progress, progressData, setProgressData, progressID, setProgressID, token}) {
    const handleAddTodayProgress = async() => {
        const update = {...progressData, [currentDay]:true};
        setProgressData(update);
        console.log(progressData);
        try{
            const response = await fetch(`http://localhost:5000/api/v1/progress/${progressID}`, {
                method: 'PUT',
                headers:{
                    'Content-Type' : 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({progress: update})
            })
            const result = await response.json()
            if(response.ok){
                setProgressData(result.progress.progress);
                setProgressID(result.progress.id);
                console.log(progressData);
            }
            if(!response.ok){
                console.log("Something went wrong with updating: ", result.error)
            }
        }
        catch(error){
            console.error("Couldn't update data: ", error);
        }
        setCompleteRoutine(true);
    }
    console.log(routineToday);
    
    return(
        <div className={styles.background}>
            <div className={styles.popup}>
                {progressData[currentDay] ? 
                    <div className={styles.progressRoutinePage}>
                        <h1>You have done Today's Workout</h1>
                        <p>Progress: {progress} / {totalDays} </p>
                        <img className={styles.check} src='/check.png'/>
                        <p>Your workout is {routineToday.selected}</p>
                        {routineToday.selected === 'Cycling' || routineToday.selected === 'Walking' || routineToday.selected === 'Running' || routineToday.selected === 'Swimming' || routineToday.selected === 'Elliptical' || routineToday.selected === 'Treadmill' ?
                            <div className={styles.cardioSection}>
                                <p><b>Duration:</b> {routineToday.duration} {routineToday.durationUnit}</p>
                                <p><b>Speed:</b> {routineToday.speed} {routineToday.speedUnit}</p>
                                <p><b>Distance: </b>{routineToday.distance} {routineToday.distanceUnit}</p>
                            </div>
                        : 
                            routineToday.selected === 'HIIT' || routineToday.selected === 'Cardio intervals' ? 
                            <div className={styles.intervalSection}>
                                <p><b>Exercise Per Round:</b> {routineToday.exercisePerRound}</p>
                                <p><b>Total Duration:</b> {routineToday.duration} {routineToday.durationUnit}</p>
                                <p><b>High Intensity time: </b>{routineToday.highIntensity} {routineToday.highIntensityUnit}</p>
                                <p><b>Low Intensity time: </b>{routineToday.lowIntensity} {routineToday.lowIntensityUnit}</p>
                                <p><b>Rest Time: </b>{routineToday.restTime} {routineToday.restTimeUnit}</p>
                            </div>
                        :
                            routineToday.selected === 'Strength' ? 
                            <div className={styles.strengthSection}>
                                {routineToday.exercise && routineToday.exercise.map((exercise,each) =>(
                                <div key={each}>
                                    <p><b>Exercise:</b> {exercise.name}</p>
                                    <p><b>Reps:</b> {exercise.reps}</p>
                                    <p><b>Sets: </b>{exercise.sets}</p>
                                </div>
                                ))}
                            </div>
                        :
                            routineToday.selected === 'Yoga' || routineToday.selected === 'Pilates' ? 
                            <div className={styles.yogaSection}>
                                <p><b>Duration</b> {routineToday.duration} {routineToday.durationUnti}</p>
                                <p><b>Notes: </b>{routineToday.notes}</p>
                            </div>
        
                        :   null
                        }
                        <button onClick={()=>setTodayRoutine(false)}>Click to go back</button>
                    </div>
                : 
                    <motion.div className={styles.progressRoutinePage}
                        animate={{rotate: [0,-10,10, -10,10,0]}}
                        transition = {{ duration: 0.75, ease:"easeInOut"}}
                    >   
                        <h1>You haven't done Today's Workout</h1>
                        <p>Progress: {progress} / {totalDays} </p>
                        <img src='/noRoutine.png'/>
                        <p>Your workout is {routineToday.selected}</p>
                        {routineToday.selected === 'Cycling' || routineToday.selected === 'Walking' || routineToday.selected === 'Running' || routineToday.selected === 'Swimming' || routineToday.selected === 'Elliptical' || routineToday.selected === 'Treadmill' ?
                            <div className={styles.cardioSection}>
                                <p><b>Duration:</b> {routineToday.duration} {routineToday.durationUnit}</p>
                                <p><b>Speed:</b> {routineToday.speed} {routineToday.speedUnit}</p>
                                <p><b>Distance: </b>{routineToday.distance} {routineToday.distanceUnit}</p>
                            </div>
                        : 
                        routineToday.selected === 'HIIT' || routineToday.selected === 'Cardio intervals' ? 
                            <div className={styles.intervalSection}>
                                <p><b>Exercise Per Round:</b> {routineToday.exercisePerRound}</p>
                                <p><b>Total Duration:</b> {routineToday.duration} {routineToday.durationUnit}</p>
                                <p><b>High Intensity time: </b>{routineToday.highIntensity} {routineToday.highIntensityUnit}</p>
                                <p><b>Low Intensity time: </b>{routineToday.lowIntensity} {routineToday.lowIntensityUnit}</p>
                                <p><b>Rest Time: </b>{routineToday.restTime} {routineToday.restTimeUnit}</p>
                            </div>
                        :
                        routineToday.selected === 'Strength' ? 
                            <div className={styles.strengthSection}>
                                {routineToday.exercise && routineToday.exercise.map((exercise,each) =>(
                                <div key={each}>
                                    <p><b>Exercise:</b> {exercise.name}</p>
                                    <p><b>Reps:</b> {exercise.reps}</p>
                                    <p><b>Sets: </b>{exercise.sets}</p>
                                </div>
                                ))}
                            </div>
                        :
                        routineToday.selected === 'Yoga' || routineToday.selected === 'Pilates' ? 
                            <div className={styles.yogaSection}>
                                <p><b>Duration</b> {routineToday.duration} {routineToday.durationUnti}</p>
                                <p><b>Notes: </b>{routineToday.notes}</p>
                            </div>
        
                        : null
                    }
            
                        <button onClick={handleAddTodayProgress}>Yes I did</button>
            
                        <button onClick={()=>setTodayRoutine(false)}>No I haven't</button>
            
                    </motion.div>
                }

            </div>
        </div>
    )

}

export default ProgressRoutine