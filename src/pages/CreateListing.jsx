import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const CreateListing = () => {

    const [loading, setLoading] = useState(false);
    // const [geolocationEnabled, setGeolocationEnabled] = useState(true);
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0
    });

    const { type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const isMounted = useRef(true);

    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid })
                } else {
                    navigate("/sign-in");
                }
            })
        }

        return () => {
            isMounted.current = false;
        }
        // eslint-disable-next-line
    }, [isMounted])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (discountedPrice >= regularPrice) {
            setLoading(false);
            toast.error("Discounted price cannot me more than regular price");
            return
        }

        if (images.length > 6) {
            setLoading(false)
            toast.error("Upload maximum of 6 images");
            return
        }

        let geolocation = {}
        // let location;    --v103--
        // if(geolocationEnabled){
        //                          --v100--
        // }else{
        geolocation.lat = latitude;
        geolocation.lng = longitude;
        // location = address;      --v103--
        // }

        //store image in firebase
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = ref(storage, 'images/' + fileName);

                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                // console.log('Upload is paused');
                                break;
                            case 'running':
                                // console.log('Upload is running');
                                break;
                            default:
                                // to remove console error
                                break;
                        }
                    },
                    (error) => {
                        console.log(error)
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            })
        }

        const imageUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false);
            toast.error("Error uploading images");
            return
        });

        const formDataCopy = {
            ...formData,
            imageUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        formDataCopy.location = address;  // --v103--
        delete formDataCopy.images;
        delete formDataCopy.address;
        // location && (formDataCopy.location = location);   --v103--
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        const docRef = await addDoc(collection(db, "listings"), formDataCopy)

        setLoading(false);
        toast.success("Listing Added");
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    }

    const handleFormChange = (e) => {
        let boolean = null;

        if (e.target.value === "true") {
            boolean = true
        }
        if (e.target.value === "false") {
            boolean = false
        }

        //file upload field
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }

        //text/boolean/num fields
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value
            }))
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Create a Listing</p>
            </header>
            <main>
                <form onSubmit={handleSubmit}>

                    <label className="formLabel">Sell / Rent</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            id="type"
                            value="sale"
                            onClick={handleFormChange}
                            className={type === "sale" ? "formButtonActive" : "formButton"}
                        >
                            Sell
                        </button>
                        <button
                            type="button"
                            id="type"
                            value="rent"
                            onClick={handleFormChange}
                            className={type === "rent" ? "formButtonActive" : "formButton"}
                        >
                            Rent
                        </button>
                    </div>

                    <label className="formLabel">Name</label>
                    <input
                        className="formInputName"
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleFormChange}
                        maxLength="32"
                        minLength="10"
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bedrooms"
                                value={bedrooms}
                                onChange={handleFormChange}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="bathrooms"
                                value={bathrooms}
                                onChange={handleFormChange}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>

                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            id="parking"
                            value={true}
                            onClick={handleFormChange}
                            className={parking ? "formButtonActive" : "formButton"}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            id="parking"
                            value={false}
                            onClick={handleFormChange}
                            className={!parking && parking !== null ? "formButtonActive" : "formButton"}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            id="furnished"
                            value={true}
                            onClick={handleFormChange}
                            className={furnished ? "formButtonActive" : "formButton"}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            id="furnished"
                            value={false}
                            onClick={handleFormChange}
                            className={!furnished && furnished !== null ? "formButtonActive" : "formButton"}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Address</label>
                    <textarea
                        type="text"
                        id="address"
                        value={address}
                        onChange={handleFormChange}
                        className="formInputAddress"
                        required
                    />

                    {/* {!geolocationEnabled && ( */}
                    <div className="formLatLng flex">
                        <div>
                            <label className="formLabel">Latitude</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="latitude"
                                value={latitude}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Longitude</label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="longitude"
                                value={longitude}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                    </div>
                    {/* )} */}

                    <label className='formLabel'>Offer</label>
                    <div className='formButtons'>
                        <button
                            className={offer ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='offer'
                            value={true}
                            onClick={handleFormChange}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null ? 'formButtonActive' : 'formButton'
                            }
                            type='button'
                            id='offer'
                            value={false}
                            onClick={handleFormChange}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPricediv flex">
                        <input
                            type="number"
                            id="regularPrice"
                            value={regularPrice}
                            onChange={handleFormChange}
                            min="50"
                            max="750000000"
                            className="formInputSmall"
                            required
                        />
                        {type === "rent" && <p className="formPriceText"> ₹ / month</p>}
                    </div>

                    {offer && (
                        <>
                            <label className="formLabel">Discounted Price</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="discountedPrice"
                                value={discountedPrice}
                                onChange={handleFormChange}
                                min="50"
                                max="750000000"
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        type="file"
                        id="images"
                        onChange={handleFormChange}
                        max="6"
                        accept=".jpg,.png,.jpeg"
                        className="formInputFile"
                        multiple
                        required
                    />

                    <button type="submit" className="primaryButton createListingButton">Create Listing</button>

                </form>
            </main>
        </div>
    );
}

export default CreateListing;
