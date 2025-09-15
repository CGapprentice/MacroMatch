import '../login.css'
import HomePageHeader from '../homepage/header'
import { Link } from 'react-router-dom'

function HomePage() {
    return(
        <>
        <div>
            <h1>MacroMatch</h1>
            <h4>This page is on the works so don't mind the empty space</h4>
            <Link to="/loginpage">login</Link><br></br>
            <Link to="/signinpage">sign in</Link>
        </div>
        </>
    )
}

export default HomePage;