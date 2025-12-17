import '../../commonStyles.css'
import AdminRegisterBarForm from "./AdminRegisterBarForm.jsx";
import "../admin.css"

function RegisterBarPage() {
  console.log('RegisterBarPage RENDER');
  return (
    <div className="form-container">
      <div className="form">
        <AdminRegisterBarForm/>
      </div>
    </div>
  );
}
export default RegisterBarPage;