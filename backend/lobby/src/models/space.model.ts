import mongoose from 'mongoose';

export interface ISpace extends mongoose.Document {  //to integrate type-safety, autocomplete, avoid unexpected runtime errors
  userId: mongoose.Types.ObjectId;
  spaceId: string;
  caption?: string;
  language: string;
  stack?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  spaceId: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String
  },
  language: {
    type: String,
    required: true
  },
  stack: {
    type: String,
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Space = mongoose.model<ISpace>('Space', SpaceSchema);
export default Space;
