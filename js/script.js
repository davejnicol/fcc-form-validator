const form = document.getElementById("registration-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const isRequiredValid = checkRequired([username,email,password,confirmPassword]);

    let isFormValid = isRequiredValid;

    if(isRequiredValid) {
        const isUsernameValid = checkLength(username,3,15);
        const isEmailValid = checkEmail(email);
        const isPasswordValid = checkLength(password,6,30);
        const isPasswordEqual = checkPasswordConfirmation(password,confirmPassword);

        isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isPasswordEqual;
    }

    if (isFormValid) {
        alert("Registration successful!");
        form.reset();
        
        document.querySelectorAll(".form-group").forEach((group) => {
            group.className = "form-group";
        });
    }
});

// Checked that all required fields have value
function checkRequired(inputArray) { 
    let isValid = true;

    inputArray.forEach(input => {
        if(input.value.trim() === "") {
            showError(input, `${formatFieldName(input)} is required`);
            isValid = false;
        } else {
            showSuccess(input);
        }
    })

    return isValid;
}

// Format field name with proper capitalization
function formatFieldName(input) { 
    let formattedFieldName = "";

    if(input.id === "confirmPassword") {
        formattedFieldName = input.id.charAt(0).toUpperCase() + input.id.slice(1,7) + " " + input.id.charAt(7).toLowerCase() + input.id.slice(8);
        return formattedFieldName;
    } else {
        formattedFieldName = input.id.charAt(0).toUpperCase() + input.id.slice(1);
        return formattedFieldName;
    }
}

// Further validation run after checking the required fields
// Check length of the input for a min and max
function checkLength(input,min,max) { 
    if(input.value.length < min) {
        showError(input, `${formatFieldName(input)} must be at least ${min} characters`);
        return false;
    } else if(input.value.length > max) {
        showError(input, `${formatFieldName(input)} must be less than ${max} characters`);
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}
// Check the email address is valid beyond browser validation
function checkEmail(email) {
    // Email regex that covers most common email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(emailRegex.test(email.value.trim())) {
        showSuccess(email);
        return true;
    } else {
        showError(email, "Email is not valid");
        return false;
    }
}
// Check that both password input are the same
function checkPasswordConfirmation(input1, input2) {
  if (input1.value !== input2.value) {
    showError(input2, "Passwords do not match");
    return false;
  }
  return true;
}

// Show error messages if input is not valid
function showError(input,message) { 
    const formGroup = input.parentElement;
    formGroup.className = "form-group error";
    const small = formGroup.querySelector("small");
    small.innerText = message;
}
// Show that the input is valid
function showSuccess(input) {
    const formGroup = input.parentElement;
    formGroup.className = "form-group success";
 }