const express = require("express");
const morgan = require("morgan");
const { Sequelize } = require("sequelize");

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
	storage: "/db.sqlite",
});
(async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
})();

router.get("/", async (req, res) => {
	try {
		const { slack_name, track } = req.query;
		const isoDate = new Date().toISOString();
		return res.status(200).send({
			slack_name,
			current_day: day[new Date().getUTCDay()],
			utc_time:
				isoDate.length === 24
					? `${new Date().toISOString().slice(0, -5)}Z`
					: `${new Date().toISOString()}`,
			track,
			github_file_url:
				"https://github.com/Otagera/zuri-stage-one/blob/main/server.js",
			github_repo_url: "https://github.com/Otagera/zuri-stage-one",
			status_code: 200,
		});
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
