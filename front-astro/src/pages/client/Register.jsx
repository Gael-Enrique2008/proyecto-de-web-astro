import AuthForm from "../../components/AuthForm"

export default function Register({ navigate }) {
  return (
    <div>
      <AuthForm
        mode="register"
        onSuccess={() => navigate("/")}
      />

      <button
        className="ghost"
        onClick={() => navigate("/login")}
      >
        Ya tengo cuenta
      </button>
    </div>
  )
}