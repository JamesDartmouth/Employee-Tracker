// const express = require('express');
// const routes = require('./routes');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const db = require('./db/connection');
require('console.table')

const utils = require('util');
db.query = utils.promisify(db.query);


// presented with the following options: view all departments, view all roles, view all employees, 
// add a department, add a role, add an employee, and update an employee role

function start() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: ['View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        // 'Update employee manager',
        // 'View employees by manager',
        // 'View employees by department',
        // 'Delete a department',
        // 'Delete a role',
        // 'Delete an employee',
        // 'View department budgets',
        'Quit']
    }
  ])
    .then((options) => {
      switch (options.choice) {

        case 'View all departments':
          viewDepartments();
          break;

        case 'View all roles':
          viewRoles();
          break;

        case 'View all employees':
          viewEmployees();
          break;

        case 'Add a department':
          addDepartment();
          break;

        case 'Add a role':
          addRole();
          break;

        case 'Add an employee':
          addEmployee();
          break;

        case 'Update an employee role':
          updateEmployeeRole();
          break;
        //
        //   case 'Update employee manager':
        //     updateEmployeeManager();
        //     break;    

        //   case 'View employees by manager':
        //     viewEmployeesByManager();
        //     break;

        //   case 'View employees by department':
        //     viewEmployeesByDepartment();
        //     break;

        //   case 'Delete a department':
        //     deleteDepartment();
        //     break;   

        //   case 'Delete a role':
        //     deleteRole();
        //     break;

        //   case 'Delete an employee':
        //     deleteEmployee();
        //     break;

        //   case 'View department budgets':
        //     viewDepartmentBudgets();
        //     break;

        default:
          process.exit();
      }
    });
}


// presented with a formatted table showing department names and department ids

function viewDepartments() {
  // `SELECT department.id AS id, department.name AS department FROM department`
  db.query('SELECT * FROM department').then((result, err) => {
    if (err) console.error(err);
    console.table(result);
    start();
  })
}

// job title, role id, the department that role belongs to, and the salary for that role
function viewRoles() {
  db.query(
    'SELECT role.title, role.id, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id')
    .then((result, err) => {
      if (err) console.error(err);
      console.table(result);
      start();
    });
}

// presented with a formatted table showing employee data, including employee ids, 
// first names, last names, job titles, departments, salaries, and managers that the employees report to

function viewEmployees() {
  db.query(
    // `SELECT employee.id, 
    //                   employee.first_name, 
    //                   employee.last_name, 
    //                   role.title, 
    //                   department.name AS department,
    //                   role.salary, 
    //                   CONCAT (manager.first_name, " ", manager.last_name) AS manager
    //            FROM employee
    //                   LEFT JOIN role ON employee.role_id = role.id
    //                   LEFT JOIN department ON role.department_id = department.id
    //                   LEFT JOIN employee manager ON employee.manager_id = manager.id`
    'SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, employee_role.salary FROM employeetracker_db.employee LEFT JOIN employee_role on employee_role.id = employee.role_id')
    .then((result, err) => {
      if (err) console.error(err);
      console.table(result);
      start();
    });
}

// prompted to enter the name of the department and that department is added to the database

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'newDept',
      message: 'What Department would you like to add?',
    }
  ])
  .then(answer => {
    db.query("INSERT INTO department SET ?", {
          department_name: answer.deptName
      })
    if (err) throw (err);
    console.log('Added ' + answer.newDept + " to departments!");

    viewDepartments();
  })
    // .then(answer => {
    //   db.query(`INSERT INTO department (name) VALUES (?)`, answer.newDept, (err, result) => {
    //     if (err) throw (err);
    //     console.log('Added ' + answer.newDept + " to departments!");
    //     viewDepartments();
    //   })
    // })
}

function addRole() {
  inquirer.prompt([
    {
      name: 'title',
      type: 'input',
      message: 'What is the title of your new role?'
    },
    {
      name: 'salary',
      type: 'input',
      message: 'What is the salary of this new role?'
    },
    {
      name: 'departmentId',
      type: 'list',
      choices: departments.map((departmentId) => {
        return {
          name: departmentId.department_name,
          value: departmentId.id
        }
      }),
      message: 'What department ID is this role associated with?',
    }
  ])
    .then(answer => {
      db.query('INSERT INTO role SET ?', {
        title: answer.title,
        salary: answer.salary,
        department_id: answer.departmentId
      })
      if (err) throw (err);
      console.log('Added ' + answer.title + " to roles!");

      viewRoles();
    })
}

function addEmployee() {
  inquirer.prompt([
    {
      name: 'firstName',
      type: 'input',
      message: 'What is the first name of this Employee?'
  },
  {
      name: 'lastName',
      type: 'input',
      message: 'What is the last name of this Employee?'
  },
  {
      name: 'roleId',
      type: 'list',
      // choices: roles.map((role) => {
      //     return {
      //         name: role.title,
      //         value: role.id
      //     }
      // }),
      message: "What is this Employee's role id?"
  },
  {
      name: 'managerId',
      type: 'list',
      // choices: managers.map((manager) => {
      //     return {
      //         name: manager.first_name + " " + manager.last_name,
      //         value: manager.id
      //     }
      // }),
      message: "What is this Employee's Manager's Id?"
  }
  ])
    .then(answer => {
      db.query("INSERT INTO employee SET ?", {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: (answer.employeeRoleId),
        // manager_id: (answer.employeeManagerId)
    })
      if (err) throw (err);
      console.log('Added ' + answer.firstName + answer.lastName +  " to employees!");

      viewEmployees();
    })
}

function updateEmployeeRole(){

  db.query('SELECT * FROM employee').then((result, err) => {
    if (err) console.error(err);

    const employees = result.map(({id, first_name, last_name})=> ({name: first_name + " " + last_name, value: id}));
  
    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
    .then(){
      db.query('SELECT * FROM role').then((data, err) => {
        if (err) console.error(err);
    
        const roles = data.map(({title,  department_id})=> ({role: title,  value: department_id}name: first_name + " " + last_name, value: id}));
      
        inquirer.prompt([
          {
            type: 'list',
            name: 'name',
            message: "What is the employee's new role?",
            choices: roles
          }
        ])

    }
    
    .then(answer => {
      db.query("INSERT INTO employee SET ?", {
        first_name: answer.firstName,
        last_name: answer.lastName,
        role_id: (answer.employeeRoleId),
        // manager_id: (answer.employeeManagerId)
    })
      if (err) throw (err);
      console.log('Added ' + answer.firstName + answer.lastName +  " to employees!");

      viewEmployees();
    })
}

// What would you like to do?
// View all Employees
// Add Employee
// Update Employee Resolver
// View all Roles
// Add ROle
// View All Departments
// Add Department
// Quit 
