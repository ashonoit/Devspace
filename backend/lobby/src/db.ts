import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI!)
                     .then(()=> console.log('Connected to MongoDB!'))
                     .catch( (error) => console.error('Failed to connect to MongoDB',error));
    }
    catch(error){
        console.log("Error connecting to MongoDB", error);
    }
}

export default connectDB;