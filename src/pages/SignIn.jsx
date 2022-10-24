import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import OAuth from "../components/OAuth";
import { toast } from "react-toastify";
import { ReactComponent as ArrowightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

const SignIn = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const { email, password } = formData;

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const login = async (e) => {
        e.preventDefault();

        try {
            const auth = getAuth();

            const userCredentials = await signInWithEmailAndPassword(auth, email, password);

            if (userCredentials.user) {
                navigate("/")
            }
        } catch (error) {
            toast.error("Invalid User Credentials");
        }

    }

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>
                <main>
                    <form onSubmit={login}>
                        <input
                            type="email"
                            className="emailInput"
                            placeholder="Email"
                            id="email"
                            value={email}
                            onChange={handleChange}
                        />
                        <div className="passwordInputDiv">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="passwordInput"
                                id="password"
                                value={password}
                                onChange={handleChange}
                            />
                            <img
                                src={visibilityIcon}
                                alt="show password"
                                className="showPassword"
                                onClick={() => setShowPassword((prevState) => !prevState)}
                            />
                        </div>
                        <Link to="/forgot-password" className="forgotPasswordLink">Forgot Password?</Link>
                        <div className="signInBar">
                            <p className="signInText">Sign In</p>
                            <button className="signInButton">
                                <ArrowightIcon fill="#fff" width="34px" height="34px" />
                            </button>
                        </div>
                    </form>
                    <OAuth />
                    <Link to="/sign-up" className="registerLink">Sign Up Instead</Link>
                </main>
            </div>
        </>
    )
}

export default SignIn;
