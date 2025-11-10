import {Link} from "react-router-dom";

function StartPage() {
    return (
        <>
            <h1>Start</h1>
            <nav>
                <Link to="/modePage">ModePage</Link>
            </nav>
        </>
    )
}
export default StartPage;