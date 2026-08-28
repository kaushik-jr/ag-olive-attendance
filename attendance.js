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

const attendanceDate =
    document.getElementById("attendanceDate");

const attendanceList =
    document.getElementById("attendanceList");

const searchAttendance =
    document.getElementById("searchAttendance");

const saveAttendanceBtn =
    document.getElementById("saveAttendanceBtn");

const message =
    document.getElementById("message");


// ===============================
// STORE MEMBERS
// ===============================

let allMembers = [];

let existingAttendance = [];


// ===============================
// SET TODAY'S DATE
// ===============================

const today =
    new Date().toISOString().split("T")[0];

attendanceDate.value = today;


// ===============================
// LOAD ACTIVE MEMBERS
// ===============================

async function loadMembers() {

    attendanceList.innerHTML =
        "Loading members...";


    const { data, error } =
        await supabaseClient
            .from("members")
            .select("id, name, phone")
            .eq("active", true)
            .order("name", {
                ascending: true
            });


    if (error) {

        console.error(error);

        attendanceList.innerHTML =
            "Error loading members.";

        return;
    }


    allMembers = data || [];

    displayMembers(allMembers);
}


// ===============================
// DISPLAY MEMBERS
// ===============================

function displayMembers(members) {

    attendanceList.innerHTML = "";


    if (!members || members.length === 0) {

        attendanceList.innerHTML =
            "No members found.";

        return;
    }


    members.forEach(member => {

        const row =
            document.createElement("div");

        row.className =
            "attendance-row";


        const isPresent =
            existingAttendance.some(
                record =>
                    String(record.member_id) ===
                    String(member.id) &&
                    record.present === true
            );


        row.innerHTML = `

            <label>

                <input
                    type="checkbox"
                    class="member-checkbox"
                    data-member-id="${member.id}"
                    ${isPresent ? "checked" : ""}
                >

                <strong>
                    ${member.name}
                </strong>

                ${
                    member.phone
                        ? `<span> - ${member.phone}</span>`
                        : ""
                }

            </label>

        `;


        attendanceList.appendChild(row);

    });

}


// ===============================
// LOAD EXISTING ATTENDANCE
// ===============================

async function loadExistingAttendance() {

    const selectedDate =
        attendanceDate.value;


    if (!selectedDate) {
        return;
    }


    const { data, error } =
        await supabaseClient
            .from("attendance")
            .select("member_id, present")
            .eq(
                "attendance_date",
                selectedDate
            );


    if (error) {

        console.error(error);

        return;
    }


    existingAttendance =
        data || [];


    displayMembers(
        getFilteredMembers()
    );

}


// ===============================
// SEARCH MEMBERS
// ===============================

function getFilteredMembers() {

    const searchText =
        searchAttendance.value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        return allMembers;

    }


    return allMembers.filter(member => {

        const name =
            (member.name || "")
                .toLowerCase();

        const phone =
            (member.phone || "")
                .toLowerCase();


        return (
            name.includes(searchText) ||
            phone.includes(searchText)
        );

    });

}


searchAttendance.addEventListener(
    "input",
    function () {

        displayMembers(
            getFilteredMembers()
        );

    }
);


// ===============================
// DATE CHANGE
// ===============================

attendanceDate.addEventListener(
    "change",
    async function () {

        message.textContent = "";

        await loadExistingAttendance();

    }
);


// ===============================
// SAVE ATTENDANCE
// ===============================

saveAttendanceBtn.addEventListener(
    "click",
    async function () {

        const selectedDate =
            attendanceDate.value;


        if (!selectedDate) {

            alert(
                "Please select a date."
            );

            return;
        }


        // Get ALL member checkboxes
        // from all members, not just
        // currently searched members.

        const allCheckboxes =
            document.querySelectorAll(
                ".member-checkbox"
            );


        // Create records based on
        // currently displayed members.

        const attendanceRecords = [];


        allCheckboxes.forEach(
            checkbox => {

                attendanceRecords.push({

                    member_id:
                        checkbox.dataset.memberId,

                    attendance_date:
                        selectedDate,

                    present:
                        checkbox.checked

                });

            }
        );


        if (
            attendanceRecords.length === 0
        ) {

            alert(
                "No members found."
            );

            return;
        }


        // ===============================
        // DELETE OLD RECORDS FOR DATE
        // ===============================

        const { error: deleteError } =
            await supabaseClient
                .from("attendance")
                .delete()
                .eq(
                    "attendance_date",
                    selectedDate
                );


        if (deleteError) {

            console.error(
                deleteError
            );

            alert(
                "Error updating attendance: " +
                deleteError.message
            );

            return;
        }


        // ===============================
        // INSERT NEW RECORDS
        // ===============================

        const { error: insertError } =
            await supabaseClient
                .from("attendance")
                .insert(
                    attendanceRecords
                );


        if (insertError) {

            console.error(
                insertError
            );

            alert(
                "Error saving attendance: " +
                insertError.message
            );

            return;
        }


        message.style.color =
            "green";

        message.textContent =
            "Attendance saved successfully!";


        await loadExistingAttendance();

    }
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
// START PAGE
// ===============================

async function startPage() {

    const loggedIn =
        await checkUser();


    if (!loggedIn) {

        return;

    }


    await loadMembers();

    await loadExistingAttendance();

}


startPage();