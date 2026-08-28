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
// ELEMENTS
// ===============================

const weekDate =
    document.getElementById("weekDate");

const weeklySummary =
    document.getElementById("weeklySummary");

const weeklyTable =
    document.getElementById("weeklyTable");


// ===============================
// DEFAULT DATE
// ===============================

const today =
    new Date().toISOString().split("T")[0];

weekDate.value = today;


// ===============================
// GET MONDAY
// ===============================

function getMonday(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    const day =
        date.getDay();

    const difference =
        day === 0
            ? 6
            : day - 1;

    date.setDate(
        date.getDate() - difference
    );

    return date;
}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


// ===============================
// GET WEEK DATES
// ===============================

function getWeekDates(monday) {

    const dates = [];

    for (let i = 0; i < 7; i++) {

        const date =
            new Date(monday);

        date.setDate(
            monday.getDate() + i
        );

        dates.push(
            date.toISOString().split("T")[0]
        );

    }

    return dates;
}


// ===============================
// LOAD WEEKLY ATTENDANCE
// ===============================

async function loadWeeklyAttendance() {

    weeklySummary.innerHTML =
        "Loading summary...";

    weeklyTable.innerHTML =
        "Loading attendance...";


    const selectedDate =
        weekDate.value;


    if (!selectedDate) {

        return;
    }


    const monday =
        getMonday(selectedDate);


    const sunday =
        new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );


    const mondayString =
        monday.toISOString().split("T")[0];

    const sundayString =
        sunday.toISOString().split("T")[0];


    const dates =
        getWeekDates(monday);


    // ===============================
    // LOAD ACTIVE MEMBERS
    // ===============================

    const {
        data: members,
        error: memberError
    } =
        await supabaseClient
            .from("members")
            .select("id, name")
            .eq("active", true)
            .order("name", {
                ascending: true
            });


    if (memberError) {

        console.error(memberError);

        weeklyTable.innerHTML =
            "Error loading members.";

        return;
    }


    // ===============================
    // LOAD ATTENDANCE
    // ===============================

    const {
        data: attendance,
        error: attendanceError
    } =
        await supabaseClient
            .from("attendance")
            .select(
                "member_id, attendance_date, present"
            )
            .gte(
                "attendance_date",
                mondayString
            )
            .lte(
                "attendance_date",
                sundayString
            );


    if (attendanceError) {

        console.error(attendanceError);

        weeklyTable.innerHTML =
            "Error loading attendance.";

        return;
    }


    // ===============================
    // CREATE ATTENDANCE MAP
    // ===============================

    const attendanceMap = {};


    attendance.forEach(record => {

        if (!attendanceMap[record.member_id]) {

            attendanceMap[record.member_id] = {};

        }


        attendanceMap[record.member_id][
            record.attendance_date
        ] = record.present;

    });


    // ===============================
    // TOTALS
    // ===============================

    let totalPresentAll = 0;

    const totalPossible =
        members.length * 7;


    // ===============================
    // CREATE TABLE
    // ===============================

    let html = `

        <div class="weekly-table-container">

        <table class="weekly-attendance-table">

            <thead>

                <tr>

                    <th>Member</th>

    `;


    dates.forEach((date, index) => {

        const dayNames = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];


        html += `

            <th>

                ${dayNames[index]}

                <br>

                <small>
                    ${formatDate(date)}
                </small>

            </th>

        `;

    });


    html += `

                    <th>Present</th>

                </tr>

            </thead>

            <tbody>

    `;


    // ===============================
    // MEMBER ROWS
    // ===============================

    members.forEach(member => {

        let memberTotal = 0;


        html += `

            <tr>

                <td class="member-name">

                    ${member.name}

                </td>

        `;


        dates.forEach(date => {

            const present =
                attendanceMap[
                    member.id
                ]?.[date] === true;


            if (present) {

                memberTotal++;

                totalPresentAll++;

            }


            html += `

                <td class="attendance-status">

                    ${
                        present
                            ? '<span class="present">✓</span>'
                            : '<span class="absent">—</span>'
                    }

                </td>

            `;

        });


        html += `

                <td class="member-total">

                    <strong>
                        ${memberTotal}
                    </strong>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

        </div>

    `;


    weeklyTable.innerHTML =
        html;


    // ===============================
    // ATTENDANCE RATE
    // ===============================

    let attendanceRate = 0;


    if (totalPossible > 0) {

        attendanceRate =
            (
                totalPresentAll /
                totalPossible
            ) * 100;

    }


    attendanceRate =
        attendanceRate.toFixed(1);


    // ===============================
    // SUMMARY
    // ===============================

    weeklySummary.innerHTML = `

        <div class="weekly-summary">

            <div class="summary-card">

                <h3>Week</h3>

                <p>
                    ${formatDate(mondayString)}
                    -
                    ${formatDate(sundayString)}
                </p>

            </div>


            <div class="summary-card">

                <h3>Active Members</h3>

                <p>
                    ${members.length}
                </p>

            </div>


            <div class="summary-card">

                <h3>Present Records</h3>

                <p>
                    ${totalPresentAll}
                </p>

            </div>


            <div class="summary-card">

                <h3>Attendance Rate</h3>

                <p>
                    ${attendanceRate}%
                </p>

            </div>

        </div>

    `;

}


// ===============================
// DATE CHANGE
// ===============================

weekDate.addEventListener(
    "change",
    loadWeeklyAttendance
);


// ===============================
// BACK TO DASHBOARD
// ===============================

document
    .getElementById("backBtn")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "dashboard.html";

        }
    );


// ===============================
// START
// ===============================

async function startPage() {

    const loggedIn =
        await checkUser();


    if (!loggedIn) {

        return;

    }


    await loadWeeklyAttendance();

}


startPage();