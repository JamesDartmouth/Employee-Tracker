// const express = require('express');
// const routes = require('./routes');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const db = require('./config/connection');
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
start();

// presented with a formatted table showing department names and department ids

function viewDepartments() {
  // `SELECT department.id AS id, department.name AS department FROM department`
  db.query('SELECT * from department').then((result, err) => {
    if (err) console.error(err);
    console.table(result);
    start();
  })
}

// job title, role id, the department that role belongs to, and the salary for that role
function viewRoles() {
  db.query(
    'SELECT role.title, role.id, role.salary, department.department_name AS department FROM role LEFT JOIN department ON role.department_id = department.id')
    .then((result, err) => {
      if (err) console.error(err);
      console.table(result);
      start();
    });
}

// presented with a formatted table showing employee data, including employee ids, 
// first names, last names, job titles, departments, salaries, and managers that the employees report to

// TROUBLE WITH ADDING MANAGER-------------------------------------------------------------------------

function viewEmployees() {
  db.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, 
    department.department_name AS department, role.salary 
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id`)
    .then((result, err) => {
      if (err) console.error(err);
      console.table(result);
      start();
    })
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
      db.query(`INSERT INTO department (department_name) VALUES (?)`, answer.newDept, (err, result) => {
        if (err) throw (err);
        console.log('Added ' + answer.newDept + " to departments!");
        viewDepartments();
      });
    });
}

function addRole() {

  const departments = db.query('SELECT * FROM department')

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
    }
  ])

    // DEPARTMENT ADDED AS NULL-------------------------------------------------------------------------------------------
    .then(answer => {

      const params = [answer.title, answer.salary]

      db.query(`SELECT department_name, id FROM department`, (err, result) => {
        if (err) throw err;

        const dept = result.map(({ department_name, department_id }) => ({ name: department_name, value: department_id }));

        inquirer.prompt([
          {
            name: 'departmentId',
            type: 'list',
            message: 'What department ID is this role associated with?',
            choices: dept

          }
        ])
          .then(newRoleDept => {
            params.push(newRoleDept.departmentId);

            db.query(`INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`, params, (err, result) => {
              if (err) throw (err);
              console.log('Added ' + answer.role + " to roles!");
              viewRoles();
            });
          });
      });
    })
}
// prompted to enter the employee’s first name, last name, role, and manager, 
// and that employee is added to the database

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
  ])

    .then(answer => {

      const params = [answer.firstName, answer.lastName]

      db.query(`SELECT role.id, role.title FROM role`, (err, result) => {
        if (err) throw (err);

        const roles = result.map(({ id, title }) => ({ name: title, value: id }));

        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is the employee's role?",
            choices: roles
          }
        ])

          .then(newRole => {

            params.push(newRole.role)

            db.query(`SELECT * FROM employee`, (err, data) => {
              if (err) throw (err);

              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: "Who is the employee's manager?",
                  choices: managers
                }
              ])

                .then(newManager => {

                  params.push(newManager.manager);

                  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`, params, (err, result) => {
                    if (err) throw (err);
                    console.log('New employee has been added!')
                    viewEmployees();
                  });
                })
            });
          })
      })
    })
}

function updateEmployeeRole() {

  db.query('SELECT * FROM employee', (err, data) => {
    if (err) throw (err);

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])

      .then(updateEmployee => {
        const params = [];
        params.push(updateEmployee.name);

        db.query('SELECT * FROM role', (err, data) => {
          if (err) console.error(err);

          const roles = data.map(({ id, title }) => ({ name: title, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's new role?",
              choices: roles
            }
          ])
            .then(updateRole => {
              params.unshift(updateRole.role)

              db.query(`UPDATE employee SET role_id =? Where id = ?`, params, (err, result) => {
                if (err) throw (err);
                console.log("Employee has been updated!");
                viewEmployees();
              })
            })
        })
      })
  })
}
