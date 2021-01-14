export function layout(title, content) {
  return `
    <!DOCTYPE html>

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <link rel="icon"
            href="https://cdn1.iconfinder.com/data/icons/jetflat-multimedia-vol-2/90/004_100_code_tag_brackets_coding_html_development-256.png"
            type="image/icon type">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/css/bootstrap.min.css"
            integrity="sha384-DhY6onE6f3zzKbjUPRc2hOzGAdEf4/Dz+WJwBvEYL/lkkIsI3ihufq9hk9K4lVoK" crossorigin="anonymous">
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script src='https://kit.fontawesome.com/a076d05399.js'></script>
        <style>
        </style>
    </head>
    
    <body>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha2/js/bootstrap.bundle.min.js"
            integrity="sha384-BOsAfwzjNJHrJ8cZidOg56tcQWfp6y72vEJ8xQ9w6Quywb24iOsW913URv1IS4GD"
            crossorigin="anonymous"></script>
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary p-2">
            <div class="container-fluid">
                <a class="navbar-brand" href="/">BLOG</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText"
                    aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarText">
                    <ul class="navbar-nav mr-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="/">Home</a>
                        </li>
                    </ul>
                    <span class="navbar-text">
                        <em>110710529 資工三 廖明志</em>
                    </span>
                </div>
            </div>
        </nav>
        ${content}
    </body>
    `;
}

export function loginUi() {
  return layout(
    "Login",
    `
    <form class="text-center border border-light p-5" action="/login" method="post">
  <p class="h4 mb-4">Sign in</p>

  <div class="container">
    <div class="row">
      <div class="col-7 mx-auto">
        <input
          type="text"
          class="form-control mb-4"
          placeholder="Username"
          name="username"
          required
        />
      </div>
      <div class="col-7 mx-auto">
        <input
          type="password"
          class="form-control mb-4"
          placeholder="Password"
          name="password"
          required
        />
      </div>
      <div class="col-7 mx-auto">
        <button class="btn btn-primary btn-block my-4" type="submit">
          Sign in
        </button>
      </div>
    </div>
  </div>
  <p>
    New user?
    <a href="/signup" class="text-decoration-none">Create an account</a>
  </p>
</form>

    `
  );
}

export function signupUi() {
  return layout(
    "Signup",
    `
     <form
    class="text-center border border-light p-5"
    action="/signup"
    method="post"
  >
    <p class="h4 mb-4">Sign up</p>

    <div class="container">
      <div class="row">
        <div class="mx-auto col-7">
          <input
            type="text"
            class="form-control mb-4"
            placeholder="Username"
            name="username"
            required
          />
        </div>

        <div class="mx-auto col-7">
          <input
            type="password"
            class="form-control mb-4"
            placeholder="Password"
            name="password"
            required
          />
        </div>

        <div class="mx-auto col-7">
          <input
            type="email"
            class="form-control mb-4"
            placeholder="Email"
            name="email"
            required
          />
        </div>
        <div class="mx-auto col-7">
          <button class="btn btn-primary btn-block my-4" type="submit">
            Sign up
          </button>
        </div>
      </div>
    </div>
  </form>
    `
  );
}

export function success() {
  return layout(
    "Success",
    `
    <div class="text-center p-5">
    <h1 class="mb-4">Success!</h1>
    <p><em>You may <a href="/" class="text-decoration-none">read all Posts</a> again !</em></p>
</div>
    `
  );
}

export function fail() {
  return layout(
    "Fail",
    `
    <div class="text-center p-5">
    <h1 class="mb-4">Failed!</h1>
    <p><em>You may <a href="/" class="text-decoration-none">read all Post</a> or <a href="JavaScript:window.history.back()" class="text-decoration-none">go back</a>!</em></p>
</div>
    `
  );
}

export function list(posts, user) {
  console.log("list: user=", user);
  let list = [];
  for (let post of posts) {
    list.push(`
        <div class="p-3 col-7 mx-auto">
    <div class="card card-cascade wider reverse ml-3">
      <div class="card-body card-body-cascade">
        <h5 class="card-title">
          <form action="/del/${post.id}" method="POST">
            <div class="row">
              <div class="col-11">${post.title}</div>
              ${
                user != null
                  ? user.username == post.username
                    ? '<div class="col-1"><button type="submit" class="btn-close" aria-label="Close"></button></div>'
                    : ""
                  : ""
              }
            </div>
          </form>
        </h5>
        <p class="card-text text-right">-- by ${post.username}</p>
        <a
          href="/post/${post.id}"
          class="black-text float-right text-decoration-none"
        >
          <h5>Read post <i class="fas fa-chevron-right"></i></h5>
        </a>
      </div>
    </div>
  </div>
      `);
  }
  let content = `
    <div class="ml-3 p-3 text-center">
    <h4 class="mb-3">Posts</h4>
    <p class="mb-3">${
      user == null
        ? '<a href="/login" class="text-decoration-none">Login</a> to Create a Post!'
        : "Welcome " +
          "<strong>" +
          user.username +
          "</strong>" +
          ', You may <a href="/post/new" class="text-decoration-none">Create a Post</a> or <a href="/logout"class="text-decoration-none">Logout</a>!'
    }</p>
    <p class="mb-3">There are <strong>${posts.length}</strong> posts!</p>
    </div>
    <div id="posts" class="container">
        <div class="row">
            ${list.join("\n")}
        </div>
    </div>
    `;
  return layout("Posts", content);
}

export function newPost() {
  return layout(
    "New Post",
    `
   <form class="text-center border border-light p-5" action="/post" method="post">
    <p class="h4 mb-4">New Post</p>
    <input class="form-control mb-4" type="text" placeholder="Title" name="title">
    <textarea class="form-control" placeholder="Contents" name="body" rows="3"></textarea>
    <button class="btn btn-primary btn-block my-4" type="submit">Create</button>
</form>
    `
  );
}

export function show(post) {
  return layout(
    post.title,
    `
   <div class="ml-3 p-3">
    <div class="row">
      <div class="col-md-6 col-12 text-center">
        <h1 class="mb-3">${post.title}</h1>
      </div>
      <div class="col-md-6 col-12">
        <p class="mb-3 mt-3"><em>-- by ${post.username}</em></p>
      </div>
    </div>
  </div>
  <div class="container w-75">
    <p class="mb-3">${post.body}</p>
  </div>
  <div class="container">
    <form class="border border-light" action="/post/${post.id}" method="post">
      <button class="btn btn-primary" type="submit" name="btnlike" value="like">
        <p class="card-text">
          <i class="far fa-thumbs-up mr-1"></i>${post.like_num}
        </p>
      </button>
      <button
        class="btn btn-primary"
        type="submit"
        name="btndislike"
        value="dislike"
      >
        <p class="card-text">
          <i class="far fa-thumbs-down mr-1"></i>${post.dislike_num}
        </p>
      </button>
    </form>
  </div>
  `
  );
}
