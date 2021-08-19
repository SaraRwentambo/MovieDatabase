//Including users.json file:
//This is a mini database of 3 users objects 
const users = require("./users.json");

//Database of movies and people
const data = require('./movies.js');

let movies = data.movieObject;
let people = data.peopleObject;

let reviews = require("./reviews.json");

//Initailizing unique id for each review object in the movie database
let nextReviewID = -1;
for(reviewID in reviews){
  if(Number(reviews[reviewID].id) >= nextReviewID){
    nextReviewID = Number(reviews[reviewID].id) + 1;
  }
}

//calculating review Ratings of movies that had reviews
for(item in movies){
    let reviewsList = []; 
    sumOfReviews = 0;
    averageReviews = 0;
    // console.log("here are the movies reviews: ")
    // console.log(movies[item].reviews)
    if(movies[item].reviews.length>0){
        movies[item].reviews.forEach(rev=>{
            reviewsList.push(reviews[rev]);
        });
        // console.log("all the reviews of this movie...");
        // console.log(reviewsList);
    
        reviewsList.forEach(thing=>{
            sumOfReviews += thing.reviewRating;
        });
        //calculating average review of the movie
        // console.log("sum of reviews")
        // console.log(sumOfReviews)
        averageReviews = Number((sumOfReviews/reviewsList.length).toFixed(1))
        movies[item].rating = averageReviews
        //console.log(averageReviews)
        //console.log(movies)
    }
}


function calcAvgRev(someMovie){
    //gathering reviews list
    let reviewsList = [];
    sumOfReviews = 0;
    averageReviews = 0;
    // console.log("here are the movies reviews: ")
    // console.log(movies[someMovie].reviews)
    if(movies[someMovie].reviews.length>0){
        movies[someMovie].reviews.forEach(item=>{
            reviewsList.push(reviews[item]);
    
        });
    }
    
    // console.log("all the reviews of this movie...");
    // console.log(reviewsList);

    //find the sum of each review rating for this movie
    reviewsList.forEach(item=>{
        sumOfReviews += item.reviewRating;
    });
    //calculating average review of the movie
    // console.log("sum of reviews")
    // console.log(sumOfReviews)
    if(reviewsList.length!==0){
        averageReviews = Number((sumOfReviews/reviewsList.length).toFixed(1))
    }
    movies[someMovie].rating = averageReviews
    //console.log(averageReviews)

    return reviewsList;
}

//adding movie reviews to the users reviewed movies
for(rev in reviews){
    users[reviews[rev].reviewer].reviewedMovies.push(reviews[rev].movieTitle)
}

//Send recomendations to to a user's a user follows
function recommendMovie(someUser, someMovieObject){
    users[someUser].followingUsers.forEach(item=>{
        if(users[item].recomendedMovies.includes(movies[someMovieObject.title].title)==false){
            users[item].recomendedMovies.push(movies[someMovieObject.title].title)
        }
    })
}

//recomend movies to the users based on their current reviews
for(user in users){
    users[user].reviewedMovies.forEach(item=>{
        if(users[user].recomendedMovies.includes(movies[item].title)==false){
            users[user].recomendedMovies.push(movies[item].title)
        }
    })
}
//Checking if a user already exists in the system
//INPUT: userObject -> a user Object
//OUTPUT: true (if it already exists in the system), false (if it does not exists)
//Must be unique username
function doesExist(someObject, resourceName){
    let doesExists = false;
    for (item in resourceName){
        if(item == someObject){
            doesExists = true;
        }
    };
    return doesExists;
};

//Check if a user entered a valid username and password
//this is used for the loginUser function in the server
//returns a boolean value (used to verify authentication of user)
function authenticUser(username, password){
    return users.hasOwnProperty(username) && users[username].password == password;
}

//Creating a new user (from an incoming new user)
function createUser(newUser){
    if (!newUser.username || !newUser.password){
       return null; //dont create user
    }
    if(users.hasOwnProperty(newUser.username)){
        return null; //dont create user
    }
    newUser.userType = false;  //new users are Regular by default
    newUser.followingUsers = [];
    newUser.followingPeople = [];
    newUser.recomendedMovies = [];
    newUser.reviewedMovies = [];
    newUser.notifications = [];
    //Add newUser to the database
    users[newUser.username] = newUser;
    console.log(users);

    return users[newUser.username];
}

//Helper function that checks if the requesting user can access a user
/*
INPUT: requestUser-> a user object that tries to access information from another user
        userToBeFound
OUTPUT: the found user (or else return nothing)
CONSTRAINTS:
    -if requesting themselves or requesting a user they follow, then they can access that information
    -returns the object instead of true/false in order to reduce code
*/

function canAccessUser(requestUser, userToBeFound){
    if (requestUser.username == userToBeFound.username || requestUser.followingUsers.includes(userToBeFound)){
        console.log(users[userToBeFound])
        return users[userToBeFound];
    }
    console.log("error");
    return null;
}

//getUser function 
/*
INPUT:
-RequestUser -> user object trying to get another user; assumed to be a logged-in user.
-userRequested -> another user object that RequestUser is trying to access
OUTPUT:
-user which RequestUser accessed
CONSTRAINTS: the requesting user must be logged in, and the user they request must be in the system; Can either be themselves (ie. viewing their own profile page) or a user they are following
*/
function getUser(requestUser, userRequested){
    if (!doesExist(requestUser, users)){  //check if user is logged in
        console.log("user doesnt exist");
        return null;
    }
    if (doesExist(userRequested, users)){  //check if the user they request is also in the database
        //implement helper function to check if they are allowed to get userRequested
        return canAccessUser(requestUser, userRequested);
    }
    console.log("Unknown user");
    return null;
}

/*
Serching for other users and returning an array of users they can access
INPUT:
-requestUser -> user object that is logged in
-searchString -> string the requestUser searched for, that contains the user ID of another user object
OUTPUT:
-array containing the user ID matching searchString
*/

function searchUsers(requestUser, searchString){
    let searchUserResults = [];

    if(!doesExist(requestUser, users)){ //if requesting user doesn't exist in system return empty array
        return searchUserResults;
    }
    for (username in users){ 
        let userInSystem = users[username]; //instance of some user in the database
        //check if searchString is matched (case insensitive)
        if(userInSystem.username.toUpperCase().indexOf(searchString.toUpperCase()) >= 0){                 
            //implement helper function
            if(canAccessUser(requestUser, username) != null){ 
                searchUserResults.push(userInSystem);
            }
        }
    }
    return searchUserResults;
}


//Requesting user follows another user
/*
INPUT: requestUser -> user object in the system
       followUser  -> another user object that requestUser is trying to follow
OUTPUT: the user they followed
*/
function followingThisUser(requestUser, followUser){
    if (!users.hasOwnProperty(requestUser) && !users.hasOwnProperty(followUser)){
        return null;
    }
    if (users[requestUser].followingUsers.includes(followUser)){
        return null;
    }
    users[requestUser].followingUsers.push(followUser);  //add followUser object to requestUser's following list
    console.log(users[followUser].username);
    return users[followUser].username;
}
//followingThisUser("Sally", "Akini");
//A Requesting user unfollows one of the users in their followingUsers array
/*
INPUT: requestUser -> user object in the system
       unfollowUser  -> another user object that requestUser is trying to unfollow
OUTPUT: nothing
*/
function unfollowThisUser(requestUser, unfollowUser){
    if (!users.hasOwnProperty(requestUser) && !users.hasOwnProperty(unfollowUser)){
        return;
    }
    if (!(users[requestUser].followingUsers.includes(unfollowUser))){
        return;
    }
    for(let i=0; i<users[requestUser].followingUsers.length; i++){
        if (users[requestUser].followingUsers[i] === unfollowUser){
            users[requestUser].followingUsers.splice(users[requestUser].followingUsers[i],1);
        }
    }
    console.log(users[requestUser]);
    return users[unfollowUser].username;
}

//Changing User's account type 
//INPUT: a requesting user object
//OUTPUT: the requested user object's new account type
//Must be a user logged in to the system
function toggleUserType(requestUser){
    if(!doesExist(requestUser, users)){
        console.log("does not exist");
        return null;
    }
    if (users[requestUser].userType == false){
        console.log("Before: " + users[requestUser].userType);
        console.log(users[requestUser]);
        users[requestUser].userType = true;
    }
    else if (users[requestUser].userType == true){
        console.log("Before: " + users[requestUser].userType);
        console.log(users[requestUser]);
        users[requestUser].userType = false;
    }    
    console.log("After: " + users[requestUser].userType);
    console.log(users[requestUser])
    return users[requestUser];
}

//Send recomendations to to a user's a user follows
function recommendMovie(someUser, someMovieObject){
    users[someUser].followingUsers.forEach(item=>{
        if(users[item].recomendedMovies.includes(movies[someMovieObject.title].title)==false){
            users[item].recomendedMovies.push(movies[someMovieObject.title].title)
        }
    })
}

//Send notifications to all the users if adds a person that they follow
// is added to a new or existing movie
function notification(someMovieObject){
    for(user in users){
        someMovieObject.actors.forEach(a=>{
            users[user].followingPeople.forEach(peopleTheyFollow=>{
                if(peopleTheyFollow == a){
                    if(users[user].notifications.includes(movies[someMovieObject.title].title)==false){
                        users[user].notifications.push(movies[someMovieObject.title].title);
                    }
                }
            })
        });
        someMovieObject.writers.forEach(w=>{
            users[user].followingPeople.forEach(peopleTheyFollow=>{
                if(peopleTheyFollow == w){
                    if(users[user].notifications.includes(movies[someMovieObject.title].title)==false){
                        users[user].notifications.push(movies[someMovieObject.title].title);
                    }
                }
            })
        });
        someMovieObject.director.forEach(d=>{
            users[user].followingPeople.forEach(peopleTheyFollow=>{
                if(peopleTheyFollow == d){
                    if(users[user].notifications.includes(movies[someMovieObject.title].title)==false){
                        users[user].notifications.push(movies[someMovieObject.title].title);
                    }
                }
            })
        });
    }
}


//GET/movies/:movie
//gets a movie, returns null if movie or requesting user doesnt exist
function getMovie(requestUser, requestMovie){
    if(!doesExist(requestUser, users)){
        console.log("user doesnt exist.");
        return null;
    }
    if(doesExist(requestMovie, movies)){
        return movies[requestMovie];
    }
    console.log("Sorry. This movie does not exist.");
    return null;
}
// console.log("----------------- TESTING getMovie()------------------------------")
// getMovie("Toy Story");


//creating a new movie
//INPUT: requestUser -> the logged in user creating a new movie
//       newMovie -> a new movie object that has 
function createMovie(requestUser, newMovie){
    if(!doesExist(requestUser, users) || users[requestUser].userType==false){
        console.log("Sorry. You are not authorized to create a new movie.");
        return null;
    }
    console.log("You are authorize to make a new movie! Processing...");

    if(movies.hasOwnProperty(newMovie.title)){
        console.log("Cannot Create this movie because already exists.");
        return null;
    }
    newMovie.director.split(', ').forEach(d=>{
        if(people.hasOwnProperty(d)){ //if the pesrson is already created
            if((people[d].movies.includes(newMovie.title))==false){
                people[d].movies.push(newMovie.title); //add this movie to new persons movie list
            }
            //update type of person (eg. if they acted in one movie and directed in another)
            if(people[d].type.director==false){
                people[d].type.director=true;
            }
            //console.log(people[d])
        }else{
            let tempPerson = {}; //creating the people object
            tempPerson.name = d;
            tempPerson.movies = [newMovie.title];
            tempPerson.type = {actor: false, director: true, writer: false}
            people[d] = tempPerson;
            //console.log(people[d])
        }
    });    
    newMovie.writers.split(', ').forEach(w=>{
        if(people.hasOwnProperty(w)){ //if the pesrson is already created
            if((people[w].movies.includes(newMovie.title))==false){
                people[w].movies.push(newMovie.title); //add this movie to new persons movie list
            }
            //update type of person (eg. if they acted in one movie and directed in another)
            if(people[w].type.writer==false){
                people[w].type.writer=true;
            }
            //console.log(people[w])
        }else{
            let tempPerson = {}; //creating the people object
            tempPerson.name = w;
            tempPerson.movies = [newMovie.title];
            tempPerson.type = {actor: false, director: false, writer: true}
            people[w] = tempPerson;
            //console.log(people[w])
        }
    });
    newMovie.actors.split(', ').forEach(a=>{
        if(people.hasOwnProperty(a)){ //if the pesrson is already created
            if((people[a].movies.includes(newMovie.title))==false){
                people[a].movies.push(newMovie.title); //add this movie to new persons movie list
            }
            //update type of person (eg. if they acted in one movie and directed in another)
            if(people[a].type.actor==false){
                people[a].type.actor=true;
            }
            //if the requesting user has following users, send a notification all of their
            //following users if the people they follow contain this person.
            //send notification to following requestUser's following users           
            //console.log(people[a])
        }else{
            let tempPerson = {}; //creating the new people object
            tempPerson.name = a;
            tempPerson.movies = [newMovie.title];
            tempPerson.type = {actor: true, director: false, writer: false}
            people[a] = tempPerson;
            //console.log(people[a])
        }
    });
    //creating movie object
    let tempNewMovie = {};
    tempNewMovie.title = newMovie.title;
    tempNewMovie.rating = 0;
    tempNewMovie.year = "";
    tempNewMovie.releaseDate = "";
    tempNewMovie.runtime = "";
    tempNewMovie.genre = [];
    tempNewMovie.plot = "";
    tempNewMovie.actors = newMovie.actors.split(", ");
    tempNewMovie.director = newMovie.director.split(", ");
    tempNewMovie.writers = newMovie.writers.split(", ");
    tempNewMovie.poster = "";
    tempNewMovie.similar = [];
    tempNewMovie.reviews = [];
    tempNewMovie.added = true;
    movies[newMovie.title] = tempNewMovie;      //Add the new created movie object into the database
    console.log(movies[newMovie.title]);
    //send notification to this following user
    notification(tempNewMovie);

    //recomend this new movie to the requesting user's following users (if not recomended already)
    recommendMovie(requestUser, newMovie);

    return movies[newMovie.title].title;
}

// console.log("Testing createMovie()...");
// createMovie("Akini", {director:"Amy", actors:"john", writers:"Amy", title:"Boogie Bear"});
// console.log(users["Sally"])


//console.log(movies);
//console.log(people);


function createPeople(requestUser, newPerson){
    let newPeopleList = [];
    if(!doesExist(requestUser, users) || users[requestUser].userType==false){
        console.log("Sorry. You are not authorized to add a new person.");
        return null;
    }
    console.log("You are authorize to add a new person! Processing...");
    if(newPerson.director){
        newPerson.director.split(', ').forEach(d=>{
            if(people.hasOwnProperty(d)){ //if the pesrson is already created
                console.log("Sorry. Cannot add this person because they already exist.");
            }else{
            let tempPerson = {}; //creating the people object
            tempPerson.name = d;
            tempPerson.movies = [];
            tempPerson.type = {actor: false, director: true, writer: false}
            tempPerson.collabs = []
            people[d] = tempPerson;
            newPeopleList.push(d);
            }
        });
    }
    if(newPerson.writers){
        newPerson.writers.split(', ').forEach(w=>{
            if(people.hasOwnProperty(w)){ //if the pesrson is already created
                console.log("Sorry. Cannot add this person because they already exist.");
            }else{
            let tempPerson = {}; //creating the people object
            tempPerson.name = w;
            tempPerson.movies = [];
            tempPerson.type = {actor: false, director: false, writer: true}
            tempPerson.collabs = []
            people[w] = tempPerson;
            newPeopleList.push(w);
            }
        });
    }
    if(newPerson.actors){
        newPerson.actors.split(', ').forEach(a=>{
            if(people.hasOwnProperty(a)){ //if the pesrson is already created
                console.log("Sorry. Cannot add this person because they already exist.");
            }else{
            let tempPerson = {}; //creating the people object
            tempPerson.name = a;
            tempPerson.movies = [];
            tempPerson.type = {actor: true, director: false, writer: false}
            tempPerson.collabs = []
            people[a] = tempPerson;
            newPeopleList.push(a);
            }
        });
    }
    //console.log(newPeopleList)
    return newPeopleList;
}
// console.log("Testing createPerson()...");
// createPeople("Akini", {director:"Ashly", actors:"Timmy"});
// console.log(people);


//edit movie function
//takes in a new movie created by a contributing user
// the existing new movie and posts the modified movie
//returns the modified version of that new movie --> this will be sent to the get the movie page
function editMovie(requestUser, movieRequested){
    if(!doesExist(requestUser, users) || users[requestUser].userType==false){
        console.log("Sorry. You are not authorized to edit this movie.");
        return null;
    }
    console.log(movieRequested)
    if(movies.hasOwnProperty(movieRequested.title)){
        console.log("before editing movie:");
        console.log(movies[movieRequested.title]);

        movies[movieRequested.title].releaseDate = movieRequested.releaseDate;
        movies[movieRequested.title].runtime = movieRequested.runtime;
        if (movieRequested.genre.length!==0){
            movies[movieRequested.title].genre = movieRequested.genre.split(", ");
        }else{
            movies[movieRequested.title].genre = "";
        }

        movies[movieRequested.title].plot = movieRequested.plot;
        movies[movieRequested.title].actors = movieRequested.actors.split(", ");
        for(let i of movies[movieRequested.title].actors){
            if(people.hasOwnProperty(i)==false){
                console.log("Sorry. Can only add people who already exist.");
                return null;
            }
        }
        movies[movieRequested.title].director = movieRequested.director.split(", ");
        for(let i of movies[movieRequested.title].director){
            if(people.hasOwnProperty(i)==false){
                console.log("Sorry. Can only add people who already exist.");
                return null;
            }
        }
        movies[movieRequested.title].writers = movieRequested.writers.split(", ");
        for(let i of movies[movieRequested.title].writers){
            if(people.hasOwnProperty(i)==false){
                console.log("Sorry. Can only add people who already exist.");
                return null;
            }
        }
        movies[movieRequested.title].poster = "";
        movies[movieRequested.title].added = true;
        //console.log(movies[movieRequested.title])
    }
    //recomend the movie edited to user's following users (if not recomended already)
    recommendMovie(requestUser, movieRequested)

    return movies[movieRequested.title];    
}


// console.log("Testing createMovie()...");
// createMovie("Akini", {director:"Joe Johnston, Amy", actors:"Tim Allen", writers:"John Lasseter", title:"Boogie Bear"});

// console.log("New movie Before:")
// console.log(movies);

// console.log("Testing editMovie()...");
// editMovie("Akini", {title: "Boogie Bear",
//                     director:"monica", 
//                     actors:"Tim Allen", 
//                     writers:"John Lasseter", 
//                     releaseDate: "June 20, 2020", 
//                     genre: "Thriller, Comedy", 
//                     plot: "Bear on the loose at Carleton University during COVID-19!!!!",
//                     runtime:"100 min"});

// console.log("New movie After:")
//console.log(movies);
//console.log(people);

// function searchMovies(requestUser, searchString){
//     let byTitle = {};
//     let byGenre = {};
//     let byYear = {};
//     //let byMinRate = {};
//     movies.forEach(m=>{
//         byTitle[m.title.toUpperCase()] = 1;
//         byGenre[m.genre.toUpperCase()] = 1;
//         byYear[m.year.toUpperCase()] = 1;
//     });
// }

//These are for searching purposes
let byTitle = {};
let byGenre = {};
let byYear = {};
for(m in movies){
    byTitle[movies[m].title.toUpperCase()] = 1;
    movies[m].genre.forEach(g=>{
        byGenre[g.toString().toUpperCase()] = 1;
    })
    byYear[movies[m].year] = 1;
};
genreList = [];
for(item in byGenre){
    genreList.push(item)
}

//getting people's profiles
function getPerson(requestUser, personRequested){
    if (!doesExist(requestUser, users)){  //check if user is exist
        console.log("user doesnt exist");
        return null;
    }
    if (doesExist(personRequested, people)){  //check if the person they request is also in the database
        return people[personRequested];
    }
    console.log("Unknown person");
    return null;
}

// console.log("Testing getPerson()...");
// getPerson("Sally", "Tim");

function determineRole(person){
    if(people[person].type.writer==true && people[person].type.actor==true && people[person].type.director==true){
        return "Actor, Writer, and Director";
    }
    else if(people[person].type.actor==true && people[person].type.director==true ){
        return "Actor & Director";
    }
    else if(people[person].type.actor==true && people[person].type.writer==true ){
        return "Actor & Writer";
    }
    else if(people[person].type.writer==true && people[person].type.director==true ){
        return "Writer & Director";
    }
    else if(people[person].type.actor==true){
        return "Actor";
    }
    else if(people[person].type.writer==true){
        return "Writer";
    }
    else{
        return "Director";
    }
}


//Searching people
function searchPeople(requestUser, searchString){
    let searchPeopleResults = [];

    if(!doesExist(requestUser, users)){ //if requesting user doesn't exist in system return empty array
        return searchPeopleResults;
    }
    for (names in people){ 
        let peopleInSystem = people[names]; //instance of some person in the database
        //check if searchString is matched (case insensitive)
        if(peopleInSystem.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0){
            searchPeopleResults.push(peopleInSystem);             
        }
    }
    return searchPeopleResults;
}

//follow a person
function followingThisPerson(requestUser, followPerson){
    if (!users.hasOwnProperty(requestUser) && !people.hasOwnProperty(followPerson)){
        return null;
    }
    if (users[requestUser].followingPeople.includes(followPerson)){
        return null;
    }
    users[requestUser].followingPeople.push(followPerson);  //add followPerson object to requestUser's following list
    console.log(people[followPerson].name);
    return people[followPerson].name;
}

//unfollow a person
function unfollowThisPerson(requestUser, unfollowPerson){
    if (!users.hasOwnProperty(requestUser) && !people.hasOwnProperty(unfollowPerson)){
        return;
    }
    if (!(users[requestUser].followingPeople.includes(unfollowPerson))){
        return;
    }
    for (let i=0; i<users[requestUser].followingPeople.length; i++){
        if (users[requestUser].followingPeople[i] === unfollowPerson){
            users[requestUser].followingPeople.splice(users[requestUser].followingPeople[i],1);
        }
    }
    return people[unfollowPerson].name;
}

//make a movie review
function newMovieReview(requestUser, newReview){
    if(!doesExist(newReview.title, movies) || !doesExist(requestUser, users)){
        console.log("User or Movie does not exist.")
        return null;
    }
    //console.log(users[requestUser].username+ " is making a reivew for "+movies[newReview.title].title)

    //console.log("Movie before review: ")
    //console.log(movies[newReview.title]);

    tempNewReview = {};
    tempNewReview.id = nextReviewID;
    tempNewReview.movieTitle = newReview.title;
    tempNewReview.reviewer = requestUser;
    tempNewReview.fullReview = newReview.full;
    tempNewReview.summary = newReview.short;
    tempNewReview.reviewRating = Number(newReview.rating)
    
    //add the new review to the reviews object
    reviews[nextReviewID]= tempNewReview;
    nextReviewID++;
    //add the new review to the movies reviews
    movies[newReview.title].reviews.push(tempNewReview.id);
    //add the movie the the list of requestUser's reviewedMovies list
    if(users[requestUser].reviewedMovies.includes(tempNewReview.movieTitle)==false){
        users[requestUser].reviewedMovies.push(tempNewReview.movieTitle)
    }
    // console.log("Movie after review: ")
    // console.log(movies[newReview.title]);

    //send notification to following requestUser's following users
    if(users[requestUser].followingUsers.length!==0){
        users[requestUser].followingUsers.forEach(item=>{
            //console.log("This is the item")
            //console.log(item)
            users[item].notifications.push(movies[newReview.title].title);
            //recomend this movie to the following users if they havent already
            if(users[item].recomendedMovies.includes(movies[newReview.title].title)==false){
                users[item].recomendedMovies.push(movies[newReview.title].title)
            }
        });    
    }

    calcAvgRev(newReview.title) //recalculate the movie's average review
    
    //recomend this movie to the requesting user (if not recomended already)
    recommendMovie(requestUser, newReview);

    //return the new movie review
    // console.log("printing the new review object")
    // console.log(reviews[tempNewReview.id])
    return reviews[tempNewReview.id]
}

// console.log("Testing newMovieReview() : ")
// newMovieReview("Akini", {title:"Toy Story", 
//                         short: "Great Family Film :)", 
//                         full: "Adventurous!",
//                         rating: '8'});

//console.log(users["Sally"])
//console.log(users["Akini"])

//console.log(reviews)
//console.log(movies)

//function that makes movie recomendations to a user based on the movie they reviewed and the people that
//they follow



console.log("-----------------------------------END OF TESTING ----------------------------------------------");

module.exports = {
    users,
    people,
    movies,
    reviews,
    calcAvgRev,
    doesExist,
    authenticUser,
    createUser,
    canAccessUser,
    getUser,
    searchUsers,
    followingThisUser,
    unfollowThisUser,
    toggleUserType,
    createMovie,
    getMovie,
    byTitle,
    byGenre,
    byYear,
    editMovie,
    newMovieReview,
    createPeople,
    searchPeople,
    getPerson,
    determineRole,
    followingThisPerson,
    unfollowThisPerson
}