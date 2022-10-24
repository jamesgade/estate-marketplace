import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import 'swiper/css';
import Spinner from "./Spinner";

const Slider = () => {

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchListings = async () => {

            const listingRef = collection(db, "listings");
            const q = query(listingRef, orderBy("timestamp", "desc"), limit(5))
            const querySnap = await getDocs(q);

            let listings = []

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            });

            setListings(listings);
            setLoading(false);
        }

        fetchListings();
    }, [])

    if (loading) {
        return <Spinner />
    }

    if(listings.length === 0){
        return <></>
    }

    return listings && (
        <>
            <p className="exploreHeading">Recommended</p>

            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                slidesPerView={1}
                // navigation={true}
                pagination={{ clickable: true }}
                loop={true}
            >
                {listings.map(({ data, id }) => (
                    <SwiperSlide key={id} onClick={() => navigate(`/category/${data.type}/${id}`)}>
                        <div
                            style={{
                                background: `url(${data.imageUrls[0]}) center no-repeat`,
                                height: "22rem",
                                backgroundSize: "cover",
                                borderRadius: "20px"
                            }}
                            className="swiperSlideDiv"
                        >
                            <p className="swiperSlideText">{data.name}</p>
                            <p className="swiperSlidePrice">
                                ₹{data.discountedPrice ?? data.regularPrice}
                                {data.type === "rent" && " / month"}
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}

export default Slider;
