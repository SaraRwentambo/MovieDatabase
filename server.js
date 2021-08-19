const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
let app = express();

//require the business logic for users
const model = require('./logic-model.js');

//for displaying JSON data
app.use(express.json());

//for parsing text content-type of request bodies
app.use(bodyParser.text());

//Using middleware for creating sessions for users.
//secret: a random security code that validates an incoming request that is stored in the cookie
//cookie: an Object that has maxAge that expires after 3,600,000ms (1 hour)
app.use(session({secret: 'ABCDEFGHIJKLMNOP', cookie:{maxAge: 3600000}}));

//use the public directory
app.use(express.static('public'));
app.set("view engine", "pug");
app.use(express.urlencoded({extended: true}));

//for testing if session works
app.use("/", function(req, res, next){
    console.log(req.session);
    next();
})
//----------------------------- / Error Handling /-------------------------------------------------------


//-----------------------------------------/ Routes for Rendering Pages /----------------------------------------------------------

//This route just makes sure that the first page they see is the welcome page of the web app
app.get("/", function (req, res){
    res.status(200).render('Welcome.pug',{session:req.session});
    
});
//Login page
app.get("/loginPage", function (req, res){
    res.status(200).render('loginForm.pug',{session:req.session});
});
//Sign-up page
app.get("/signupPage", function (req, res){
    res.status(200).render('signupForm.pug',{session:req.session});
});
app.get("/contProfilePage", function (req, res){
    res.status(200).render('contributeUser.pug',{session:req.session});
});
app.get("/moviePage", function (req, res){
    res.status(200).render('viewMovie.pug',{session:req.session});
});
app.get("/peoplePage", function (req, res){
    res.status(200).render('viewPeople.pug',{session:req.session});
});
app.get("/notifications", notificationsPage);

app.get("/logout", logOut);


//Routes for the Navigation Bar:

app.get("/home", function(req, res){    //home page when a user logs in
    res.status(200).render("Home.pug",{session:req.session});
});
app.get("/searchUsers", function(req, res){ //Page for searching for users
    res.status(200).render("searchUsers.pug",{session:req.session});
});
app.get("/searchMovies", function(req, res){    //page for searching for movies
    res.status(200).render("searchMovies.pug",{session:req.session});
});
app.get("/searchPeople", function(req, res){    //page for searching for people
    res.status(200).render("searchPeople.pug",{session:req.session});
});


//-------------------------------------------/ Functionality Routes /------------------------------------------------


//Routes for Users:
app.get("/users/:userID", readUser);
app.get("/users", searchingUsers);
app.post("/loginUser", loginUser);
app.post("/users", signupUser, loginUser); //uses middleware chaining
app.post("/upgrade", updateAccount);
app.post("/followUser", friendUser);
app.post("/unfollowUser", unfriendUser);


//Routes for Movies:
app.get("/movies/:movieID", readMovie);
app.get("/movies", parseMovieQuery, searchingMovies); //uses middleware chaining
app.post("/movies", addMovie)
app.get("/editMoviePage/:movieID", editMoviePage)
app.post("/editMovie", editMovie);
app.get("/advancedSearch", advMovieSearch);
app.post("/addReview", addReview)


//Routes for people:
app.get("/people", searchingPeople);
app.get("/people/:peopleID", readPerson);
app.post("/followPerson", friendPerson);
app.post("/unfollowPerson", unfriendPerson);
app.post("/people", addPeople);


//---------------------------------------/ Functionality API /------------------------------------------------------


//function checks if the user is logged in or not
//see POST/loginUser
//CLIENT: If user is not logged in yet and provided valid username/password, send a post request to 
///'/loginUser' route and redirect user to their profile page
//model.authenticUser : a boolean value that checks if the user has entered correct username/password
///SERVER: if false -> send 404 message; else send 200 response and redirect to profile page at /users/:userID
function loginUser(req, res){
    if(session.loggedIn == true){ 
        res.send("Already logged in!");
    }else{
        let loggingUser = req.body; //info from the loginForm.pug form
        console.log(loggingUser.username + " is trying to login...");

        //check if the loggingUser exists in the system
        if(model.authenticUser(loggingUser.username, loggingUser.password)){
            console.log("Valid logging user! Logging in " + loggingUser.username);
            console.log("match username");
            req.session.username = loggingUser.username //match the session with a the loggingUser
            console.log("set loggedIn = true");
            req.session.loggedIn = true;  //set this user's loggedin session to true
            console.log("redirecting to your profile page...")
            res.status(200).redirect(`users/${loggingUser.username}`);
        }
        else{
            console.log("Invalid");
            res.status(401).send("Sorry. Inccorrect username or password. Please try again.");
        }
    }
}

//logs out a user and destroys the session-user association
//now user must log back in to have access to database
//see GET/logOut
function logOut(req, res){
    req.session.destroy();  //delete the session after user logs out
    console.log("cookie distroyed");
    res.redirect("/");      //redirect them to the welcome page
    console.log('redirecting to page');
}

function notificationsPage (req, res){
    let notifications = model.users[req.session.username].notifications;
    res.status(200).render('notifications.pug',{notifications: notifications, session:req.session});
}



//Creating a new User
//CLIENT: see POST/users
//information from the signinForm.pug at the /signupPage route is sent to server
//SERVER: sends a 401 respose code if username/password are null or already exist
//middleware chaning to loginUser function (to redirect new User to their profile page)
function signupUser(req, res, next){
    let newUser = req.body;     //info from the signinForm.pug
    //assume that request body contains the new user info (username/password) 
    //this will come from a signup form
    console.log("Trying to create the user: "+ newUser.username + "...");
    let result = model.createUser(newUser); //represents the body contents of the request from the client
    console.log(result);
    if(result == null){
        res.status(401).send("Invalid User, or user aldready exists. Please try again.");
        return;
    }else{
        next();
        return;
    }
};

//Reading users
//see GET/users/:userID
//SERVER or CLIENT: get a specific user using parameterized route
//SERVER: sends 200 resopnse and html web page or json if found
//SERVER: sends 404 response code if user not found
function readUser(req, res){
    console.log("Getting the user named: " + req.params.userID + "...");
    let result = model.getUser(req.session.username, req.params.userID);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(404).send("Unknown user.");
            }else if (req.session.username != result.username){
                console.log("Different User");
                res.status(200).render("otherUser.pug",{otherUser: result, 
                                                        followUsers: model.users[req.session.username].followingUsers, 
                                                        followPeople: model.users[result.username].followingPeople,
                                                        session: req.session});
            }else if (result.userType == true){
                res.status(200).render("contributeUser.pug",{followUsers: model.users[req.session.username].followingUsers, 
                                                            followPeople: model.users[req.session.username].followingPeople,
                                                            recommend: model.users[req.session.username].recomendedMovies,
                                                            session: req.session});
            }else{
                console.log("Same user");
                res.status(200).render("regularUser.pug",{followUsers: model.users[req.session.username].followingUsers,
                                                        followPeople: model.users[req.session.username].followingPeople,
                                                        recommend: model.users[req.session.username].recomendedMovies,
                                                        session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(404).send("Unknown user.");
            }else{
                res.status(200).json(result);
            }
        }
    })
};

function updateAccount(req, res){
    console.log("Updating user's account...");
    let changeAccount = model.toggleUserType(req.session.username);
    if(changeAccount==null){
        res.status(404).send("Unknown user.");
    }
    else{
        req.session.userType = changeAccount.userType;
        console.log("redirecting to your profile page...")
        res.status(200).redirect(`users/${changeAccount.username}`);
    }
};

function friendUser(req, res){
    let followingUser =  req.body;              //info from the AJAX request
    console.log("Following " + followingUser + "...");
    let afterFriending = model.followingThisUser(req.session.username, followingUser);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(afterFriending == null){
                res.status(404).json("Unknown User");
            }else{
                res.status(200).json(afterFriending);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(afterFriending == null){
                res.status(404).json("Unknwon User");
            }else{
                res.status(200).json("Successfully followed " + followingUser)
            }
        }
    })
};

function unfriendUser(req, res){
    let unfollowingUser =  req.body;              //info from the AJAX request
    console.log("Unfollowing " + unfollowingUser + "...");
    let afterUnfriending = model.unfollowThisUser(req.session.username, unfollowingUser);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(afterUnfriending == null){
                res.status(404).json("Unknown User");
            }else{
                res.status(200).json(afterUnfriending);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(afterUnfriending == null){
                res.status(404).json("Unknwon User");
            }else{
                res.status(200).json("Successfully unfollowed " + unfollowingUser)
            }
        }
    })
};

//CLIENT: Searching for other users using query parameter called 'name'
//see GET/users
//result: an array of user objects that match that query string based on username
//SERVER: sends 200 response and html web page or json if found
//SERVER: sends 404 response code if user not found
function searchingUsers(req, res){
    let name = req.query.name;  //info from the searchUsers.pug search bar
    console.log(name);
    let result = model.searchUsers(req.session.username, name);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result.length == null){
                res.status(404).json("Sorry we could not find what you are looking for");
            }else{
                res.status(200).render("FoundUsers.pug",{userArray: result, session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result.length == null){
                res.status(500).json(result);
            }else{
                res.status(200).json(result);
            }
        }
    })
};

function addMovie(req, res){
    console.log("Attempting to add a new movie...");
    let newMovie = req.body;
    let result = model.createMovie(req.session.username, newMovie);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(404).send("Cannot add this movie.");
            }else{
                console.log("Redirecting to this new movie page...");
                res.status(200).redirect(`movies/${result}`);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(404).send("Cannot add this movie.");
            }else{
                res.status(200).json(result);
            }
        }
    })

}

function readMovie(req, res){
    console.log("Getting the movie ID: " + req.params.movieID + "...");
    let result = model.getMovie(req.session.username, req.params.movieID);
    let reviews = model.calcAvgRev(result.title)
    
    let writersList = [];
    result.writers.forEach(w=>{
        let regEXP = /\((.*)\)/;  //regular expression
        writersList.push(w.replace(regEXP,"").trim())
    });
    

    console.log("user Type: "+model.users[req.session.username].userType)
    console.log("Movie added? "+result.added)

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(404).send("Unknown movie.");
            }else{
                console.log("Found Movie");
                res.status(200).render("viewMovie.pug",{movie: result,
                                                        writers: writersList,
                                                        avgRev: averageReviews,
                                                        reviews: reviews,
                                                        userType: model.users[req.session.username].userType,
                                                        similar: result.similar,
                                                        session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(404).send("Unknown movie.");
            }else{
                res.status(200).json(result);
            }
        }
    })
};

function editMoviePage(req, res){
    console.log("Attempting to edit the movie: "+ req.params.movieID+"...");
    let result = model.getMovie(req.session.username, req.params.movieID);
    if(result.genre.length!==0){
        genreList = result.genre.join(', ');
    }else{
        genreList = result.genre
    }
    let directorList = result.director.join(', ');
    let actorsList = result.actors.join(', ');
    let writersList = result.writers.join(', ');

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(401).send("You are not authorized to edit this movie.");
            }else{
                console.log("Found Movie");
                res.status(200).render("editMovie.pug",{movie: result,
                                                        genreList: genreList,
                                                        directorList: directorList,
                                                        actorsList: actorsList,
                                                        writersList: writersList, 
                                                        session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(401).send("You are not authorized to edit this movie.");
            }else{
                res.status(200).json(result);
            }
        }
    })
}

function editMovie(req, res){
    let modMovie = req.body;
    console.log(modMovie);
    console.log("Attempting to edit the movie...");
    let result = model.editMovie(req.session.username, modMovie);
    console.log(result)

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(404).send("Incorrect Edit.");
            }else{
                console.log("Found Movie");
                res.status(200).redirect(`movies/${result.title}`);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(404).send("Incorrect Edit.");
            }else{
                res.status(200).json(result);
            }
        }
    })
}

function parseMovieQuery(req, res, next){
    let byGenre = model.byGenre;
    let byYear = model.byYear;

    req.parameters = {};
    //if the user entered title
    if(req.query.title){
        req.parameters.title = req.query.title.toUpperCase();
        console.log("The movie must have this title.")
    }
    //if user entered genre
    if(req.query.genre && byGenre.hasOwnProperty(req.query.genre.toUpperCase())){
        req.parameters.genre = req.query.genre.toUpperCase();
        console.log("The movie must have this genre.")
    }
    if(req.query.year && byYear.hasOwnProperty(req.query.year)){
        req.parameters.year = req.query.year;
        console.log("The movie must have this year.")
    }
    if(req.query.minRating){
        req.parameters.minRating = Number(req.query.minRating);
        console.log("The movie must have this minRating.")
    }
    console.log("----Organized parameters within req.properParams------")
    console.log(req.parameters);

    next();
    return;
}

function searchingMovies(req, res){
    let matchedMovies = [];
    let movies = model.movies;

    for(item in movies){
        let currentMovie = movies[item];
        let currentMovieGenreList = [];
        if(currentMovie.genre.length!==0){
            currentMovie.genre.forEach(g=>{
                currentMovieGenreList.push(g.toUpperCase())
            }) 
        }
                           
        let foundMovies =
            ((!req.parameters.title) || (currentMovie.title.toUpperCase().indexOf(req.parameters.title)>=0))
            &&
            ((!req.parameters.genre) || (currentMovieGenreList.includes(req.parameters.genre)))
            &&
            ((!req.parameters.year) || (Number(req.parameters.year) === Number(currentMovie.year)))
            &&
            ((!req.parameters.minRating) || (currentMovie.rating >= req.parameters.minRating))
        
        if(foundMovies){
            matchedMovies.push(currentMovie);
        }
    }

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(matchedMovies.length===0){
                console.log("ITS WRONG!!!")
                res.status(404).json("Sorry. Cannot Find this movie.");
            }
            else{
                res.status(200).render("foundMovies.pug", {moviesArray: matchedMovies, session: req.session});  
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(matchedMovies.length===0){
                res.status(404).json("Sorry. Cannot Find this movie.");
            }else{
                res.status(200).json(matchedMovies);  
            }
        }
    });

}

function advMovieSearch(req, res){
    genreList = ["NONE"];
    for(item in model.byGenre){
        genreList.push(item)
    }
    res.status(200).render("advMovieSearch.pug", {genreList: genreList, session: req.session});
}

function addReview(req, res){
    let newReview = req.body;
    console.log(req.session.username+" is makeing writing a review for the movie: "+newReview.title)
    let result = model.newMovieReview(req.session.username, newReview);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result==null){
                res.status(404).json("Sorry. Invalide review.");
            }
            else{
                res.status(200).redirect(`movies/${newReview.title}`)
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result==null){
                res.status(404).json("Sorry. Invalide review.");
            }else{
                res.status(200).json(result);  
            }
        }
    });

}

function addPeople(req, res){
    let newPerson = req.body;
    console.log("Adding a new person/people...");
    let result = model.createPeople(req.session.username, newPerson);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result.length==null){
                console.log("ITS WRONG!!!")
                res.status(404).json("Sorry. Cannot add person/people because they already exist.");
            }
            else{
                res.status(200).redirect(`users/${req.session.username}`)
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result.length==null){
                res.status(404).json("Sorry. Cannot add person/people because they already exist.");
            }else{
                res.status(200).json(result);  //this will be sent as an alert
            }
        }
    });
}

function readPerson(req, res){
    console.log("Getting the person named: " + req.params.peopleID + "...");
    let result = model.getPerson(req.session.username, req.params.peopleID);
    console.log(result)

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result == null){
                res.status(404).send("Unknown person.");
            }
            else{
                res.status(200).render("viewPeople.pug",{personName: result.name,
                                                        role: model.determineRole(result.name),
                                                        works: model.people[result.name].movies,
                                                        collabs: model.people[result.name].collabs,
                                                        followPeople: model.users[req.session.username].followingPeople, 
                                                        session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result == null){
                res.status(404).send("Unknown person.");
            }else{
                res.status(200).json(result);
            }
        }
    })
};
function friendPerson(req, res){
    let followingPerson =  req.body;              //info from the AJAX request
    console.log("Following " + followingPerson + "...");
    let afterFriending = model.followingThisPerson(req.session.username, followingPerson);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(afterFriending == null){
                res.status(404).json("Unknown Person");
            }else{
                res.status(200).json(afterFriending);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(afterFriending == null){
                res.status(404).json("Unknwon Person");
            }else{
                res.status(200).json("Successfully followed " + followingPerson)
            }
        }
    })
};

function unfriendPerson(req, res){
    let unfollowingPerson =  req.body;              //info from the AJAX request
    console.log("Unfollowing " + unfollowingPerson + "...");
    let afterUnfriending = model.unfollowThisPerson(req.session.username, unfollowingPerson);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(afterUnfriending == null){
                res.status(404).json("Unknown Person");
            }else{
                res.status(200).json(afterUnfriending);
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(afterUnfriending == null){
                res.status(404).json("Unknwon Person");
            }else{
                res.status(200).json("Successfully unfollowed " + unfollowingPerson)
            }
        }
    })
};

function searchingPeople(req, res){
    let name = req.query.name;  //info from the searchUsers.pug search bar
    console.log(name);
    let result = model.searchPeople(req.session.username, name);

    //for REST API
    res.format({
        'text/html': function(){
            console.log("Requesting HTML:");
            if(result.length==null){
                res.status(404).json("Sorry We could not find what you are looking for");
            }else{
                res.status(200).render("FoundPeople.pug",{peopleArray: result, session: req.session});
            }
        },
        'application/json':function(){
            console.log("Requesting JSON:");
            if(result.length==null){
                res.status(404).json(result);
            }else{
                res.status(200).json(result);
            }
        }
    })
};

//listen at port 3000
app.listen(3000);
console.log("Server listening at http://localhost:3000");