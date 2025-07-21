import { useEffect, useState } from "react";
import axios from "axios";

function BasketComponent() {
  const [baskets, setBaskets] = useState([]);

  const getAll = async () => {
    let user = JSON.parse(localStorage.getItem("user"));
    let model = { userId: user._id };
    try {
      let response = await axios.post(
        "http://localhost:5000/baskets/getAll",
        model
      );
      setBaskets(response.data);
    } catch (error) {
      console.error("Sepet ürünleri getirilirken hata:", error);
    }
  };


const addOrder = async () => {
  try {
    let user = JSON.parse(localStorage.getItem("user"));
    let model = { userId: user._id };
    const response = await axios.post("http://localhost:5000/orders/add", model);
    console.log("Sipariş sonucu:", response.data);
    getAll();
  } catch (error) {
    console.error("Sipariş eklenirken hata:", error);
    alert("Sipariş oluşturulurken hata oluştu. Konsolu kontrol edin.");
  }
};


useEffect(() => {
  getAll();
}, []);  


  const totalAmount = baskets.reduce((total, basket) => {
    return total + basket.product.price * (basket.count || 1);
  }, 0);

  const remove = async (basketId) => {
    let isConfirmed = window.confirm("Sepetten ürünü silmek istiyor musunuz?");
    if (!isConfirmed) return;

    try {
      await axios.post("http://localhost:5000/baskets/remove", { _id: basketId });
      alert("Ürün sepetten kaldırıldı.");
      getAll();
    } catch (error) {
      console.error("Sepetten ürün silinirken hata:", error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h1 className="text-center">Sepetteki Ürünler</h1>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ürün Adı</th>
                    <th>Ürün Resmi</th>
                    <th>Ürün Adedi</th>
                    <th>Birim Fiyatı</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {baskets.map((basket, index) => (
                    <tr key={basket._id || index}>
                      <td>{index + 1}</td>
                      <td>{basket.product.name}</td>
                      <td>
                        <img
                          src={"http://localhost:5000/" + basket.product.imageUrl}
                          width="75"
                          alt={basket.product.name}
                        />
                      </td>
                      <td>{basket.count || 1}</td>
                      <td>{basket.product.price}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => remove(basket._id)}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h4 className="text-center">Sepet Toplamı</h4>
                  <hr />
                  <ul>
                    <h6 className="text-center">Toplam Ürün Sayısı: {baskets.length}</h6>
                    <h5 className="alert alert-danger text-center">
                      Toplam Tutar: {totalAmount.toFixed(2)} ₺
                    </h5>
                    <hr />
                    <button type="button" onClick={addOrder} className="btn btn-outline-danger w-100">Ödeme Yap</button>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasketComponent;
