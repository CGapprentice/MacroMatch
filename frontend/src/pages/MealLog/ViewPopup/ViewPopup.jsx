import styles from "./ViewPopup.module.css"

function ViewPopup({day, setShowView, setCheckOption}){

    const handleClose = () =>{
        setShowView(false);
        setCheckOption(false);
    }
    return(
        <div className={styles.background}>
            <div className={styles.boxPopup}>
                <div className={styles.topPopup}>
                    <h1>Meals for {day.date}</h1>
                    <button className={styles.exitbutton} onClick={handleClose}>X</button>
                    
                </div>
                {day.newMeal.map(meal =>(
                    <div key={meal.id} className={styles.meals}>
                        <div className={styles.header}>
                            <h3>{meal.mealType}</h3> <p>at {meal.time}</p>
                        </div>
                        <div>
                            <p>{meal.meal}</p>
                            <p>{meal.calories}</p>
                            <p>{meal.notes}</p>
                        </div>
                    </div>
                ))}
                <div className={styles.calories}>
                    <p><b>Total Calories</b></p>
                    <p>{day.totalCalories}</p>                
                </div>
            </div>
            
        </div>
    )
}

export default ViewPopup