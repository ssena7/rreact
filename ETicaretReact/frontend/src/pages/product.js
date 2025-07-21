import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProductComponent() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);

    const getAll = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Ürünler getirilirken hata oluştu:", error);
        }
    }, []);

    const checkIsAdmin = useCallback(() => {
        let user = JSON.parse(localStorage.getItem("user"));
        if (!user?.isAdmin) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        getAll();
        checkIsAdmin();
    }, [getAll, checkIsAdmin]);

    const remove = async (_id) => {
        if (window.confirm("Ürünü silmek istiyor musunuz?")) {
            try {
                let response = await axios.post("http://localhost:5000/products/remove", { _id });
                alert(response.data.message);
                await getAll();
            } catch (error) {
                console.error("Ürün silinirken hata oluştu:", error);
            }
        }
    };

    const add = async (e) => {
        e.preventDefault();
        var input = document.querySelector("input[type='file']");
        const formData = new FormData();
        formData.append("name", name);
        formData.append("categoryName", categoryName);
        formData.append("stock", stock);
        formData.append("price", price);
        formData.append("image", input.files[0]);

        var response = await axios.post("http://localhost:5000/products/add", formData);
        alert(response.data.message);
        getAll();

        document.getElementById("addModalCloseBtn").click();
        setName("");
        setPrice(0);
        setStock(0);
        setCategoryName(0);
        input.value = "";
    };

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h1>Ürün Listesi</h1>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <button data-bs-toggle="modal" data-bs-target="#addModal" className="btn btn-outline-primary">Ekle</button>
                        <table className="table table-bordered table-hover mt-2">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Resim</th>
                                    <th>Ürün Adı</th>
                                    <th>Kategori Adı</th>
                                    <th>Adet</th>
                                    <th>Fiyat</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product._id || index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img style={{ width: "50px" }} src={"http://localhost:5000/" + product.imageUrl} alt={product.name} />
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{product.categoryName}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.price}</td>
                                        <td>
                                            <button onClick={() => remove(product._id)} className="btn btn-outline-danger btn-sm">Sil</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="addModalLabel">Ürün Ekle</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" id="addModalCloseBtn" aria-label="Close"></button>
                        </div>
                        <form onSubmit={add}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Ürün Adı</label>
                                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>

                                <div className="form-group mt-2">
                                    <label>Kategori Adı</label>
                                    <select className="form-control" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
                                        <option value="0">Seçim Yapınız...</option>
                                        <option>Sebze</option>
                                        <option>Meyve</option>
                                        <option>Teknoloji</option>
                                        <option>Diğer</option>
                                    </select>
                                </div>

                                <div className="form-group mt-2">
                                    <label>Stok Adedi</label>
                                    <input className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
                                </div>

                                <div className="form-group mt-2">
                                    <label>Birim Fiyatı</label>
                                    <input className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>

                                <div className="form-group mt-2">
                                    <label>Resmi</label>
                                    <input type="file" className="form-control" />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductComponent;
