// const express = require('express');
// const routes = require('./routes');
const mysql = require('mysql2');
const inquirer = require('inquirer'); 
const db = require('./db/connection');
require('console.table')

const utils = require('util');
db.query = utils.promisify(db.query);

function start(){
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
    switch (options.choice){

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

function viewDepartments(){
  db.query('SELECT * FROM department').then((result, err) => {
    if(err) console.error(err);
    console.table(result);
    start();
  })
}

function viewRoles(){
  db.query('SELECT * FROM department').then((result, err) => {
    if(err) console.error(err);
    console.table(result);
    start();
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

