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
// DATE ELEMENTS
// ===============================

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const today =
    new Date().toISOString().split("T")[0];


// Current month

const firstDay =
    new Date();

firstDay.setDate(1);

const firstDayString =
    firstDay.toISOString().split("T")[0];

startDate.value = firstDayString;
endDate.value = today;


// ===============================
// STORE REPORT DATA
// ===============================

let reportData = [];

let reportTotalMembers = 0;

let reportTotalPresent = 0;

let reportPercentage = 0;

let reportTotalDays = 0;


// ===============================
// GENERATE REPORT
// ===============================

async function generateReport() {

    const start =
        startDate.value;

    const end =
        endDate.value;


    if (!start || !end) {

        alert("Please select both dates.");

        return;
    }


    if (start > end) {

        alert(
            "Start date cannot be after end date."
        );

        return;
    }


    // ===============================
    // GET ACTIVE MEMBERS
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

        alert(
            "Error loading members: " +
            memberError.message
        );

        return;
    }


    // ===============================
    // GET ATTENDANCE
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
                start
            )
            .lte(
                "attendance_date",
                end
            )
            .eq(
                "present",
                true
            );


    if (attendanceError) {

        console.error(attendanceError);

        alert(
            "Error loading attendance: " +
            attendanceError.message
        );

        return;
    }


    // ===============================
    // CALCULATE DAYS
    // ===============================

    const startObj =
        new Date(start + "T00:00:00");

    const endObj =
        new Date(end + "T00:00:00");


    const millisecondsPerDay =
        1000 * 60 * 60 * 24;


    const totalDays =
        Math.floor(
            (endObj - startObj) /
            millisecondsPerDay
        ) + 1;


    // ===============================
    // TOTAL POSSIBLE
    // ===============================

    const totalPossible =
        members.length * totalDays;


    // ===============================
    // TOTAL PRESENT
    // ===============================

    const totalPresent =
        attendance.length;


    let percentage = 0;


    if (totalPossible > 0) {

        percentage =
            (totalPresent / totalPossible) * 100;

    }


    // ===============================
    // SAVE DATA FOR PDF
    // ===============================

    reportData = [];

    reportTotalMembers =
        members.length;

    reportTotalPresent =
        totalPresent;

    reportPercentage =
        percentage;

    reportTotalDays =
        totalDays;


    // ===============================
    // SUMMARY CARDS
    // ===============================

    document.getElementById(
        "totalMembers"
    ).textContent =
        members.length;


    document.getElementById(
        "totalPresent"
    ).textContent =
        totalPresent;


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        percentage.toFixed(1) + "%";


    // ===============================
    // ATTENDANCE COUNT
    // ===============================

    const attendanceCount = {};


    members.forEach(member => {

        attendanceCount[
            member.id
        ] = 0;

    });


    attendance.forEach(record => {

        if (
            attendanceCount[
                record.member_id
            ] !== undefined
        ) {

            attendanceCount[
                record.member_id
            ]++;

        }

    });


    // ===============================
    // CREATE REPORT TABLE
    // ===============================

    let html = `

        <table>

            <thead>

                <tr>

                    <th>Member</th>

                    <th>Present</th>

                    <th>Possible Days</th>

                    <th>Attendance %</th>

                </tr>

            </thead>

            <tbody>

    `;


    members.forEach(member => {

        const present =
            attendanceCount[
                member.id
            ];


        const memberPercentage =
            totalDays > 0
                ? (present / totalDays) * 100
                : 0;


        // Save for PDF

        reportData.push({

            name: member.name,

            present: present,

            possibleDays: totalDays,

            percentage: memberPercentage

        });


        html += `

            <tr>

                <td>
                    <strong>
                        ${member.name}
                    </strong>
                </td>

                <td>
                    ${present}
                </td>

                <td>
                    ${totalDays}
                </td>

                <td>
                    ${memberPercentage.toFixed(1)}%
                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    document.getElementById(
        "reportTable"
    ).innerHTML = html;


    // ===============================
    // SHOW PDF BUTTON
    // ===============================

    document.getElementById(
        "downloadPdfBtn"
    ).style.display = "inline-block";

}


// ===============================
// DOWNLOAD PDF
// ===============================

function downloadPDF() {

    if (!reportData || reportData.length === 0) {

        alert(
            "Please generate the report first."
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF();


    // ===============================
    // TITLE
    // ===============================

    doc.setFontSize(18);

    doc.setFont("helvetica", "bold");

    doc.text(
        "AG Olive Prayer Centre",
        14,
        18
    );


    doc.setFontSize(12);

    doc.setFont("helvetica", "normal");

    doc.text(
        "Attendance Report",
        14,
        27
    );


    // ===============================
    // DATE RANGE
    // ===============================

    doc.setFontSize(10);

    doc.text(
        `Period: ${startDate.value} to ${endDate.value}`,
        14,
        36
    );


    // ===============================
    // SUMMARY
    // ===============================

    doc.text(
        `Total Members: ${reportTotalMembers}`,
        14,
        46
    );


    doc.text(
        `Total Present: ${reportTotalPresent}`,
        14,
        53
    );


    doc.text(
        `Attendance Rate: ${reportPercentage.toFixed(1)}%`,
        14,
        60
    );


    // ===============================
    // PDF TABLE
    // ===============================

    const tableRows =
        reportData.map(member => [

            member.name,

            member.present,

            member.possibleDays,

            member.percentage.toFixed(1) + "%"

        ]);


    doc.autoTable({

        startY: 68,

        head: [[

            "Member",

            "Present",

            "Possible Days",

            "Attendance %"

        ]],

        body: tableRows,

        theme: "grid",

        styles: {

            fontSize: 10,

            cellPadding: 4

        },

        headStyles: {

            fontStyle: "bold"

        }

    });


    // ===============================
    // FOOTER
    // ===============================

    const finalY =
        doc.lastAutoTable.finalY + 15;


    doc.setFontSize(9);

    doc.text(
        "Generated by AG Olive Prayer Centre Attendance System",
        14,
        finalY
    );


    // ===============================
    // SAVE PDF
    // ===============================

    const fileName =
        `AG-Olive-Attendance-${startDate.value}-to-${endDate.value}.pdf`;


    doc.save(fileName);

}


// ===============================
// GENERATE BUTTON
// ===============================

document.getElementById(
    "generateBtn"
).addEventListener(
    "click",
    generateReport
);


// ===============================
// PDF BUTTON
// ===============================

document.getElementById(
    "downloadPdfBtn"
).addEventListener(
    "click",
    downloadPDF
);


// ===============================
// BACK TO DASHBOARD
// ===============================

document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);


// ===============================
// START PAGE
// ===============================

async function startPage() {

    const loggedIn =
        await checkUser();

    if (!loggedIn) {

        return;
    }


    await generateReport();

}


startPage();