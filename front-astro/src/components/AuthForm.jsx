import { useState } from "react"
import { mutateGraphQL } from "../lib/apollo"
import { M_LOGIN, M_REGISTRAR_USUARIO } from "../lib/queries"
import { useAuthStore } from "../store/authStore"

export default function AuthForm({ mode = "login", onSuccess }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nombre, setNombre] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const loginStore = useAuthStore((state) => state.login)
    const isRegister = mode === "register"

    const submit = async (event) => {
        event.preventDefault()
        setError("")

        if (isRegister && password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return
        }

        setLoading(true)

        try {
            let response

            if (isRegister) {
                const result = await mutateGraphQL(M_REGISTRAR_USUARIO, {
                    datos: {
                        nombre,
                        email,
                        password
                    }
                })

                response = result.registrarUsuario
            } else {
                const result = await mutateGraphQL(M_LOGIN, {
                    email,
                    password
                })

                response = result.login
            }

            if (!response.ok) {
                throw new Error(response.mensaje)
            }

            loginStore(response.usuario, response.token)

            if (onSuccess) {
                onSuccess(response.usuario)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={submit}>
            <h1>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>

            {isRegister && (
                <label>
                    Nombre
                    <input
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                </label>
            )}

            <label>
                Correo
                <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>

            <label>
                Contraseña
                <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>

            {isRegister && (
                <label>
                    Confirmar contraseña
                    <input
                        required
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </label>
            )}

            {error && <div className="inline-error">{error}</div>}

            <button disabled={loading}>
                {loading
                    ? "Procesando..."
                    : isRegister
                        ? "Crear cuenta"
                        : "Iniciar sesión"}
            </button>
        </form>
    )
}