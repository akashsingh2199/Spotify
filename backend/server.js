require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
