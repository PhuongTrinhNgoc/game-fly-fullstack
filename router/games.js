const router = require('express').Router();
const gamesController  = require("../controllers/gamesController")

router.get("/getGames",gamesController.getGames)
router.get("/getGames/:id",gamesController.getAnGame)
router.post("/addGame",gamesController.addGame)
router.put("/addGame",gamesController.addGame)
router.delete("/deleteGame/:id",gamesController.deleteGame)

module.exports = router 
