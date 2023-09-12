const express = require("express");
const morgan = require("morgan");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const router = express.Router({ mergeParams: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const day = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db.sqlite",
});
const User = sequelize.define("User", {
	// Model attributes are defined here
	firstName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	lastName: {
		type: DataTypes.STRING,
	},
});
(async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
		await sequelize.sync({ force: true });
		console.log("All models were synchronized successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
})();

router.post("/", async (req, res) => {
	try {
		const { firstName, lastName } = req.body;
		const user = await User.create({ firstName, lastName });
		return res.status(200).send({ message: "User fetched successfully", user });
	} catch (error) {
		return res.status(500).send({ error: error.message || error });
	}
});

router.get("/:user_id", async (req, res) => {
	try {
		const { user_id } = req.params;
		const user = await User.findOne({ where: { id: user_id } });
		if (!user) {
			res.status(404).send({ message: "User not found" });
		}
		return res.status(200).send({ message: "User fetched successfully", user });
	} catch (error) {
		return res.status(500).send({ error: error.message || error });
	}
});

router.all("*", (req, res) => {
	res.status(404).json({
		message: "Invalid request, Route does not exist",
	});
});
app.use("/api", router);

const PORT = process.env.NODE_ENV === "test" ? 2345 : process.env.PORT || 4040;

app.listen(PORT, () => {
	console.log(`Server started on port #${PORT}`);
});

module.exports = { app };
