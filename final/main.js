import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from "./render.js";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/session@1.1.0/mod.ts";

const fighting = "(๑و•̀ω•́)و\n⇟⇟⇟";
const finishing = " ~ (★´ω｀★)ゞ\n";
const db = new DB("blog.db");
const server = "https://git.heroku.com/fathomless-thicket-08112.git";
db.query(
  "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT, like_num INTEGER, dislike_num INTEGER)"
);
db.query(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, active INTEGER)"
);
db.query(
  "CREATE TABLE IF NOT EXISTS like (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, postid INTEGER, likes TEXT)"
);
const router = new Router();

router
  .get("/", list)
  .get("/signup", signupUi)
  .post("/signup", signup)
  .get("/login", loginUi)
  .post("/login", login)
  .get("/logout", logout)
  .get("/post/new", add)
  .get("/post/:id", show)
  .post("/post/:id", comment)
  .post("/post", create)
  .post("/del/:id", del);

const session = new Session({ framework: "oak" });
await session.init();

const app = new Application();

app.use(session.use()(session));
app.use(router.routes());
app.use(router.allowedMethods());

function working(f) {
  console.log("\nstart", f, "ing...", fighting);
}

function finish(f) {
  console.log("⇞⇞⇞\nend of", f, "ing", finishing);
}

function sqlcmd(sql, arg1) {
  console.log("sql:", sql);
  try {
    var results = db.query(sql, arg1);
    //console.log("sqlcmd: results=", results);
    return results;
  } catch (error) {
    console.log("sqlcmd error: ", error);
    throw error;
  }
}

function postQuery(sql) {
  let list = [];
  for (const [id, username, title, body, like_num, dislike_num] of sqlcmd(
    sql
  )) {
    list.push({ id, username, title, body, like_num, dislike_num });
  }
  console.log("postQuery: list=", list);
  return list;
}

function userQuery(sql) {
  let list = [];
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({ id, username, password, email });
  }
  console.log("userQuery: list=", list);
  return list;
}

async function parseFormBody(body) {
  const pairs = await body.value;
  const obj = {};
  for (const [key, value] of pairs) {
    obj[key] = value;
  }
  return obj;
}

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

async function signup(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(
      `SELECT id, username, password, email FROM users WHERE username='${user.username}'`
    );
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [
        user.username,
        user.password,
        user.email,
      ]);
      ctx.state.session.set("user", user);
      ctx.response.body = render.success();
    } else ctx.response.body = render.fail();
  }
}

async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

async function login(ctx) {
  const body = ctx.request.body();
  if (body.type === "form") {
    var user = await parseFormBody(body);
    var dbUsers = userQuery(
      `SELECT id, username, password, email FROM users WHERE username='${user.username}'`
    ); // userMap[user.username]
    var dbUser = dbUsers[0];
    if (dbUser.password === user.password) {
      ctx.state.session.set("user", user);
      console.log("session.user=", await ctx.state.session.get("user"));
      ctx.response.redirect("/");
    } else {
      ctx.response.body = render.fail();
    }
  }
}

async function logout(ctx) {
  ctx.state.session.set("user", null);
  ctx.response.redirect("/");
}

async function list(ctx) {
  let posts = postQuery(
    "SELECT id, username, title, body, like_num, dislike_num FROM posts"
  );
  console.log("list:posts=", posts);
  ctx.response.body = await render.list(
    posts,
    await ctx.state.session.get("user")
  );
}

async function add(ctx) {
  var user = await ctx.state.session.get("user");
  if (user != null) {
    ctx.response.body = await render.newPost();
  } else {
    ctx.response.body = render.loginUi();
  }
}

async function show(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(
    `SELECT id, username, title, body, like_num, dislike_num FROM posts WHERE id=${pid}`
  );
  let post = posts[0];
  console.log("show:post=", post);
  if (!post) ctx.throw(404, "invalid post id");
  ctx.response.body = await render.show(post);
}

async function comment(ctx) {
  const pid = ctx.params.id;
  let users = await ctx.state.session.get("user");
  let user;
  const body = ctx.request.body();
  var post = await parseFormBody(body);
  console.log("comment:post=", post);
  if (users != null) {
    user = users.username;
    let posts = db.query(
      "SELECT like_num, dislike_num FROM posts WHERE id=" + pid
    );
    let user_like = sqlcmd(
      `SELECT likes FROM like WHERE postid=(?) and username=(?)`,
      [pid, user]
    );
    let userLike;
    for (const [likes] of user_like) {
      userLike = likes;
    }
    console.log(`userLike-> `, userLike);
    if (userLike === undefined) {
      console.log(`i'm here~`);
      sqlcmd("INSERT INTO like (username, postid) VALUES ( ?, ?)", [user, pid]);
    }

    let likeNum, dislikeNum;
    for (const [like_num, dislike_num] of posts) {
      likeNum = like_num;
      dislikeNum = dislike_num;
    }

    /* null -> like：(likeNum+1) (update)
     * dislike ->like：(dislikeNum-1) (likeNum+1) (update)
     * like -> like：(likeNum-1) (delete)
     */
    if (post.btndislike != null) {
      if (userLike === "dislike") {
        dislikeNum -= 1;
        sqlcmd(`DELETE FROM like WHERE username=(?) AND postid=(?)`, [
          user,
          pid,
        ]);
      } else {
        if (userLike === "like") {
          likeNum -= 1;
          dislikeNum += 1;
        }
        if (userLike === undefined) dislikeNum += 1;
        sqlcmd(
          `UPDATE like SET likes = (?) WHERE username=(?) and postid=(?)`,
          [post.btndislike, user, pid]
        );
      }
    } else {
      if (userLike === "like") {
        console.log("like -> like");
        likeNum -= 1;
        sqlcmd(`DELETE FROM like WHERE username=(?) AND postid=(?)`, [
          user,
          pid,
        ]);
      } else {
        if (userLike === "dislike") {
          console.log("dislike -> like");
          dislikeNum -= 1;
          likeNum += 1;
        }
        if (userLike === undefined) {
          console.log("null -> like");
          likeNum += 1;
        }
        sqlcmd(
          `UPDATE like SET likes = (?) WHERE username=(?) and postid=(?)`,
          [post.btnlike, user, pid]
        );
      }
    }
    sqlcmd("UPDATE posts SET like_num =(?), dislike_num =(?) WHERE id=(?)", [
      likeNum,
      dislikeNum,
      pid,
    ]);
    ctx.response.redirect("/post/" + pid);
  } else {
    ctx.response.body = render.loginUi();
  }
}

async function create(ctx) {
  const body = ctx.request.body();
  var post = await parseFormBody(body);
  console.log("create:post=", post);
  var user = await ctx.state.session.get("user");
  if (user != null) {
    console.log("user=", user);
    sqlcmd(
      "INSERT INTO posts (username, title, body, like_num, dislike_num) VALUES (?, ?, ?, ?, ?)",
      [user.username, post.title, post.body, 0, 0]
    );
  } else {
    ctx.throw(404, "not login yet!");
  }
  ctx.response.redirect("/");
}

async function del(ctx) {
  const pid = ctx.params.id;

  var user = await ctx.state.session.get("user");
  if (user != null) {
    working("delete");
    sqlcmd(`DELETE FROM like WHERE postid=(?)`, [pid]);
    sqlcmd(`DELETE FROM posts WHERE id=(?)`, [pid]);
    ctx.response.redirect("/");
    finish("delete");
  } else {
    ctx.response.body = render.loginUi();
  }
}

console.log("Server run at http://127.0.0.1:8000");
await app.listen({ hostname: "127.0.0.1", port: 8000 });
