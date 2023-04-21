const express = require("express");

const multer = require("multer");
let { Expo } = require("expo-server-sdk");
const cloudinary =require("cloudinary") ;

const expo = new Expo();





const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors());

app.use(express.json());

app.use(express.urlencoded());


const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("invalide mimetype"));
    }
  };
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });


  const upload = multer({ storage, fileFilter });


let savedPushTokens = [];



app.post("/sendAll",upload.single("image"),async(req,res,next)=>{

    cloudinary.v2.config({
        cloud_name: "dmuz6ggje",
        api_key: "111126228699557",
        api_secret: "kYD2kr9GfBLxGxSEnSCX_g3miVE",
      });
    
      const {title,body}=req.body

      console.log(req?.file);

      let result = null;
  
    if (req?.file?.path) {
      result = await cloudinary.v2.uploader.upload(req.file.path);
    }

    handlePushTokens(req.body,result?.secure_url);  
})


//App acilanda expoTokeni gonderir 
app.post("/token",async(req,res)=>{
    const {token:pushToken} = req.body 

    saveToken(pushToken)
   
})

//Tokeni goturur bir arraye-push edir DB evezi bele yazmisam
const saveToken = token => {
    console.log(token, savedPushTokens);
    const exists = savedPushTokens.find(t => t === token);
    if (!exists) {
      savedPushTokens.push(token);
    }
  };




const handlePushTokens = (body,url) => {
    let notifications = [];
    for (let pushToken of savedPushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }
  
      notifications.push({
        to: pushToken,
        sound: "default",
        title: body.title,
        body: body.body,
        image:url,
        
        data: { url }
      });
    }
  
    let chunks = expo.chunkPushNotifications(notifications);
  
    (async () => {
      for (let chunk of chunks) {
        try {
          let receipts = await expo.sendPushNotificationsAsync(chunk);
          console.log(receipts);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  };
  
 
  
 


const accessToken = "OmBFQQQi1xRoz3rzj9lte-aXyxQ8mwHqZbz6aFZO";



app.listen(7000, () => console.log("app listening"));
