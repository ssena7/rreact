const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  isAdmin: { type: Boolean, default: false },
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
  count: { type: Number, default: 1 }
});
const Basket = mongoose.model("Basket", basketSchema);

// Order Collection
const orderSchema = new mongoose.Schema({
  _id: String,
  productId: String,
  userId: String,

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
      name,
      email,
      password,
      isAdmin: false
    });
    await user.save();
    const userObj = user.toObject();

    const token = jwt.sign({ user: userObj }, secretKey, { expiresIn: "1h" });
    res.json({ user: userObj, token });
  } catch (error) {
    console.error("Register Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login İşlemi
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await User.find({ email, password });
    if (users.length === 0) {
      res.status(401).json({ message: "Mail adresi ya da şifre yanlış!" });
    } else {
      const token = jwt.sign({ user: users[0] }, secretKey, { expiresIn: "1h" });
      res.json({ user: users[0], token });
    }
  } catch (error) {
    console.error("Login Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// Dosya Kayıt İşlemi
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Product Listesi
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Product İşlemi
app.post("/products/remove", async (req, res) => {
  try {
    const { _id } = req.body;
    await Product.findByIdAndDelete(_id);
    res.json({ message: "Silme işlemi başarıyla gerçekleşti" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Product İşlemi
app.post("/products/add", upload.single("image"), async (req, res) => {
  try {
    const { name, categoryName, stock, price } = req.body;
    const product = new Product({
      _id: uuidv4(),
      name,
      stock,
      price,
      categoryName,
      imageUrl: "uploads/" + req.file.filename
    });
    await product.save();
    res.json({ message: "Ürün kaydı başarıyla tamamlandı!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sepete Ürün Ekleme
app.post("/baskets/add", async (req, res) => {
  try {
    const { productId, userId } = req.body;

    // Sepette var mı kontrol et
    let basket = await Basket.findOne({ userId, productId });

    if (basket) {
      // Varsa miktarı artır
      basket.count = (basket.count || 1) + 1;
      await basket.save();
    } else {
      // Yoksa ekle
      basket = new Basket({
        _id: uuidv4(),
        userId,
        productId,
        count: 1
      });
      await basket.save();
    }

    // Stok güncelle
    let product = await Product.findById(productId);
    product.stock = product.stock - 1;
    await product.save();

    res.json({ message: "Ürün sepete başarıyla eklendi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sepetten Ürün Silme (stok güncelleme ile birlikte)
app.post("/baskets/remove", async (req, res) => {
  try {
    const { _id } = req.body;

    const basket = await Basket.findById(_id);
    if (!basket) {
      return res.status(404).json({ message: "Sepet ürünü bulunamadı." });
    }

    const countToReturn = basket.count || 1;

    // Stok güncelle
    const product = await Product.findByIdAndUpdate(
      basket.productId,
      { $inc: { stock: countToReturn } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    // Sepet ürünü sil
    await Basket.findByIdAndDelete(_id);

    res.json({ message: "Ürün sepetten kaldırıldı ve stok güncellendi.", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sepetteki Ürünleri Getir
app.post("/baskets/getAll", async (req, res) => {
  try {
    const { userId } = req.body;
    const baskets = await Basket.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: { userId: userId } }
    ]);
    res.json(baskets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//Sipariş Oluşturma 
app.post("/orders/add", async (req, res) => {
  try {
    const { userId } = req.body;
    const baskets = await Basket.find({ userId });

    for (const basket of baskets) {
      let order = new Order({
        _id: uuidv4(),
        productId: basket.productId,
        userId: userId,
        count: basket.count,
        price: basket.price, // burada basket.price olabilir mi? Yoksa product fiyatı mı?
      });
      await order.save();
      await Basket.findByIdAndDelete(basket._id);
    }

    res.json({ message: "Siparişler başarıyla oluşturuldu." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


//Sipariş Oluşturma 


//Sipariş Listesi

app.post("/orders", async(req,res)=>{
  try {
    const {userId} = req.body;
    const orders =await Order.aggregate([
      {
        $match: {userId: userId}
      },
      {
        $lookup:{
          from:"products",
          localField:"productId",
          foreignField:"_id",
          as:"products"
        }
      }
    ]);
    res.json(orders);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})



//Sipariş Listesi


// Server başlatma
const port = 5000;
app.listen(port, () => {
  console.log("Uygulama http://localhost:" + port + " üzerinden ayakta!");
});