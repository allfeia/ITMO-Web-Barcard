import '../../commonStyles.css'
import AdminRegisterBarForm from "./AdminRegisterBarForm.jsx";
import "../admin.css"


function RegisterBarPage() {
    return (
        <div className="form-container">
            <h1 className="form-title">Регистрация бара</h1>
            <div className="form">
                <AdminRegisterBarForm/>
            </div>
        </div>

    )
}
export default RegisterBarPage;