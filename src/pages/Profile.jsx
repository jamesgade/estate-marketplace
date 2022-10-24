import { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify"
import ListingItem from "../components/ListingItem";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";

const Profile = () => {

    const auth = getAuth();
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState(null);
    const [changeDetails, setChangeDetails] = useState(false);
    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    });

    const { name, email } = formData;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserListings = async () => {
            const listingsRef = collection(db, "listings");
            const q = query(listingsRef, where("userRef", "==", auth.currentUser.uid), orderBy('timestamp', "desc"))

            const querySnap = await getDocs(q);

            const userListings = [];

            querySnap.forEach((doc) => {
                return userListings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })

            setListings(userListings)
            setLoading(false)
        }

        fetchUserListings();

    }, [auth.currentUser.uid])

    const logout = () => {
        auth.signOut();
        navigate('/');
    }

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const onSubmit = async () => {
        try {
            if (auth.currentUser.displayName !== name) {
                //update displayName in fb
                await updateProfile(auth.currentUser, {
                    displayName: name
                })

                //update in firestore
                const userRef = doc(db, "users", auth.currentUser.uid)
                await updateDoc(userRef, {
                    name       // name: name
                })
            }
        } catch (error) {
            toast.error("Error Updating Profile")
        }
    }

    const deleteListing = async (listingId) => {
        if (window.confirm("Are you sure you want to delete?")) {
            await deleteDoc(doc(db, "listings", listingId))
            const updatedListings = listings.filter((listing) => listing.id !== listingId)
            setListings(updatedListings);
            toast.success("Successfully deleted listing");
        }
    }

    const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

    return (
        <div className="profile">
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type="button" className="logOut" onClick={logout}>Logout</button>
            </header>
            <main>
                <div className="profileDetailsHeader">
                    <p className="profileDetailsText">Personal Details</p>
                    <p className="changePersonalDetails" onClick={() => {
                        changeDetails && onSubmit()
                        setChangeDetails((prevState) => !prevState)
                    }}>
                        {changeDetails ? "Done" : "Change"}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                        <input
                            type="text"
                            id="name"
                            className={!changeDetails ? "profileName" : "profileNameActive"}
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                        />
                        {/* Cannot Update Registered Email in fb */}
                        {/* <input
                            type="text"
                            id="email"
                            className={!changeDetails ? "profileEmail" : "profileEmailActive"}
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                        /> */}
                        <p className="profileEmail">{email}</p>
                    </form>
                </div>
                <Link to="/create-listing" className="createListing">
                    <img src={homeIcon} alt="home" />
                    <p>Rent or Sell your home</p>
                    <img src={arrowRight} alt="arrow right" />
                </Link>

                {!loading && listings?.length > 0 && (
                    <>
                        <p className="listingText">Your Listings</p>
                        <ul className="listingsList">
                            {listings.map((listing) => (
                                <ListingItem
                                    key={listing.id}
                                    listing={listing.data}
                                    id={listing.id}
                                    onDelete={() => deleteListing(listing.id)}
                                    onEdit={() => onEdit(listing.id)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </div>
    )
}

export default Profile;
