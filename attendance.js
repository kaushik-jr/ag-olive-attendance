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

const selectedDay =
    document.getElementById("selectedDay");

const attendanceList =
    document.getElementById("attendanceList");

const searchAttendance =
    document.getElementById("searchAttendance");

const saveAttendanceBtn =
    document.getElementById("saveAttendanceBtn");

const message =
    document.getElementById("message");

const presentCount =
    document.getElementById("presentCount");

const absentCount =
    document.getElementById("absentCount");

const totalCount =
    document.getElementById("totalCount");


// ===============================
// STORE MEMBERS
// ===============================

let allMembers = [];

let existingAttendance = [];


// ===============================
// CHECK SUNDAY
// ===============================

function isSunday(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.getDay() === 0;
}


// ===============================
// SHOW SELECTED DAY
// ===============================

function updateSelectedDay() {

    const selectedDate =
        attendanceDate.value;

    if (!selectedDate) {

        selectedDay.textContent =
            "Please select a Sunday";

        return;
    }

    if (!isSunday(selectedDate)) {

        selectedDay.textContent =
            "⚠️ Please select a Sunday only";

        selectedDay.style.color =
            "#dc2626";

        return;
    }

    const date =
        new Date(
            selectedDate + "T00:00:00"
        );

    const formattedDate =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    selectedDay.textContent =
        "✅ " + formattedDate;

    selectedDay.style.color =
        "#2563eb";
}


// ===============================
// SET CURRENT SUNDAY
// ===============================

function setSundayDate() {

    const today =
        new Date();

    const sunday =
        new Date(today);

    sunday.setDate(
        today.getDate() -
        today.getDay()
    );

    const year =
        sunday.getFullYear();

    const month =
        String(
            sunday.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            sunday.getDate()
        ).padStart(2, "0");

    attendanceDate.value =
        `${year}-${month}-${day}`;

    updateSelectedDay();
}


// ===============================
// LOAD MEMBERS FROM SUPABASE
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

        console.error(
            "Member loading error:",
            error
        );

        attendanceList.innerHTML =
            "Error loading members: " +
            error.message;

        return;
    }

    allMembers =
        data || [];

    updateTotalCount();

    displayMembers(
        getFilteredMembers()
    );
}


// ===============================
// TOTAL MEMBERS
// ===============================

function updateTotalCount() {

    totalCount.textContent =
        allMembers.length;
}


// ===============================
// ATTENDANCE COUNTS
// ===============================

function updateAttendanceCounts() {

    const checkboxes =
        document.querySelectorAll(
            ".member-checkbox"
        );

    let present = 0;

    checkboxes.forEach(
        checkbox => {

            if (checkbox.checked) {

                present++;

            }

        }
    );

    presentCount.textContent =
        present;

    absentCount.textContent =
        allMembers.length - present;

    totalCount.textContent =
        allMembers.length;
}


// ===============================
// DISPLAY MEMBERS
// ===============================

function displayMembers(members) {

    attendanceList.innerHTML = "";

    if (!members ||
        members.length === 0) {

        attendanceList.innerHTML = `

            <div class="empty-state">

                <div>👥</div>

                <p>
                    No members found.
                </p>

            </div>

        `;

        updateAttendanceCounts();

        return;
    }

    members.forEach(member => {

        const row =
            document.createElement("div");

        row.className =
            "attendance-row";


        const existingRecord =
            existingAttendance.find(
                record =>
                    String(
                        record.member_id
                    ) ===
                    String(member.id)
            );


        const isPresent =
            existingRecord
                ? existingRecord.present === true
                : false;


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
                        ? `<span class="member-phone">
                            ${member.phone}
                           </span>`
                        : ""
                }

            </label>

        `;


        const checkbox =
            row.querySelector(
                ".member-checkbox"
            );


        checkbox.addEventListener(
            "change",
            updateAttendanceCounts
        );


        attendanceList.appendChild(row);

    });


    updateAttendanceCounts();
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

    if (!isSunday(selectedDate)) {

        existingAttendance = [];

        displayMembers(
            getFilteredMembers()
        );

        return;
    }


    const { data, error } =
        await supabaseClient
            .from("attendance")
            .select(
                "member_id, present"
            )
            .eq(
                "attendance_date",
                selectedDate
            );


    if (error) {

        console.error(
            "Attendance loading error:",
            error
        );

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


    return allMembers.filter(
        member => {

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

        }
    );
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


        if (!isSunday(
            attendanceDate.value
        )) {

            alert(
                "Please select a Sunday only."
            );


            setSundayDate();

            return;
        }


        updateSelectedDay();


        await loadExistingAttendance();

    }
);


// ===============================
// SAVE SUNDAY ATTENDANCE
// ===============================

saveAttendanceBtn.addEventListener(
    "click",
    async function () {

        const selectedDate =
            attendanceDate.value;


        if (!selectedDate) {

            alert(
                "Please select a Sunday."
            );

            return;
        }


        if (!isSunday(selectedDate)) {

            alert(
                "Attendance can only be marked for Sundays."
            );

            return;
        }


        if (allMembers.length === 0) {

            alert(
                "No active members found."
            );

            return;
        }


        // Create attendance records
        // for every active member.

        const attendanceRecords =
            allMembers.map(member => {


                const checkbox =
                    document.querySelector(
                        `.member-checkbox[data-member-id="${member.id}"]`
                    );


                const existingRecord =
                    existingAttendance.find(
                        record =>
                            String(
                                record.member_id
                            ) ===
                            String(member.id)
                    );


                let present =
                    existingRecord
                        ? existingRecord.present
                        : false;


                if (checkbox) {

                    present =
                        checkbox.checked;

                }


                return {

                    member_id:
                        member.id,

                    attendance_date:
                        selectedDate,

                    present:
                        present

                };

            });


        saveAttendanceBtn.disabled =
            true;


        saveAttendanceBtn.textContent =
            "⏳ SAVING...";


        // ===============================
        // DELETE OLD RECORDS
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


            saveAttendanceBtn.disabled =
                false;


            saveAttendanceBtn.textContent =
                "💾 SAVE SUNDAY ATTENDANCE";


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


            saveAttendanceBtn.disabled =
                false;


            saveAttendanceBtn.textContent =
                "💾 SAVE SUNDAY ATTENDANCE";


            return;
        }


        // ===============================
        // SUCCESS
        // ===============================

        message.style.color =
            "#16a34a";


        message.textContent =
            "✅ Sunday attendance saved successfully!";


        saveAttendanceBtn.disabled =
            false;


        saveAttendanceBtn.textContent =
            "💾 SAVE SUNDAY ATTENDANCE";


        await loadExistingAttendance();

    }
);


// ===============================
// DASHBOARD BUTTON
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


    setSundayDate();


    await loadMembers();


    await loadExistingAttendance();

}


startPage();
