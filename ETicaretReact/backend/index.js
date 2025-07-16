const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://sumersena77:c4uUX7TlZDL9UMjE@reacteticaretdb.jteudfd.mongodb.net/?retryWrites=true&w=majority&appName=ReactEticaretDb";

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Database bağlantısı başarılı");
    })
    .catch(err => {
        console.log("❌ Hata:", err.message);
    });

// User Collection
const UserSchema = new mongoose.Schema({
    _id: String,
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", UserSchema);

// Product Collection
const productSchema = new mongoose.Schema({
    _id: String,
    name: String,
    stock: Number,
    price: Number,
    imageUrl: String,
    categoryName: String
});

const Product = mongoose.model("Product", productSchema);

// Basket Collection
const basketSchema = new mongoose.Schema({
    _id: String,
    productId: String,
    userId: String,
    count: Number,
    price: Number
});

const Basket = mongoose.model("Basket", basketSchema);

// Order Collection
const orderSchema = new mongoose.Schema({
    _id: String,
    productId: String,
    userId: String,
    count: Number,
    price: Number
});

const Order = mongoose.model("Order", orderSchema);


// Token Ayarları
const secretKey = "Gizli anahtarım Gizli anahtarım Gizli anahtarım";

// Register İşlemi
app.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = new User({
            _id: uuidv4(),
            name: name,
            email: email,
            password: password
        });

        await user.save();

        const token = jwt.sign(
            { user: user },
            secretKey,
            { expiresIn: "1h" } // DOĞRU YAZIM BU
        );

        res.json({ user: user, token: token });

    } catch (error) {
        console.error("Register Hatası:", error);
        res.status(500).json({ error: error.message });
    }
});

// Login İşlemi
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await User.find({ email: email, password: password });
        if (users.length == 0) {
            res.status(500).json({ message: "Mail adresi ya da şifre yanlış!" });
        } else {
            const token = jwt.sign(
                { user: users[0] },
                secretKey,
                { expiresIn: "1h" }
            );
            res.json({ user: users[0], token: token });
        }
    } catch (error) {
        console.error("Login Hatası:", error);
        res.status(500).json({ error: error.message });
    }
});


//Dosya Kayıt İşlemi
const storage =multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"uploads/")
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + "-" + file.originalname)
    }
});

const upload = multer({storage: storage});


//Dosya Kayıt İşlemi

//Product Listesi
app.get("/products",async(req,res)=> { 
    try {
        const products =await Product.find({}).sort({name: 1});
        res.json(products);
    } catch (error) {
        res.status(500).json({message:error.message});
    }
})

//Remove Product İşlemi

app.post("/products/remove", async (req,res) => {
    try {
        const {_id} = req.body;
        await Product.findByIdAndDelete(_id);  // burası değişti
        res.json({message: "Silme işlemi başarıyla gerçekleşti"});
    } catch (error) {
        res.status(500).json({message:error.message });
    }
});


//Remove Product İşlemi



//Add Product İşlemi
app.post("/products/add", upload.single("image"), async(req,res)=>{
    try {
        const {name, categoryName, stock, price}= req.body;
        const product = new Product({
            _id: uuidv4(),
            name: name,
            stock: stock,
            price: price,
            categoryName: categoryName,
            imageUrl: req.file.path
        });

        await product.save();
        res.json({message: "Ürün kaydı başarıyla tamamlandı!"});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
})
//Add Product İşlemi


const port = 5000;
app.listen(port, () => {
    console.log("Uygulama http://localhost:" + port + " üzerinden ayakta!");
});
