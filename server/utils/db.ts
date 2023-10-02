import mongoose from "mongoose";

const dbUrl: string = process.env.MONGODB_URL || '';

const DB = async () => {

    mongoose.Promise = global.Promise;
    try {
        await mongoose
            .connect(dbUrl)
            .then((data: any) => {
                console.log(`Database connected with ${data.connection.host}`)

            });

    } catch (error: any) {
        console.log(error.message);
    }
}

export default DB;