//DEPENDENCIES
const inquirer = require("inquirer");
const mysql = require("mysql2");

//DATA
const options = [
  "View All Employees",
  "Add Employee",
  "Update Employee Role",
  "View All Roles",
  "Add Role",
  "View All Departments",
  "Add Department",
  "Quit",
];

//DATABASE CONNECTION
const db = mysql.createConnection(
  {
    user: "root",
    password: "password",
    host: "localhost",
    database: "employee_db",
  },
  console.log("Connection to database was successful")
);

//FUNCTIONS

//given a sql query as input, will display the table into the console
const printTable = (query) => {
  db.query(query, (err, result) => {
    console.table(result);
    init();
  });
};

const init = () => {
  //create the main menu
  inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What do you want to do?",
        choices: options,
      },
    ])
    .then((choice) => {
      //View All Departments
      if (choice.menu === options[5]) {
        printTable("SELECT * FROM department;");
      }
      //View All Roles
      else if (choice.menu === options[3]) {
        printTable(`SELECT r.id, r.title, d.name AS "department", r.salary
        FROM roles AS r LEFT JOIN department AS d ON r.department_id = d.id;`);
      }
      //add a role
      else if (choice.menu === options[4]) {
        const departmentList = [];
        // db.query(`select * from department;`, (err, result) => {
        //   departmentList = result;
        //   //result.map((obj) => obj.id);
        // });
        inquirer
          .prompt([
            {
              type: "input",
              message: "Enter Role Name",
              name: "name",
            },
            {
              type: "number",
              message: "Enter Salary",
              name: "salary",
            },
            {
              type: "list",
              message: "Choose a Department",
              name: "department",
              options: function () {
                await db.query(`select * from department;`, (err, result) => {
                  return result.map((obj) => obj.id);
                });
              },
            },
          ])
          .then((answer) => {
            // db.query(
            //   `INSERT INTO roles(title, salary, )
            // VALUES ("${answer.name}")`,
            //   (err, result) => {
            //     console.log(answer.name, "was entered into Department table");
            //     return init();
            //   }
            // );
          });
      }
      //view all employees
      else if (choice.menu === options[0]) {
        printTable(`SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title as "Title", d.name as "Department", r.salary as "Salary", concat(employee.first_name, ' ', employee.last_name) as "Manager" 
        FROM employee AS e 
        LEFT JOIN roles AS r on e.role_id = r.id 
        LEFT JOIN department AS d ON r.department_id = d.id
        LEFT JOIN employee on e.manager_id = employee.id`);
      }
      //add department
      else if (choice.menu === options[6]) {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Enter Department Name",
              name: "name",
            },
          ])
          .then((answer) => {
            db.query(
              `INSERT INTO department(name)
            VALUES ("${answer.name}")`,
              (err, result) => {
                console.log(answer.name, "was entered into Department table");
                return init();
              }
            );
          });
      } else {
        db.close();
        return;
      }
    });
};

//INITIALIZATIONS
init();
