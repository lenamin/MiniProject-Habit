const express = require("express");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const sql = require("sqlite3");
const path = require("path");
const { emitWarning } = require("process");

const app = express();
const PORT = 3000;

const db_name = path.join(__dirname, "habit.db");
const db = new sql.Database(db_name);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"))

// session을 쓰기 위한 작업 
app.use(cookieParser());
app.use(
    expressSession({
        secret: "sample",
        resave: true,
        saveUninitialized: true,
    })
);

const create_users_sql = `
    create table if not exists users (
        id integer primary key AUTOINCREMENT,
        name varchar(100),
        email varchar(255) UNIQUE,
        password varchar(255),
        createdAt datetime default CURRENT_TIMESTAMP
        )`;

const create_habits_sql = `
    create table if not exists habits (
        id integer primary key AUTOINCREMENT,
        habit_name varchar(255),
        start_date datetime,
        end_date datetime,
        createdAt datetime default CURRENT_TIMESTAMP,
        user_id integer not null,
        FOREIGN KEY(user_id) REFERENCES user(id)
    )
`;

const create_records_sql = `
    create table if not exists records (
        id integer PRIMARY key AUTOINCREMENT,
        memo varchar(255),
        createdAt datetime default CURRENT_TIMESTAMP,
        habit_id integer not null,
        FOREIGN KEY(habit_id) REFERENCES habits(id)
    )
`;

// 메모리에 올리는 거니까 주석처리가 아닌, 
db.serialize(() => {
    db.run(create_users_sql);
    db.run(create_habits_sql);
    db.run(create_records_sql);
});

app.use(express.urlencoded({ extended: true })); // post body에서 데이터를 가져오기 위해 


// 회원가입 화면 띄우기 
app.get("/register", (req, res) => {
    res.render("register");
});

// 선생님 코드 
app.get("/habit", (req, res) => {
    console.log(req.session);
    const user = req.session.user
    
    if (user == undefined) {
        res.redirect("/login");
        return;
    }

    const list_sql = `
        select id, habit_name, start_date, end_date, 
        (select count(1) from records r where r.habit_id == h.id ) count 
        from habits h where user_id = ${user.id}
    `;

    db.all(list_sql, [], (err, rows) => {
        if(err) {
            res.status(500).send("Internal Server Error");
        } 
        if(rows) {
            console.log(`rows는: ${rows}`)
            res.render("habit", { habits: rows});
        }
    });
})

app.get("/", (req, res)=> {
    if (req.session.user) {
        res.render("home");
    }else{
        res.redirect("/login")
    }
});

// post router -> form에서 받은 회원가입 정보 이용해서 DB에 회원가입 
app.post("/register", (req, res) => {
    console.log(req.body);
    const { name, email, password } = req.body;
    // 로그인 처리 
    const check_dup_email_sql = `select count(1) as count from users where email = '${email}'`;

    db.get(check_dup_email_sql, (err, row) => {
        console.log(row)
        if(err) {
            res.status(500).send("Internal Server Error");
        }
        if (row.count > 0) {
            console.log(row);
            res.status(200).send("Existed Email...");
        } else {
            const insert_users_sql = `insert into users(name, email, password) values('${name}', '${email}', '${password}');`;
            db.run(insert_users_sql);
            res.redirect("/login");
        }
    });
});



// 로그인 
// get router -> register.ejs 
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    // post로 본문 가져오기 
    console.log(`req.body는 ${req.body}`)

    const { email, password } = req.body; 

    // db에서 username aa@gmail.com이고 password 12344인 사용자 있는지 체크 
    // -> select 문 이용해 해당유저 찾아오기 
    const check_sql = `select * from users where email = '${email}' and password = '${password}'`;

    db.get(check_sql, (err, row) => {
        // row가 있으면 유저의 객체가 있다  
        console.log(row)
        if (row) {
            req.session.user = {
                id: row.id,
                email: row.email,
                name: row.name,
            };
            // 습관 목록으로 이동 
            res.redirect("/habit");
        } else {
            res.redirect("/login");
        }

        // row 없는 경우 해당 유저 없기 때문에 다시 로그인 페이지로 이동함 
    })
})

app.get("/habit/add", (req, res) => {
    res.render("add"); // ejs 파일 출력 
});

app.post("/habit/add", (req, res) => {
    const { habit_name, start_date, end_date } = req.body;
    // 사용자 ID 받아오기 
    const user = req.session.user;

    if(user == undefined) {
        res.redirect("/login");
        return;
    }

    const insert_sql = `
        insert into habits(habit_name, start_date, end_date, user_id) values ('${habit_name}', '${start_date}', '${end_date}', ${user.id})`;
    
    db.run(insert_sql, (err) => {
        if(err) {
            res.status(500).send("Internal Server Error");
        } 

        res.redirect("/habit");
    });

});

app.listen(PORT, (req, res) => {
    console.log(`${PORT} 에서 게시판 서버를 시작합니다.`);
});
