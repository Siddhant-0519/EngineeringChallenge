import mongoose, { ConnectOptions } from "mongoose";

const authenticationDBUri = "mongodb://127.0.0.1:27017/role_auth";
const persistentDataDBUri = "mongodb://127.0.0.1:27017/persistentDataDB"; // Update with your actual connection URI for persistent data

const connectDB = async (): Promise<void> => {
  try {
    // Connect to the Authentication DB
    await mongoose.connect(authenticationDBUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Authentication DB Connected");

    // Additional logging for successful connection
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Connect to the Persistent Data DB
    await mongoose.createConnection(persistentDataDBUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Persistent Data DB Connected");

    // Additional logging for successful connection
    mongoose.connection.on("connected", () => {
      console.log("Persistent Data MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Persistent Data MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if unable to connect to the database
  }
};

export default connectDB;
