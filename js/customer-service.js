function onClickVideo(){
    document.location.href="./video_chat.html";
}

const selectedAll = document.querySelectorAll(".selected");

// To keep track of values added to the search box. This will be used later to enable submit button
var lst = [];

selectedAll.forEach(selected => {
    const optionsContainer = selected.nextElementSibling;
    const optionsList = optionsContainer.querySelectorAll(".option");

    selected.addEventListener("click", () => {
        if(optionsContainer.classList.contains("active")){
            optionsContainer.classList.remove("active");
        }
        else{
            let currentActive = document.querySelector(".options-container.active");

            if(currentActive){
                currentActive.classList.remove("active");
            }

            optionsContainer.classList.add("active");
        }

    });

    optionsList.forEach(i => {
        i.addEventListener("click", () => {
            value = i.querySelector("label").innerHTML;
            lst.push(value);
            if(lst.length >= 2){
                $(".proceed").attr("disabled", false);
                $(".proceed").css("background-color", "#d40c2d");
                $(".proceed").mouseover(function(){
                    $(this).css("background-color", "#6b0e1d");
                }).mouseout(function(){
                    $(this).css("background-color", "#d40c2d");
                });
            }
            selected.innerHTML = i.querySelector("label").innerHTML;
            optionsContainer.classList.remove("active");
        });
    });



});








