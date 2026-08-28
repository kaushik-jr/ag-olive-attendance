const SUPABASE_URL =
    "https://hrnblzhstapfkonavpye.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_9MAdAwW84eAxyCMSaANZBw_qDEoWhVw";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================
// CHECK LOGIN
// =====================================

async function checkUser() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error || !data.session) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


// =====================================
// VARIABLES
// =====================================

let allMembers = [];

let editingMemberId = null;


// =====================================
// ELEMENTS
// =====================================

const membersList =
    document.getElementById("membersList");

const searchMember =
    document.getElementById("searchMember");

const addMemberBtn =
    document.getElementById("addMemberBtn");

const memberForm =
    document.getElementById("memberForm");

const cancelBtn =
    document.getElementById("cancelBtn");

const formTitle =
    document.getElementById("formTitle");

const saveBtn =
    document.getElementById("saveBtn");

const newMemberForm =
    document.getElementById("newMemberForm");

const backBtn =
    document.getElementById("backBtn");


// =====================================
// LOAD MEMBERS
// =====================================

async function loadMembers() {

    membersList.innerHTML =
        "Loading members...";


    const { data, error } =
        await supabaseClient
            .from("members")
            .select("*")
            .order("name", {
                ascending: true
            });


    if (error) {

        console.error(
            "Member loading error:",
            error
        );

        membersList.innerHTML =
            "Error loading members: " +
            error.message;

        return;
    }


    allMembers = data || [];


    updateStatistics();

    displayMembers(allMembers);
}


// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics() {

    const totalMembers =
        document.getElementById(
            "totalMembers"
        );

    const activeMembers =
        document.getElementById(
            "activeMembers"
        );

    const inactiveMembers =
        document.getElementById(
            "inactiveMembers"
        );


    const total =
        allMembers.length;


    const active =
        allMembers.filter(
            member => member.active === true
        ).length;


    const inactive =
        allMembers.filter(
            member => member.active !== true
        ).length;


    totalMembers.textContent =
        total;


    activeMembers.textContent =
        active;


    inactiveMembers.textContent =
        inactive;
}


// =====================================
// DISPLAY MEMBERS
// =====================================

function displayMembers(members) {

    if (!members || members.length === 0) {

        membersList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👥
                </div>

                <h3>
                    No Members Found
                </h3>

                <p>
                    Add a church member to get started.
                </p>

            </div>

        `;

        return;
    }


    membersList.innerHTML = "";


    members.forEach(member => {

        const memberDiv =
            document.createElement("div");


        memberDiv.className =
            "member-card";


        const statusText =
            member.active
                ? "Active"
                : "Inactive";


        const statusClass =
            member.active
                ? "active"
                : "inactive";


        memberDiv.innerHTML = `

            <div class="member-card-header">

                <div class="member-avatar">
                    ${getInitials(member.name)}
                </div>

                <div class="member-main-info">

                    <h3>
                        ${escapeHTML(member.name)}
                    </h3>

                    <span class="member-status ${statusClass}">
                        ${member.active ? "🟢" : "🔴"}
                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="member-details">

                <div class="member-detail">

                    <span>
                        📱 Phone
                    </span>

                    <strong>
                        ${
                            member.phone
                                ? escapeHTML(member.phone)
                                : "Not provided"
                        }
                    </strong>

                </div>


                <div class="member-detail">

                    <span>
                        🎂 Age
                    </span>

                    <strong>
                        ${
                            member.age ??
                            "Not provided"
                        }
                    </strong>

                </div>


                <div class="member-detail">

                    <span>
                        ⚥ Gender
                    </span>

                    <strong>
                        ${
                            member.gender
                                ? escapeHTML(member.gender)
                                : "Not provided"
                        }
                    </strong>

                </div>


                <div class="member-detail">

                    <span>
                        📅 Joined
                    </span>

                    <strong>
                        ${
                            member.joined_date ||
                            "Not provided"
                        }
                    </strong>

                </div>

            </div>


            <div class="member-actions">

                <button
                    class="edit-member-btn"
                    data-id="${member.id}"
                >
                    ✏️ Edit
                </button>


                <button
                    class="toggle-active-btn"
                    data-id="${member.id}"
                >

                    ${
                        member.active
                            ? "🔴 Deactivate"
                            : "🟢 Activate"
                    }

                </button>

            </div>

        `;


        membersList.appendChild(memberDiv);

    });


    attachMemberButtons();
}


// =====================================
// GET INITIALS
// =====================================

function getInitials(name) {

    if (!name) {
        return "👤";
    }


    const words =
        name.trim().split(" ");


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// BUTTON EVENTS
// =====================================

function attachMemberButtons() {


    // EDIT

    document
        .querySelectorAll(".edit-member-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    editMember(
                        this.dataset.id
                    );

                }
            );

        });


    // ACTIVATE / DEACTIVATE

    document
        .querySelectorAll(".toggle-active-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const memberId =
                        this.dataset.id;


                    const member =
                        allMembers.find(
                            m =>
                                String(m.id) ===
                                String(memberId)
                        );


                    if (!member) {
                        return;
                    }


                    const newStatus =
                        !member.active;


                    const action =
                        newStatus
                            ? "activate"
                            : "deactivate";


                    const confirmed =
                        confirm(
                            `Are you sure you want to ${action} ${member.name}?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    const { error } =
                        await supabaseClient
                            .from("members")
                            .update({
                                active: newStatus
                            })
                            .eq(
                                "id",
                                memberId
                            );


                    if (error) {

                        console.error(error);

                        alert(
                            "Error changing member status: " +
                            error.message
                        );

                        return;
                    }


                    await loadMembers();

                }
            );

        });

}


// =====================================
// SEARCH
// =====================================

searchMember.addEventListener(
    "input",
    function () {

        const searchText =
            this.value
                .toLowerCase()
                .trim();


        if (searchText === "") {

            displayMembers(allMembers);

            return;
        }


        const filteredMembers =
            allMembers.filter(member => {

                const name =
                    String(
                        member.name || ""
                    ).toLowerCase();


                const phone =
                    String(
                        member.phone || ""
                    ).toLowerCase();


                return (
                    name.includes(searchText) ||
                    phone.includes(searchText)
                );

            });


        displayMembers(
            filteredMembers
        );

    }
);


// =====================================
// ADD MEMBER
// =====================================

addMemberBtn.addEventListener(
    "click",
    function () {

        editingMemberId = null;


        formTitle.textContent =
            "➕ Add New Member";


        saveBtn.textContent =
            "💾 SAVE MEMBER";


        newMemberForm.reset();


        memberForm.style.display =
            "block";


        memberForm.scrollIntoView({
            behavior: "smooth"
        });

    }
);


// =====================================
// CANCEL
// =====================================

cancelBtn.addEventListener(
    "click",
    function () {

        memberForm.style.display =
            "none";


        newMemberForm.reset();


        editingMemberId = null;


        formTitle.textContent =
            "➕ Add New Member";


        saveBtn.textContent =
            "💾 SAVE MEMBER";

    }
);


// =====================================
// EDIT MEMBER
// =====================================

async function editMember(memberId) {

    const { data, error } =
        await supabaseClient
            .from("members")
            .select("*")
            .eq("id", memberId)
            .single();


    if (error) {

        console.error(error);

        alert(
            "Error loading member: " +
            error.message
        );

        return;
    }


    editingMemberId =
        memberId;


    document.getElementById("name").value =
        data.name || "";


    document.getElementById("phone").value =
        data.phone || "";


    document.getElementById("age").value =
        data.age ?? "";


    document.getElementById("gender").value =
        data.gender || "";


    document.getElementById("joined_date").value =
        data.joined_date || "";


    formTitle.textContent =
        "✏️ Edit Member";


    saveBtn.textContent =
        "💾 SAVE CHANGES";


    memberForm.style.display =
        "block";


    memberForm.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================
// SAVE MEMBER
// =====================================

newMemberForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const age =
            document
                .getElementById("age")
                .value;


        const gender =
            document
                .getElementById("gender")
                .value;


        const joined_date =
            document
                .getElementById("joined_date")
                .value;


        if (!name) {

            alert(
                "Please enter the member name."
            );

            return;
        }


        saveBtn.disabled = true;


        saveBtn.textContent =
            "⏳ SAVING...";


        // =================================
        // UPDATE
        // =================================

        if (editingMemberId !== null) {

            const { error } =
                await supabaseClient
                    .from("members")
                    .update({

                        name: name,

                        phone:
                            phone || null,

                        age:
                            age
                                ? Number(age)
                                : null,

                        gender:
                            gender || null,

                        joined_date:
                            joined_date || null

                    })
                    .eq(
                        "id",
                        editingMemberId
                    );


            if (error) {

                console.error(error);

                alert(
                    "Error updating member: " +
                    error.message
                );

                saveBtn.disabled = false;

                saveBtn.textContent =
                    "💾 SAVE CHANGES";

                return;
            }


            alert(
                "Member updated successfully!"
            );

        }


        // =================================
        // ADD
        // =================================

        else {

            const { error } =
                await supabaseClient
                    .from("members")
                    .insert({

                        name: name,

                        phone:
                            phone || null,

                        age:
                            age
                                ? Number(age)
                                : null,

                        gender:
                            gender || null,

                        joined_date:
                            joined_date || null,

                        active: true

                    });


            if (error) {

                console.error(error);

                alert(
                    "Error adding member: " +
                    error.message
                );

                saveBtn.disabled = false;

                saveBtn.textContent =
                    "💾 SAVE MEMBER";

                return;
            }


            alert(
                "Member added successfully!"
            );

        }


        editingMemberId = null;

        newMemberForm.reset();

        memberForm.style.display =
            "none";


        saveBtn.disabled = false;

        saveBtn.textContent =
            "💾 SAVE MEMBER";


        await loadMembers();

    }
);


// =====================================
// DASHBOARD
// =====================================

backBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);


// =====================================
// START PAGE
// =====================================

async function startPage() {

    const loggedIn =
        await checkUser();


    if (!loggedIn) {
        return;
    }


    await loadMembers();

}


startPage();
