const { Router } = require('express');
const controller = require('./controller');
const router = Router();

router.post("/login", controller.loginUser);
router.post("/addUser", controller.addUser)
router.put("/updatePassword", controller.updatePassword);
router.post('/signup', controller.signupUser);

router.get('/Users/stores', controller.getStoresForu);
router.get('/Users/storesSearch', controller.searchStores);
router.post('/Users/submitRate', controller.submitNewRating);

router.get("/dashboardStats", controller.getDashboardStats);
router.get("/getUser", controller.getUser)

router.get("/storeRatings", controller.getStoreRatings);
router.get('/averageRating', controller.getStoreAvgRating);


module.exports=router