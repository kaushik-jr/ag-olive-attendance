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

```
const { data, error } =
    await supabaseClient.auth.getSession();

if (error || !data.session) {

    window.location.href =
        "index.html";

    return false;
}

return true;
```

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

// =====================================
// LOAD MEMBERS
// =====================================

async function loadMembers() {

```
membersList.innerHTML = `
    <div class="loading-state">
        ⏳ Loading members...
    </div>
`;


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

    membersList.innerHTML = `
        <div class="empty-state">
            ❌
            <p>
                Error loading members.
            </p>
        </div>
    `;

    return;
}


allMembers = data || [];


updateStatistics();

displayMembers(allMembers);
```

}

// =====================================
// UPDATE STATISTICS
// =====================================

function updateStatistics() {

```
const total =
    allMembers.length;


const active =
    allMembers.filter(
        member => member.active === true
    ).length;


const inactive =
    allMembers.filter(
        member => member.active === false
    ).length;


document.getElementById(
    "totalMembers"
).textContent = total;


document.getElementById(
    "activeMembers"
).textContent = active;


document.getElementById(
    "inactiveMembers"
).textContent = inactive;
```

}

// =====================================
// DISPLAY MEMBERS
// =====================================

function displayMembers(members) {

```
membersList.innerHTML = "";


if (!members ||
    members.length === 0) {

    membersList.innerHTML = `

        <div class="empty-state">

            <div>
                👥
            </div>

            <h3>
                No Members Found
            </h3>

            <p>
                Try another search or add a new member.
            </p>

        </div>

    `;

    return;
}


members.forEach(member => {

    const memberDiv =
        document.createElement("div");


    memberDiv.className =
        "member-card";


    const statusClass =
        member.active
            ? "active"
            : "inactive";


    const statusText =
        member.active
            ? "🟢 Active"
            : "🔴 Inactive";


    memberDiv.innerHTML = `

        <div class="member-card-header">

            <div class="member-avatar">
                ${getInitials(member.name)}
            </div>

            <div class="member-name-area">

                <h3>
                    ${escapeHTML(member.name)}
                </h3>

                <span class="status-badge ${statusClass}">
                    ${statusText}
                </span>

            </div>

        </div>


        <div class="member-details">


            <div class="member-detail">

                <span>
                    📱
                </span>

                <div>

                    <small>
                        Phone
                    </small>

                    <strong>
                        ${escapeHTML(
                            member.phone ||
                            "Not provided"
                        )}
                    </strong>

                </div>

            </div>


            <div class="member-detail">

                <span>
                    🎂
                </span>

                <div>

                    <small>
                        Age
                    </small>

                    <strong>
                        ${
                            member.age ??
                            "Not provided"
                        }
                    </strong>

                </div>

            </div>


            <div class="member-detail">

                <span>
                    ⚥
                </span>

                <div>

                    <small>
                        Gender
                    </small>

                    <strong>
                        ${escapeHTML(
                            member.gender ||
                            "Not provided"
                        )}
                    </strong>

                </div>

            </div>


            <div class="member-detail">

                <span>
                    📅
                </span>

                <div>

                    <small>
                        Joined
                    </small>

                    <strong>
                        ${
                            member.joined_date ||
                            "Not provided"
                        }
                    </strong>

                </div>

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
```

}

// =====================================
// MEMBER INITIALS
// =====================================

function getInitials(name) {

```
if (!name) {

    return "?";
}


const words =
    name
        .trim()
        .split(/\s+/);


if (words.length === 1) {

    return words[0]
        .substring(0, 2)
        .toUpperCase();
}


return (
    words[0][0] +
    words[words.length - 1][0]
).toUpperCase();
```

}

// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

```
const div =
    document.createElement("div");

div.textContent =
    value;

return div.innerHTML;
```

}

// =====================================
// BUTTON EVENTS
// =====================================

function attachMemberButtons() {

```
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


document
    .querySelectorAll(".toggle-active-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            async function () {

                await toggleMemberStatus(
                    this.dataset.id
                );

            }
        );

    });
```

}

// =====================================
// ACTIVATE / DEACTIVATE
// =====================================

async function toggleMemberStatus(memberId) {

```
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
```

}

// =====================================
// SEARCH MEMBERS
// =====================================

searchMember.addEventListener(
"input",
function () {

```
    const searchText =
        this.value
            .toLowerCase()
            .trim();


    if (searchText === "") {

        displayMembers(
            allMembers
        );

        return;
    }


    const filteredMembers =
        allMembers.filter(
            member => {

                const name =
                    String(
                        member.name || ""
                    ).toLowerCase();


                const phone =
                    String(
                        member.phone || ""
                    ).toLowerCase();


                return (
                    name.includes(
                        searchText
                    ) ||
                    phone.includes(
                        searchText
                    )
                );

            }
        );


    displayMembers(
        filteredMembers
    );

}
```

);

// =====================================
// ADD MEMBER
// =====================================

addMemberBtn.addEventListener(
"click",
function () {

```
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
```

);

// =====================================
// CANCEL FORM
// =====================================

cancelBtn.addEventListener(
"click",
function () {

```
    closeForm();

}
```

);

// =====================================
// CLOSE FORM
// =====================================

function closeForm() {

```
memberForm.style.display =
    "none";


newMemberForm.reset();


editingMemberId = null;


formTitle.textContent =
    "➕ Add New Member";


saveBtn.textContent =
    "💾 SAVE MEMBER";
```

}

// =====================================
// EDIT MEMBER
// =====================================

async function editMember(memberId) {

```
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
```

}

// =====================================
// SAVE / UPDATE MEMBER
// =====================================

newMemberForm.addEventListener(
"submit",
async function (event) {

```
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
            "✅ Member updated successfully!"
        );


        saveBtn.disabled = false;


        closeForm();


        await loadMembers();


        return;
    }


    // =================================
    // ADD
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

        saveBtn.disabled = false;

        saveBtn.textContent =
            "💾 SAVE MEMBER";

        return;
    }


    alert(
        "✅ Member added successfully!"
    );


    saveBtn.disabled = false;


    closeForm();


    await loadMembers();

}
```

);

// =====================================
// DASHBOARD
// =====================================

document
.getElementById("backBtn")
.addEventListener(
"click",
function () {

```
        window.location.href =
            "dashboard.html";

    }
);
```

// =====================================
// START PAGE
// =====================================

async function startPage() {

```
const loggedIn =
    await checkUser();


if (!loggedIn) {

    return;
}


await loadMembers();
```

}

startPage();
