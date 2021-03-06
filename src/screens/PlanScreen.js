import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import db from '../firebase';
import Nav from '../Nav';
import "./Planscreen.css";



const PlanScreen = () => {

    const [products, setProducts] = useState([]);
    const user = useSelector(selectUser);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        db.collection("customers").doc(user.uid).collection("subscriptions").get().then((querySnapshot) => {
            querySnapshot.forEach(async subscription => {
                setSubscription({
                    role: subscription.data().role,
                    current_period_end: subscription.data().current_period_end.seconds,
                    current_period_start: subscription.data().current_period_start.seconds,
                });
            });
        });
    }, [user.uid]);

    const loadCheckout = async (priceId) => {
        const docRef = await db.collection("customers").doc(user.uid).collection("checkout_sessions").add({
            price: priceId,
            success_url: window.location.origin,
            cancel_url: window.location.origin
        });
        docRef.onSnapshot(async(snap) => {
            const {error, sessionId} = snap.data();
            if(error){
                alert(`An error occured: ${error.message}`);
            }
            if(sessionId){
                const stripe = await loadStripe("pk_test_51IHZ93DKWvUxuh5uRJTd47ks4dXWVdN6ATOIxRxqnlggEpSzBJOKM4lYXXMn3upDGBIHDKEtbRcXXz9Gol0f352o00g4HiBlGV");
                stripe.redirectToCheckout({sessionId});
            }
        })
    };

    useEffect(() => {
        db.collection("products").where("active", "==", true).get().then((querySnapshot) => {
            const products = {};
            querySnapshot.forEach(async (productDoc) => {
                products[productDoc.id] = productDoc.data();
                const priceSnap = await productDoc.ref.collection("prices").get();
                priceSnap.docs.forEach((price) => {
                    products[productDoc.id].prices = {
                        priceId: price.id,
                        priceData: price.data()
                    }
                })
            })
            setProducts(products);
        })
    }, [])

    return (
        <div className="planScreen">
            <div className={`${subscription ? "" : "noNav"}`}>
                <Nav />
            </div>
            {subscription && <p>Renewal date: {new Date(subscription?.current_period_end * 1000).toLocaleDateString()}</p>}
            {Object.entries(products).map(([productId, productData]) => {
                const isCurrentPackage = productData.name?.toLowerCase().includes(subscription?.role);
                return(
                    <div key={productId} className="planScreenPlan">
                        <div className="planScreenInfo">
                            <h5>{productData.name}</h5>
                            <h6>{productData.description}</h6>
                        </div>
                        <button className={`${isCurrentPackage && "planDisabled"}`} onClick={() => !isCurrentPackage && loadCheckout(productData?.prices?.priceId)}>{isCurrentPackage ? "Current Package" : "Subscribe"}</button>
                    </div>
                )                
            })}
        </div>
    )
}

export default PlanScreen

