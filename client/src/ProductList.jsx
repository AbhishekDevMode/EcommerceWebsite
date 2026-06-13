import React from "react";

const ProductList = ({ products }) => {
  const backend_url="http://localhost:8080";

  return (
    <div className="row">
      {products.map((product) => (
        <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={product.id}>
          <div className="card h-100">
            <img
              src={`${backend_url}${product.imageUrl}`}
              className="card-img-top"
              alt={product.name}
              style={{height:"300px",objecFit:"cover"}}
              onError={(e)=>{
                console.log(`Failed to load image:${product.imageUrl}`);
                e.target.src="https://via.placeholder.com/600X400?text=Image+NOt+Found";
              }}
            />
            <div className="card-body">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">{product.description}</p>
              <p className="card-text"><strong>${product.price}</strong></p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
