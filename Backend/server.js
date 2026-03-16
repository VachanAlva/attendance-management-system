const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* DATABASE CONNECTION */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "attendance_system"
});

db.connect(function(err){
    if(err){
        console.log("Database connection failed");
    } else {
        console.log("Connected to MySQL database");
    }
});

/* TEST ROUTE */

app.get("/", (req, res) => {
    res.send("Attendance system backend running");
});



// API to upload absence
app.post("/upload-absence", (req, res) => {

    const { student_id, subject, date, reason } = req.body;

    const sql = "INSERT INTO absence_requests (student_id, subject, date, reason) VALUES (?, ?, ?, ?)";

    db.query(sql, [student_id, subject, date, reason], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error inserting absence");
        } else {
            res.send("Absence submitted successfully");
        }
    });

});



// API to save attendance

app.post("/mark-attendance", (req, res) => {

    const { student_id, subject, date, status } = req.body;

    const sql = "INSERT INTO attendance (student_id, subject, date, status) VALUES (?, ?, ?, ?)";

    db.query(sql, [student_id, subject, date, status], (err, result) => {

        if (err) {
            console.log(err);
            res.send("Error saving attendance");
        } else {
            res.send("Attendance saved successfully");
        }

    });

});

// STUDENT LOGIN API

app.post("/student-login", (req, res) => {

    const { student_id, password } = req.body;

    const sql = "SELECT * FROM students WHERE student_id=? AND password=?";

    db.query(sql, [student_id, password], (err, result) => {

        if(err){
            res.send("error");
        }
        else if(result.length > 0){
            res.send("success");
        }
        else{
            res.send("invalid");
        }

    });

});

// TEACHER LOGIN API

app.post("/teacher-login", (req,res)=>{

    const {teacher_id, password} = req.body;

    const sql = "SELECT * FROM teachers WHERE teacher_id=? AND password=?";

    db.query(sql,[teacher_id,password],(err,result)=>{

        if(err){
            res.send("error");
        }
        else if(result.length > 0){
            res.send("success");
        }
        else{
            res.send("invalid");
        }

    });

});

// GET STUDENTS API

app.get("/students/:class",(req,res)=>{

const className = req.params.class;

const sql = "SELECT * FROM students WHERE class=?";

db.query(sql,[className],(err,result)=>{

if(err){
    res.send(err);
}
else{
    res.json(result);
}

});

});

// GET ABSENCE REQUESTS
app.get("/absence-requests", (req, res) => {

    const sql = "SELECT * FROM absence_requests";

    db.query(sql, (err, result) => {

        if(err){
            res.send(err);
        }
        else{
            res.json(result);
        }

    });

});

// UPDATE ATTENDANCE
app.post("/update-attendance", (req, res) => {

    const { student_id, subject, date, status } = req.body;

    const sql = `
        UPDATE attendance 
        SET status = ?
        WHERE student_id = ? AND subject = ? AND date = ?
    `;

    db.query(sql, [status, student_id, subject, date], (err, result) => {

        if(err){
            res.send(err);
        }
        else{
            res.send("Attendance Updated");
        }

    });

});

app.get("/student-attendance/:student_id", (req,res)=>{

    const student_id = req.params.student_id;

    const sql = `
    SELECT subject,
    COUNT(*) as total,
    SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present
    FROM attendance
    WHERE student_id = ?
    GROUP BY subject
    `;

    db.query(sql,[student_id],(err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.json(result);
        }
    });

});

/* SERVER */

app.listen(3000, () => {
    console.log("Server running on port 3000");
});