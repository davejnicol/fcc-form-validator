const form = document.getElementById("registration-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

// Track whether a user has interacted with a field yet
const touchedFields = new Set();

// Master function to validate a single field
function validateField(input, forceCheck = false) {
    // Prevent validation if the user hasn't finished interacting yet
    if (!touchedFields.has(input) && !forceCheck) {
        return true; 
    }

    input.parentElement.className = "form-group";

    // 1. Check if empty
    if (!checkRequired([input])) {
        return false;
    }

    // 2. Run specific field validations
    switch (input.id) {
        case "username":
            return checkLength(input, 3, 15);
        case "email":
            return checkEmail(input);
        case "password":
            const isValidPass = checkLength(input, 6, 30);
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

// REAL-TIME VALIDATION ARCHITECTURE
[username, email, password, confirmPassword].forEach(input => {
    // Triggered when user leaves a field (stops early flashing errors)
    input.addEventListener("blur", () => {
        touchedFields.add(input);
        validateField(input);
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
    });
});

// SUBMIT VALIDATION: Forces validation on everything
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Force add all fields to touched status on submit
    [username, email, password, confirmPassword].forEach(input => touchedFields.add(input));

    // Validate every single field and store results
    const isUsernameValid = validateField(username, true);
    const isEmailValid = validateField(email, true);
    const isPasswordValid = validateField(password, true);
    const isPasswordEqual = validateField(confirmPassword, true);

    const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isPasswordEqual;

    if (isFormValid) {
        alert("Registration successful!");
        form.reset();
        touchedFields.clear();
        updatePasswordStrength(""); // Reset meter
        
        document.querySelectorAll(".form-group").forEach((group) => {
            group.className = "form-group";
        });
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