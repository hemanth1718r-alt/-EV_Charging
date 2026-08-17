import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// ============================================
// DATA
// ============================================

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const FEEDBACKS_FILE = path.join(DATA_DIR, "feedbacks.json");

function readData(file, defaultValue = []) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, "utf8"));
        }
    } catch (e) {
        console.error("Error reading file", file, e);
    }
    return defaultValue;
}

function writeData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
        console.error("Error writing file", file, e);
    }
}

let users = readData(USERS_FILE);
let bookings = readData(BOOKINGS_FILE);
let feedbacks = readData(FEEDBACKS_FILE);


// ============================================
// SAMPLE EV STATIONS
// ============================================

const stations = [

    {
        id: 1,
        name: "GreenCharge EV Station",
        address: "City Center",
        chargeType: "DC Fast Charger",
        totalPorts: 6,
        availablePorts: 4,
        latitude: 12.9716,
        longitude: 77.5946
    },

    {
        id: 2,
        name: "PowerVolt Charging Hub",
        address: "Main Road",
        chargeType: "AC Charger",
        totalPorts: 8,
        availablePorts: 5,
        latitude: 12.9784,
        longitude: 77.6408
    },

    {
        id: 3,
        name: "EcoCharge Point",
        address: "Tech Park Road",
        chargeType: "DC Fast Charger",
        totalPorts: 10,
        availablePorts: 7,
        latitude: 12.9352,
        longitude: 77.6245
    },

    {
        id: 4,
        name: "VoltWay EV Station",
        address: "Airport Road",
        chargeType: "DC Fast Charger",
        totalPorts: 5,
        availablePorts: 2,
        latitude: 13.0102,
        longitude: 77.5545
    },

    {
        id: 5,
        name: "ChargePoint Green Hub",
        address: "Electronic City",
        chargeType: "AC Charger",
        totalPorts: 7,
        availablePorts: 6,
        latitude: 12.8452,
        longitude: 77.6602
    }

];


// ============================================
// HOME PAGE
// ============================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


// ============================================
// PROFILE PAGE
// ============================================

app.get("/profile", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "profile.html")
    );

});


// ============================================
// REGISTER
// ============================================

app.post("/api/register", (req, res) => {

    const {
        name,
        email,
        password,
        vehicleModel
    } = req.body;


    if (!name || !email || !password) {

        return res.status(400).json({

            message: "Please fill all required fields."

        });

    }


    const existingUser =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (existingUser) {

        return res.status(400).json({

            message: "Email already registered."

        });

    }


    const newUser = {

        id: Date.now(),

        name: name,

        email: email,

        password: password,

        vehicleModel: vehicleModel || ""

    };


    users.push(newUser);
    writeData(USERS_FILE, users);


    res.status(201).json({

        message: "Registration successful.",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email,

            vehicleModel: newUser.vehicleModel

        }

    });

});


// ============================================
// LOGIN
// ============================================

app.post("/api/login", (req, res) => {

    const {
        email,
        password
    } = req.body;


    const user =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase() &&
                user.password === password
        );


    if (!user) {

        return res.status(401).json({

            message: "Invalid email or password."

        });

    }


    res.json({

        message: "Login successful.",

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

            vehicleModel: user.vehicleModel

        }

    });

});


// ============================================
// FORGOT PASSWORD
// ============================================

app.post("/api/forgot-password", (req, res) => {

    const {
        email,
        newPassword
    } = req.body;


    if (!email || !newPassword) {

        return res.status(400).json({

            message: "Email and new password are required."

        });

    }


    const user =
        users.find(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        );


    if (!user) {

        return res.status(404).json({

            message: "Email not registered."

        });

    }


    user.password = newPassword;


    writeData(USERS_FILE, users);


    res.json({

        message: "Password reset successful."

    });

});


// ============================================
// GET PROFILE
// ============================================

app.get("/api/profile/:userId", (req, res) => {

    const userId =
        Number(req.params.userId);


    const user =
        users.find(
            user => user.id === userId
        );


    if (!user) {

        return res.status(404).json({

            message: "User not found."

        });

    }


    res.json({

        id: user.id,

        name: user.name,

        email: user.email,

        vehicleModel: user.vehicleModel

    });

});


// ============================================
// UPDATE PROFILE
// ============================================

app.put("/api/profile/:userId", (req, res) => {

    const userId =
        Number(req.params.userId);


    const user =
        users.find(
            user => user.id === userId
        );


    if (!user) {

        return res.status(404).json({

            message: "User not found."

        });

    }


    const {
        name,
        vehicleModel
    } = req.body;


    if (name) {

        user.name = name;

    }


    user.vehicleModel =
        vehicleModel || "";


    writeData(USERS_FILE, users);


    res.json({

        message: "Profile updated successfully.",

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

            vehicleModel: user.vehicleModel

        }

    });

});


// ============================================
// DISTANCE CALCULATION
// ============================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;


    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;


    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


// ============================================
// GET STATIONS
// ============================================

app.get("/api/stations", (req, res) => {

    const userLat =
        Number(req.query.userLat);

    const userLng =
        Number(req.query.userLng);


    let result =
        stations.map(station => ({

            ...station

        }));


    // If browser location is available
    if (
        !isNaN(userLat) &&
        !isNaN(userLng)
    ) {

        result =
            result.map(station => {

                const distance =
                    calculateDistance(

                        userLat,
                        userLng,

                        station.latitude,
                        station.longitude

                    );


                return {

                    ...station,

                    distanceAway:
                        distance.toFixed(2)

                };

            });


        // Nearest station first
        result.sort(
            (a, b) =>
                Number(a.distanceAway) -
                Number(b.distanceAway)
        );

    }


    res.json(result);

});


// ============================================
// CREATE BOOKING
// ============================================

app.post("/api/bookings", (req, res) => {

    const {
        userId,
        stationId,
        vehicleModel,
        date,
        startTime,
        endTime
    } = req.body;


    if (
        !userId ||
        !stationId ||
        !vehicleModel ||
        !date ||
        !startTime ||
        !endTime
    ) {

        return res.status(400).json({

            message:
                "Please fill all booking details."

        });

    }


    const user =
        users.find(
            user =>
                user.id === Number(userId)
        );


    if (!user) {

        return res.status(401).json({

            message: "User not found."

        });

    }


    const station =
        stations.find(
            station =>
                station.id === Number(stationId)
        );


    if (!station) {

        return res.status(404).json({

            message: "Station not found."

        });

    }


    const booking = {

        id: Date.now(),

        userId: Number(userId),

        stationId: Number(stationId),

        stationName: station.name,

        vehicleModel: vehicleModel,

        date: date,

        startTime: startTime,

        endTime: endTime,

        status: "Confirmed"

    };


    bookings.push(booking);
    writeData(BOOKINGS_FILE, bookings);


    res.status(201).json({

        message: "Booking confirmed.",

        booking: booking

    });

});


// ============================================
// GET USER BOOKINGS
// ============================================

app.get("/api/bookings/:userId", (req, res) => {

    const userId =
        Number(req.params.userId);


    const userBookings =
        bookings.filter(
            booking =>
                booking.userId === userId
        );


    res.json(userBookings);

});


// ============================================
// CANCEL BOOKING
// ============================================

app.delete("/api/bookings/:bookingId", (req, res) => {

    const bookingId =
        Number(req.params.bookingId);


    const index =
        bookings.findIndex(
            booking =>
                booking.id === bookingId
        );


    if (index === -1) {

        return res.status(404).json({

            message: "Booking not found."

        });

    }


    bookings.splice(index, 1);
    writeData(BOOKINGS_FILE, bookings);


    res.json({

        message: "Booking cancelled successfully."

    });

});


// ============================================
// SUBMIT FEEDBACK
// ============================================

app.post("/api/feedback", (req, res) => {

    const {
        userId,
        rating,
        comment
    } = req.body;


    if (
        !userId ||
        !rating ||
        !comment
    ) {

        return res.status(400).json({

            message:
                "Please provide rating and feedback."

        });

    }


    const user =
        users.find(
            user =>
                user.id === Number(userId)
        );


    if (!user) {

        return res.status(404).json({

            message: "User not found."

        });

    }


    const feedback = {

        id: Date.now(),

        userId: Number(userId),

        userName: user.name,

        rating: Number(rating),

        comment: comment,

        date:
            new Date()
                .toLocaleDateString()

    };


    feedbacks.unshift(
        feedback
    );
    writeData(FEEDBACKS_FILE, feedbacks);


    res.status(201).json({

        message:
            "Feedback submitted successfully.",

        feedback: feedback

    });

});


// ============================================
// GET FEEDBACK
// ============================================

app.get("/api/feedback", (req, res) => {

    res.json(feedbacks);

});


// ============================================
// START SERVER
// ============================================

app.listen(
    PORT,
    () => {

        console.log(
            `EV Charging Server running at http://localhost:${PORT}`
        );

    }
);