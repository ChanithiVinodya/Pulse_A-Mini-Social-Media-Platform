const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

if (!process.env.JWT_SECRET) {
  console.error(
    "Missing JWT_SECRET in backend/.env. Set JWT_SECRET before starting the server.",
  );
  process.exit(1);
}

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Pulse API running on port ${PORT}`);
});
