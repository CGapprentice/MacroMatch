import styles from './MealLog.module.css'
import {useEffect, useState} from 'react'
import HomePageHeader from '../../homepage/header.jsx'
import MealHistory from '../MealLog/MealHistory.jsx'
import { useNavigate } from "react-router-dom"


function MealLog(){
    useEffect(()=>{
        document.title = 'Meal Log';
    },[])

    const token = localStorage.getItem('firebase_token')

    const[date, setDate] = useState('');
    const[time, setTime] = useState('');
    const[mealType, setMealType] = useState('Breakfast');
    const[calories, setCalories] = useState('');
    const[meal, setMeal] = useState('');
    const[note, setNote] = useState('');
    const[showLog, setShowLog] = useState(true);
    const[dayMeal, setDayMeal] = useState([]);
    const[totalCalories, setTotalCalories] = useState(0);
    const[errorMessage, setErrorMessage] = useState('');
    
    const handleClose = () =>{
        setDate('');
        setTime('');
        setMealType('Breakfast');
        setCalories('');
        setMeal('');
        setNote('');
        setShowLog(false);
    }



   const handleAddMeal = async() =>{
        const newMeal ={
            date,
            time,
            mealType,
            calories: Number(calories),
            meal,
            note
        }

        setTotalCalories(prev => prev + Number(calories));

        /*setDayMeal(day => {
            const dateExist = day.findIndex( d => d.date === newMeal.date);
            let addMeal;
            if(dateExist === -1){
                addMeal = [
                    ...day,
                    {date, newMeal: [newMeal], totalCalories: calories}
                ]
            }else{
                //this is when date does exists 
                addMeal = day.map((day) =>{
                    if(day.date === date){
                        const allMeals = [...day.newMeal, newMeal];
                        const totalCal = allMeals.reduce((add, meal) => add + Number(meal.calories || 0), 0);
                        return{
                            ...day,
                            newMeal: allMeals,
                            totalCalories: totalCal
                        };
                    }
                    return day
                })
            }
            return addMeal.sort((a,b) => new Date(b.date) - new Date(a.date));
        })
        console.log(dayMeal);*/

        
        try{
            const response = await fetch('http://localhost:5000/api/v1/meals/',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newMeal)
            });
            const result = await response.json();
            if(!response.ok){
                console.log(result.error);
                setErrorMessage(result.error);
            }

            const sentMeal = result.meal;

            setDayMeal(day => {
                const dateExist = day.findIndex( d => d.date === sentMeal.date);
                let addMeal;
                if(dateExist === -1){
                    addMeal = [
                        ...day,
                        {date: sentMeal.date, newMeal: [sentMeal], totalCalories: sentMeal.calories}
                    ]
                }else{
                    //this is when date does exists 
                    addMeal = day.map((day) =>{
                        if(day.date === sentMeal.date){
                            const allMeals = [...day.newMeal, sentMeal];
                            const totalCal = allMeals.reduce((add, meal) => add + Number(meal.calories || 0), 0);
                            return{
                                ...day,
                                newMeal: allMeals,
                                totalCalories: totalCal
                            };
                        }
                        return day
                    })
                }
                return addMeal.sort((a,b) => new Date(b.date) - new Date(a.date));
            })
            console.log(dayMeal);
        }catch(error){
            console.error('Adding meal error: ', error);
            setErrorMessage(error.message || String(error));
        }
        
    }
   

    const handleChange = (event) =>{
        setMealType(event.target.value);
    }

    const navigate = useNavigate();
    useEffect(()=>{
        const getMealLogHistory = async () =>{
            try{
                const result = await fetch('http://localhost:5000/api/v1/meals/',{
                    method: 'GET',
                    headers:{
                        'Content-Type' : 'application/json',
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
                    const responseArray = response.meals || [];
                    const groupByDate = responseArray.reduce((acc, obj)=>{
                        const key = obj.date;
                        if(!acc[key]){
                            acc[key] =[];
                        }
                        acc[key].push(obj);
                        return acc;
                    },{});

                    const groupDates = Object.entries(groupByDate).map(([date,meal])=>({
                        date,
                        newMeal: meal,
                        totalCalories: meal.reduce((sum, meal)=> sum+ Number(meal.calories || 0),0)                    
                    }));
                    const sortedGroup = groupDates.sort((a,b) => new Date(b.date) - new Date(a.date));
                    setDayMeal(sortedGroup);
                    console.log(dayMeal);
                }
            }catch(error){
                console.error('Getting User History Meals error: ', error);
                setErrorMessage(error.message || String(error));
            } 
        }; getMealLogHistory();
    },[]);
    
    return(
        <>
            <header>
                <HomePageHeader />
            </header>
            <main>
                {showLog ? <section className={styles.mealContainer}>
                    <div className={styles.mealLogBox}>
                        <div className={styles.title}>
                            <h1>{errorMessage}</h1>
                            <h1>Log your meal</h1>
                        </div>
                        <div className={styles.option}>
                            <p><b>Your Meal</b></p><button onClick={handleClose}>X</button>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.dateColumn}>
                                <label>Date:</label>
                                <input
                                    type="date"
                                    value={date}
                                    id="input date"
                                    onChange= {(e)=> setDate(e.target.value)}
                                />
                            </div>

                            <div className={styles.timeColumn}>
                                <label>Time:</label>
                                <input
                                    type="time"
                                    value={time}
                                    id="input time"
                                    onChange= {(e)=> setTime(e.target.value)}
                                />
                            </div>

                            <div className={styles.mealTypeColumn}>
                                 <label>Which meal is this?</label>
                                <select id="whichMeal" onChange={handleChange}>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snack">Snack</option>
                                </select>
                            </div>
                            
                            <div className={styles.caloriesColumn}>
                                    <label>Calories:</label>
                                    <div className={styles.caloriesRow}>
                                        <input 
                                            type="number"
                                            id="Calorie input"
                                            value={calories}
                                            onChange={(e)=> {
                                                const stringCalories = e.target.value;
                                                const intCalories = Number(stringCalories);
                                                setCalories(intCalories);
                                            }}
                                        />
                                        <p>or</p>
                                        <button className={styles.uploadImage}><img src='/download.png'/></button>
                                </div>
                                
                            </div> 

                        </div>
                        <div className={styles.mealColumn}>
                            <label>What is your meal?</label>
                            <textarea
                                name="meal name"
                                value={meal}
                                onChange={(e)=>setMeal(e.target.value)}
                            />
                            <label>Notes:</label>
                            <textarea
                                name="meal notes"
                                value={note}
                                onChange={(e)=>setNote(e.target.value)}
                            /> 
                        </div>
                        <div className={styles.addButton}>
                            <button onClick={handleAddMeal}>+ meal</button>
                        </div>
                    </div>
                    {
                        dayMeal.length > 0 ? 
                        <MealHistory
                            dayMeal={dayMeal}
                            totalCalories={totalCalories}
                            setDayMeal={setDayMeal}
                            
                       /> 
                       : null
                    }
                    
                </section> : 
                <section className={styles.showLogNoLog}>
                    <div className={styles.addMeal}>
                        <button onClick={()=> setShowLog(true)}>+ Meal</button>
                    </div>
                    {
                        dayMeal.length > 0 ? 
                        <MealHistory
                            dayMeal={dayMeal}
                            totalCalories={totalCalories}
                            setDayMeal={setDayMeal}
                            
                       /> 
                       : null
                    }
                </section>
                }
                
            </main>
        </>
    )
}

export default MealLog