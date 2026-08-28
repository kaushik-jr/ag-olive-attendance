const SUPABASE_URL = "https://hrnblzhstapfkonavpye.supabase.co";

const SUPABASE_KEY = "sb_publishable_9MAdAwW84eAxyCMSaANZBw_qDEoWhVw";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// CHECK LOGIN
// ===============================

async function checkUser() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error || !data.session) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


// ===============================
// GLOBAL VARIABLES
// ===============================

let attendanceChart = null;


// ===============================
// GET DATE
// ===============================

function getDateString(date) {

    return date.toISOString().split("T")[0];

}


// ===============================
// GET MONDAY
// ===============================

function getMonday(date) {

    const day =
        date.getDay();

    const difference =
        day === 0 ? 6 : day - 1;

    const monday =
        new Date(date);

    monday.setDate(
        date.getDate() - difference
    );

    return monday;

}


// ===============================
// TOTAL ACTIVE MEMBERS
// ===============================

async function loadTotalMembers() {

    const { count, error } =
        await supabaseClient
            .from("members")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("active", true);


    if (error) {

        console.error(
            "Members error:",
            error
        );

        return 0;
    }


    const total =
        count ?? 0;


    document.getElementById(
        "totalMembers"
    ).textContent = total;


    return total;

}


// ===============================
// TODAY'S ATTENDANCE
// ===============================

async function loadTodayAttendance() {

    const today =
        getDateString(
            new Date()
        );


    const { count, error } =
        await supabaseClient
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "attendance_date",
                today
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(
            "Today's attendance error:",
            error
        );

        return 0;
    }


    const total =
        count ?? 0;


    document.getElementById(
        "todayAttendance"
    ).textContent = total;


    return total;

}


// ===============================
// TODAY'S PERCENTAGE
// ===============================

async function loadTodayPercentage(
    totalMembers
) {

    const today =
        getDateString(
            new Date()
        );


    const { count, error } =
        await supabaseClient
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "attendance_date",
                today
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(error);

        return;
    }


    const present =
        count ?? 0;


    let percentage = 0;


    if (totalMembers > 0) {

        percentage =
            (present / totalMembers) * 100;

    }


    document.getElementById(
        "todayPercentage"
    ).textContent =
        percentage.toFixed(1) + "%";

}


// ===============================
// WEEK ATTENDANCE
// ===============================

async function loadWeekAttendance() {

    const today =
        new Date();


    const monday =
        getMonday(today);


    const mondayDate =
        getDateString(monday);


    const todayDate =
        getDateString(today);


    const { count, error } =
        await supabaseClient
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true
            })
            .gte(
                "attendance_date",
                mondayDate
            )
            .lte(
                "attendance_date",
                todayDate
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(
            "Weekly attendance error:",
            error
        );

        return 0;
    }


    const total =
        count ?? 0;


    document.getElementById(
        "weekAttendance"
    ).textContent = total;


    return total;

}


// ===============================
// WEEKLY PERCENTAGE
// ===============================

async function loadWeekPercentage(
    totalMembers
) {

    const today =
        new Date();


    const monday =
        getMonday(today);


    const mondayDate =
        getDateString(monday);


    const todayDate =
        getDateString(today);


    const daysPassed =
        Math.floor(
            (
                today -
                monday
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1;


    const { count, error } =
        await supabaseClient
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true
            })
            .gte(
                "attendance_date",
                mondayDate
            )
            .lte(
                "attendance_date",
                todayDate
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(error);

        return;
    }


    const present =
        count ?? 0;


    const possible =
        totalMembers *
        daysPassed;


    let percentage = 0;


    if (possible > 0) {

        percentage =
            (
                present /
                possible
            ) * 100;

    }


    document.getElementById(
        "weekPercentage"
    ).textContent =
        percentage.toFixed(1) + "%";

}


// ===============================
// TOTAL ATTENDANCE RECORDS
// ===============================

async function loadTotalRecords() {

    const { count, error } =
        await supabaseClient
            .from("attendance")
            .select("*", {
                count: "exact",
                head: true
            });


    if (error) {

        console.error(
            "Records error:",
            error
        );

        return;

    }


    document.getElementById(
        "totalRecords"
    ).textContent =
        count ?? 0;

}


// ===============================
// ATTENDANCE TREND
// ===============================

async function loadAttendanceChart() {

    const today =
        new Date();


    const dates = [];

    const labels = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() - i
        );


        dates.push(
            getDateString(date)
        );


        labels.push(
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            )
        );

    }


    const { data, error } =
        await supabaseClient
            .from("attendance")
            .select(
                "attendance_date, present"
            )
            .gte(
                "attendance_date",
                dates[0]
            )
            .lte(
                "attendance_date",
                dates[6]
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(
            "Chart error:",
            error
        );

        return;

    }


    const counts =
        dates.map(
            date => {

                return data.filter(
                    record =>
                        record.attendance_date ===
                        date
                ).length;

            }
        );


    const canvas =
        document.getElementById(
            "attendanceChart"
        );


    if (!canvas) {

        return;

    }


    const ctx =
        canvas.getContext("2d");


    if (attendanceChart) {

        attendanceChart.destroy();

    }


    attendanceChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Members Present",

                            data:
                                counts,

                            borderWidth: 3,

                            tension: 0.3,

                            fill: false

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: true

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            }

                        }

                    }

                }

            }
        );

}


// ===============================
// TOP ATTENDANCE MEMBERS
// ===============================

async function loadTopMembers() {

    const today =
        new Date();


    const monday =
        getMonday(today);


    const mondayDate =
        getDateString(monday);


    const todayDate =
        getDateString(today);


    const { data, error } =
        await supabaseClient
            .from("attendance")
            .select(
                "member_id, present"
            )
            .gte(
                "attendance_date",
                mondayDate
            )
            .lte(
                "attendance_date",
                todayDate
            )
            .eq(
                "present",
                true
            );


    if (error) {

        console.error(
            "Top members error:",
            error
        );

        return;

    }


    const counts = {};


    data.forEach(
        record => {

            if (
                !counts[
                    record.member_id
                ]
            ) {

                counts[
                    record.member_id
                ] = 0;

            }


            counts[
                record.member_id
            ]++;

        }
    );


    const memberIds =
        Object.keys(counts);


    const topMembers =
        document.getElementById(
            "topMembers"
        );


    if (
        memberIds.length === 0
    ) {

        topMembers.innerHTML =
            "<p>No attendance records this week.</p>";

        return;

    }


    const {
        data: members,
        error: memberError
    } =
        await supabaseClient
            .from("members")
            .select("id, name")
            .in(
                "id",
                memberIds
            );


    if (memberError) {

        console.error(
            memberError
        );

        return;

    }


    members.sort(
        (a, b) =>
            counts[b.id] -
            counts[a.id]
    );


    let html = "";


    members
        .slice(0, 5)
        .forEach(
            (member, index) => {

                html += `

                    <div
                        style="
                            padding:12px;
                            margin-top:8px;
                            background:#1d1d1d;
                            border-left:4px solid #c00000;
                            border-radius:6px;
                        "
                    >

                        <strong>
                            ${index + 1}.
                            ${member.name}
                        </strong>

                        <span
                            style="
                                float:right;
                                color:#ff3333;
                            "
                        >
                            ${counts[member.id]}
                            present
                        </span>

                    </div>

                `;

            }
        );


    topMembers.innerHTML =
        html;

}


// ===============================
// LOGOUT
// ===============================

async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "index.html";

}


// ===============================
// NAVIGATION
// ===============================

function openMembers() {

    window.location.href =
        "members.html";

}


function openAttendance() {

    window.location.href =
        "attendance.html";

}


function openWeekly() {

    window.location.href =
        "weekly.html";

}


function openReports() {

    window.location.href =
        "reports.html";

}


// ===============================
// START DASHBOARD
// ===============================

async function startDashboard() {

    const loggedIn =
        await checkUser();


    if (!loggedIn) {

        return;

    }


    const totalMembers =
        await loadTotalMembers();


    await loadTodayAttendance();

    await loadTodayPercentage(
        totalMembers
    );


    await loadWeekAttendance();

    await loadWeekPercentage(
        totalMembers
    );


    await loadTotalRecords();

    await loadAttendanceChart();

    await loadTopMembers();


    // ===========================
    // BUTTONS
    // ===========================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );

    }


    const membersBtn =
        document.getElementById(
            "membersBtn"
        );

    if (membersBtn) {

        membersBtn.addEventListener(
            "click",
            openMembers
        );

    }


    const attendanceBtn =
        document.getElementById(
            "attendanceBtn"
        );

    if (attendanceBtn) {

        attendanceBtn.addEventListener(
            "click",
            openAttendance
        );

    }


    const weeklyBtn =
        document.getElementById(
            "weeklyBtn"
        );

    if (weeklyBtn) {

        weeklyBtn.addEventListener(
            "click",
            openWeekly
        );

    }


    const reportsBtn =
        document.getElementById(
            "reportsBtn"
        );

    if (reportsBtn) {

        reportsBtn.addEventListener(
            "click",
            openReports
        );

    }

}


// ===============================
// START
// ===============================

startDashboard();