// JS code for index.html

function checkEmail(){
    let email = document.getElementById('email');

    if(!email.value.match(/\S+@\S+/)){
        email.className = "input-fields-incorrect";
        console.log('Please Enter valid email ID');
        return false
    }
    else{
        email.className = "input-fields-correct";
        console.log('Email Check Pass!')
        return true      
    }

}

function checkPassword(){
    let password = document.getElementById('password');

    if(password.value.length < 8){
        password.className = "input-fields-incorrect";
        console.log('Minimum password length should be greater than 7');
        return false
    }
    else{
        password.className = "input-fields-correct";
        console.log('Password Check Pass!');
        return true        
    }

}

const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
const optionsList = document.querySelectorAll(".option");

selected.addEventListener("click", () => {
    optionsContainer.classList.toggle("active");

})

// Looping through the options inside the options list ('User' & 'Staff')
// Whenever any options are clicked, it sets the value to selected value.

optionsList.forEach(i => {
    i.addEventListener("click", () => {
        selected.innerHTML = i.querySelector("label").innerHTML;
        optionsContainer.classList.remove("active");
    });
    
});

function checkUserType(){
    console.log(selected.innerHTML);
    if(selected.innerHTML == "Staff" || selected.innerHTML == "Customer"){
        console.log("User Type pass!");
        return true
    }
    else{
        console.log("Please choose user type!");
        return false
    }
}


function onClick(){
    var1 = checkEmail();
    var2 = checkPassword();
    var3 = checkUserType();
    if(var1 && var2 && var3){
        $("#proceed").attr("disabled", false);
        $("#proceed").css("background-color", "#d40c2d");
        $("#proceed").mouseover(function(){
            $(this).css("background-color", "#6b0e1d");
        }).mouseout(function(){
            $(this).css("background-color", "#d40c2d");
        });
    }
    return false

}

function onClickIssue(){
    if(selected.innerHTML == "Staff"){
        document.location.href="pages/video_chat.html";
    }
    else if(selected.innerHTML == "Customer"){
        document.location.href="pages/customer_service.html";
    }
}


