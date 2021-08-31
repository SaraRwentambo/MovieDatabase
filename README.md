# MovieDatabase


---------------- ABOUT THIS WEB APP -----------------------------------------------------------------------------------

This is a project I submitted for my web development course at Carleton University (COMP 2406) in December 2020. The goal of this project is to create a web app similar to Internet Movie Database (IMDb). It maintains a database of movie information, including the movie title, release year, writers, actors, etc. This app supports Regular Users (who are able to browese all information on the site, and add movie reviews), and Contributing Users (who are able to do everything Regular Users can do, plus add new people/movies and edit existing records). This site also offers movie recomendations based on a user's past reviews. Within this web app, the term 'people' is used to refer to people that are part of a movie (actor, writer, director) while the term 'user' refers to a user logged into the app. I designed the API to be RESTful, and tested it using Postman. This web app is deployed using Heroku.

Note: This web app is still a little buggy, and does not yet use a database. I only import the data from a .JSON file into the express server. I'm working on improving the app at the moment to fix the bugs, and add a database (I plan on using MongoDB). I will update the app and the README when changes are made. ***Enjoy the app :) *** 


---------------- NAVIGATING THE WEB APP --------------------------------------------------------------------------------

The app already has 4 users, 6 movie reviews, and 26 movies (including all the people in each of these movies) in the database.

Signing/Logging in:
First page you should see is a public welcome page. You can try logging in a user withthese examples: 
1) username: Sally, password: 1111 
2) username: Akini, password: 2222 
3) username: Andy, password: 3333 
4) username: Trevor, password: 4444

Or you can create a new user ("Join Us" tab on the navigation bar). When user is in the
system, they will first see their profile page. You can also search for other users, people
and movies in the respective tabs of the navigation bar.

Adding a new movie, people, or editing a movie:
The key to having this functionality work properly is to make sure that if you do include more than one string that you intend to be separate strings, please separate strings with
a comma and space to allow the server to splice the correct information.
