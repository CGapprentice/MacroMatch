import { useState } from 'react';
import styles from './toggleSwitch.module.css';

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