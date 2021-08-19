//------------USERS--------------------------------------------------------


function followingUserButton(){
  let thisUserName = document.getElementById("userName").innerHTML;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.responseText);

      let buttonText = document.getElementById("followUser");
      buttonText.innerHTML = "Unfollow";
      buttonText.style.background = "rgb(163, 8, 8)";
      buttonText.style.color = "white";
      
      window.location.reload();
    }
  }
  req.open("POST", `/followUser`); 
  req.send(thisUserName);
}
    
function unfollowingUserButton(){
  let thisUserName = document.getElementById("userName").innerHTML;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.responseText);

      let buttonText = document.getElementById("unfollowUser"); 
      buttonText.innerHTML = "Follow";
      buttonText.style.background = "rgb(110, 195, 25)"
      buttonText.style.color = "black";
      window.location.reload();
    }
  }
  req.open("POST", `/unfollowUser`);
  req.send(thisUserName);
}

//-----------------MOVIES-----------------------------------------
function writeReview() {
  let reviewForm = document.getElementById("newR");
  if (reviewForm.style.display === "none") {
    reviewForm.style.display = "block";
  } else {
    reviewForm.style.display = "none";
  }
}

//----------------PEOPLE--------------------------------------------
function followingPersonButton(){
  let thisPersonName = document.getElementById("personName").innerHTML;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.responseText);

      let buttonText = document.getElementById("followPerson");
      buttonText.innerHTML = "Unfollow";
      buttonText.style.background = "rgb(163, 8, 8)";
      buttonText.style.color = "white";
      
      window.location.reload();
    }
  }
  req.open("POST", `/followPerson`); 
  req.send(thisPersonName);
}
    
function unfollowingPersonButton(){
  let thisPersonName = document.getElementById("personName").innerHTML;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      console.log(this.responseText);

      let buttonText = document.getElementById("unfollowPerson"); 
      buttonText.innerHTML = "Follow";
      buttonText.style.background = "rgb(110, 195, 25)"
      buttonText.style.color = "black";
      window.location.reload();
    }
  }
  req.open("POST", `/unfollowPerson`);
  req.send(thisPersonName);
}
