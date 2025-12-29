const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 8080;

// Connect DB then start server
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
