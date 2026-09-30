Project Setup
--------------

Database
--------
Install MongoDB

Start Mongodb -> From Command Prompt go to mongodb bin folder and type mongodb

Install MongoDB Compass - for DB UI

Create db -> Catalog


Setup react
------------
npm install

npm install react-router-dom

npm install axios

npm install react-icons

npm install react-toastify

npm install bootstrap

npm install recharts

npm install react-hot-toast

npm install recharts

npm install react-calendar


Application Startup
--------------------

Repo: https://github.com/venues-aaa/DqBooking

Java Application -> Start from main class

React -> From terminal go to frontend folder and type -> npm run dev


Once application is up and running:

First step -> Create a vendor

Click on Register -> Register as Vendor(at the bottom)

OTP: **123456**

After Register, login and go to vendor Dashboard(top near login). There vendor can create a service. Make sure Price is also added with each service.

Admin
------
Run the below query:

db.users.insertOne({
  email: "admin@test.com",
  password: "$2a$10$U33CQfBSQHWHKrKfBRDEdew3BuqiRMLIda02nOkq5Ax2o6zBzRiFi",
  firstName: "admin",
  lastName: "1",
  phone: 8989898989,
  role: "ADMIN",
  status: "ACTIVE",
  active: true
})

After this, try to login as Admin and go to dashboard(top near login)

