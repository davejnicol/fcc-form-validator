const form = document.getElementById("registration-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Run all validations simultaneously so the user sees all errors at once
    const isRequiredValid = checkRequired([username, email, password, confirmPassword]);
    const isUsernameValid = checkLength(username, 3, 15);
    const isEmailValid = checkEmail(email);
    const isPasswordValid = checkLength(password, 6, 30);
    const isPasswordEqual = checkPasswordConfirmation(password, confirmPassword);

    // Form is only valid if every single check passes
    const isFormValid = isRequiredValid && isUsernameValid && isEmailValid && isPasswordValid && isPasswordEqual;

    if (isFormValid) {
        alert("Registration successful!");
        form.reset();
        
        document.querySelectorAll(".form-group").forEach((group) => {
            group.className = "form-group";
        });
    }
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
    if (input.value.trim() === "") return false; // Skip if empty (handled by checkRequired)

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
    if (emailInput.value.trim() === "") return false;

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
    if (input1.value.trim() === "" || input2.value.trim() === "") return false;

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
    small.innerText = message;
}

// UI: Show success state
function showSuccess(input) {
    const formGroup = input.parentElement;
    formGroup.className = "form-group success";
}