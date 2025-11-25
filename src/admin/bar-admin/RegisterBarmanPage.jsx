import '../commonStyles.css'
import AdminRegisterBarmanForm from "./AdminRegisterBarmanForm.jsx";
import "../admin.css"


function RegisterBarmenPage() {
    return (
        <div className="container">
            <h1 className="title">Регистрация бармена</h1>
            <div className="form">
                <AdminRegisterBarmanForm/>
            </div>
        </div>

    )
}
export default RegisterBarmenPage;