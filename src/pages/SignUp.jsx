import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase.config";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import OAuth from "../components/OAuth";
import { toast } from "react-toastify";
import { ReactComponent as ArrowightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";

const SignUp = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const { name, email, password } = formData;

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const register = async (e) => {
        e.preventDefault();

        try {
            const auth = getAuth();

            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredentials.user;

            updateProfile(auth.currentUser, {
                displayName: name
            });

            const formDataCopy = { ...formData }
            delete formDataCopy.password;
            formDataCopy.timestamp = serverTimestamp();

            await setDoc(doc(db, "users", user.uid), formDataCopy);

            navigate("/");

        } catch (error) {
            toast.error("Something Went Wrong");
        }
    }

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>
                <main>
                    <form onSubmit={register}>
                        <input
                            type="text"
                            className="nameInput"
                            placeholder="Name"
                            id="name"
                            value={name}
                            onChange={handleChange}
                        />
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
                        <div className="signUpBar">
                            <p className="signUpText">Sign Up</p>
                            <button className="signUpButton">
                                <ArrowightIcon fill="#fff" width="34px" height="34px" />
                            </button>
                        </div>
                    </form>
                    <OAuth />
                    <Link to="/sign-in" className="registerLink">Sign In Instead</Link>
                </main>
            </div>
        </>
    );
}

export default SignUp;
