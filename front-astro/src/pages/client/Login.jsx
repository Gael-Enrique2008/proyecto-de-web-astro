import AuthForm from "../../components/AuthForm"

export default function Login({ navigate }) {
  return (
    <div>
      <AuthForm
        mode="login"
        onSuccess={() => navigate("/")}
      />

      <button
        className="ghost"
        onClick={() => navigate("/registro")}
      >
        Crear cuenta
      </button>
    </div>
  )
}