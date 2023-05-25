const express = require("express");
const app = express();
const { Todo, User } = require("./models");
const bodypaser = require("body-parser");
const path = require("path");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const flash = require("connect-flash");

app.set("views", path.join(__dirname, "views"));
app.use(flash());


var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");

app.use(bodypaser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("Somthing Went Wrong!!!"));

app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
//set EJS as view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my-super-secret-key-21647134443213215",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null,false,{message: "Invalid Password"});
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Invalid E-mail" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/signup", (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("signup", {
    title: "signup",
    csrfToken: request.csrfToken(),
  });
});

app.get("/", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const overdueTodos = await Todo.getoverdueTodos(loggedInUser);
    const dueTodayTodos = await Todo.getdueTodayTodos(loggedInUser);
    const dueLaterTodos = await Todo.getdueLaterTodos(loggedInUser);
    const completedTodos = await Todo.getCompletedTodos(loggedInUser);
    if (request.accepts("html")) {
      response.render("todos", {
        loggedInUser: request.user,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        userId: loggedInUser,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
      });
    }
  }
);

app.post("/users", async (request, response) => {
  console.log("Firstname ", request.body.firstname);
  const hashedpwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedpwd);
  const trimmedPassword = request.body.password.trim();
  if (request.body.firstName.length == 0) {
    request.flash("error", "First Name cant be empty");
    return response.redirect("/signup");
  } else if (request.body.email.length == 0) {
    request.flash("error", "Email cant be empty");
    return response.redirect("/signup");
  } else if (trimmedPassword.length == 0) {
    request.flash("error", "password cannot be empty");
    return response.redirect("/signup");
  }
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastname,
      email: request.body.email,
      password: hashedpwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    });
    // response.redirect("/todos");
  } catch (error) {
    console.log(error);
    request.flash("error", "Error! Email Already in use");
    response.redirect("/signup");
  }
});

app.get("/login", (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", { failureRedirect: "/login",failureFlash:true }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logOut((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

// app.get("/todos", async (request, response) => {
//   console.log("Todo items", response.body);
//   try {
//     const todo = await Todo.findAll();
//     return response.send(todo);
//     // return response.json(todo);
//   } catch (error) {
//     console.log(error);
//     return response.status(422).json(error);
//   }
// });

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("creating a todo", request.body);
    console.log("essddsfse", request.user.id);
    if (request.body.title.trim().length === 0) {
      request.flash("error", "Todo title cannot be empty");
      return response.redirect("/todos");
    }
    if (request.body.dueDate.trim().length === 0) {
      request.flash("error", "Todo due date cannot be empty");
      return response.redirect("/todos");
    }
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
        // completed: false,
        // request.body
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("we have to update a todo with ID:", request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    //  completed = todo.completed;
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

// eslint-disable-line no-unused-vars
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("Delete a todo by ID: ", request.params.id);
    const loggedInUser = request.user.id;
    try {
      await Todo.remove(request.params.id, loggedInUser);
      // response.send(deleted > 0);
      // return response.json(deleted);
      return response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
