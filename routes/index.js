var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");

var async = require("async");
var mysql = require("mysql");
var fs = require("fs");
const date = require("date-and-time");
var moment = require("moment");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "event_merge",
});

connection.connect(function (err) {
  if (!err) {
    console.log("Connected Successfully");
  } else {
    console.log("Connect Failed");
  }
});

/* Login Home Page. */
router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/loginProcess", function (req, res, next) {
  console.log("Hello Login Process");
  var admin_email = req.body.admin_email;
  var admin_pass = req.body.admin_pass;

  query = `select * from tbl_admin where admin_email='${admin_email}' and admin_pass='${admin_pass}'`;
  console.log(query);

  connection.query(query, function (err, rows) {
    if (err) {
      res.send(err);
    } else {
      if (rows.length > 0) {
        var adminemail = rows[0].admin_email;
        var adminpass = rows[0].admin_pass;
        var adminid = rows[0].admin_id;
        var adminname = rows[0].admin_name;

        req.session.adminemail = adminemail;
        req.session.adminid = adminid;
        req.session.adminname = adminname;

        console.log("Session Value is" + req.session.adminemail);
        console.log("Session Adminid : " + req.session.adminid);
        console.log("Session Name" + req.session.adminname);
        res.redirect("/");
      } else {
        // res.send("Login Failed");
        req.flash("notify", "Invalid Credential !!!");
        res.redirect("/login");
      }
    }
  });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.adminname) {
    //get session value
    var adminname = req.session.adminname;
    //important line
    res.render("index", { adminname: adminname });
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

//Add Admin
router.get("/addAdmin", function (req, res, next) {
  if (req.session.adminname) {
    //get session value
    var adminname = req.session.adminname;
    //important line
    res.render("add-admin", { adminname: adminname });
  } else {
    res.redirect("/login");
  }
});

router.post("/addAdmin", function (req, res, next) {
  console.log(req.body);
  const mydata = {
    admin_name: req.body.admin_name,
    admin_mobile: req.body.admin_mobile,
    admin_email: req.body.admin_email,
    admin_pass: req.body.admin_pass,
  };
  connection.query(
    "insert into tbl_admin set ?",
    mydata,
    function (err, result) {
      if (err) throw err;
      res.redirect("/addAdmin");
    }
  );
  req.flash("notify", "Data Added Successfully !!!");
});
//Display Admin
router.get("/displayAdmin", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    connection.query("select * from tbl_admin ", function (err, rows) {
      console.log(rows);
      res.render("display-admin", {
        db_rows_array: rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});
//Delete Admin
router.get("/deleteAdmin/:admin_id", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    var deleteid = req.params.admin_id;
    connection.query(
      "delete from tbl_admin where admin_id = ?",
      [deleteid],
      function (err, rows) {
        if (err) throw err;
        console.log("data deleted succesfully");
        req.flash("notify", "Data Deleted Succesfully !!!");

        res.redirect("/displayAdmin");
      }
    );
  } else {
    res.redirect("/login");
  }
});

//Edit Admin
router.get("/editAdmin/:admin_id", function (req, res) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    console.log("Admin ID:" + req.params.admin_id);

    var admin_id = req.params.admin_id;
    connection.query(
      "select * from tbl_admin where admin_id = ? ",
      [admin_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);
        res.render("edit-admin", {
          db_rows_array: db_rows,
          adminname: adminname,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/editAdmin/:admin_id", function (req, res) {
  console.log(admin_id);
  var admin_id = req.params.admin_id;

  var admin_mobile = req.body.admin_mobile;
  var admin_name = req.body.admin_name;
  var admin_email = req.body.admin_email;
  var admin_pass = req.body.admin_pass;

  var query = `update tbl_admin set admin_name = '${admin_name}', admin_email = '${admin_email}', admin_mobile = '${admin_mobile}' , admin_pass = '${admin_pass}' where admin_id = ${admin_id} `;
  req.flash("notify", "Data Edited Succesfully !!!");

  console.log(query);
  connection.query(query, function (err, data) {
    if (err) throw err;
    console.log(data);
    res.redirect("/displayAdmin");
  });
});
//============Admin Crud Complete=======

//============Category Crud =======

//Add Category
router.get("/addCategory", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    res.render("add-category", { adminname: adminname });
  } else {
    res.redirect("/login");
  }
});

router.post("/addCategory", function (req, res, next) {
  console.log(req.body);
  const data = {
    category_name: req.body.category_name,
  };
  connection.query(
    "insert into tbl_category set ?",
    [data],
    function (err, data) {
      if (err) throw err;
      console.log(data);
      res.redirect("/addCategory");
    }
  );
  req.flash("notify", "Data Added Successfully !!!");
});

//Display Category

router.get("/displayCategory", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    connection.query("select * from tbl_category", function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("display-category", {
        db_rows_array: db_rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//Delete Catregory

router.get("/deleteCategory/:category_id", function (req, res) {
  var category_id = req.params.category_id;
  console.log("Category Id" + category_id);

  connection.query(
    "delete from tbl_category where category_id  = ?",
    [category_id],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      console.log("Record deleted");
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayCategory");
    }
  );
});

//Edit Category
router.get("/editCategory/:category_id", function (req, res) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    var category_id = req.params.category_id;
    console.log(category_id);

    connection.query(
      "select * from tbl_category where category_id = ? ",
      [category_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);

        res.render("edit-category", {
          db_rows_array: db_rows,
          adminname: adminname,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/editCategory/:category_id", function (req, res) {
  console.log("category id " + req.params.category_id);
  var category_id = req.params.category_id;
  var category_name = req.body.category_name;

  var query = `update tbl_category set category_name = '${category_name}' where category_id = ${category_id}`;
  req.flash("notify", "Data Edited Succesfully !!!");

  connection.query(query, function (err, data) {
    if (err) throw err;
    console.log(data);
    res.redirect("/displayCategory");
  });
});
//========Category Crud Complete ======
//========Event Crud============
//Add Event
router.get("/addEvent", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    connection.query("select * from tbl_category", function (err, rows1) {
      connection.query("select * from tbl_faculty", function (err, rows2) {
        res.render("add-event", {
          categoryData: rows1,
          facultyData: rows2,
          adminname: adminname,
        });
      });
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/addEvent", function (req, res, next) {
  console.log(req.body);
  myfile = req.files.event_photo;
  filename = req.files.event_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + filename, function (err) {
    if (err) throw err;
    console.log("file is uploaded");
  });

  const data = {
    event_name: req.body.event_name,
    event_details: req.body.event_details,
    event_from_date: req.body.event_from_date,
    event_to_date: req.body.event_to_date,
    event_from_time: req.body.event_from_time,
    event_to_time: req.body.event_to_time,
    event_venue: req.body.event_venue,
    faculty_id: req.body.faculty_id,

    event_photo: path + filename,
    category_id: req.body.category_id,
  };
  connection.query("insert into tbl_event set ?", [data], function (err, data) {
    if (err) throw err;
    console.log(data);
    res.redirect("/addEvent");
  });
  req.flash("notify", "Data Added Successfully !!!");
});

//Display Event

router.get("/displayEvent", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    var query = `SELECT
  tbl_event.event_id
  , tbl_event.event_name
  , tbl_event.event_from_date
  , tbl_event.event_to_date
  , tbl_event.event_from_time
  , tbl_event.event_to_time
  , tbl_event.event_venue
  , tbl_event.event_details
  , tbl_event.event_photo
  , tbl_faculty.faculty_name
  , tbl_category.category_name
FROM
  tbl_event
  INNER JOIN tbl_faculty 
      ON (tbl_event.faculty_id = tbl_faculty.faculty_id)
  INNER JOIN tbl_category 
      ON (tbl_event.category_id = tbl_category.category_id)`;

    connection.query(query, function (err, db_rows) {
      // if(err) throw err;
      // console.log(db_rows);
      // res.render('display-event',{db_rows_array:db_rows});

      if (err) {
        throw err;
      } else {
        console.log(db_rows);
     
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format(
              "DD/MM/YYYY"
            );
            row.event_to_date = moment(row.event_to_date).format("DD/MM/YYYY");
          });

          res.render("display-event", {db_rows_array: db_rows,adminname: adminname});
         
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Delete Event

router.get("/deleteEvent/:event_id", function (req, res) {
  var event_id = req.params.event_id;
  console.log("event id" + event_id);

  connection.query(
    "delete from tbl_event where event_id  = ?",
    [event_id],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayEvent");
    }
  );
});

//Edit Event

router.get("/editevent/:event_id", function (req, res) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    console.log("event ID:" + req.params.event_id);

    var event_id = req.params.event_id;
    connection.query(
      "select * from tbl_event where event_id = ? ",
      [event_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);
        db_rows.forEach((row) => {
          row.event_from_date = moment(row.event_from_date).format(
            "YYYY-MM-DD"
          );
          row.event_to_date = moment(row.event_to_date).format("YYYY-MM-DD");
        });
        connection.query("select * from tbl_category", function (err, rows1) {
          connection.query("select * from tbl_faculty", function (err, rows2) {
            res.render("edit-event", {
              db_rows_array: db_rows,
              categoryData: rows1,
              facultyData: rows2,
              adminname: adminname,
            });
          });
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/editevent/:event_id", function (req, res) {
  console.log(req.body);
  var new_image = "";
  var new_image = req.files.event_photo;
  var fname = req.files.event_photo.name;

  console.log("old image " + req.body.old_image);

  try {
    fs.unlinkSync("public" + req.body.old_image);
  } catch (err) {
    console.log(err);
  }

  var event_id = req.params.event_id;
  console.log("event ID:" + req.params.event_id);

  var myfile = req.files.event_photo;
  var fname = req.files.event_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + fname, function (err) {
    if (err) return res.status(500).send(err);
  });

  var event_name = req.body.event_name;
  var event_from_date = req.body.event_from_date;
  var event_to_date = req.body.event_to_date;
  var event_from_time = req.body.event_from_time;
  var event_to_time = req.body.event_to_time;

  var event_venue = req.body.event_venue;
  var event_photo = "/upload/" + fname;
  var event_details = req.body.event_details;
  var faculty_id = req.body.faculty_id;
  var category_id = req.body.category_id;

  var query = `update tbl_event set event_name='${event_name}',event_from_date = '${event_from_date}',event_to_date = '${event_to_date}',event_from_time = '${event_from_time}',event_to_time = '${event_to_time}',
                                  event_venue = '${event_venue}',event_photo = '${event_photo}', event_details = '${event_details}', faculty_id = '${faculty_id}' , category_id = '${category_id}' where event_id = '${event_id}'`;

  req.flash("notify", "Data Edited Succesfully !!!");

  console.log(query);
  connection.query(query, function (err, db_rows) {
    if (err) throw err;
    console.log(db_rows);
    res.redirect("/displayevent");
  });
});
//=======Event Crud Complete ====
//=======View Booked Event=====
router.get("/displayBookedEvent", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    var query = `SELECT
  tbl_registration.reg_id
  , tbl_registration.student_id
  , tbl_event.event_name
  , tbl_student.student_name
  , tbl_registration.reg_date
FROM
  tbl_registration
  INNER JOIN tbl_student 
      ON (tbl_registration.student_id = tbl_student.student_id)
  INNER JOIN tbl_event 
      ON (tbl_registration.event_id = tbl_event.event_id)`;

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.reg_date = moment(row.reg_date).format("DD/MM/YYYY");
          });

          res.render("display-bookedevent", {
            db_rows_array: db_rows,
            adminname: adminname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});
// =========View Booked Event===
//==========Student Crud=======
//Add Student
router.get("/addStudent", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    res.render("add-student", { adminname: adminname });
  } else {
    res.redirect("/login");
  }
});

router.post("/addStudent", function (req, res, next) {
  console.log(req.body);
  myfile = req.files.student_photo;
  filename = req.files.student_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + filename, function (err) {
    if (err) throw err;
    console.log("file is uploaded");
  });
  const data = {
    student_enrollment: req.body.student_enrollment,
    student_name: req.body.student_name,
    student_gender: req.body.student_gender,
    student_dob: req.body.student_dob,
    student_email: req.body.student_email,
    student_pass: req.body.student_pass,
    student_mobile: req.body.student_mobile,
    student_address: req.body.student_address,
    student_photo: path + filename,
  };
  connection.query(
    "insert into tbl_student set ?",
    [data],
    function (err, result) {
      if (err) throw err;
      res.redirect("/addStudent");
    }
  );
  req.flash("notify", "Data Added Successfully !!!");
});

//Display Student
router.get("/displayStudent", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    connection.query("select * from tbl_student", function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      db_rows.forEach((row) => {
        row.student_dob = moment(row.student_dob).format("DD-MM-YY");
      });
      res.render("display-student", {
        db_rows_array: db_rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//Delete Student
router.get("/deleteStudent/:student_id", function (req, res, next) {
  var deleteid = req.params.student_id;
  console.log("delete id is " + deleteid);
  connection.query(
    "delete from tbl_student where student_id = ?",
    [deleteid],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayStudent");
    }
  );
});

router.get("/editstudent/:student_id", function (req, res) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    console.log("student ID:" + req.params.student_id);

    var student_id = req.params.student_id;
    connection.query(
      "select * from tbl_student where student_id = ? ",
      [student_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);
        db_rows.forEach((row) => {
          row.student_dob = moment(row.student_dob).format("YYYY-MM-DD");
        });
        res.render("edit-student", { db_rows_array: db_rows, adminname });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/editstudent/:student_id", function (req, res) {
  console.log(req.body);
  var new_image = "";
  var new_image = req.files.student_photo;
  var fname = req.files.student_photo.name;

  console.log("old image " + req.body.old_image);

  try {
    fs.unlinkSync("public" + req.body.old_image);
  } catch (err) {
    console.log(err);
  }

  console.log("student ID:" + req.params.student_id);

  var student_id = req.params.student_id;

  var myfile = req.files.student_photo;
  var fname = req.files.student_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + fname, function (err) {
    if (err) return res.status(500).send(err);
  });

  var student_enrollment = req.body.student_enrollment;
  var student_name = req.body.student_name;
  var student_email = req.body.student_email;
  var student_pass = req.body.student_pass;
  var student_mobile = req.body.student_mobile;
  var student_gender = req.body.student_gender;

  var student_dob = req.body.student_dob;
  var student_photo = "/upload/" + fname;
  var student_address = req.body.student_address;

  var query = `update tbl_student  set student_enrollment='${student_enrollment}',  student_name='${student_name}',student_gender = '${student_gender}',student_email = '${student_email}',student_pass = '${student_pass}',student_mobile = '${student_mobile}',
                                  student_dob = '${student_dob}',student_photo = '${student_photo}', student_address = '${student_address}' where student_id = '${student_id}'`;

  req.flash("notify", "Data Edited Succesfully !!!");

  console.log(query);
  connection.query(query, function (err, db_rows) {
    if (err) throw err;
    console.log(db_rows);
    res.redirect("/displaystudent");
  });
});

//Add Faculty By Admin

router.get("/addFaculty", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;
    res.render("add-faculty", { adminname: adminname });
  } else {
    res.redirect("/login");
  }
});

router.post("/addFaculty", function (req, res, next) {
  console.log(req.body);
  myfile = req.files.faculty_photo;
  filename = req.files.faculty_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + filename, function (err) {
    if (err) throw err;
    console.log("file is uploaded");
  });
  const data = {
    faculty_name: req.body.faculty_name,
    faculty_email: req.body.faculty_email,
    faculty_pass: req.body.faculty_pass,
    faculty_mobile: req.body.faculty_mobile,

    faculty_gender: req.body.faculty_gender,
    faculty_dob: req.body.faculty_dob,
    faculty_address: req.body.faculty_address,
    faculty_photo: path + filename,
  };
  connection.query(
    "insert into tbl_faculty set ?",
    [data],
    function (err, result) {
      if (err) throw err;
      res.redirect("addfaculty");
    }
  );
  req.flash("notify", "Data Added Successfully !!!");
});

//Display Faculty
router.get("/displayFaculty", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    connection.query("select * from tbl_faculty", function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);

      db_rows.forEach((row) => {
        row.faculty_dob = moment(row.faculty_dob).format("DD/MM/YYYY");
      });

      res.render("display-faculty", {
        db_rows_array: db_rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//Delete faculty
router.get("/deletefaculty/:faculty_id", function (req, res, next) {
  var deleteid = req.params.faculty_id;
  console.log("delete id is " + deleteid);
  connection.query(
    "delete from tbl_faculty where faculty_id = ?",
    [deleteid],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayfaculty");
    }
  );
});

//Edit Faculty

router.get("/editFaculty/:faculty_id", function (req, res) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    console.log("faculty ID:" + req.params.faculty_id);

    var faculty_id = req.params.faculty_id;
    connection.query(
      "select * from tbl_faculty where faculty_id = ? ",
      [faculty_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);
        db_rows.forEach((row) => {
          row.faculty_dob = moment(row.faculty_dob).format("YYYY-MM-DD");
        });
        res.render("edit-faculty", {
          db_rows_array: db_rows,
          adminname: adminname,
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.post("/editfaculty/:faculty_id", function (req, res) {
  console.log(req.body);
  var new_image = "";
  var new_image = req.files.faculty_photo;
  var fname = req.files.faculty_photo.name;

  console.log("old image " + req.body.old_image);

  try {
    fs.unlinkSync("public" + req.body.old_image);
  } catch (err) {
    console.log(err);
  }

  console.log("faculty ID:" + req.params.faculty_id);

  var faculty_id = req.params.faculty_id;

  var myfile = req.files.faculty_photo;
  var fname = req.files.faculty_photo.name;
  console.log(myfile);
  var path = "/upload/";
  myfile.mv("public/upload/" + fname, function (err) {
    if (err) return res.status(500).send(err);
  });

  var faculty_name = req.body.faculty_name;
  var faculty_email = req.body.faculty_email;
  var faculty_pass = req.body.faculty_pass;
  var faculty_mobile = req.body.faculty_mobile;
  var faculty_gender = req.body.faculty_gender;

  var faculty_dob = req.body.faculty_dob;
  var faculty_photo = "/upload/" + fname;
  var faculty_address = req.body.faculty_address;

  var query = `update tbl_faculty set faculty_name='${faculty_name}',faculty_gender = '${faculty_gender}',faculty_email = '${faculty_email}',faculty_pass = '${faculty_pass}',faculty_mobile = '${faculty_mobile}',
                                  faculty_dob = '${faculty_dob}',faculty_photo = '${faculty_photo}', faculty_address = '${faculty_address}' where faculty_id = '${faculty_id}'`;
  req.flash("notify", "Data Edited Succesfully !!!");

  console.log(query);
  connection.query(query, function (err, db_rows) {
    if (err) throw err;
    console.log(db_rows);
    res.redirect("/displayfaculty");
  });
});

//Add Registration
router.get("/addRegistration", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    connection.query("select * from tbl_event", function (err, rows1) {
      connection.query("select * from tbl_student", function (err, rows2) {
        res.render("add-registration", {
          eventData: rows1,
          studentData: rows2,
          adminname: adminname,
        });
      });
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/addRegistration", function (req, res, next) {
  console.log(req.body);
  const registration = {
    reg_date: new Date(req.body.reg_date).toISOString(),
    event_id: req.body.event_id,
    student_id: req.body.student_id,
    is_present: req.body.is_present,
  };
  connection.query(
    "insert into tbl_registration set ?",
    [registration],
    function (err, result) {
      if (err) throw err;
      res.redirect("/displayregistration");
    }
  );
});

//Display Registration
router.get("/displayregistration", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    var query = `SELECT
  tbl_registration.reg_id
  , tbl_registration.reg_date
  , tbl_event.event_name
  , tbl_student.student_name
FROM
  tbl_registration
  INNER JOIN tbl_event 
      ON (tbl_registration.event_id = tbl_event.event_id)
  INNER JOIN tbl_student 
      ON (tbl_student.student_id = tbl_registration.student_id)`;

    connection.query(query, function (err, db_rows) {
      // if (err) throw err;
      // console.log(rows);

      // res.render('display-registration', { db_rows_array :rows });

      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.reg_date = moment(row.reg_date).format("DD/MM/YYYY");
          });

          res.render("display-registration", {
            db_rows_array: db_rows,
            adminname: adminname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

//Delete Registration
router.get("/deleteRegistration/:reg_id", function (req, res, next) {
  var deleteid = req.params.reg_id;
  console.log("delete id is " + deleteid);
  connection.query(
    "delete from tbl_registration where reg_id = ?",
    [deleteid],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayRegistration");
    }
  );
});

//=======Display Winner ==== 
router.get("/displayWinner", function (req, res, next) {
  if (req.session.adminname) {
    var adminname = req.session.adminname;

    query = `SELECT
    tbl_winner.winner_id
    , tbl_winner.winner_status
    , tbl_winner.winner_date
    , tbl_student.student_name
    , tbl_event.event_name
FROM
    tbl_student
    INNER JOIN tbl_winner 
        ON (tbl_student.student_id = tbl_winner.student_id)
    INNER JOIN tbl_event 
        ON (tbl_winner.event_id = tbl_event.event_id)`;

    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);

      db_rows.forEach((row) => {
        row.winner_date = moment(row.winner_date).format("DD/MM/YYYY");
      });

      res.render("display-winner", {
        db_rows_array: db_rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//==========Display Coordinator=====
router.get("/displaycoordinator", function (req, res, next) {
  if (req.session.adminname) {
    //get session value
    var adminname = req.session.adminname;
    var adminid = req.session.adminid;
    //important line

    var query = `SELECT
  tbl_student.student_name
  , tbl_event.event_name
  , tbl_coordinator.coordinator_id
  , tbl_coordinator.coordinator_email
  , tbl_coordinator.coordinator_mobile
FROM
  tbl_student
  INNER JOIN tbl_coordinator 
      ON (tbl_student.student_id = tbl_coordinator.student_id)
  INNER JOIN tbl_event 
      ON (tbl_coordinator.event_id = tbl_event.event_id)`;

    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("display-coordinator", {
        db_rows_array: db_rows,
        adminname: adminname,
      });
    });
  } else {
    res.redirect("/login");
  }
});

//Change Password
router.get("/changePassword", function (req, res, next) {
  res.render("change-password");
});

router.post("/changePasswordProcess", function (req, res, next) {
  console.log("Welcome to Chnage Password");
  var adminid = req.session.adminid;

  var opass = req.body.opass;
  var npass = req.body.npass;
  var cpass = req.body.cpass;

  console.log("session id:" + req.session.adminid);

  if (req.session.adminid) {
    connection.query(
      "select * from tbl_admin where admin_id = ? ",
      [adminid],
      function (err, rows) {
        if (err) {
          res.send(err);
        } else {
          if (rows.length > 0) {
            var user_pass = rows[0].admin_pass;
            console.log(user_pass);

            if (opass == user_pass) {
              if (npass == cpass) {
                connection.query(
                  "update tbl_admin set admin_pass = ? where admin_id = ? ",
                  [npass, adminid],
                  function (err, rows) {
                    //res.send("Password Changed");

                    req.flash("success", "Password Changed Successfully");
                    res.redirect("/changePassword");
                  }
                );
              } else {
                req.flash("notify", "new and confirm password not matched");
                res.redirect("/changePassword");
              }
            } else {
              req.flash("notify", "Old Password Not matched");
              res.redirect("/changePassword");
            }
          } else {
            res.send("No Record Found");
          }
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

router.get('/displaycontact',function(req,res, next){
  if(req.session.adminname){
    var adminname = req.session.adminname;
    var query = "select * from tbl_contact";
    connection.query(query, function(err, db_rows){
      if(err) throw err;
      console.log(db_rows);
      res.render('display-contact',{db_rows_array:db_rows,adminname:adminname});
    }) 

  }else{
    res.redirect('/login');
  }
});

router.get("/deletecontact/:c_id", function (req, res) {
  var c_id = req.params.c_id;
  console.log("Category Id" + c_id);

  connection.query(
    "delete from tbl_contact where c_id  = ?",
    [c_id],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      console.log("Record deleted");
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayContact");
    }
  );
});




// =====Admin Panel Complete====

router.get("/studentlogin", function (req, res, next) {
  //  res.render('student/student-login');
  res.render("student/student-login");
});

router.post("/studentloginProcess", function (req, res, next) {
  console.log("Hello Login Process");
  var student_email = req.body.student_email;
  var student_pass = req.body.student_pass;

  query = `select * from tbl_student where student_email='${student_email}' and student_pass='${student_pass}'`;
  console.log(query);

  connection.query(query, function (err, rows) {
    if (err) {
      res.send(err);
    } else {
      if (rows.length > 0) {
        var studentemail = rows[0].student_email;
        var studentpass = rows[0].student_pass;
        var studentid = rows[0].student_id;
        var studentname = rows[0].student_name;

        req.session.studentemail = studentemail;
        req.session.studentid = studentid;
        req.session.studentname = studentname;

        console.log("Session Value is" + req.session.studentemail);
        console.log("Session Studentid : " + req.session.studentid);
        console.log("Session Name" + req.session.studentname);
        //res.redirect('/student-index');
        res.redirect("/student-index");
      } else {
        req.flash("notify", "Invalid Credential !!!");
        res.redirect("/studentlogin");
      }
    }
  });
});

router.get("/studentlogout", function (req, res, next) {
  req.session.destroy(function (err) {
    res.redirect("/studentlogin");
  });
});

/* GET home page. */
router.get("/student-index", function (req, res, next) {
  if (req.session.studentname) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);
    //get session value
    var studentname = req.session.studentname;
    //important line

    connection.query("select * from tbl_category", function (err, db_rows) {
      var query = `SELECT
        event_id
        , event_from_date
        , event_to_date
        , event_from_time
        , event_to_time
        , event_venue
        , event_details
        , event_photo
        , event_name
    FROM
        tbl_event WHERE tbl_event.event_to_date < '${
          today.toISOString().split("T")[0]
        }' `;

      connection.query(query, function (err, event_row) {
        if (err) throw err;
        console.log(db_rows);
        console.log(event_row);

        event_row.forEach((row) => {
          row.event_from_date = moment(row.event_from_date).format("MMM Do ");
          row.event_to_date = moment(row.event_to_date).format("MMM Do ");
        });
        res.render("student/index", {
          studentname: studentname,
          db_rows_array: db_rows,
          event_rows_array: event_row,
        });
      });
    });
  } else {
    res.redirect("/studentlogin");
  }
});


router.get("/studentprofile", function (req, res, next) {
  if (req.session.studentid) {
    //get session value
    var studentid = req.session.studentid;
    var studentname = req.session.studentname;
    //important line

    connection.query(
      "select * from tbl_student where student_id = ? ",
      [studentid],
      function (err, db_rows) {
        if (err) {
          throw err;
        } else {
          console.log(db_rows);
          if (db_rows.length > 0) {
            db_rows.forEach((row) => {
              row.student_dob = moment(row.student_dob).format("DD/MM/YYYY");
            });

            res.render("student/student-profile", {
              db_rows_array: db_rows,
              studentname: studentname,
            });
          } else {
            console.log("No record");
          }
        }
      }
    );
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/studentprofileedit", function (req, res, next) {
  if (req.session.studentid) {
    var studentname = req.session.studentname;
    var studentid = req.session.studentid;
    console.log("student ID:" + studentid);

    connection.query(
      "select * from tbl_student where student_id=?",
      [studentid],
      (err, db_rows) => {
        if (err) throw err;
        db_rows.forEach((row) => {
          row.student_dob = moment(row.student_dob).format("YYYY-MM-DD");
        });
        res.render("student/edit-student-profile", {
          db_rows_array: db_rows,
          studentname: studentname,
        });
      }
    );
  } else {
    console.log("Session Expiry..");
    res.redirect("/studentlogin");
  }
});

router.post("/studentprofileedit", (req, res, next) => {
  if (req.session.studentid) {
    var studentid = req.session.studentid;
    console.log("student ID:" + studentid);
    const studenteditdata = {
      student_name: req.body.student_name,
      student_email: req.body.student_email,
      student_gender: req.body.student_gender,
      student_dob: req.body.student_dob,
      student_mobile: req.body.student_mobile,
      student_address: req.body.student_address,
      student_enrollment: req.body.student_enrollment,
    };
    connection.query(
      "update tbl_student set ? where student_id=?",
      [studenteditdata, studentid],
      (err) => {
        if (err) throw err;
        console.log("Profile Updated..");
        req.flash("notify", "Profile Updated Successfully");
        res.redirect("/studentprofile");
      }
    );
  } else {
    console.log("Session Expiry..");
    res.redirect("/studentlogin");
  }
});



router.get("/studentevent/:category_id", function (req, res, next) {
  if (req.session.studentid) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);

    var studentid = req.session.studentid;
    var studentname = req.session.studentname;

    console.log("EVENT CATEGORY ID :" + req.params.category_id);

    var category_id = req.params.category_id;
    var query = `SELECT
  tbl_category.category_id
  , tbl_event.event_id
  , tbl_event.event_from_date
  , tbl_event.event_to_date
  , tbl_event.event_from_time
  , tbl_event.event_to_time
  , tbl_event.event_venue
  , tbl_event.event_details
  , tbl_event.event_photo
  
  , tbl_event.event_name
  , tbl_category.category_name
FROM
  tbl_event
  INNER JOIN tbl_category  
      ON (tbl_event.category_id = tbl_category.category_id) 
  INNER JOIN tbl_coordinator 
      ON (tbl_event.event_id = tbl_coordinator.event_id)
  INNER JOIN tbl_student 
      ON (tbl_coordinator.student_id = tbl_student.student_id) where tbl_category.category_id = '${category_id}' and tbl_coordinator.student_id != '${studentid}' and tbl_event.event_from_date > '${today.toISOString().split("T")[0]}'`;
    console.log(query);

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format("MMM Do ");
            row.event_to_date = moment(row.event_to_date).format("MMM Do ");
          });

          res.render("student/student-event", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/eventdetails/:event_id/:category_id", function (req, res, next) {
  if (req.session.studentid) {
    var studentid = req.session.studentid;
    var studentname = req.session.studentname;

    console.log("Welcome to Event Details....");
    console.log("EVENT  ID :" + req.params.event_id);

    var event_id = req.params.event_id;
    var category_id = req.params.category_id;
    console.log("Category  ID :" + req.params.category_id);
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);

    const show_modal = !!req.body.modal;

    var qry = `SELECT
   tbl_event.event_id
   , tbl_event.event_from_date
   , tbl_event.event_to_date
   , tbl_event.event_from_time
   , tbl_event.event_to_time
   , tbl_event.event_venue
   , tbl_event.event_details
   , tbl_event.event_photo
   , tbl_event.event_name
   , tbl_faculty.faculty_name
   , tbl_student.student_name
   , tbl_category.category_name
   , tbl_category.category_id
   , tbl_coordinator.coordinator_mobile
   ,tbl_coordinator.student_id
   
     , tbl_faculty.faculty_mobile
 FROM
   tbl_faculty
   INNER JOIN tbl_event 
       ON (tbl_faculty.faculty_id = tbl_event.faculty_id)
   INNER JOIN tbl_coordinator 
       ON (tbl_event.event_id = tbl_coordinator.event_id)
   INNER JOIN tbl_category 
       ON (tbl_event.category_id = tbl_category.category_id)
   INNER JOIN tbl_student 
       ON (tbl_coordinator.student_id = tbl_student.student_id) where tbl_event.event_id = '${event_id}' and tbl_coordinator.student_id != '${studentid}'`;
   
    console.log(qry);
    
    connection.query(qry, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format(
              "MMM Do YYYY"
            );
            row.event_to_date = moment(row.event_to_date).format("MMM Do YYYY");
          });
          var coord_stud_id = req.body.coord_stu_id;
          console.log(coord_stud_id);
      
          res.render("student/student-event-details", {
            db_rows_array: db_rows,
            studentname: studentname,
            studentid:studentid
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});


router.get("/studentbooking/:event_id", function (req, res, next) {
  if (req.session.studentid) {
    //get session value
    var studentid = req.session.studentid;
    var studentname = req.session.studentname;

    const show_modal = !!req.body.modal;

    //important line
    console.log("Welcome to Student Event Booking");
    console.log("Student Id:" + studentid);
    var event_id = req.params.event_id;
    console.log("Event Id:" + event_id);

    const mydata = {
      student_id: req.session.studentid,
      event_id: req.params.event_id,
    };
    var checkqry = `select * from tbl_registration where tbl_registration.event_id = '${event_id}' and tbl_registration.student_id = '${studentid}' `;
    console.log(checkqry);

    connection.query(checkqry, function (err, db_rows) {
      if (err) throw err;
      else {
        if (db_rows.length >= 1) {
          console.log("Event is already booked");
        } else {
          connection.query(
            "insert into tbl_registration set ?",
            [mydata],
            function (err, result) {
              if (err) throw err;
              console.log(result);
             
              res.redirect("/thanks");
            }
          );
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/thanks", function (req, res, next) {
  res.render("student/thankyou");
});


router.get("/viewbookedevent", function (req, res, next) {
  if (req.session.studentid) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);

    var studentid = req.session.studentid;
    var studentname = req.session.studentname;
    var query = `SELECT
    tbl_registration.reg_date
    , tbl_registration.event_id
    , tbl_event.event_name
    , tbl_event.event_photo
    , tbl_event.event_details
    , tbl_event.event_venue
    , tbl_event.event_to_time
    , tbl_event.event_from_time
    , tbl_event.event_to_date
    , tbl_event.event_from_date
    , tbl_registration.student_id
FROM
    tbl_registration
    INNER JOIN tbl_event 
        ON (tbl_registration.event_id = tbl_event.event_id)
    INNER JOIN tbl_student 
        ON (tbl_registration.student_id = tbl_student.student_id) WHERE tbl_student.student_id =  '${studentid}' `;

    console.log(query);

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format("MMM Do ");
            row.event_to_date = moment(row.event_to_date).format("MMM Do ");
          });

          res.render("student/student-booked-event", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/viewprize/:event_id", function (req, res, next) {
  if (req.session.studentid) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);
    var event_id = req.params.event_id;
    console.log("Event id:" + event_id);

    var studentid = req.session.studentid;
    var studentname = req.session.studentname;
    var query = `SELECT
    tbl_winner.winner_id
    , tbl_winner.winner_status
    , tbl_winner.winner_date
    , tbl_student.student_id
    , tbl_student.student_name
    , tbl_event.event_id
    , tbl_event.event_name
    , tbl_event.event_venue
    , tbl_event.event_from_date
    , tbl_event.event_to_date
    , tbl_faculty.faculty_name
FROM
    tbl_winner
    INNER JOIN tbl_event 
        ON (tbl_winner.event_id = tbl_event.event_id)
    INNER JOIN tbl_student 
        ON (tbl_winner.student_id = tbl_student.student_id)
        INNER JOIN tbl_faculty 
        ON (tbl_event.faculty_id = tbl_faculty.faculty_id) where tbl_event.event_id = '${event_id}' and tbl_student.student_id = '${studentid}' `;

    console.log(query);

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.winner_date = moment(row.winner_date).format("MMM Do ");
          });

          res.render("student/student-prize", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});



router.get("/studentchangePassword", function (req, res, next) {
  res.render("student/student-change-password");
});

router.post("/studentchangePasswordProcess", function (req, res, next) {
  console.log("Welcome to Chnage Password");
  var studentid = req.session.studentid;

  var opass = req.body.opass;
  var npass = req.body.npass;
  var cpass = req.body.cpass;

  console.log("session id:" + req.session.studentid);

  if (req.session.studentid) {
    connection.query(
      "select * from tbl_student where student_id = ? ",
      [studentid],
      function (err, rows) {
        if (err) {
          res.send(err);
        } else {
          if (rows.length > 0) {
            var user_pass = rows[0].student_pass;
            console.log(user_pass);

            if (opass == user_pass) {
              if (npass == cpass) {
                connection.query(
                  "update tbl_student set student_pass = ? where student_id = ? ",
                  [npass, studentid],
                  function (err, rows) {
                    //res.send("Password Changed");
                    req.flash("success", "Password ChangedSuccessfully !!!");
                    res.redirect("/studentchangePassword");
                  }
                );
              } else {
                req.flash("notify", "new and confirm password not matched");
                res.redirect("/studentchangePassword");
              }
            } else {
              req.flash("notify", "Old Password Not matched");
              res.redirect("/studentchangePassword");
            }
          } else {
            res.send('No Record Found"');
          }
        }
      }
    );
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/studentforgotPassword", function (req, res, next) {
  res.render("student/student-forgot-password");
});

router.post("/studentforgotPasswordProcess", function (req, res, next) {
  console.log("Welcome to forgot password");
  var student_email = req.body.student_email;
  //console.log(qry);
  connection.query(
    "select * from tbl_student where student_email = ? ",
    [student_email],
    function (err, rows) {
      if (err) {
        res.send(err);
      } else {
        if (rows.length > 0) {
          var student_pass = rows[0].student_pass;
          console.log(student_pass);

          ("use strict");
          const nodemailer = require("nodemailer");

          // async..await is not allowed in global scope, must use a wrapper
          async function main() {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: "fitnessfounders9613@gmail.com", // generated ethereal user
                pass: "cre@tepass", // generated ethereal password
              },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
              from: '"Fitness Founders" <fitnessfounders9613@gmail.com>', // sender address
              to: student_email, // list of receivers
              subject: "Forgot Password", // Subject line
              text: "Hello Your Password is :" + student_pass, // plain text body
              html: "Hello Your Password is :" + student_pass, // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          }

          main().catch(console.error);

          req.flash("success", "mail sent");
          res.redirect("/studentForgotPassword");

          // res.sleep(3000);
        } else {
          req.flash("notify", "Sorry Wrong Email");
          res.redirect("/studentForgotPassword");
        }
      }
    }
  );
});


router.get('/contactus', function(req, res, next){
  if (req.session.studentid) {
  res.render('student/contact')
  }
  else{
    res.redirect('/studentlogin');
  }
});

router.post('/contactus', function(req, res, next){
  if (req.session.studentid) {
    var studentid = req.session.studentid;
    var studentname = req.session.studentname;
    
  console.log(req.body);
  const mydata = {
    c_name: studentname,
    c_email: req.body.c_email,
    c_sub: req.body.c_sub,
    c_msg: req.body.c_msg,
    student_id:studentid
  };
  connection.query("insert into tbl_contact set ?",mydata,function (err, result) {
      if (err) throw err;
      res.redirect("/contactus");
    }
  );
  req.flash("notify", "Your Message Has been Sent !!!");
  }
  else{
    res.redirect('/studentlogin');
  }
});

router.get('/about', function(req, res, next){

  connection.query("select * from tbl_faculty",function(err,db_rows){
    connection.query("select * from tbl_event",function(err,db_rows1){
      connection.query("select * from tbl_student",function(err,db_rows2){
        connection.query("select * from tbl_registration",function(err,db_rows3){
            res.render('student/about',{facultyData:db_rows,eventData:db_rows1,studentData:db_rows2,registerData:db_rows3});
        })
      })
    })
  })

  
  // res.render('student/about');
});




router.get("/studentcomingevent", function (req, res, next) {
  if (req.session.studentid) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);

    var studentid = req.session.studentid;
    var studentname = req.session.studentname;

    var query = `SELECT
    tbl_category.category_id
    , tbl_event.event_id
    , tbl_event.event_from_date
    , tbl_event.event_to_date
    , tbl_event.event_from_time
    , tbl_event.event_to_time
    , tbl_event.event_venue
    , tbl_event.event_details
    , tbl_event.event_photo
    
    , tbl_event.event_name
    , tbl_category.category_name
  FROM
    tbl_event
    INNER JOIN tbl_category  
        ON (tbl_event.category_id = tbl_category.category_id) where tbl_category.category_id = '${category_id}' and tbl_event.event_from_date > '${
      today.toISOString().split("T")[0]
    }'`;
    console.log(query);

    console.log(query);

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format("MMM Do ");
            row.event_to_date = moment(row.event_to_date).format("MMM Do ");
          });

          res.render("student/student-sevent", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/studentsevent", function (req, res, next) {
  if (req.session.studentid) {
    var today = new Date();
    today.toISOString().split("T")[0];
    console.log(today);

    var studentid = req.session.studentid;
    var studentname = req.session.studentname;
    var query = `SELECT
    event_id
    , event_from_date
    , event_to_date
    , event_from_time
    , event_to_time
    , event_venue
    , event_details
    , event_photo
    , event_name
FROM
    tbl_event WHERE tbl_event.event_to_date < '${today.toISOString().split("T")[0]}' `;

    console.log(query);

    connection.query(query, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format("MMM Do ");
            row.event_to_date = moment(row.event_to_date).format("MMM Do ");
          });

          res.render("student/student-sevent", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

router.get("/seventdetails/:event_id", function (req, res, next) {
  if (req.session.studentid) {
    var studentid = req.session.studentid;
    var studentname = req.session.studentname;

    console.log("Welcome to Event Details....");
    console.log("EVENT  ID :" + req.params.event_id);

    var event_id = req.params.event_id;

    var qry = `SELECT
   tbl_event.event_id
   , tbl_event.event_from_date
   , tbl_event.event_to_date
   , tbl_event.event_from_time
   , tbl_event.event_to_time
   , tbl_event.event_venue
   , tbl_event.event_details
   , tbl_event.event_photo
   , tbl_event.event_name
   , tbl_faculty.faculty_name
   , tbl_student.student_name
   , tbl_category.category_name
   , tbl_coordinator.coordinator_mobile
     , tbl_faculty.faculty_mobile
 FROM
   tbl_faculty
   INNER JOIN tbl_event 
       ON (tbl_faculty.faculty_id = tbl_event.faculty_id)
   INNER JOIN tbl_coordinator 
       ON (tbl_event.event_id = tbl_coordinator.event_id)
   INNER JOIN tbl_category 
       ON (tbl_event.category_id = tbl_category.category_id)
   INNER JOIN tbl_student 
       ON (tbl_coordinator.student_id = tbl_student.student_id) where tbl_event.event_id = '${event_id}'`;

    console.log(query);
    console.log(qry);
    connection.query(qry, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          db_rows.forEach((row) => {
            row.event_from_date = moment(row.event_from_date).format(
              "MMM Do YYYY"
            );
            row.event_to_date = moment(row.event_to_date).format("MMM Do YYYY");
          });

          res.render("student/student-sevent-details", {
            db_rows_array: db_rows,
            studentname: studentname,
          });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/studentlogin");
  }
});

/===========FACULTY==================/;

router.get("/facultylogin", function (req, res, next) {
  res.render("faculty/faculty-login");
});

router.post("/facultyloginProcess", function (req, res, next) {
  console.log("Hello Login Process");
  var faculty_email = req.body.faculty_email;
  var faculty_pass = req.body.faculty_pass;

  query = `select * from tbl_faculty where faculty_email='${faculty_email}' and faculty_pass='${faculty_pass}'`;
  console.log(query);

  connection.query(query, function (err, rows) {
    if (err) {
      res.send(err);
    } else {
      if (rows.length > 0) {
        var facultyemail = rows[0].faculty_email;
        var facultypass = rows[0].faculty_pass;
        var facultyid = rows[0].faculty_id;
        var facultyname = rows[0].faculty_name;

        req.session.facultyemail = facultyemail;
        req.session.facultyid = facultyid;
        req.session.facultyname = facultyname;

        console.log("Session Value is" + req.session.facultyemail);
        console.log("Session facultyid : " + req.session.facultyid);
        console.log("Session Name" + req.session.facultyname);
        res.redirect("faculty-index");
      } else {
        req.flash("notify", "Invalid Credential !!!");
        res.redirect("/facultylogin");
      }
    }
  });
});

/* GET home page. */
router.get("/faculty-index", function (req, res, next) {
  if (req.session.facultyname) {
    //get session value
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    //important line

    var query = `SELECT
        tbl_event.event_name,
        tbl_event.event_id
    FROM
        tbl_faculty
        INNER JOIN tbl_event 
            ON (tbl_faculty.faculty_id = tbl_event.faculty_id) where tbl_faculty.faculty_id = '${facultyid}' `;
    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("faculty/faculty-index", {
        facultyname: facultyname,
        db_rows_array: db_rows,
      });
    });
  } else {
    res.redirect("/facultylogin");
  }
});



router.get("/facultyprofile", function (req, res, next) {
  if (req.session.facultyid) {
    //get session value
    var facultyid = req.session.facultyid;
    var facultyname = req.session.facultyname;
    //important line

    connection.query(
      "select * from tbl_faculty where faculty_id = ? ",
      [facultyid],
      function (err, db_rows) {
        if (err) {
          throw err;
        } else {
          console.log(db_rows);
          if (db_rows.length > 0) {
            db_rows.forEach((row) => {
              row.faculty_dob = moment(row.faculty_dob).format("DD/MM/YYYY");
            });

            res.render("faculty/faculty-profile", {
              db_rows_array: db_rows,
              facultyname: facultyname,
            });
          } else {
            console.log("No record");
          }
        }
      }
    );
  } else {
    res.redirect("/facultylogin");
  }
});
//Faculty Profile Edit
router.get("/facultyprofileedit", (req, res, next) => {
  if (req.session.facultyid) {
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    console.log("Faculty ID:" + facultyid);

    connection.query(
      "select * from tbl_faculty where faculty_id=?",
      [facultyid],
      (err, db_rows) => {
        if (err) throw err;
        db_rows.forEach((row) => {
          row.faculty_dob = moment(row.faculty_dob).format("YYYY-MM-DD");
        });
        res.render("faculty/edit-faculty-profile", {db_rows_array: db_rows,facultyname: facultyname});
      }
    );
  } else {
    console.log("Session Expiry..");
    res.redirect("/facultylogin");
  }
});
router.post("/facultyprofileedit", (req, res, next) => {
  if (req.session.facultyid) {
    var facultyid = req.session.facultyid;
    console.log("Faculty ID:" + facultyid);
    const facultyeditdata = {
      faculty_name: req.body.faculty_name,
      faculty_email: req.body.faculty_email,
      faculty_gender: req.body.faculty_gender,
      faculty_dob: req.body.faculty_dob,
      faculty_mobile: req.body.faculty_mobile,
      faculty_address: req.body.faculty_address,
    };
    connection.query(
      "update tbl_faculty set ? where faculty_id=?",
      [facultyeditdata, facultyid],
      (err) => {
        if (err) throw err;
        console.log("Profile Updated..");
        req.flash("notify", "Profile Updated Successfully");
        res.redirect("/facultyprofile");
      }
    );
  } else {
    console.log("Session Expiry..");
    res.redirect("/facultylogin");
  }
});

router.get("/facultylogout", function (req, res, next) {
  req.session.destroy(function (err) {
    res.redirect("/facultylogin");
  });
});

router.get("/facultychangePassword", function (req, res, next) {
  res.render("faculty/faculty-change-password");
});

router.post("/facultychangePasswordProcess", function (req, res, next) {
  console.log("Welcome to Chnage Password");
  var facultyid = req.session.facultyid;

  var opass = req.body.opass;
  var npass = req.body.npass;
  var cpass = req.body.cpass;

  console.log("session id:" + req.session.facultyid);

  if (req.session.facultyid) {
    connection.query(
      "select * from tbl_faculty where faculty_id = ? ",
      [facultyid],
      function (err, rows) {
        if (err) {
          res.send(err);
        } else {
          if (rows.length > 0) {
            var user_pass = rows[0].faculty_pass;
            console.log(user_pass);

            if (opass == user_pass) {
              if (npass == cpass) {
                connection.query(
                  "update tbl_faculty set faculty_pass = ? where faculty_id = ? ",
                  [npass, facultyid],
                  function (err, rows) {
                    req.flash("success", "Password Changed Successfully");
                    res.redirect("/facultychangePassword");
                  }
                );
              } else {
                req.flash("notify", "new and confirm password not matched");
                res.redirect("/facultychangePassword");
              }
            } else {
              req.flash("notify", "Old Password Not matched");
              res.redirect("/facultychangePassword");
            }
          } else {
            res.send("No Record Found");
          }
        }
      }
    );
  } else {
    res.redirect("/facultylogin");
  }
});

router.get("/facultyforgotPassword", function (req, res, next) {
  res.render("faculty/faculty-forgot-password");
});

router.post("/facultyforgotPasswordProcess", function (req, res, next) {
  console.log("Welcome to forgot password");
  var faculty_email = req.body.faculty_email;
  var qry = `select * from tbl_admin where faculty_email = ${faculty_email}`;
  console.log(qry);
  connection.query(
    "select * from tbl_faculty where faculty_email = ? ",
    [faculty_email],
    function (err, rows) {
      if (err) {
        res.send(err);
      } else {
        if (rows.length > 0) {
          var faculty_pass = rows[0].faculty_pass;
          console.log(faculty_pass);

          ("use strict");
          const nodemailer = require("nodemailer");

          // async..await is not allowed in global scope, must use a wrapper
          async function main() {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: "fitnessfounders9613@gmail.com", // generated ethereal user
                pass: "cre@tepass", // generated ethereal password
              },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
              from: '"Fred Foo 👻" <foo@example.com>', // sender address
              to: faculty_email, // list of receivers
              subject: "Forgot Password", // Subject line
              text: "Hello Your Password is :" + faculty_pass, // plain text body
              html: "Hello Your Password is :" + faculty_pass, // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          }

          main().catch(console.error);

          req.flash("success", "mail sent");
          res.redirect("/facultyForgotPassword");
          // res.sleep(3000);
        } else {
          req.flash("notify", "No Such Email Found");
          res.redirect("/facultyForgotPassword");
        }
      }
    }
  );
});
//Add Coordinator By Faculty
router.get("/addcoord/:event_id", function (req, res, next) {
  if (req.session.facultyname) {
    //get session value
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    //important line

    var event_id = req.params.event_id;

    var query = `select * from tbl_event where event_id='${event_id}'`;

    console.log(query);
    connection.query(query, function (err, rows1) {
      connection.query("select * from tbl_student", function (err, rows2) {
        res.render("faculty/add-coord", {
          eventData: rows1,
          studentData: rows2,
          facultyname: facultyname,
        });
      });
    });
  } else {
    res.redirect("/facultylogin");
  }
});

router.post("/addcoord/:event_id", function (req, res, next) {
  console.log(req.body);

  const data = {
    student_id: req.body.student_id,
    event_id: req.body.event_id,
    coordinator_email: req.body.coordinator_email,
    coordinator_pass: req.body.coordinator_pass,
    coordinator_mobile: req.body.coordinator_mobile,
  };
  connection.query(
    "insert into tbl_coordinator set ?",
    [data],
    function (err, result) {
      if (err) throw err;
      res.redirect("/displaycoord");
    }
  );
  req.flash("notify", "Data Added Successfully !!!");
});

//Display Coordinator
router.get("/displaycoord", function (req, res, next) {
  if (req.session.facultyname) {
    //get session value
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    //important line

    var query = `SELECT
  tbl_student.student_name
  , tbl_event.event_name
  , tbl_coordinator.coordinator_id
  , tbl_coordinator.coordinator_email
  , tbl_coordinator.coordinator_mobile
FROM
  tbl_student
  INNER JOIN tbl_coordinator 
      ON (tbl_student.student_id = tbl_coordinator.student_id)
  INNER JOIN tbl_event 
      ON (tbl_coordinator.event_id = tbl_event.event_id)`;

    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("faculty/display-coord", {
        db_rows_array: db_rows,
        facultyname: facultyname,
      });
    });
  } else {
    res.redirect("/facultylogin");
  }
});

router.get("/editcoord/:coordinator_id", function (req, res) {
  if (req.session.facultyid) {
    var facultyname = req.session.facultyname;
    console.log("coordinator_id ID:" + req.params.coordinator_id);

    var coordinator_id = req.params.coordinator_id;
    connection.query(
      "select * from tbl_coordinator where coordinator_id = ? ",
      [coordinator_id],
      function (err, db_rows) {
        if (err) throw err;
        console.log(db_rows);
        connection.query("select * from tbl_event", function (err, rows1) {
          connection.query("select * from tbl_student", function (err, rows2) {
            res.render("faculty/edit-coord", {
              db_rows_array: db_rows,
              eventData: rows1,
              studentData: rows2,
              facultyname: facultyname,
            });
          });
        });
      }
    );
  } else {
    res.redirect("/facultylogin");
  }
});

router.post("/editcoord/:coordinator_id", function (req, res) {
  console.log(coordinator_id);
  var coordinator_id = req.params.coordinator_id;

  var coordinator_mobile = req.body.coordinator_mobile;

  var coordinator_email = req.body.coordinator_email;
  var coordinator_pass = req.body.coordinator_pass;
  var student_id = req.body.student_id;
  var event_id = req.body.event_id;

  var query = `update tbl_coordinator set  coordinator_email = '${coordinator_email}', coordinator_mobile = '${coordinator_mobile}' , coordinator_pass = '${coordinator_pass}', student_id = '${student_id}', event_id = '${event_id}' where coordinator_id = ${coordinator_id} `;
  req.flash("notify", "Data Edited Succesfully !!!");

  console.log(query);
  connection.query(query, function (err, data) {
    if (err) throw err;
    console.log(data);
    res.redirect("/displaycoord");
  });
});

router.get("/deletecoord/:coordinator_id", function (req, res) {
  var coordinator_id = req.params.coordinator_id;
  console.log(" coordinator_id" + coordinator_id);

  connection.query(
    "delete from tbl_coordinator where coordinator_id  = ?",
    [coordinator_id],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displaycoord");
    }
  );
});

//======Winner Display=====
router.get("/facultywinner", function (req, res, next) {
  if (req.session.facultyname) {
    //get session value
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    //important line

    var query = `SELECT
        tbl_event.event_name,
        tbl_event.event_id
    FROM
        tbl_faculty
        INNER JOIN tbl_event 
            ON (tbl_faculty.faculty_id = tbl_event.faculty_id) where tbl_faculty.faculty_id = '${facultyid}' `;
    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("faculty/faculty-winner", {
        facultyname: facultyname,
        db_rows_array: db_rows,
      });
    });
  } else {
    res.redirect("/facultylogin");
  }
});

router.get("/addwinner/:event_id", function (req, res, next) {
  if (req.session.facultyid) {
    var facultyname = req.session.facultyname;
    var event_id = req.params.event_id;

    var query = `SELECT
    tbl_registration.student_id
    , tbl_student.student_name
    , tbl_attendance.reg_id
    , tbl_event.event_id
    , tbl_event.event_name
    , tbl_attendance.attendance_id
    , tbl_attendance.is_present
FROM
    tbl_registration
    INNER JOIN tbl_student 
        ON (tbl_registration.student_id = tbl_student.student_id)
    INNER JOIN tbl_attendance 
        ON (tbl_attendance.reg_id = tbl_registration.reg_id)
    INNER JOIN tbl_event 
        ON (tbl_registration.event_id = tbl_event.event_id) WHERE tbl_event.event_id = '${event_id}' AND tbl_attendance.is_present = 1  `;
    console.log(query);

    connection.query(query, function (err, rows1) {
      console.log(rows1);

      res.render("faculty/add-winner", {
        studentData: rows1,
        facultyname: facultyname,
      });
    });
  } else {
    res.redirect("/facultylogin");
  }
});

router.post("/addWinnerProcess/:length", function (req, res, next) {
  console.log(req.body);

  console.log("Welcome to Add Winner Process");

  var length = req.params.length;
  console.log("Length" + length);

  var winner_status = req.body.winner_status;

  console.log("is present" + winner_status);

  var event_id = req.body.event_id;
  console.log("Event id:" + event_id);
  var student_id = req.body.student_id;
  console.log("Student id:" + student_id);

  var attendance_id = req.body.attendance_id;
  console.log("attendance  id:" + attendance_id);

if(length>1){
  connection.connect(function (err) {
    for (var i = 0; i < event_id.length; i++) {
      if (winner_status[i] == "1") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (1,${student_id[i]},${event_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else if (winner_status[i] == "2") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (2,${student_id[i]},${event_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else if (winner_status[i] == "3") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (3,${student_id[i]},${event_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (4,${student_id[i]},${event_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
    }
    req.flash("notify", "Ranks Marked!!!");
    res.redirect("/faculty-index");
  });
} else if(length==1){
  connection.connect(function (err) {
    for (var i = 0; i < event_id.length; i++) {
      if (winner_status[i] == "1") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (1,${student_id},${event_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else if (winner_status[i] == "2") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (2,${student_id},${event_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else if (winner_status[i] == "3") {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (3,${student_id},${event_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      } else {
        connection.query(
          `insert into tbl_winner(winner_status,student_id,event_id) VALUES (4,${student_id},${event_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
    }
    req.flash("notify", "Ranks Marked!!!");
    res.redirect("/faculty-index");
  });
}
else{
  console.log("No Record Found");
}

});

//Display Winner

//Display Coordinator
router.get("/displayprize", function (req, res, next) {
  if (req.session.facultyname) {
    //get session value
    var facultyname = req.session.facultyname;
    var facultyid = req.session.facultyid;
    //important line

    var query = `SELECT
    tbl_winner.winner_id
    , tbl_winner.winner_status
    , tbl_winner.winner_date
    , tbl_student.student_name
    , tbl_event.event_name
FROM
    tbl_student
    INNER JOIN tbl_winner 
        ON (tbl_student.student_id = tbl_winner.student_id)
    INNER JOIN tbl_event 
        ON (tbl_winner.event_id = tbl_event.event_id)`;

    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      db_rows.forEach((row) => {
        row.winner_date = moment(row.winner_date).format("DD/MM/YYYY");
      });
      console.log(db_rows);
      res.render("faculty/display-prize", {db_rows_array: db_rows,facultyname: facultyname});
    });
  } else {
    res.redirect("/facultylogin");
  }
});

//Delete Prize

router.get("/deleteprize/:winner_id", function (req, res) {
  var winner_id = req.params.winner_id;
  console.log(" winner_id" + winner_id);

  connection.query(
    "delete from tbl_winner where winner_id  = ?",
    [winner_id],
    function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      req.flash("notify", "Data Deleted Succesfully !!!");

      res.redirect("/displayprize");
    }
  );
});




//=====Faculty Complete================


//======Coord Start===============
router.get("/coordlogin", function (req, res, next) {
  res.render("coordinator/coord-login");
});

router.post("/coordloginProcess", function (req, res, next) {
  console.log("Hello Login Process");
  var coordinator_email = req.body.coordinator_email;
  var coordinator_pass = req.body.coordinator_pass;

  query = `select * from tbl_coordinator where coordinator_email='${coordinator_email}' and coordinator_pass='${coordinator_pass}'`;
  console.log(query);

  connection.query(query, function (err, rows) {
    if (err) {
      res.send(err);
    } else {
      if (rows.length > 0) {
        var coordinatoremail = rows[0].coordinator_email;
        var coordinatorpass = rows[0].coordinator_pass;
        var coordinatorid = rows[0].coordinator_id;

        req.session.coordinatoremail = coordinatoremail;
        req.session.coordinatorpass = coordinatorpass;
        req.session.coordinatorid = coordinatorid;

        console.log("Session Value is" + req.session.coordinatoremail);
        console.log("Session coordid : " + req.session.coordinatorid);

        res.redirect("coord-index");
      } else {
        req.flash("notify", "Invalid Credential !!!");
        res.redirect("/coordlogin");
      }
    }
  });
});

/* GET home page. */
router.get("/coord-index", function (req, res, next) {
  if (req.session.coordinatorid) {
    //get session value
    var coordinatorid = req.session.coordinatorid;
    var coordinatoremail = req.session.coordinatoremail;
    //important line

    var query = `SELECT
          tbl_event.event_name,
          tbl_event.event_id
      FROM
          tbl_coordinator
          INNER JOIN tbl_event 
              ON (tbl_coordinator.event_id = tbl_event.event_id) where tbl_coordinator.coordinator_email = '${coordinatoremail}' `;
    console.log(query);
    connection.query(query, function (err, db_rows) {
      if (err) throw err;
      console.log(db_rows);
      res.render("coordinator/coord-index", { db_rows_array: db_rows });
    });
  } else {
    res.redirect("/coordlogin");
  }
});

router.get("/coordlogout", function (req, res, next) {
  req.session.destroy(function (err) {
    res.redirect("/coordlogin");
  });
});

router.get("/coordprofile", function (req, res, next) {
  if (req.session.coordinatorid) {
    //get session value
    var coordinatorid = req.session.coordinatorid;
    var coordinatoremail = req.session.coordinatoremail;
    //important line
    var qry = `SELECT
        tbl_coordinator.coordinator_id
        , tbl_coordinator.coordinator_email
        , tbl_coordinator.coordinator_pass
        , tbl_coordinator.coordinator_mobile
        , tbl_student.student_name
        , tbl_event.event_name
    FROM
        tbl_coordinator
        INNER JOIN tbl_student 
            ON (tbl_coordinator.student_id = tbl_student.student_id)
        INNER JOIN tbl_event 
            ON (tbl_coordinator.event_id = tbl_event.event_id) where tbl_coordinator.coordinator_email = '${coordinatoremail}'`;

    console.log(qry);

    connection.query(qry, function (err, db_rows) {
      if (err) {
        throw err;
      } else {
        console.log(db_rows);
        if (db_rows.length > 0) {
          res.render("coordinator/coord-profile", { db_rows_array: db_rows });
        } else {
          console.log("No record");
        }
      }
    });
  } else {
    res.redirect("/coordlogin");
  }
});

router.get("/coordchangePassword", function (req, res, next) {
  res.render("coordinator/coord-change-password");
});

router.post("/coordchangePasswordProcess", function (req, res, next) {
  console.log("Welcome to Chnage Password");
  var coordinatorid = req.session.coordinatorid;

  var opass = req.body.opass;
  var npass = req.body.npass;
  var cpass = req.body.cpass;

  console.log("session id:" + req.session.coordinatorid);

  if (req.session.coordinatorid) {
    connection.query(
      "select * from tbl_coordinator where coordinator_id = ? ",
      [coordinatorid],
      function (err, rows) {
        if (err) {
          res.send(err);
        } else {
          if (rows.length > 0) {
            var user_pass = rows[0].coordinator_pass;
            console.log(user_pass);

            if (opass == user_pass) {
              if (npass == cpass) {
                connection.query(
                  "update tbl_coordinator set coordinator_pass = ? where coordinator_id = ? ",
                  [npass, coordinatorid],
                  function (err, rows) {
                    req.flash("success", "Password Changed Successfully");
                    res.redirect("/coordchangePassword");
                  }
                );
              } else {
                req.flash("notify", "new and confirm password not matched");
                res.redirect("/coordchangePassword");
              }
            } else {
              req.flash("notify", "Old Password Not matched");
              res.redirect("/coordchangePassword");
            }
          } else {
            res.send("No Record Found");
          }
        }
      }
    );
  } else {
    res.redirect("/coordlogin");
  }
});

router.get("/coordforgotPassword", function (req, res, next) {
  res.render("coordinator/coord-forgot-password");
});

router.post("/coordforgotPasswordProcess", function (req, res, next) {
  console.log("Welcome to forgot password");
  var coordinator_email = req.body.coordinator_email;
  var qry = `select * from tbl_coordinator where coordinator_email = ${coordinator_email}`;
  console.log(qry);
  connection.query(
    "select * from tbl_coordinator where coordinator_email = ? ",
    [coordinator_email],
    function (err, rows) {
      if (err) {
        res.send(err);
      } else {
        if (rows.length > 0) {
          var coordinator_pass = rows[0].coordinator_pass;
          console.log(coordinator_pass);

          ("use strict");
          const nodemailer = require("nodemailer");

          // async..await is not allowed in global scope, must use a wrapper
          async function main() {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true, // true for 465, false for other ports
              auth: {
                user: "fitnessfounders9613@gmail.com", // generated ethereal user
                pass: "cre@tepass", // generated ethereal password
              },
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
              from: '"Admin"', // sender address
              to: coordinator_email, // list of receivers
              subject: "Forgot Password", // Subject line
              text: "Hello Your Password is :" + coordinator_pass, // plain text body
              html: "Hello Your Password is :" + coordinator_pass, // html body
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          }

          main().catch(console.error);

          req.flash("success", "mail sent");
          res.redirect("/coordForgotPassword");
          // res.sleep(3000);
        } else {
          req.flash("notify", "No Such Email Found");
          res.redirect("/coordForgotPassword");
        }
      }
    }
  );
});

// ============Coordinator Add Attendance
router.get("/addAttendance/:event_id", function (req, res, next) {
  if (req.session.coordinatorid) {
    var coordinatorid = req.session.coordinatorid;
    var event_id = req.params.event_id;
    
    var query = `SELECT
      tbl_registration.student_id
      ,tbl_registration.reg_id
      , tbl_student.student_name
      , tbl_event.event_id
      , tbl_event.event_name
      
  FROM
      tbl_student
      INNER JOIN tbl_registration 
          ON (tbl_student.student_id = tbl_registration.student_id)
      INNER JOIN tbl_event 
          ON (tbl_event.event_id = tbl_registration.event_id) where tbl_event.event_id = '${event_id}' `;
    console.log(query);

    connection.query(query, function (err, rows1) {
      res.render("coordinator/add-attendance", {studentData: rows1,coordinatorid: coordinatorid});
    });
  } else {
    res.redirect("/coordlogin");
  }
});



router.post("/addAttendanceProcess/:length", function (req, res, next) {
  console.log(req.body);

  console.log("Welcome to Add Attendance Process");

  var length = req.params.length;
  console.log("Length" + length);

  var is_present = req.body.is_present;

  console.log("is present" + is_present);

  var reg_id = req.body.reg_id;
  console.log("Reg id:" + reg_id);
  var student_id = req.body.student_id;
  console.log("Student id:" + student_id);




  if(length>1){
  connection.connect(function (err) {
    for (var i = 0; i < reg_id.length; i++) {
      if (is_present[i] == "1") {
        connection.query(
          `insert into tbl_attendance(is_present,reg_id,student_id) VALUES (1,${reg_id[i]},${student_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
      if (is_present[i] == "0") {
        connection.query(
          `insert into tbl_attendance(is_present,reg_id,student_id) VALUES (0,${reg_id[i]},${student_id[i]})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
    }
    req.flash("notify", "Attendance Marked!!!");
    res.redirect("/coord-index");

  });
}
else if(length==1){
  connection.connect(function (err) {
    for (var i = 0; i < reg_id.length; i++) {
      if (is_present[i] == "1") {
        connection.query(
          `insert into tbl_attendance(is_present,reg_id,student_id) VALUES (1,${reg_id},${student_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
      if (is_present[i] == "0") {
        connection.query(
          `insert into tbl_attendance(is_present,reg_id,student_id) VALUES (0,${reg_id},${student_id})`,
          function (err, result) {
            if (err) throw err;
            console.log("Values Added");
          }
        );
      }
    }
    req.flash("notify", "Attendance Marked!!!");
    res.redirect("/coord-index");

  });
}
else{
  console.log("No Record Found");
}
});



router.get("/dispeventcatwise", function (req, res, next) {
  var query = `select * from tbl_category`;

  connection.query(query, function (err, db_rows) {
    if (err) throw err;
    console.log(db_rows);
    res.render("reports/disp-event-catwise", { db_rows_array: db_rows });
  });
});

router.post("/dispeventcatwise", function (req, res, next) {
  var category_id = req.body.category;

  var query = `SELECT
 tbl_category.category_id
 , tbl_category.category_name
 , tbl_event.event_id
 , tbl_event.event_from_date
 , tbl_event.event_to_date
 , tbl_event.event_from_time
 , tbl_event.event_to_time
 , tbl_event.event_venue
 , tbl_event.event_name
FROM
 tbl_event
 INNER JOIN tbl_category 
     ON (tbl_event.category_id = tbl_category.category_id) WHERE tbl_category.category_id = '${category_id}'`;

  connection.query(query, function (err, db_rows) {
    if (err) throw err;
    console.log(db_rows);
    db_rows.forEach((row) => {
      row.event_from_date = moment(row.event_from_date).format("MMM Do YYYY");
      row.event_to_date = moment(row.event_to_date).format("MMM Do YYYY");
    });
    res.render("reports/disp-event-catwise", { db_rows_array: db_rows });
  });
});
module.exports = router;
