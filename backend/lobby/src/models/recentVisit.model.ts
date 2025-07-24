import mongoose from "mongoose";

export interface IRecentVisit extends mongoose.Document {
    spaceDocId:string,
    userId:string,
    lastVisit:Date
}

const RecentVisitSchema = new mongoose.Schema({
    spaceDocId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space',
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    lastVisit: {
        type:Date,
        default: Date.now
    }
})

RecentVisitSchema.index({ userId: 1, lastVisit: -1 })

const RecentVisit = mongoose.model<IRecentVisit>('RecentVisit', RecentVisitSchema);
export default RecentVisit;