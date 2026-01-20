

const app = require("./app");
const httpStatus = require("http-status");

const PORT = process.env.PORT || 8000;
const connectDB = require("./db/dbConnection");
const setupCronJobs = require("./cron/cronJobs");

connectDB();
setupCronJobs();


app.get("/", (req, res) => {
    res.send({
        status: 200,
        message: "Server is running",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});