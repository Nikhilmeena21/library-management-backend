const apiV1 = require("express")(); // Note: This is creating an Express Router
const { router: bookRouter } = require("./book");
const { router: userRouter } = require("./users");

apiV1.use("/books", bookRouter); // Use plural form for consistency
apiV1.use("/users", userRouter); // Use plural form for consistency

module.exports = { apiV1 };