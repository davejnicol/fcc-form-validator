const form = document.getElementById("registration-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const submitButton = document.getElementById("registration-submit");

// Track whether a user has interacted with a field yet
const touchedFields = new Set();

// Variables used throughout
const emailLenMin = 3;
const emailLenMax = 15
const passwordLenMin = 6;
const passwordLenMax = 30;

// Keep track of active timer so it can be cleared on a new submission
let statusTimeoutId = null;

// UTILITY: Silent background check to toggle button status
function checkFormValidity() {
    // Basic structural checks using identical parameters as the visual UI validations
    const isUserOk = username.value.length >= emailLenMin && username.value.length <= emailLenMax;
    const isEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const isPassOk = password.value.length >= passwordLenMin && password.value.length <= passwordLenMax;
    const isMatchOk = password.value === confirmPassword.value && confirmPassword.value !== "";

    if (isUserOk && isEmailOk && isPassOk && isMatchOk) {
        submitButton.removeAttribute("disabled");
        submitButton.setAttribute("aria-disabled", "false");
    } else {
        submitButton.setAttribute("disabled", "true");
        submitButton.setAttribute("aria-disabled", "true");
    }
}

// Master function to validate a single field
function validateField(input, forceCheck = false) {
    // Prevent validation if the user hasn't finished interacting yet
    if (!touchedFields.has(input) && !forceCheck) {
        return true; 
    }

    input.parentElement.className = "form-group";

    // Check if empty
    if (!checkRequired([input])) {
        return false;
    }

    // Run specific field validations
    switch (input.id) {
        case "username":
            return checkLength(input, emailLenMin, emailLenMax);
        case "email":
            return checkEmail(input);
        case "password":
            const isValidPass = checkLength(input, passwordLenMin, passwordLenMax);

            if (confirmPassword.value.trim() !== "" && touchedFields.has(confirmPassword)) {
                checkPasswordConfirmation(password, confirmPassword);
            }
            return isValidPass;
        case "confirmPassword":
            return checkPasswordConfirmation(password, confirmPassword);
        default:
            return true;
    }
}

// REAL-TIME VALIDATION ARCHITECTURE LOOP WITH AUTOSAVE LOGIC
[username, email, password, confirmPassword].forEach(input => {
    // Triggered when user leaves a field (stops early flashing errors)
    input.addEventListener("blur", () => {
        touchedFields.add(input);
        validateField(input);
        checkFormValidity(); // Check validity on blur
    });

    // Triggered on every keystroke
    input.addEventListener("input", () => {
        // Special case: Update password strength instantly as they type
        if (input.id === "password") {
            updatePasswordStrength(input.value);
        }
        
        // Only validate typing if they already blurred the field once before
        if (touchedFields.has(input)) {
            validateField(input);
        }

        checkFormValidity(); // Check validity on every keystroke
    });
});

// HELPER: Updates and displays the form alert message container
function showFormStatus(text, isSuccess) {
    const statusMsg = document.getElementById("form-status-msg");
    if (!statusMsg) return;
    
    // Clear any pending auto-hide timer immediately
    if (statusTimeoutId) {
        clearTimeout(statusTimeoutId);
    }

    statusMsg.className = "status-msg " + (isSuccess ? "success" : "error");
    statusMsg.innerText = text;
    
    // Make visible in the DOM structure, then trigger CSS opacity animation
    statusMsg.style.display = 'block';
    // Small timeout ensures the browser registers display block before animating opacity
    setTimeout(() => statusMsg.classList.add("visible"), 10);

    // If it is a success state, trigger the 5-second auto-hide fade out sequence
    if (isSuccess) {
        statusTimeoutId = setTimeout(() => {
            statusMsg.classList.remove("visible");
            
            // Fully remove from view after fade opacity transition completes (400ms)
            statusTimeoutId = setTimeout(() => {
                statusMsg.style.display = "none";
                statusMsg.className = "status-msg";
            }, 400);
        }, 5000);
    }
}

// SUBMIT VALIDATION: Forces validation, cleans up form state upon successful confirmation, & sends data to a mock server
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide any previous message box when starting a new submit cycle
    const statusMsg = document.getElementById('form-status-msg');
    
    if (statusMsg) {
        if (statusTimeoutId) clearTimeout(statusTimeoutId);
        statusMsg.classList.remove("visible");
        statusMsg.style.display = "none";
    }

    // Force add all fields to touched status on submit
    [username, email, password, confirmPassword].forEach(input => touchedFields.add(input));

    // Validate every single field and store results
    const isUsernameValid = validateField(username, true);
    const isEmailValid = validateField(email, true);
    const isPasswordValid = validateField(password, true);
    const isPasswordEqual = validateField(confirmPassword, true);

    const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isPasswordEqual;

    if (!isFormValid) return;

    // 1. Prepare UI Loading State
    submitButton.disabled = true;
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = `<span class="btn-inline-spinner"></span> Registering...`;

    // 2. Gather form data payload
    const formData = {
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value, // Do not trim passwords to preserve spaces intentionally set
    };

    // 3. Initiate the mock backend network call
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Server Response:", data); // Check your developer console to see the mock ID created

            showFormStatus("Registration successful! Your account has been created.", true);

            // Reset everything on success
            form.reset();
            touchedFields.clear();
            updatePasswordStrength("");
            document.querySelectorAll(".form-group").forEach((group) => (group.className = "form-group"));
        } else {
            throw new Error("Server rejected registration request.");
        }
    } catch (error) {
        console.error("Network Error:", error);
        showFormStatus("Something went wrong with the server connection. Please try again later.", false);
    } finally {
        // 4. Clean up: Restore button state regardless of success or failure
        submitButton.innerHTML = originalButtonText;
        checkFormValidity(); // Recalculate button lock status based on current fields
    }
});

// Password Strength Calculator
function updatePasswordStrength(val) {
    const meter = document.getElementById("password-strength");
    if (!meter) return; // Guard clause if HTML element is missing

    if (val.length === 0) {
        meter.className = "meter-bar";
        return;
    }

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    // Map scores to UI classes
    if (score <= 2) {
        meter.className = "meter-bar weak";
    } else if (score <= 4) {
        meter.className = "meter-bar medium";
    } else {
        meter.className = "meter-bar strong";
    }
}

// Show/Hide Password Toggle Engine
document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
        // Find the input field attached to this specific button
        const targetId = button.getAttribute("data-target");
        const inputField = document.getElementById(targetId);

        if (!inputField) return;

        // Toggle the input type attribute and swap visual mask classes
        if (inputField.type === "password") {
            inputField.type = "text";
            button.classList.remove("eye-show");
            button.classList.add("eye-hide");
            button.setAttribute("aria-label", "Hide password");
        } else {
            inputField.type = "password";
            button.classList.remove("eye-hide");
            button.classList.add("eye-show");
            button.setAttribute("aria-label", "Show password");
        }
    });
});

// Check that all required fields have a value
function checkRequired(inputArray) { 
    let isValid = true;
    inputArray.forEach(input => {
        if (input.value.trim() === "") {
            showError(input, `${formatFieldName(input)} is required`);
            isValid = false;
        }
    });
    return isValid;
}

// Format field name with proper capitalization
function formatFieldName(input) { 
    // Insert a space before capital letters and lowercase the whole result first
    const result = input.id.replace(/([A-Z])/g, " $1").toLowerCase();
    // Capitalize only the very first character
    return result.charAt(0).toUpperCase() + result.slice(1);
}

// Check input length constraints
function checkLength(input, min, max) { 
    const length = input.value.length;
    if (length < min) {
        showError(input, `${formatFieldName(input)} must be at least ${min} characters`);
        return false;
    }
    if (length > max) {
        showError(input, `${formatFieldName(input)} must be less than ${max} characters`);
        return false;
    }
    showSuccess(input);
    return true;
}

// Validate email format using regex
function checkEmail(emailInput) {
    // Email regex that covers most common email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailInput.value.trim())) {
        showSuccess(emailInput);
        return true;
    }
    showError(emailInput, "Email is not valid");
    return false;
}

// Confirm both passwords match
function checkPasswordConfirmation(input1, input2) {
    if (input1.value !== input2.value) {
        showError(input2, "Passwords do not match");
        return false;
    }
    showSuccess(input2);
    return true;
}

// UI: Show error message
function showError(input, message) { 
    const formGroup = input.parentElement;
    formGroup.className = "form-group error";
    const small = formGroup.querySelector("small");
    if (small) small.innerText = message;
}

// UI: Show success state
function showSuccess(input) {
    const formGroup = input.parentElement;
    formGroup.className = "form-group success";
}