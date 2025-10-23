import styles from './DayPopup.module.css'
import InputPopup from './InputPopup.jsx'
import { useState } from 'react'

function DayPopup({showPopup, activeDay, dayCount }){
    const [routine, setRoutine] = useState('');
    const capitalizedDay = activeDay.charAt(0).toUpperCase() + activeDay.slice(1);
    
    if(showPopup === false) return null;
    
    return(
        <div className={styles.DayPopupContainter}>
            <div className={styles.DayPopup}>
                <div className={styles.topBox}>
                    <h1>{capitalizedDay}</h1> <button>X</button>
                </div>
                
                <div className={styles.workoutOptions}>
                    <h4>Workout {dayCount}</h4>
                </div>
                <div className={styles.types}>
                    <InputPopup />
                </div>
            </div>
        </div>
    )
}

export default DayPopup