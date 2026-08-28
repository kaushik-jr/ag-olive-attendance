const SUPABASE_URL = "https://hrnblzhstapfkonavpye.supabase.co";

const SUPABASE_KEY = "sb_publishable_9MAdAwW84eAxyCMSaANZBw_qDEoWhVw";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    message.style.color = "black";
    message.textContent = "Logging in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        message.style.color = "red";
        message.textContent = error.message;
        return;
    }

    message.style.color = "green";
    message.textContent = "Login successful!";

    console.log("Logged in user:", data.user);

    window.location.href = "./dashboard.html";
});