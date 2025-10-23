import styles from './RoutinePage.module.css'
import { useEffect, useState } from 'react'
import HomePageHeader from '../../homepage/header.jsx'

import DayPopup from './components/DayPopup.jsx'

function RoutinePage(){
    useEffect(()=>{
        document.title = 'Routine Page';
    },[])

    const[chooseDay, setChooseDay] = useState({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
    });

    const[showPopup, setShowPopup] = useState(false);
    const[activeDay, setActiveDay] = useState('');
    const[dayCount,setDayCount] = useState(0);


    const handleDayClick = (selectedDay) =>{
        setChooseDay(prevState => {
           const newState = { ...prevState,
            [selectedDay]: !prevState[selectedDay]};
            if(newState[selectedDay]){
                setActiveDay(selectedDay);
                setShowPopup(true);
                console.log(selectedDay);
                console.log(showPopup);
                console.log(chooseDay);

            }else{
                setShowPopup(false);
                console.log(selectedDay);
                console.log(showPopup);
                console.log(chooseDay);
            }
            return newState;
        });
    
        /*
        setActiveDay(selectedDay);
        setShowPopup(true);
        console.log(selectedDay);
        console.log(chooseDay);*/

    };

    return(
        <>
        <header>
            <HomePageHeader />
        </header>
        <main className={styles.mainRoutine}>
            <section className={styles.chooseContainer}>
                <div className={styles.days}>
                    <div className={styles.routineHeader}>
                        <h1>Workout Routine</h1>
                    </div>
                    <div className={styles.dayButtons}>
                        <button className={`${styles.set} ${chooseDay.sunday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('sunday')}>Sun</button>
                        <button className={`${styles.set} ${chooseDay.monday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('monday')}>Mon</button>
                        <button className={`${styles.set} ${chooseDay.tuesday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('tuesday')}>Tue</button>
                        <button className={`${styles.set} ${chooseDay.wednesday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('wednesday')}>Wed</button>
                        <button className={`${styles.set} ${chooseDay.thursday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('thursday')}>Thu</button>
                        <button className={`${styles.set} ${chooseDay.friday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('friday')}>Fri</button>
                        <button className={`${styles.set} ${chooseDay.saturday ? styles.chooseDay : ''}`} onClick={() => handleDayClick('saturday')}>Sat</button>
                    </div>
                </div>
            </section>
            <section className={styles.routineSection}>
                {Object.entries(chooseDay)
                .filter(([day,isOpen]) => isOpen)
                .map(([day]) => (
                    <div className={styles.popUp} key={day}>
                        <DayPopup key={day} showPopup={true} activeDay={day} selectedDay={day} dayCount={dayCount+1}/>
                    </div>
                ))}
                
                <div className={styles.addbutton}>
                    <button>add routine</button> 
                </div>
                       
            </section>


            
        </main>
        </>
    )
}

export default RoutinePage