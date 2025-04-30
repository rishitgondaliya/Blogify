/* eslint-disable no-unused-vars */
import { Client, Storage, ID, Account } from "appwrite";
import conf from "../conf/conf";

export class fileUploadService {
  client = new Client();
  blogBucket;
  profileBucket;
  account;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteURL)
      .setProject(conf.appwriteProjectID);
    this.blogBucket = new Storage(this.client);
    this.profileBucket = new Storage(this.client);
    this.account = new Account(this.client);
  }

  async uploadFile(file) {
    try {
      return await this.blogBucket.createFile(
        conf.appwriteBlogImageBucketID,
        ID.unique(),
        file
      );
    } catch (error) {
      console.log("Appwrite service :: uploadBlogImg :: error ", error);
      return false;
    }
  }

  async deleteFile(fileID) {
    try {
      await this.blogBucket.deleteFile(conf.appwriteBlogImageBucketID, fileID);
      return true;
    } catch (error) {
      console.log("Appwrite service :: deleteBlogImg :: error ", error);
      return false;
    }
  }

  getFilePreview(fileID) {
    return this.blogBucket.getFileView(
      conf.appwriteBlogImageBucketID,
      fileID
    );
  }

  // upload service for profile
  async uploadProfilePicture(file) {
    try {
      const uploadedFile = await this.profileBucket.createFile(
        conf.appwriteProfileImageBucketID,
        ID.unique(),
        file
      );
      const profilePictureUrl = uploadedFile.$id;

      // Update user preferences with new profile picture
      const user = await this.account.get();
      await this.account.updatePrefs({ profilePicture: profilePictureUrl });

      console.log("Profile picture uploaded successfully:", profilePictureUrl);
      return profilePictureUrl;
    } catch (error) {
      console.error(
        "ProfileService :: uploadProfilePicture :: error",
        error.message
      );
      throw new Error("Failed to upload profile picture");
    }
  }

  async deleteProfilePicture(fileId) {
    try {
      await this.profileBucket.deleteFile(conf.appwriteProfileImageBucketID, fileId);
      return true;
    } catch (error) {
      console.error(
        "ProfileService :: deleteProfilePicture :: error",
        error.message
      );
      return false;
    }
  }

  getProfilePicturePreview(fileId) {
    return this.profileBucket.getFilePreview(
      conf.appwriteProfileImageBucketID,
      fileId
    ).href
  }
}

const uploadService = new fileUploadService();
export default uploadService;
