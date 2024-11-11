import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Typography, Box } from '@mui/material';
import { ProfilePicture } from '../components/index';
import { ProfileForm } from '../components/index';
import { ImageUpload } from '../components/index';
import { Modal } from '../components/index';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import uploadService from '../appwrite/fileUpload';
import authService from '../appwrite/authentication';
import conf from '../conf/conf';

const Profile = () => {
    const { register, handleSubmit, setValue } = useForm();
    const [error, setError] = useState(null);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileImageURL, setProfileImageURL] = useState(null);
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData); 

    useEffect(() => {
        if (userData) {
            setValue("name", userData.name);
            setValue("email", userData.email);

            // Set profile image URL on initial load
            if (userData.prefs?.profilePicture) {
                const baseURL = `https://cloud.appwrite.io/v1/storage/buckets/${conf.appwriteProfileImageBucketID}/files/`;
                const profileImageID = userData.prefs.profilePicture;
                const imageUrl = `${baseURL}${profileImageID}/view?project=${conf.appwriteProjectID}&mode=admin`;
                setProfileImageURL(imageUrl);
            }
        }
    }, [userData, setValue]);

    const handleFileChange = (event) => {
        setNewProfilePicture(event.target.files[0]);
    };

    const handleUpdateProfilePicture = async () => {
        if (newProfilePicture) {
            try {
                // Check if an old profile picture exists and delete it before uploading a new one
                if (userData.prefs && userData.prefs.profilePicture) {
                    await uploadService.deleteProfilePicture(userData.prefs.profilePicture);
                }
    
                // Upload the new profile picture
                const uploadedUrl = await uploadService.uploadProfilePicture(newProfilePicture);
                if (uploadedUrl) {
                    // Set the new profile image URL immediately after upload
                    const newImageUrl = `https://cloud.appwrite.io/v1/storage/buckets/${conf.appwriteProfileImageBucketID}/files/${uploadedUrl}/view?project=${conf.appwriteProjectID}&mode=admin`;
                    setProfileImageURL(newImageUrl); // Update the state with new image URL
                    setNewProfilePicture(null); // Clear the file input
                    alert("Profile picture updated successfully!");
                    setIsEditing(false);
                }
            } catch (error) {
                setError(error);
            }
        }
    };
    
    const onSubmit = async (data) => {
        try {
            const { name, email, password } = data;
            await authService.updateUser({ name, email, password });
            alert("Profile updated successfully!");
            setIsEditing(false);
            navigate("/profile");
        } catch (error) {
            setError(error);
        }
    };

    const handleImageClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4} mb={4}>
                <Typography variant="h4" align="center" gutterBottom>
                    {userData ? userData.name : 
                    <div className="flex justify-center items-center">
                        <h1 className="text-xl font-medium">Loading...</h1>
                        <div className="ml-4 animate-spin rounded-full h-8 w-8 border-t-2 border-black"></div>
                    </div>}
                </Typography>
                {userData && (
                    <>
                        {/* Display the profile picture using the updated state */}
                        <ProfilePicture 
                            profileImageUrl={profileImageURL} 
                            handleImageClick={handleImageClick} 
                        />
                        {isEditing && (
                            <ImageUpload 
                                handleFileChange={handleFileChange} 
                                handleUpdateProfilePicture={handleUpdateProfilePicture} 
                            />
                        )}
                        <ProfileForm
                            register={register}
                            handleSubmit={handleSubmit}
                            onSubmit={onSubmit}
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            error={error}
                        />
                    </>
                )}
                <Modal 
                    isModalOpen={isModalOpen} 
                    handleCloseModal={handleCloseModal} 
                    profileImageUrl={profileImageURL} 
                />
            </Box>
        </Container>
    );
};

export default Profile;