const express = require("express");
const morgan = require("morgan");
const { Sequelize, DataTypes } = require("sequelize");
const Joi = require("joi");

const app = express();
const router = express.Router({ mergeParams: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

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
		allowNull: false,
	},
	age: {
		type: DataTypes.INTEGER,
	},
});
const createUserSchema = Joi.object({
	firstName: Joi.string().required(),
	lastName: Joi.string().required(),
	age: Joi.number(),
});
const updateUserSchema = Joi.object({
	firstName: Joi.string(),
	lastName: Joi.string(),
	age: Joi.number(),
});

(async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
		await sequelize.sync({});
		console.log("All models were synchronized successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
})();

router.post("/", async (req, res) => {
	try {
		const { firstName, lastName, age } = req.body;
		await createUserSchema.validateAsync({ firstName, lastName, age });
		const user = await User.create({ firstName, lastName, age });
		return res.status(200).send({ message: "User created successfully", user });
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

router.put("/:user_id", async (req, res) => {
	try {
		const { body, params } = req;
		const { firstName, lastName, age } = body;
		await updateUserSchema.validateAsync({ firstName, lastName, age });
		const { user_id } = params;
		const user = await User.findOne({ where: { id: user_id }, raw: false });
		if (!user) {
			res.status(404).send({ message: "User not found" });
		}
		user.set({ firstName, lastName, age });
		await user.save();
		return res.status(200).send({ message: "User updated successfully", user });
	} catch (error) {
		return res.status(500).send({ error: error.message || error });
	}
});

router.delete("/:user_id", async (req, res) => {
	try {
		const { user_id } = req.params;
		const user = await User.findOne({ where: { id: user_id }, raw: false });
		if (!user) {
			res.status(404).send({ message: "User not found" });
		}
		await user.destroy();
		return res.status(200).send({ message: "User deleted successfully", user });
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
