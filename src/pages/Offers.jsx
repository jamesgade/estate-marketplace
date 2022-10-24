import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Offers = () => {

    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastFetchedListing, setLastSetchedListing] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                //get reference
                const listingsRef = collection(db, "listings");

                //create a query
                const q = query(listingsRef, where("offer", "==", true),
                    orderBy("timestamp", "desc"),
                    limit(10)
                );

                //execute query
                const querySnap = await getDocs(q);

                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastSetchedListing(lastVisible);

                const listings = []

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                setListings(listings);
                setLoading(false);

            } catch (error) {
                toast.error("Could not fetch listings");
            }
        }

        fetchListing();
    }, []);

    //pagination / loadmore
    const fetchMoreListings = async () => {
        try {
            const listingsRef = collection(db, "listings");

            const q = query(listingsRef, where("offer", "==", true),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedListing),
                limit(10)
            );

            const querySnap = await getDocs(q);

            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastSetchedListing(lastVisible);

            const listings = []

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            });

            setListings((prevState) => [...prevState, ...listings]);
            setLoading(false);

        } catch (error) {
            toast.error("Could not fetch listings");
        }
    }

    return (
        <div className="category">
            <header>
                <p className="pageHeader">Offers</p>
            </header>
            {loading
                ? (
                    <Spinner />
                ) : listings && listings.length > 0 ? (
                    <>
                        <main>
                            <ul className="categoryListings">
                                {listings.map((listing) => (
                                    <ListingItem
                                        listing={listing.data}
                                        id={listing.id}
                                        key={listing.id}
                                    />
                                ))}
                            </ul>
                        </main>
                        <br />
                        {lastFetchedListing && (
                            <p className="loadMore" onClick={fetchMoreListings}>Load More</p>
                        )}
                    </>
                ) : (
                    <p>No existing offers</p>
                )}
        </div>
    );
}

export default Offers;
