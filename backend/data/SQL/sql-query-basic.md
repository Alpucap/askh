---
title: SQL Basic Commands
---
# SQL Query Commands

## Data Query Commands

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **SELECT** | Retrieving specific columns from a table | `SELECT column1, column2 FROM table_name;` |
| **SELECT *** | Retrieving all columns from a table | `SELECT * FROM table_name;` |
| **DISTINCT** | Returning only unique (different) values | `SELECT DISTINCT country FROM customers;` |
| **WHERE** | Filtering records that meet a certain condition | `SELECT * FROM orders WHERE amount > 100;` |
| **AND** | Combining multiple conditions where all must be true | `SELECT * FROM users WHERE age > 18 AND active = 1;` |
| **OR** | Combining multiple conditions where at least one is true | `SELECT * FROM users WHERE city = 'NY' OR city = 'LA';` |
| **NOT** | Negating a condition | `SELECT * FROM products WHERE NOT category = 'Electronics';` |
| **ORDER BY** | Sorting the result set in ascending or descending order | `SELECT * FROM employees ORDER BY salary DESC;` |
| **LIMIT / TOP** | Specifying the number of records to return | `SELECT * FROM users LIMIT 5;` |
| **IS NULL** | Testing for empty values (NULL) | `SELECT * FROM tasks WHERE due_date IS NULL;` |
| **IS NOT NULL** | Testing for non-empty values | `SELECT * FROM tasks WHERE completed_at IS NOT NULL;` |
| **BETWEEN** | Selecting values within a given range | `SELECT * FROM products WHERE price BETWEEN 10 AND 50;` |
| **IN** | Specifying multiple possible values for a column | `SELECT * FROM users WHERE id IN (1, 5, 9);` |
| **LIKE** | Searching for a specified pattern in a column | `SELECT * FROM customers WHERE name LIKE 'A%';` |
| **AS (Alias)** | Giving a table or column a temporary name | `SELECT first_name AS Name FROM users;` |

## Aggregation and Grouping

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **COUNT** | Returning the number of rows that match a criteria | `SELECT COUNT(id) FROM orders;` |
| **SUM** | Returning the total sum of a numeric column | `SELECT SUM(total) FROM invoices;` |
| **AVG** | Returning the average value of a numeric column | `SELECT AVG(score) FROM tests;` |
| **MIN** | Returning the smallest value in a column | `SELECT MIN(price) FROM items;` |
| **MAX** | Returning the largest value in a column | `SELECT MAX(price) FROM items;` |
| **GROUP BY** | Grouping rows that have the same values into summary rows | `SELECT category, COUNT(*) FROM products GROUP BY category;` |
| **HAVING** | Filtering groups created by GROUP BY (WHERE cannot be used with aggregates) | `SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 5;` |

## Joins and Combinations

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **INNER JOIN** | Returning records that have matching values in both tables | `SELECT users.name, orders.id FROM users INNER JOIN orders ON users.id = orders.user_id;` |
| **LEFT JOIN** | Returning all records from the left table, and matched records from the right | `SELECT users.name, orders.id FROM users LEFT JOIN orders ON users.id = orders.user_id;` |
| **RIGHT JOIN** | Returning all records from the right table, and matched records from the left | `SELECT users.name, orders.id FROM users RIGHT JOIN orders ON users.id = orders.user_id;` |
| **FULL OUTER JOIN** | Returning all records when there is a match in either left or right table | `SELECT * FROM users FULL OUTER JOIN orders ON users.id = orders.user_id;` |
| **CROSS JOIN** | Returning the Cartesian product of the set of records from two or more joined tables | `SELECT * FROM shirts CROSS JOIN pants;` |
| **SELF JOIN** | Joining a table to itself as if it were two tables | `SELECT A.name, B.name FROM employees A, employees B WHERE A.manager_id = B.id;` |
| **UNION** | Combining the result-set of two or more SELECT statements (removes duplicates) | `SELECT city FROM customers UNION SELECT city FROM suppliers;` |
| **UNION ALL** | Combining the result-set of two or more SELECT statements (keeps duplicates) | `SELECT city FROM customers UNION ALL SELECT city FROM suppliers;` |
| **EXISTS** | Testing for the existence of any record in a subquery | `SELECT name FROM suppliers WHERE EXISTS (SELECT * FROM products WHERE supplier_id = suppliers.id);` |

## Advanced Functions and CTEs

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **CASE** | Going through conditions and returning a value when the first condition is met (If-Then logic) | `SELECT name, CASE WHEN age < 18 THEN 'Minor' ELSE 'Adult' END AS status FROM users;` |
| **COALESCE** | Returning the first non-null value in a list | `SELECT product, COALESCE(discount_price, regular_price) AS final_price FROM items;` |
| **NULLIF** | Returning NULL if two expressions are equal | `SELECT NULLIF(current_year, previous_year) FROM sales;` |
| **CAST** | Converting a value (of any type) into a specified datatype | `SELECT CAST(order_date AS DATE) FROM orders;` |
| **WITH (CTE)** | Defining a temporary named result set (Common Table Expression) | `WITH RegionalSales AS (SELECT region, SUM(amount) as total FROM sales GROUP BY region) SELECT * FROM RegionalSales WHERE total > 10000;` |
| **RECURSIVE CTE** | Querying hierarchical data (like organizational charts) | `WITH RECURSIVE subordinates AS (SELECT id, manager_id FROM employees WHERE id = 1 UNION ALL SELECT e.id, e.manager_id FROM employees e JOIN subordinates s ON e.manager_id = s.id) SELECT * FROM subordinates;` |

## Window Functions

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **ROW_NUMBER()** | Assigning a unique sequential integer to rows within a partition | `SELECT name, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank FROM employees;` |
| **RANK()** | Assigning a rank with gaps for duplicate values | `SELECT name, score, RANK() OVER (ORDER BY score DESC) as rank FROM players;` |
| **DENSE_RANK()** | Assigning a rank without gaps for duplicate values | `SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) as rank FROM players;` |
| **NTILE()** | Distributing rows of an ordered partition into a specified number of approximately equal groups | `SELECT name, salary, NTILE(4) OVER (ORDER BY salary DESC) as quartile FROM employees;` |
| **LEAD()** | Accessing data from a subsequent row in the same result set | `SELECT month, sales, LEAD(sales, 1) OVER (ORDER BY month) as next_month_sales FROM revenue;` |
| **LAG()** | Accessing data from a previous row in the same result set | `SELECT month, sales, LAG(sales, 1) OVER (ORDER BY month) as prev_month_sales FROM revenue;` |
| **FIRST_VALUE()** | Returning the first value in an ordered set of values | `SELECT name, department, FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC) as highest_paid FROM employees;` |

## String and Date Functions

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **CONCAT** | Adding two or more strings together | `SELECT CONCAT(first_name, ' ', last_name) FROM users;` |
| **SUBSTRING** | Extracting some characters from a string | `SELECT SUBSTRING(title, 1, 10) FROM posts;` |
| **TRIM** | Removing leading and trailing spaces from a string | `SELECT TRIM(email) FROM users;` |
| **UPPER / LOWER** | Converting a string to upper or lower case | `SELECT UPPER(lastname) FROM employees;` |
| **LENGTH** | Returning the length of a string | `SELECT LENGTH(password) FROM users;` |
| **REPLACE** | Replacing all occurrences of a substring within a string | `SELECT REPLACE(description, 'bad', 'good') FROM products;` |
| **EXTRACT** | Extracting a part (year, month, day) from a date | `SELECT EXTRACT(YEAR FROM order_date) FROM orders;` |
| **DATE_ADD** | Adding a time/date interval to a date | `SELECT DATE_ADD(order_date, INTERVAL 30 DAY) FROM orders;` |
| **DATEDIFF** | Returning the difference between two dates | `SELECT DATEDIFF(delivery_date, order_date) FROM shipments;` |
| **NOW() / GETDATE()** | Returning the current date and time | `SELECT * FROM logs WHERE created_at < NOW();` |

## Data Manipulation

| **Command** | **For What** | **Code Example** |
| :--- | :--- | :--- |
| **INSERT INTO** | Inserting new records into a table | `INSERT INTO users (name, email) VALUES ('John', 'john@example.com');` |
| **UPDATE** | Modifying existing records in a table | `UPDATE products SET price = 20 WHERE id = 5;` |
| **DELETE** | Deleting existing records from a table | `DELETE FROM cart WHERE user_id = 10;` |
| **CREATE TABLE** | Creating a new table in the database | `CREATE TABLE students (id INT, name VARCHAR(50));` |
| **ALTER TABLE** | Adding, deleting, or modifying columns in an existing table | `ALTER TABLE users ADD COLUMN phone VARCHAR(15);` |
| **DROP TABLE** | Deleting a table and all its data | `DROP TABLE old_logs;` |
| **TRUNCATE TABLE** | Deleting the data inside a table, but not the table itself | `TRUNCATE TABLE logs;` |