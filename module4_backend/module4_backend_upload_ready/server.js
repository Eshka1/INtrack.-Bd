require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./app");
const startZeroActivityJob = require("./jobs/zeroActivityJob");

const PORT = process.env.PORT || 5000;

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/intrack";


async function startServer() {

    try {

        await mongoose.connect(MONGO_URI);

        console.log("MongoDB connected successfully");


        if (
            process.env.DISABLE_ZERO_ACTIVITY_JOB !== "true"
        ) {

            startZeroActivityJob();

            console.log(
                "Zero activity scheduler started"
            );

        }


        app.listen(PORT, () => {

            console.log(
                `IN-Track Module 4 backend running on http://localhost:${PORT}`
            );

            console.log(
                `Health check: http://localhost:${PORT}/api/health`
            );

        });

    }
    catch (error) {

        console.error(
            "Failed to start backend:",
            error.message
        );

        process.exit(1);

    }

}


process.on("unhandledRejection", (error) => {

    console.error(
        "Unhandled Promise Rejection:",
        error
    );

});


process.on("SIGINT", async () => {

    try {

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed"
        );

    }
    finally {

        process.exit(0);

    }

});


startServer();