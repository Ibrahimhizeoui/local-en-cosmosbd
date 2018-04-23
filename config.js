var config = {}

config.host = process.env.HOST || "https://localhost:8081/";
config.authKey = process.env.AUTH_KEY || "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";
config.databaseId = "aitopya_end_users";
config.collections = ["patients", "providers", "sessions"];

config.udfs = [
	{
       "id": "isToday",
       "serverScript": function isToday(epochTs){ return new Date(epochTs * 1000).toDateString() === new Date().toDateString();}
    },
    {
       "id": "isSameDate",
       "serverScript": function isSameDate (epoch1, epoch2) { return new Date(epoch1 * 1000).toDateString() === new Date(epoch2 * 1000).toDateString();}
    }

    ];
module.exports = config;