import mongoose from 'mongoose';

export interface IPod extends mongoose.Document {
  spaceId: string;
  podId: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'running' | 'stopped' | 'failed' | 'pending';
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PodSchema = new mongoose.Schema({
  spaceId: {
    type: String,
    required: true,
  },
  podId: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'failed', 'pending'],
    default: 'pending'
  },
  ip: {
    type: String
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Pod = mongoose.model<IPod>('Pod', PodSchema);
export default Pod;
