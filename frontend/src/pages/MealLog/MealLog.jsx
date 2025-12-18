import styles from './MealLog.module.css'
import {useEffect, useState} from 'react'
import HomePageHeader from '../../homepage/header.jsx'
import MealHistory from '../MealLog/MealHistory.jsx'
import { useNavigate } from "react-router-dom"
import { API_BASE_URL} from '../../firebase.js'
const mealOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
import { useUser } from '../../components/UserContext'

/*
    TO DO:
    - Fix Meal Order When User Clicks + meal it should order from Breakfast, Lunch, Dinner, and Snack
    - Change Design for when user has passed daily calorie goal or not.
    - 
*/

function MealLog(){
    const {saveAllMacros} = useUser();
    const USDA_URL = 'https://api.nal.usda.gov/fdc/v1/'
    const UDSA_KEY = import.meta.env.VITE_USDA_KEY
    useEffect(()=>{
        document.title = 'Meal Log';
    },[])
    const{ calculatorResults } = useUser();

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
    const[totalCarbsDay, setTotalCarbsDay] = useState(0);
    const[totalFatsDay, setTotalFatsDay] = useState(0);
    const[totalProteinDay, setTotalProteinDay] = useState(0);
    const[errorMessage, setErrorMessage] = useState('');

    const[chooseMeal, setChooseMeal] = useState(false);
    const[chooseIngredient, setChooseIngredient] = useState(false);
    const[showChoice, setShowChoice] = useState(true);
    const[protein, setProtein] = useState(null);
    const[carbs, setCarbs] = useState(null);
    const[fats, setFats] = useState(null);
    const[searchMessage, setSearchMessage] = useState('');
    const[ingredients, setIngredients] = useState([]);
    const[ingredientform, setIngredientForm] = useState({
        ingredientName: "",
        amount: 0,
        amountUnit: "g"
    });
    const[mealReturn, setMealReturn] = useState([]);
    const[mealChosen, setMealChosen] = useState({});
    const[questionMeal, setQuestionMeal] = useState(false);
    const[userUnits, setUserUnits] = useState(false);
    const[equalUnits, setEqualUnits] = useState('');
    const[userAte, setUserAte] = useState(0);
    const[dataCal, setDataCal] = useState(0);
    const[dataServingSize, setDataServingSize] = useState(0);
    const[dataFat, setDataFat] = useState(0);
    const[dataCarbs, setDataCarbs] = useState(0);
    const[dataProtein, setDataProtein] = useState(0);
    const[totalFats, setTotalFats] = useState(0);
    const[totalCarbs, setTotalCarbs] = useState(0);
    const[totalProtein, setTotalProtein] = useState(0);
    const[sendData, setSendData] = useState({
        date:"",
        totalCalories: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFats: 0,
    })
    
    
    
    const handleClose = () =>{
        setDate('');
        setTime('');
        setMealType('Breakfast');
        setCalories('');
        setMeal('');
        setNote('');
        setShowLog(false);
        setChooseIngredient(false);
        setChooseMeal(false);
        setShowChoice(true);
    }



   const handleAddMeal = async() =>{
        const newMeal ={
            date,
            time,
            mealType,
            calories: Number(calories),
            meal,
            carbs: Number(carbs),
            fats: Number(fats),
            protein: Number(protein),
            calculatorResults,
            note
        }
        
        if(!date || !time || !calories || !meal){
            setErrorMessage('Date, time, Calories, or What is your meal do not have an input. Please fill these in.');
            return;
        }
        setErrorMessage('');
        setTotalCalories(prev => prev + Number(calories));
        setTotalCarbs(prev => prev + Number(carbs));
        setTotalFats(prev => prev + Number(fats));
        setTotalProtein(prev => prev + Number(protein));
        
        try{
            const response = await fetch(`${API_BASE_URL}/api/v1/meals/`,{
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
                        {date: sentMeal.date, newMeal: [sentMeal], totalCalories: sentMeal.calories, totalCarbs: sentMeal.carbs, totalFats: sentMeal.fats, totalProtein: sentMeal.protein}
                    ]
                }else{
                    //this is when date does exists 
                    addMeal = day.map((day) =>{
                        if(day.date === sentMeal.date){
                            const allMeals = [...day.newMeal, sentMeal];
                            const totalCal = allMeals.reduce((add, meal) => add + Number(meal.calories ), 0);
                            const totalCarb = allMeals.reduce((add, meal) => add + Number(meal.carbs ),0);
                            const totalFat = allMeals.reduce((add,meal) => add + Number(meal.fats),0);
                            const totalPro = allMeals.reduceRight((add, meal) => add + Number(meal.protein),0);
                            return{
                                ...day,
                                newMeal: allMeals.sort((a,b)=> mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType)),
                                totalCalories: totalCal,
                                totalCarbs: totalCarb,
                                totalFats: totalFat,
                                totalProtein: totalPro
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
        setDate('');
        setTime('');
        setCalories('');
        setMeal('');
        setNote('');
        setFats('');
        setCarbs('');
        setProtein('');
        setChooseIngredient(false);
        setChooseMeal(false);
        setShowChoice(true);
        
        
    }
   

    const handleChange = (event) =>{
        setMealType(event.target.value);
    }

    const navigate = useNavigate();
    useEffect(()=>{
        const getMealLogHistory = async () =>{
            try{
                const result = await fetch(`${API_BASE_URL}/api/v1/meals/`,{
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
                        newMeal: meal.sort((a,b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType)),
                        totalCalories: meal.reduce((sum, meal)=> sum+ Number(meal.calories || 0),0),
                        totalCarbs: meal.reduce((sum, meal)=> sum+ Number(meal.carbs || 0),0),
                        totalFats: meal.reduce((sum, meal)=> sum+ Number(meal.fats || 0),0),
                        totalProtein: meal.reduce((sum, meal)=> sum+ Number(meal.protein || 0),0)
                    }));
                    const sortedGroup = groupDates.sort((a,b) => new Date(b.date) - new Date(a.date));
                    setDayMeal(sortedGroup);
                    // Set daily totals for the most recent day (today or latest)
                    if(sortedGroup.length > 0) {
                        setTotalCalories(sortedGroup[0].totalCalories);
                        setTotalCarbsDay(sortedGroup[0].totalCarbs);
                        setTotalFatsDay(sortedGroup[0].totalFats);
                        setTotalProteinDay(sortedGroup[0].totalProtein);
                    } else {
                        setTotalCalories(0);
                        setTotalCarbsDay(0);
                        setTotalFatsDay(0);
                        setTotalProteinDay(0);
                    }
                    console.log(response);
                }
            }catch(error){
                console.error('Getting User History Meals error: ', error);
                setErrorMessage(error.message || String(error));
            } 
        }; getMealLogHistory();
    },[]);

    const choosenMeal = () =>{
        setChooseMeal(true);
        setShowChoice(false);
    }
    const choosenIngredient = () =>{
        setChooseIngredient(true);
        setShowChoice(false);
    }

    function addIngredient(){
        if(ingredientform.ingredientName.trim() !==''){
            setIngredients([...ingredients, {ingredientName: ingredientform.ingredientName, amount: ingredientform.amount, amountUnit: ingredientform.amountUnit}])
        }
        setIngredientForm({ingredientName:'', amount: 0, amountUnit: ''})
        console.log(ingredientform);
        console.log(ingredients)
    }

    const mealSearch = async() => {
        console.log("clicked search")
        try{
            const response = await fetch(`${USDA_URL}/foods/search?api_key=${UDSA_KEY}`,{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    query: meal,
                    pageSize: 5,
                    dataType:['Foundation', 'Survey','Branded']
                })
            })
            const data = await response.json();
            const feedback = data.foods;
            const containAllMacros = feedback.filter(food => {
                if(!food.servingSize)return false;
                const nutrient = food.foodNutrients || [];
                const hasCal = nutrient.find(n => n.nutrientName === "Energy" && n.unitName==="KCAL")
                const hasFat = nutrient.find(n => n.nutrientName === "Total lipid (fat)" && n.unitName==="G")
                const hasCar = nutrient.find(n => n.nutrientName === "Carbohydrate, by difference" && n.unitName==="G")
                const hasPro = nutrient.find(n => n.nutrientName === "Carbohydrate, by difference" && n.unitName==="G")
                    return hasCal && hasPro && hasFat && hasCar 
                })
            const foodsWithServingSize = data.foods.filter(food => food.servingSize);
            setMealReturn(containAllMacros);
            setQuestionMeal(true);
            console.log(mealReturn);
            return

        }catch(error){
            console.log("Failed to connect to API", error);
        }
    }

    const mealInfo = (meal)=>{
        
        setMealChosen(meal);
        console.log(meal);
        setUserUnits(true);
        setDataServingSize(meal.servingSize);
        setUserAte(meal.servingSize);
        
        setEqualUnits(meal.servingSizeUnit);
        
        const getCalories = meal.foodNutrients.find(
            n => n.nutrientName === "Energy" && n.unitName === 'KCAL'
        );
        const calories = getCalories ? getCalories.value : null;
        setDataCal(calories);

        const getProtein = meal.foodNutrients.find(
            n => n.nutrientName === "Protein" && n.unitName === 'G'
        );
        const protein = getProtein ? getProtein.value : null;
        setDataProtein(protein);

        const getFat = meal.foodNutrients.find(
            n => n.nutrientName === "Total lipid (fat)" && n.unitName === 'G'
        );
        const fat = getFat ? getFat.value : null;
        setDataFat(fat);

        const getCarbs = meal.foodNutrients.find(
            n => n.nutrientName === "Carbohydrate, by difference" && n.unitName === 'G'
        );
        const carbs = getCarbs ? getCarbs.value : null;
        setDataCarbs(carbs);
    }
    
    const handleData = () =>{
        const userServings = userAte / dataServingSize;
        setCalories(userServings * dataCal);
        setProtein(userServings * dataProtein);
        setFats(userServings * dataFat);
        setCarbs(userServings * dataCarbs);

        console.log("calories: ", calories, "Protein: ", protein, "fats: ", fats, "carbs: ", carbs);
    }

    useEffect(()=>{
        const today = new Date().toISOString().split("T")[0];
        console.log("dayMea", dayMeal);
        const todayData = dayMeal.find(day=>day.date === today);
        if(todayData){
            setSendData({
                date: todayData.date,
                totalCalories: todayData.totalCalories,
                protein: todayData.totalProtein,
                carbs: todayData.totalCarbs,
                fats: todayData.totalFats
            })
            saveAllMacros(sendData);
        }else{
            setSendData({
                date: today,
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            })
            saveAllMacros(sendData);

        }
    },[dayMeal]);
    return(
        <>
            <header>
                <HomePageHeader />
            </header>
            <main>
                
                {showLog ? <section className={styles.mealContainer}>
                    <div className={styles.mealLogBox}>
                        <div className={styles.title}>
                            <h1>Log your meal</h1>
                        </div>
                        <div className={styles.option}>
                            <p><b>Your Meal</b></p><button onClick={handleClose}>X</button>
                        </div>
                        {/*
                        {showChoice ? 
                            <div className={styles.checkIngredientOrMeal}>
                                <p>Do you want to add meal or ingredient?</p>
                                <button onClick={choosenMeal}>meal</button> <button onClick={choosenIngredient}>ingredient</button>
                            </div>
                        : chooseMeal ? 
                            <div className={styles.mealSearch}>
                                <div className={styles.mealName}>
                                    <label>What is your meal?</label>
                                        <textarea
                                            name="meal name"
                                            value={meal}
                                            onChange={(e)=>setMeal(e.target.value)}
                                        />
                                        <button className={styles.searchButton1} onClick={mealSearch}>Search</button>
                                </div>
                                <div className={styles.mealForm}>
                                    {questionMeal ? <p>Which works best describes the meal you are adding to the log?<br></br></p>:null}
                                    {mealReturn ? 
                                    <>
                                        {mealReturn.map((meal, each) => (
                                            <div className={styles.mealChoice}>
                                                <label key= {meal.fdcId || each}>
                                                    <input 
                                                        name="mealchoice"
                                                        type='radio'
                                                        value={each}
                                                        checked={mealChosen && mealChosen.fdcId === meal.fdcId}
                                                        onChange={e => mealInfo(meal)}
                                                    />{meal.description.charAt(0) + meal.description.slice(1).toLowerCase()} {meal.servingSize} {meal.servingSizeUnit}
                                                </label>
                                            </div>
                                        
                                        ))}
                                    </>
                                    : <p>Not able to get data for your input. Apologize but you can feel free to add your own data</p>
                                    }
                                    
                                    {userUnits ? 
                                        <>
                                            <label>How many {equalUnits} did you eat? </label>
                                            <input
                                                name="amount"
                                                type="number"
                                                value={userAte ?? ''}
                                                onChange={e=>setUserAte(e.target.value)}
                                            />
                                            <button onClick={handleData}>Calculate</button>
                                        </>
                                        
                                    :  
                                        null}


                                </div>
                            
                            </div>
                        : chooseIngredient ? 
                            <div className={styles.overallIngredient}>
                                
                                <div className={styles.ingredientform}>
                                    <div className={styles.nameIngredient}>
                                        <label htmlFor="ingredients">What are the ingredients you want to add?</label>
                                        <input
                                            type="text"
                                            id="eachExercise"
                                            value={ingredientform.ingredientName}
                                            onChange={(e)=> setIngredientForm({...ingredientform, ingredientName: e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.amountIngredient}>
                                        <label htmlFor="amount"> Amount: </label>
                                        <input
                                            type="text"
                                            id="amount"
                                            value={ingredientform.amount}
                                            onChange={(e)=> setIngredientForm({...ingredientform, amount: e.target.value})}
                                        />
                                    </div>
                                    <div className ={styles.unitIngredients}>
                                        <label htmlFor="unit"> Units: </label>
                                        <select id='unit' value={ingredientform.amountUnit} onChange={e => setIngredientForm({ ...ingredientform, amountUnit: e.target.value })}>
                                            <option value="g">g</option>
                                            <option value="kg">kg</option>
                                            <option value="oz">oz</option>
                                            <option value="lb">lb</option>
                                            <option value="tsp">tsp</option>
                                            <option value="tbsp">tbsp</option>
                                            <option value="cup">cup</option>
                                            <option value="fl">fl</option>
                                            <option value="g">g</option>
                                            <option value="ml">ml</option>
                                            <option value="l">l</option>
                                            <option value="piece">piece</option>
                                            <option value="slice">slice</option>
                                            <option value="item">item</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={addIngredient}>add</button>
                                <div className={styles.ingredientsArray}>

                                    <ul>
                                        {ingredients.map((ingredient)=>(
                                            <li key={ingredient.ingredientName}>
                                                {ingredient.ingredientName} {ingredient.amount} {ingredient.amountUnit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                               
                                
                            </div>
                        : null
                        }*/}
                        <div className={styles.mealSearch}>
                                <div className={styles.mealName}>
                                    <label>What is your meal?</label>
                                        <textarea
                                            name="meal name"
                                            value={meal}
                                            onChange={(e)=>setMeal(e.target.value)}
                                        />
                                        <button className={styles.searchButton1} onClick={mealSearch}>Search</button>
                                </div>
                                <div className={styles.mealForm}>
                                    {questionMeal ? <p>Which works best describes the meal you are adding to the log?<br></br></p>:null}
                                    {mealReturn ? 
                                    <>
                                        {mealReturn.map((meal, each) => (
                                            <div className={styles.mealChoice}>
                                                <label key= {meal.fdcId || each}>
                                                    <input 
                                                        name="mealchoice"
                                                        type='radio'
                                                        value={each}
                                                        checked={mealChosen && mealChosen.fdcId === meal.fdcId}
                                                        onChange={e => mealInfo(meal)}
                                                    />{meal.description.charAt(0) + meal.description.slice(1).toLowerCase()} {meal.servingSize} {meal.servingSizeUnit}
                                                </label>
                                            </div>
                                        
                                        ))}
                                    </>
                                    : <p>Not able to get data for your input. Apologize but you can feel free to add your own data</p>
                                    }
                                    {userUnits ? 
                                        <>
                                            <label>How many {equalUnits} did you eat? </label>
                                            <input
                                                name="amount"
                                                type="number"
                                                value={userAte ?? ''}
                                                onChange={e=>setUserAte(e.target.value)}
                                            />
                                            <button onClick={handleData}>Calculate</button>
                                        </>
                                        
                                    :  
                                        null}
                                </div>
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
                                        {/*<p>or</p>
                                        <button className={styles.uploadImage}><img src='/download.png'/></button>*/}
                                </div>
                                
                            </div> 
                            <div>
                                <label>Protein:</label>
                                    <div className={styles.caloriesRow}>
                                        <input 
                                            type="number"
                                            id="protein input"
                                            value={protein}
                                            onChange={(e)=> {
                                                const stringCalories = e.target.value;
                                                const intCalories = Number(stringCalories);
                                                setProtein(intCalories);
                                            }}
                                        />
                                        </div>
                                    </div>
                                    <div>
                                    <label>Fats:</label>
                                    <div className={styles.caloriesRow}>
                                        <input 
                                            type="number"
                                            id="fats input"
                                            value={fats}
                                            onChange={(e)=> {
                                                const stringCalories = e.target.value;
                                                const intCalories = Number(stringCalories);
                                                setFats(intCalories);
                                            }}
                                        />
                                    </div>
                                    </div>
                                    <div>
                                        <label>Carbs:</label>
                                        <div className={styles.caloriesRow}>
                                            <input 
                                                type="number"
                                                id="fats input"
                                                value={carbs}
                                                onChange={(e)=> {
                                                    const stringCalories = e.target.value;
                                                    const intCalories = Number(stringCalories);
                                                    setCarbs(intCalories);
                                                }}
                                            />
                                        </div>
                                    </div>

                        </div>
                        <div className={styles.mealColumn}>
                            
                            <label>Notes:</label>
                            <textarea
                                name="meal notes"
                                value={note}
                                onChange={(e)=>setNote(e.target.value)}
                            /> 
                            <p className={styles.errorMessage}>{errorMessage}</p>
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
                            totalCarbs={totalCarbsDay}
                            totalFats={totalFatsDay}
                            totalProtein={totalProteinDay}
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
                            totalCarbs={totalCarbs}
                            totalFats={totalFats}
                            totalProtein={totalProtein}
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