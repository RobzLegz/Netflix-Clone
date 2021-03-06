import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth } from '../firebase';
import "./ProfileScreen.css"
import EditIcon from '@material-ui/icons/Edit';
import PlanScreen from './PlanScreen';

const ProfileScreen = () => {

    const user = useSelector(selectUser);
    const [profileUrl, setProfileUrl] = useState("");

    const toggleProfileForm = (e) => {
        e.preventDefault();
        document.querySelector(".profileImageForm").classList.toggle("hiddenProfileUrlForm");
        setProfileUrl(profileUrl);
    }

    return (
        <div className="profileScreen">
            <div className="profileScreenBody">
                <h1>Edit profile</h1>
                <form onSubmit={() => this.enterUserProfilePic} className="profileImageForm hiddenProfileUrlForm">
                    <input onChange={(e) => setProfileUrl(e.target.value)} value={profileUrl} className="profileImageUrlInput" type="text" placeholder="Profile Image Url"/>
                    <button type="submit" onClick={toggleProfileForm}>Enter</button>
                </form>
                <div className="profileScreenInfo">
                    <div className="profileImageContainer">
                        <img src={`${!profileUrl ? "https://pbs.twimg.com/profile_images/1240119990411550720/hBEe3tdn_400x400.png" : profileUrl}`} alt="error"/>
                        <div onClick={toggleProfileForm} className="imageOverlay">
                            <EditIcon />
                        </div>
                        
                    </div>
                    <div className="profileScreenDetails">
                        <h2>{user.email}</h2>
                        <div className="profileScreenPlans">
                            <PlanScreen profileUrl={profileUrl} />
                            <button onClick={() => auth.signOut()} className="signoutButtonProfileScreen">Sign Out</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileScreen
