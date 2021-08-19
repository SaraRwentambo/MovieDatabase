//Including movie-data-short.json
//converting JSON movies into JS objects
let arrMovies = require("./movie-data-short.json");
let arrMoviesString = JSON.stringify(arrMovies);
let movieData = JSON.parse(arrMoviesString);

let reviewData = require("./reviews.json")

//Initailize a unique number id for each movie object in the movie database
for(let i=0; i<movieData.length; i++){
    idNum = 0;
    movieData.forEach(obj=>{
        obj.id = idNum;
        idNum++;
    });
}


let movieObject = {};  //change to moviesObject later
let peopleObject = {}; //have a type field that has director, writer, actor
                        //have array of movies they worked on
                        //could have a link for a picture of an actor
                        //could have have a link to imdb api

movieData.forEach(m=>{

    //for making a movie object
    let tempMovie = {};
    tempMovie.id = m.id;
    tempMovie.title = m.Title;
    tempMovie.rating = 0;
    tempMovie.year = m.Year;
    tempMovie.releaseDate = m.Released;
    tempMovie.runtime = m.Runtime;
    tempMovie.genre = m.Genre.split(', ');
    tempMovie.plot = m.Plot;
    tempMovie.actors = m.Actors.split(", ");
    tempMovie.director = m.Director.split(", ");
    tempMovie.writers = m.Writer.split(", ");
    tempMovie.poster = m.Poster;
    tempMovie.similar = [];
    tempMovie.reviews = [];
    for(item in reviewData){
        if(reviewData[item].movieTitle == m.Title){
            tempMovie.reviews.push(reviewData[item].id);
        }
    }
    
    //for making a people object
    m.Actors.split(', ').forEach(a=>{
        //console.log(peopleObject[a]);
        if(peopleObject.hasOwnProperty(a)){ //if the object is already created
            //add current movie to array of movies
            // console.log(peopleObject[a]);
            if((peopleObject[a].movies.includes(m.title))==false){
                peopleObject[a].movies.push(m.Title);
            }
            //update type of person (eg. if they acted in one movie and directed in another)
            if(peopleObject[a].type.actor==false){
                peopleObject[a].type.actor=true;
            }
        }else{
            let tempPeople = {}; //creating the people object
            tempPeople.name = a;
            tempPeople.movies = [m.Title];
            tempPeople.type = {actor: true, director: false, writer: false}
            tempPeople.collabs = [];
            peopleObject[a] = tempPeople;
        }
    });
    m.Director.split(', ').forEach(d=>{
        //console.log(d);
        if(peopleObject.hasOwnProperty(d)){ //if the object is already created
            //add current movie to array of movies
            if((peopleObject[a].movies.includes(m.title))==false){
                peopleObject[d].movies.push(m.Title);
            }
            //update type of person (eg. if they acted in one movie and directed in another)
            if(peopleObject[d].type.director==false){
                peopleObject[d].type.director=true;
            }
        }else{
            let tempPeople = {}; //creating the people object
            tempPeople.name = d;
            tempPeople.movies = [m.Title];
            tempPeople.type = {actor: false, director: true, writer: false}
            tempPeople.collabs = [];
            peopleObject[d] = tempPeople;
        }
    });
    m.Writer.split(', ').forEach(w=>{
        let regEXP = /\((.*)\)/;
        let writer = w.replace(regEXP,"").trim();
        // console.log("This is the Writer");
        // console.log(writer);
        if(peopleObject.hasOwnProperty(writer)){ //if the object is already created
            //add current movie to array of movies
            //update type of person (eg. if they acted in one movie and directed in another)
            if(peopleObject[writer].movies.includes(m.Title)==false){
                peopleObject[writer].movies.push(m.Title);
            }
            if(peopleObject[writer].type.writer==false){
                peopleObject[writer].type.writer=true;
            } 
        }else{
            let tempPeople = {}; //creating the people object
            tempPeople.name = writer;
            tempPeople.movies = [m.Title];
            tempPeople.type = {actor: false, director: false, writer: true}
            tempPeople.collabs = [];
            peopleObject[writer] = tempPeople;
        }
    });
    //final movieObject
    movieObject[m.Title] = tempMovie;
});

//console.log(peopleObject);


// console.log("-------------------------------MOVIE OBJECTS-----------------------------------");
// console.log(movieObject);

// console.log("-------------------------------PEOPLE OBJECTS ----------------------------------");
// console.log(peopleObject);

function generateCollabs(person){
    for(otherPerson in peopleObject){
        let count = 1;
        for(i in peopleObject[person].movies){ //loop through all the person's movies 
            for(j in peopleObject[otherPerson].movies){ //then loop through all the other person's movies
            //if the movie titles match (and is not the same persion)
                if(peopleObject[person].movies[i]===peopleObject[otherPerson].movies[j] && peopleObject[person].name!=peopleObject[otherPerson].name){
                    //create otherPerson object and add it to collab list with a frequency of 1
                    let tempCollab={};
                    tempCollab.name = peopleObject[otherPerson].name;
                    tempCollab.frequency = Number(count);
                    peopleObject[person].collabs.push(tempCollab);
                }
            }
        }
    }
    //Sort the array of collab objects
    //count the occurence of names, if it is counted more than once (occurence is more than zero)
    //set frequency of that person to occurrence
    
    //console.log(peopleObject[person].collabs);
    return (peopleObject[person].collabs)
}

//set collaborators to the movies
for(person in peopleObject){
    generateCollabs(peopleObject[person].name)
}

function similarMovies(someMovie){
    for(otherMovie in movieObject){
        let count = 1;
        for(i in movieObject[someMovie].genre){ //loop through all the movie's genres 
            for(j in movieObject[otherMovie].genre){ //then loop through all the other movie's genres
        //if the movie titles match (and is not the same persion)
                if(movieObject[someMovie].genre[i]===movieObject[otherMovie].genre[j] && movieObject[someMovie].title!==movieObject[otherMovie].title){
                    //add other movie to the movie's "similar" list
                    let tempSimilar={};
                    tempSimilar.title = movieObject[otherMovie].title;
                    tempSimilar.frequency = Number(count);
                    if(movieObject[someMovie].similar.includes(tempSimilar.title)==false){
                        movieObject[someMovie].similar.push(tempSimilar);
                    }
                }
            }
        }
    }
    //console.log(movieObject[someMovie].similar)

}
//set similar movies
for(movie in movieObject){
    similarMovies(movieObject[movie].title)
}



module.exports = {
    movieObject,
    peopleObject,
}

