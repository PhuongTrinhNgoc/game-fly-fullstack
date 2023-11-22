const router = require('express').Router();
const authorController  = require("../controllers/authorController")

router.get("/getAuthor",authorController.getAuthors)
router.get("/getAnAuthor/:id",authorController.getAnAuthor)
router.post("/addAuthor",authorController.addAuthor)
router.delete("/deteleAuthor",authorController.deleteAuthor)
router.put("/updateAuthor/:authorId",authorController.updateAuthor)

module.exports = router 
