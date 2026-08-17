// =====================================================
// EV CHARGEHUB - MAIN JAVASCRIPT
// =====================================================


// =====================================================
// GLOBAL USER
// =====================================================

let currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupAuthentication();

        setupLogout();

        setupProfile();

        setupFeedback();

        setupBooking();

        checkLogin();

        setMinimumDate();

    }
);


// =====================================================
// CHECK LOGIN
// =====================================================

function checkLogin() {

    const authPage =
        document.getElementById(
            "authPage"
        );

    const mainPage =
        document.getElementById(
            "mainPage"
        );


    // INDEX PAGE

    if (authPage && mainPage) {

        loadStations();


        if (currentUser) {

            authPage.classList.add(
                "hidden"
            );

            mainPage.classList.remove(
                "hidden"
            );


            const welcomeText =
                document.getElementById(
                    "welcomeText"
                );


            if (welcomeText) {

                welcomeText.innerText =
                    "Welcome, " +
                    currentUser.name +
                    "!";

            }


            const vehicle =
                document.getElementById(
                    "vehicleModel"
                );


            if (
                vehicle &&
                currentUser.vehicleModel
            ) {

                vehicle.value =
                    currentUser.vehicleModel;

            }


            loadBookings();

        }

        else {

            authPage.classList.remove(
                "hidden"
            );

            mainPage.classList.add(
                "hidden"
            );

        }

    }


    // PROFILE PAGE

    if (
        document.getElementById(
            "profileForm"
        )
    ) {

        if (!currentUser) {

            window.location.href = "/";

            return;

        }


        loadProfile();

        loadBookings();

        loadFeedback();

    }

}


// =====================================================
// LOGIN / REGISTER
// =====================================================

function setupAuthentication() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    const registerForm =
        document.getElementById(
            "registerForm"
        );


    const showRegister =
        document.getElementById(
            "showRegister"
        );


    const showLogin =
        document.getElementById(
            "showLogin"
        );


    const forgotPasswordBox =
        document.getElementById(
            "forgotPasswordBox"
        );


    const showForgotPassword =
        document.getElementById(
            "showForgotPassword"
        );


    const forgotBackToLogin =
        document.getElementById(
            "forgotBackToLogin"
        );


    const forgotPasswordForm =
        document.getElementById(
            "forgotPasswordForm"
        );


    if (showRegister) {

        showRegister.onclick =
            function () {

                document
                    .getElementById(
                        "loginBox"
                    )
                    .classList.add(
                        "hidden"
                    );


                if (forgotPasswordBox) {

                    forgotPasswordBox
                        .classList.add(
                            "hidden"
                        );

                }


                document
                    .getElementById(
                        "registerBox"
                    )
                    .classList.remove(
                        "hidden"
                    );

            };

    }


    if (showLogin) {

        showLogin.onclick =
            function () {

                document
                    .getElementById(
                        "registerBox"
                    )
                    .classList.add(
                        "hidden"
                    );


                if (forgotPasswordBox) {

                    forgotPasswordBox
                        .classList.add(
                            "hidden"
                        );

                }


                document
                    .getElementById(
                        "loginBox"
                    )
                    .classList.remove(
                        "hidden"
                    );

            };

    }


    if (showForgotPassword) {

        showForgotPassword.onclick =
            function () {

                document
                    .getElementById(
                        "loginBox"
                    )
                    .classList.add(
                        "hidden"
                    );


                document
                    .getElementById(
                        "registerBox"
                    )
                    .classList.add(
                        "hidden"
                    );


                if (forgotPasswordBox) {

                    forgotPasswordBox
                        .classList.remove(
                            "hidden"
                        );

                }


                const msg =
                    document.getElementById(
                        "forgotPasswordMessage"
                    );


                if (msg) {

                    msg.innerHTML = "";

                }


                if (forgotPasswordForm) {

                    forgotPasswordForm.reset();

                }

            };

    }


    if (forgotBackToLogin) {

        forgotBackToLogin.onclick =
            function () {

                if (forgotPasswordBox) {

                    forgotPasswordBox
                        .classList.add(
                            "hidden"
                        );

                }


                document
                    .getElementById(
                        "loginBox"
                    )
                    .classList.remove(
                        "hidden"
                    );

            };

    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginUser
        );

    }


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            registerUser
        );

    }


    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document
                        .getElementById(
                            "forgotEmail"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "forgotPassword"
                        )
                        .value;


                const confirmPassword =
                    document
                        .getElementById(
                            "forgotConfirmPassword"
                        )
                        .value;


                const message =
                    document.getElementById(
                        "forgotPasswordMessage"
                    );


                if (
                    password !==
                    confirmPassword
                ) {

                    message.innerHTML =
                        `<p class="error">
                            ❌ Passwords do not match.
                        </p>`;

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/api/forgot-password",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        email,

                                        newPassword:
                                            password

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        message.innerHTML =
                            `<p class="error">
                                ❌ ${data.message}
                            </p>`;

                        return;

                    }


                    message.innerHTML =
                        `<p class="success">
                            ✅ Password reset successful!
                        </p>`;


                    forgotPasswordForm.reset();


                    setTimeout(
                        function () {

                            if (
                                forgotPasswordBox
                            ) {

                                forgotPasswordBox
                                    .classList.add(
                                        "hidden"
                                    );

                            }


                            document
                                .getElementById(
                                    "loginBox"
                                )
                                .classList.remove(
                                    "hidden"
                                );

                        },
                        1000
                    );


                }
                catch (error) {

                    message.innerHTML =
                        `<p class="error">
                            ❌ Server connection failed.
                        </p>`;

                    console.error(error);

                }

            }
        );

    }

}


// =====================================================
// REGISTER
// =====================================================

async function registerUser(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "registerName"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "registerPassword"
            )
            .value;


    const vehicleModel =
        document
            .getElementById(
                "registerVehicle"
            )
            .value
            .trim();


    const message =
        document.getElementById(
            "registerMessage"
        );


    try {

        const response =
            await fetch(
                "/api/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            name,
                            email,
                            password,
                            vehicleModel

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerHTML =
                `<p class="error">
                    ❌ ${data.message}
                </p>`;

            return;

        }


        message.innerHTML =
            `<p class="success">
                ✅ Registration successful!
            </p>`;


        document
            .getElementById(
                "registerForm"
            )
            .reset();


        setTimeout(
            function () {

                document
                    .getElementById(
                        "registerBox"
                    )
                    .classList.add(
                        "hidden"
                    );


                document
                    .getElementById(
                        "loginBox"
                    )
                    .classList.remove(
                        "hidden"
                    );

            },
            800
        );


    }
    catch (error) {

        message.innerHTML =
            `<p class="error">
                ❌ Server connection failed.
            </p>`;

        console.error(error);

    }

}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(event) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    try {

        const response =
            await fetch(
                "/api/login",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email,
                            password

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerHTML =
                `<p class="error">
                    ❌ ${data.message}
                </p>`;

            return;

        }


        currentUser =
            data.user;


        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                currentUser
            )
        );


        message.innerHTML =
            `<p class="success">
                ✅ Login successful!
            </p>`;


        setTimeout(
            function () {

                window.location.href =
                    "/";

            },
            500
        );


    }
    catch (error) {

        message.innerHTML =
            `<p class="error">
                ❌ Server connection failed.
            </p>`;

        console.error(error);

    }

}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    const profileLogout =
        document.getElementById(
            "profileLogout"
        );


    function logout() {

        localStorage.removeItem(
            "currentUser"
        );


        currentUser = null;


        window.location.href =
            "/";

    }


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    if (profileLogout) {

        profileLogout.addEventListener(
            "click",
            logout
        );

    }

}


// =====================================================
// LOCATION + STATIONS
// =====================================================

function loadStations() {

    const container =
        document.getElementById(
            "stationContainer"
        );


    if (!container) {

        return;

    }


    const locationMessage =
        document.getElementById(
            "locationMessage"
        );


    if (!navigator.geolocation) {

        locationMessage.innerText =
            "Location is not supported. Showing all stations.";

        getStations();

        return;

    }


    locationMessage.innerText =
        "📍 Please allow location permission...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            locationMessage.innerText =
                "📍 Location detected. Finding nearest stations...";


            getStations(
                latitude,
                longitude
            );

        },


        function (error) {

            console.log(
                "Location error:",
                error
            );


            locationMessage.innerText =
                "📍 Location permission denied. Showing all stations.";


            getStations();

        }

    );

}


// =====================================================
// GET STATIONS FROM SERVER
// =====================================================

async function getStations(
    latitude,
    longitude
) {

    try {

        let url =
            "/api/stations";


        if (
            latitude !== undefined &&
            longitude !== undefined
        ) {

            url =
                `/api/stations?userLat=${latitude}&userLng=${longitude}`;

        }


        const response =
            await fetch(url);


        const stations =
            await response.json();


        displayStations(
            stations
        );


        fillStationSelect(
            stations
        );


    }
    catch (error) {

        console.error(
            error
        );

        const container =
            document.getElementById(
                "stationContainer"
            );


        if (container) {

            container.innerHTML =
                `<p class="error">
                    ❌ Unable to load stations.
                </p>`;

        }

    }

}


// =====================================================
// DISPLAY STATIONS
// =====================================================

function displayStations(
    stations
) {

    const container =
        document.getElementById(
            "stationContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    stations.forEach(
        function (station) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "station-card";


            let distanceHTML = "";


            if (
                station.distanceAway
            ) {

                distanceHTML =
                    `
                    <p class="distance">
                        📍 ${station.distanceAway}
                        km away
                    </p>
                    `;

            }


            card.innerHTML = `

                <div class="station-icon">
                    ⚡
                </div>

                <h3>
                    ${station.name}
                </h3>

                <p>
                    📍 ${station.address}
                </p>

                <p>
                    🔌 ${station.chargeType}
                </p>

                <p class="available">
                    🟢 ${station.availablePorts}
                    ports available
                </p>

                ${distanceHTML}

                <button
                    class="primary-btn"
                    onclick="selectStation(${station.id})"
                >
                    Book Now
                </button>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// STATION SELECT
// =====================================================

function fillStationSelect(
    stations
) {

    const select =
        document.getElementById(
            "stationId"
        );


    if (!select) {

        return;

    }


    select.innerHTML =
        `
        <option value="">
            Select charging station
        </option>
        `;


    stations.forEach(
        function (station) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                station.id;


            option.textContent =
                station.name;


            select.appendChild(
                option
            );

        }
    );

}


// =====================================================
// SELECT STATION FOR BOOKING
// =====================================================

function selectStation(
    stationId
) {

    const select =
        document.getElementById(
            "stationId"
        );


    if (select) {

        select.value =
            stationId;

    }


    const booking =
        document.getElementById(
            "booking"
        );


    if (booking) {

        booking.scrollIntoView({
            behavior: "smooth"
        });

    }

}


window.selectStation =
    selectStation;


// =====================================================
// BOOKING
// =====================================================

function setupBooking() {

    const form =
        document.getElementById(
            "bookingForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            const stationId =
                document.getElementById(
                    "stationId"
                ).value;


            const vehicleModel =
                document.getElementById(
                    "vehicleModel"
                ).value;


            const date =
                document.getElementById(
                    "date"
                ).value;


            const startTime =
                document.getElementById(
                    "startTime"
                ).value;


            const endTime =
                document.getElementById(
                    "endTime"
                ).value;


            const message =
                document.getElementById(
                    "bookingMessage"
                );


            if (
                endTime <= startTime
            ) {

                message.innerHTML =
                    `<p class="error">
                        ❌ End time must be after start time.
                    </p>`;

                return;

            }


            try {

                const response =
                    await fetch(
                        "/api/bookings",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        currentUser.id,

                                    stationId:
                                        stationId,

                                    vehicleModel:
                                        vehicleModel,

                                    date:
                                        date,

                                    startTime:
                                        startTime,

                                    endTime:
                                        endTime

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML =
                        `<p class="error">
                            ❌ ${data.message}
                        </p>`;

                    return;

                }


                message.innerHTML =
                    `<p class="success">
                        ✅ Booking confirmed!
                        Booking ID:
                        ${data.booking.id}
                    </p>`;


                form.reset();

                if (currentUser && currentUser.vehicleModel) {
                    const vehicle = document.getElementById("vehicleModel");
                    if (vehicle) {
                        vehicle.value = currentUser.vehicleModel;
                    }
                }


                loadBookings();


            }
            catch (error) {

                console.error(error);


                message.innerHTML =
                    `<p class="error">
                        ❌ Server connection failed.
                    </p>`;

            }

        }
    );

}


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBookings() {

    if (!currentUser) {

        return;

    }


    const profileBookings =
        document.getElementById(
            "profileBookings"
        );


    const bookingList =
        document.getElementById(
            "bookingList"
        );


    if (
        !profileBookings &&
        !bookingList
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/bookings/${currentUser.id}`
            );


        const bookings =
            await response.json();


        displayBookings(
            bookings,
            profileBookings
        );


        displayBookings(
            bookings,
            bookingList
        );


    }
    catch (error) {

        console.error(
            error
        );

    }

}


// =====================================================
// DISPLAY BOOKINGS
// =====================================================

function displayBookings(
    bookings,
    container
) {

    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        bookings.length === 0
    ) {

        container.innerHTML =
            `
            <p class="muted">
                No bookings yet.
            </p>
            `;

        return;

    }


    bookings.forEach(
        function (booking) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "booking-item";


            card.innerHTML = `

                <h3>
                    ⚡ ${booking.stationName}
                </h3>

                <p>
                    📅 ${booking.date}
                </p>

                <p>
                    🕐 ${booking.startTime}
                    -
                    ${booking.endTime}
                </p>

                <p>
                    🚗 ${booking.vehicleModel}
                </p>

                <p>
                    Status:
                    <strong>
                        ${booking.status}
                    </strong>
                </p>

                <button
                    class="cancel-btn"
                    onclick="cancelBooking(${booking.id})"
                >
                    Cancel Booking
                </button>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// =====================================================
// CANCEL BOOKING
// =====================================================

async function cancelBooking(
    bookingId
) {

    const answer =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!answer) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/bookings/${bookingId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        alert(
            data.message
        );


        loadBookings();


    }
    catch (error) {

        alert(
            "Server connection failed."
        );

    }

}


window.cancelBooking =
    cancelBooking;


// =====================================================
// PROFILE
// =====================================================

function setupProfile() {

    const form =
        document.getElementById(
            "profileForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "profileName"
                ).value.trim();


            const vehicleModel =
                document.getElementById(
                    "profileVehicle"
                ).value.trim();


            const message =
                document.getElementById(
                    "profileMessage"
                );


            try {

                const response =
                    await fetch(
                        `/api/profile/${currentUser.id}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name,
                                    vehicleModel

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML =
                        `<p class="error">
                            ❌ ${data.message}
                        </p>`;

                    return;

                }


                currentUser =
                    data.user;


                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                message.innerHTML =
                    `<p class="success">
                        ✅ Profile updated successfully.
                    </p>`;

            }
            catch (error) {

                message.innerHTML =
                    `<p class="error">
                        ❌ Server connection failed.
                    </p>`;

            }

        }
    );

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

    if (!currentUser) {

        window.location.href =
            "/";

        return;

    }


    try {

        const response =
            await fetch(
                `/api/profile/${currentUser.id}`
            );


        const user =
            await response.json();


        if (!response.ok) {

            localStorage.removeItem("currentUser");

            currentUser = null;

            window.location.href = "/";

            return;

        }


        const name =
            document.getElementById(
                "profileName"
            );


        const email =
            document.getElementById(
                "profileEmail"
            );


        const vehicle =
            document.getElementById(
                "profileVehicle"
            );


        if (name) {

            name.value =
                user.name;

        }


        if (email) {

            email.value =
                user.email;

        }


        if (vehicle) {

            vehicle.value =
                user.vehicleModel || "";

        }

    }
    catch (error) {

        console.error(
            error
        );

    }

}


// =====================================================
// FEEDBACK
// =====================================================

function setupFeedback() {

    const form =
        document.getElementById(
            "profileFeedbackForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            const rating =
                document.getElementById(
                    "profileRating"
                ).value;


            const comment =
                document.getElementById(
                    "profileComment"
                ).value.trim();


            const message =
                document.getElementById(
                    "profileFeedbackMessage"
                );


            try {

                const response =
                    await fetch(
                        "/api/feedback",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    userId:
                                        currentUser.id,

                                    rating:
                                        Number(rating),

                                    comment:
                                        comment

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.innerHTML =
                        `<p class="error">
                            ❌ ${data.message}
                        </p>`;

                    return;

                }


                message.innerHTML =
                    `<p class="success">
                        ✅ Feedback submitted successfully.
                    </p>`;


                form.reset();


                loadFeedback();

            }
            catch (error) {

                message.innerHTML =
                    `<p class="error">
                        ❌ Server connection failed.
                    </p>`;

            }

        }
    );

}


// =====================================================
// LOAD FEEDBACK
// =====================================================

async function loadFeedback() {

    const container =
        document.getElementById(
            "profileFeedbackList"
        );


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/feedback"
            );


        const feedbacks =
            await response.json();


        container.innerHTML = "";


        if (
            feedbacks.length === 0
        ) {

            container.innerHTML =
                `
                <p class="muted">
                    No feedback yet.
                </p>
                `;

            return;

        }


        feedbacks.forEach(
            function (feedback) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "feedback-item";


                const stars =
                    "⭐".repeat(
                        feedback.rating
                    );


                card.innerHTML = `

                    <h3>
                        ${feedback.userName}
                    </h3>

                    <div>
                        ${stars}
                    </div>

                    <p>
                        ${feedback.comment}
                    </p>

                    <small>
                        ${feedback.date}
                    </small>

                `;


                container.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(
            error
        );

    }

}


// =====================================================
// DATE
// =====================================================

function setMinimumDate() {

    const dateInput =
        document.getElementById(
            "date"
        );


    if (!dateInput) {

        return;

    }


    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;


    dateInput.min =
        today;

}


// =====================================================
// GO TO STATIONS
// =====================================================

function goToStations() {

    const stations =
        document.getElementById(
            "stations"
        );


    if (stations) {

        stations.scrollIntoView({
            behavior: "smooth"
        });

    }

}


window.goToStations =
    goToStations;