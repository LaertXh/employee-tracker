USE employee_db

-- view all departments 
SELECT * FROM department;

-- view all roles
SELECT r.id, r.title, d.name AS "department", r.salary
FROM roles AS r LEFT JOIN department AS d ON r.department_id = d.id;

-- vew all employees 
SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", r.title as "Title", d.name as "Department", r.salary as "Salary", concat(employee.first_name, ' ', employee.last_name) as "Manager" 
FROM employee AS e 
LEFT JOIN roles AS r on e.role_id = r.id 
LEFT JOIN department AS d ON r.department_id = d.id
LEFT JOIN employee on e.manager_id = employee.id;

-- view budget used 
SELECT d.name as "Department Name", COALESCE(sum(r.salary), 0) AS "Total Budget $"
FROM department as d 
LEFT JOIN roles AS r ON d.id = r.department_id
LEFT JOIN employee AS e ON r.id = e.role_id
GROUP BY d.name;

