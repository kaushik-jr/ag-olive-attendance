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

        window.location.href =
            "index.html";

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
// LOAD MEMBERS
// =====================================

async function loadMembers() {

    const membersList =
        document.getElementById("membersList");

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

        console.error(error);

        membersList.innerHTML =
            "Error loading members.";

        return;
    }


    allMembers = data || [];

    displayMembers(allMembers);
}


// =====================================
// DISPLAY MEMBERS
// =====================================

function displayMembers(members) {

    const membersList =
        document.getElementById("membersList");


    if (!members || members.length === 0) {

        membersList.innerHTML =
            "No members found.";

        return;
    }


    membersList.innerHTML = "";


    members.forEach(member => {

        const memberDiv =
            document.createElement("div");


        memberDiv.className =
            "member-card";


        memberDiv.innerHTML = `

            <h3>
                ${member.name}
            </h3>

            <p>
                <strong>Phone:</strong>
                ${member.phone || "Not provided"}
            </p>

            <p>
                <strong>Age:</strong>
                ${member.age ?? "Not provided"}
            </p>

            <p>
                <strong>Gender:</strong>
                ${member.gender || "Not provided"}
            </p>

            <p>
                <strong>Joined:</strong>
                ${member.joined_date || "Not provided"}
            </p>

            <p>
                <strong>Status:</strong>

                ${
                    member.active
                        ? "Active"
                        : "Inactive"
                }

            </p>


            <button
                class="edit-member-btn"
                data-id="${member.id}"
            >
                ✏️ EDIT MEMBER
            </button>


            <button
                class="toggle-active-btn"
                data-id="${member.id}"
            >

                ${
                    member.active
                        ? "🔴 DEACTIVATE"
                        : "🟢 ACTIVATE"
                }

            </button>

        `;


        membersList.appendChild(memberDiv);

    });


    // =================================
    // EDIT BUTTONS
    // =================================

    document
        .querySelectorAll(".edit-member-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const memberId =
                        this.dataset.id;

                    editMember(memberId);

                }
            );

        });


    // =================================
    // ACTIVATE / DEACTIVATE
    // =================================

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


                    alert(
                        `Member ${action}d successfully!`
                    );


                    await loadMembers();

                }
            );

        });

}


// =====================================
// SEARCH MEMBERS
// =====================================

const searchMember =
    document.getElementById(
        "searchMember"
    );


searchMember.addEventListener(
    "input",
    function () {

        const searchText =
            this.value
                .toLowerCase()
                .trim();


        // Show everyone when search is empty

        if (searchText === "") {

            displayMembers(allMembers);

            return;

        }


        // Search by name OR phone

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
// FORM ELEMENTS
// =====================================

const addMemberBtn =
    document.getElementById(
        "addMemberBtn"
    );

const memberForm =
    document.getElementById(
        "memberForm"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const newMemberForm =
    document.getElementById(
        "newMemberForm"
    );


// =====================================
// ADD MEMBER BUTTON
// =====================================

addMemberBtn.addEventListener(
    "click",
    function () {

        editingMemberId = null;


        formTitle.textContent =
            "Add New Member";


        saveBtn.textContent =
            "SAVE MEMBER";


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
            "Add New Member";


        saveBtn.textContent =
            "SAVE MEMBER";

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
            .eq(
                "id",
                memberId
            )
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


    document.getElementById(
        "name"
    ).value =
        data.name || "";


    document.getElementById(
        "phone"
    ).value =
        data.phone || "";


    document.getElementById(
        "age"
    ).value =
        data.age ?? "";


    document.getElementById(
        "gender"
    ).value =
        data.gender || "";


    document.getElementById(
        "joined_date"
    ).value =
        data.joined_date || "";


    formTitle.textContent =
        "Edit Member";


    saveBtn.textContent =
        "SAVE CHANGES";


    memberForm.style.display =
        "block";


    memberForm.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================
// SAVE / UPDATE MEMBER
// =====================================

newMemberForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "name"
            ).value.trim();


        const phone =
            document.getElementById(
                "phone"
            ).value.trim();


        const age =
            document.getElementById(
                "age"
            ).value;


        const gender =
            document.getElementById(
                "gender"
            ).value;


        const joined_date =
            document.getElementById(
                "joined_date"
            ).value;


        // =================================
        // VALIDATE NAME
        // =================================

        if (!name) {

            alert(
                "Please enter the member name."
            );

            return;

        }


        // =================================
        // UPDATE MEMBER
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

                return;

            }


            alert(
                "Member updated successfully!"
            );


            editingMemberId =
                null;


            newMemberForm.reset();


            memberForm.style.display =
                "none";


            formTitle.textContent =
                "Add New Member";


            saveBtn.textContent =
                "SAVE MEMBER";


            await loadMembers();


            return;

        }


        // =================================
        // ADD NEW MEMBER
        // =================================

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

            return;

        }


        alert(
            "Member added successfully!"
        );


        newMemberForm.reset();


        memberForm.style.display =
            "none";


        await loadMembers();

    }
);


// =====================================
// BACK TO DASHBOARD
// =====================================

document
    .getElementById("backBtn")
    .addEventListener(
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


// =====================================
// START
// =====================================

startPage();