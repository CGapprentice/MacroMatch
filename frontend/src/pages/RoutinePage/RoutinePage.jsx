import styles from './RoutinePage.module.css'
import { useEffect, useState } from 'react'
import HomePageHeader from '../../homepage/header.jsx'
import SummaryPage from "./components/SummaryPage.jsx"
import { useNavigate } from "react-router-dom"


import DayPopup from './components/DayPopup.jsx'

function RoutinePage(){
    useEffect(()=>{
        document.title = 'Routine Page';
    },[])

    const[errorMessage, setErrorMessage] = useState('');
    const navigate= useNavigate();
    const token = localStorage.getItem('firebase_token')

    const [routineSummary, setRoutineSummary] = useState(false);
    const[data, setData] = useState({});
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

    const check = Object.values(chooseDay).every(value => value === false);
    
    useEffect (()=>{
        const getSummaryRoutine = async () => {
            try{
                const result = await fetch('http://localhost:5000/api/v1/routine/',{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });
                if(result.status === 401){
                    localStorage.removeItem("firebase_token");
                    navigate('/login')
                    return
                }
                if(result.ok){
                    const response = await result.json();

                    const routinesEachDay = {}
                    response.routine.forEach(routine=>{
                        routinesEachDay[routine.activeDay] = routine;
                    });
                    setData(routinesEachDay);
                    setRoutineSummary(true);
                }
            }catch(error){
                console.error('Get User routine error: ', error);
                setErrorMessage(error);
            }
        }; getSummaryRoutine();
    },[]);


    const handleDayClick = async(selectedDay) =>{
        const changed= chooseDay[selectedDay]
        setChooseDay(prevState => {
           const newState = { ...prevState,
            [selectedDay]: !prevState[selectedDay]};
            
            if(newState[selectedDay]){
                setActiveDay(selectedDay);
                setShowPopup(true);
            }else{
                setShowPopup(false);
                setData(prev=>{
                    const update = {...prev};
                    delete update[selectedDay];
                    return update;
                });

            }
            
            return newState;
        }); 
        if(changed){
            const routineId= data[selectedDay]?.id;
            console.log(data);
            if(routineId){
                try{
                    const response = await fetch(`http://localhost:5000/api/v1/routine/${routineId}`,{
                        method: 'DELETE',
                        headers:{
                            'Content-type' : 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if(response.status === 401){
                        localStorage.removeItem("firebase_token")
                        navigate('/login')
                        return
                    }
                    if(response.ok){
                        setData(prev=>{
                            const update = {...prev};
                            delete update[selectedDay];
                            return update;
                        });
                        console.log(selectedDay, "was successfully deleted");
                    }else{
                        const dataError = await response.json();
                        console.error("Failed to delete: ", dataError);
                    }
                }catch(error){
                    console.error('Delete Routine Failed: ' ,error);
                    setErrorMessage("Wasn't able to delete routine")
                }
            } else{
                console.error("no routine id found");
            }
        }
            
    };

    

    const addRoutine= ()=>{
        setRoutineSummary(true);
        console.log(data);
    }


    return(
        <>
        <header>
            <HomePageHeader />
        </header>
        {routineSummary ? (
            <SummaryPage data={data} setRoutineSummary={setRoutineSummary} setData={setData} />
        ): <main className={styles.mainRoutine}>
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
                        <DayPopup key={day} showPopup={true} 
                        activeDay={day} 
                        selectedDay={day} 
                        eachDayChange={(day, data) => 
                            setData(prev => ({...prev, [day]: data})) 
                        }
                        data={data[activeDay]}
                        setActiveDay={setActiveDay}
                        routineId = {data[activeDay]?.id}
                        />
                    </div>
                ))}
                {check || routineSummary ? null : <div className={styles.addbutton}>
                    <button onClick={addRoutine}>add routine</button> 
                </div> }
                       
            </section>


            
        </main>}
        </>
    )
}

export default RoutinePage