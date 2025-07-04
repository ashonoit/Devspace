import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: mongoose.Types.ObjectId; // required
  //all optional :-
  firstName?: string;
  lastName?: string;
  github?: string;
  dob?: Date;
  profilePic?: string;
  phoneNo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userProfileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  github: {
    type: String
  },
  dob: {
    type: Date
  },
  profilePic: {
    type: String
  },
  phoneNo: {
    type: String
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
export default UserProfile;
