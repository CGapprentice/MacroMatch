import { useState } from 'react';
import styles from './toggleSwitch.module.css';

{/*import { useState } from 'react';
import styles from './toggleSwitch.module.css';

const ToggleSwitch = ({label}) =>{
    return(
        <div className={styles.container}>
            <div className={styles.toggle}>
                <input
                    type="checkbox"
                    className={styles.checkbox}
                    name={label}
                    id={label}
                />
                <label className={styles.label} htmlFor={label}>
                    <span className={styles.inner}/>
                    <span className={styles.switch}/>
                </label>
            </div>
        </div>
    )
}
export default ToggleSwitch;*/}

function ToggleSwitch(){
    const [toggled, setToggled] = useState(false);
    return(
        <div className={styles.toggleButton}>
            <button className={`${styles.toggle} ${toggled ? styles.toggled : ''}`} onClick={()=> setToggled(!toggled)}>
                <div className={styles.inner}></div>
            </button>

        </div>
    )
}
export default ToggleSwitch;