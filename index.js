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
  "View Department Utilized Budget",
  "Quit",
];

let depList = [];
let roleList = [];
let empList = [];

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

//get the current department list
const updateDepartmentList = () => {
  db.query(`select * from department;`, (err, result) => {
    depList = result;
  });
};
//given a name and a list, find the element and return the id
const getId = (nameInput, list) => {
  if (nameInput === "None") return null;
  for (elem of list) {
    if (elem.name === nameInput) {
      return elem.id;
    }
  }
};
//get the current role list
const updateRoleList = () => {
  db.query(`select r.id, r.title as "name" from roles as r;`, (err, result) => {
    roleList = result;
  });
};

//get the current employee list
const updateEmployeeList = () => {
  db.query(
    `select e.id, concat(e.first_name," ", e.last_name) as "name" from employee as e;`,
    (err, result) => {
      empList = result;
      empList.push("None");
    }
  );
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
      //view all employees
      if (choice.menu === options[0]) {
        printTable(`SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title as "Title", d.name as "Department", r.salary as "Salary", concat(employee.first_name, ' ', employee.last_name) as "Manager" 
                FROM employee AS e 
                LEFT JOIN roles AS r on e.role_id = r.id 
                LEFT JOIN department AS d ON r.department_id = d.id
                LEFT JOIN employee on e.manager_id = employee.id`);
      }
      //add an employee
      else if (choice.menu === options[1]) {
        inquirer
          .prompt([
            {
              type: "input",
              message: "Enter Employee's First Name",
              name: "firstName",
            },
            {
              type: "input",
              message: "Enter Employee's Last Name",
              name: "lastName",
            },
            {
              type: "list",
              message: "What is the employee's role?",
              name: "role",
              choices: roleList,
            },
            {
              type: "list",
              message: "Who is the employee's manager?",
              name: "manager",
              choices: empList,
            },
          ])
          .then((answer) => {
            db.query(
              `INSERT INTO employee(first_name, last_name, role_id, manager_id)
            VALUES ("${answer.firstName}", "${answer.lastName}", ${getId(
                answer.role,
                roleList
              )}, ${getId(answer.manager, empList)})`,
              (err, result) => {
                console.log(
                  answer.firstName,
                  answer.lastName,
                  "was entered into Employee table"
                );
                updateEmployeeList();
                return init();
              }
            );
          });
      }
      //update employee role
      else if (choice.menu === options[2]) {
        inquirer
          .prompt([
            {
              type: "list",
              message: "Choose a employee to update:",
              name: "emp",
              choices: empList,
            },
            {
              type: "list",
              message: "Choose which role you want to assign:",
              name: "role",
              choices: roleList,
            },
          ])
          .then((choice) => {
            db.query(
              `UPDATE employee SET role_id = ${getId(
                choice.role,
                roleList
              )} WHERE id = ${getId(choice.emp, empList)}`,
              (err, result) => {
                updateEmployeeList();
                err
                  ? console.log(err)
                  : console.log(choice.emp, "is now a", choice.role);
                return init();
              }
            );
          });
      }
      //View All Roles
      else if (choice.menu === options[3]) {
        printTable(`SELECT r.id, r.title, d.name AS "department", r.salary
              FROM roles AS r LEFT JOIN department AS d ON r.department_id = d.id;`);
      }
      //add a role
      else if (choice.menu === options[4]) {
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
              choices: depList,
            },
          ])
          .then((answer) => {
            db.query(
              `INSERT INTO roles(title, salary, department_id)
                  VALUES ("${answer.name}", ${parseInt(answer.salary)}, ${getId(
                answer.department,
                depList
              )})`,
              (err, result) => {
                console.log(answer.name, "was entered into Roles table");
                updateRoleList();
                return init();
              }
            );
          });
      }
      //View All Departments
      else if (choice.menu === options[5]) {
        printTable("SELECT * FROM department;");
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
                updateDepartmentList();
                return init();
              }
            );
          });
      }
      //view department budget
      else if (choice.menu === options[7]) {
        printTable(`SELECT d.name as "Department Name", COALESCE(sum(r.salary), 0) AS "Total Budget $"
        FROM department as d 
        LEFT JOIN roles AS r ON d.id = r.department_id
        LEFT JOIN employee AS e ON r.id = e.role_id
        GROUP BY d.name;`);
      } else {
        db.close();
        return;
      }
    });
};

//INITIALIZATIONS
updateEmployeeList();
updateDepartmentList();
updateRoleList();
init();
