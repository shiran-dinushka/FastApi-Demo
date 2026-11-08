from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

import database_models
from database import engine, session
from models import Product

app = FastAPI()


database_models.Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return "Hello, welcome to the program!"

products = [
    Product(id=1, name="Phone", description="A smartphone", price=699.99, quantity=50),
    Product(id=2, name="Laptop", description="A powerful laptop", price=1299.99, quantity=30),  
    Product(id=3, name="Headphones", description="Noise-cancelling headphones", price=199.99, quantity=100), 
    Product(id=4, name="Smartwatch", description="A smartwatch with fitness tracking", price=249.99, quantity=75)
]

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

def init_db():
    db = session()

    count = db.query(database_models.Product).count()
    if count == 0:
        for product in products:
            db.add(database_models.Product(**product.model_dump()))
        db.commit()
        db.close()

init_db()

@app.get("/products")
def get_products(db:Session = Depends(get_db)):

    db_products = db.query(database_models.Product).all()
    return db_products

@app.get("/product/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        return db_product
    return {"error": "Product not found"}

@app.post("/product")
def add_product(product: Product, db: Session = Depends(get_db)):
    db.add(database_models.Product(**product.model_dump()))
    db.commit()
    return product

@app.put("/product/{id}")
def update_product(id: int, updated_product: Product, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        for key, value in updated_product.model_dump().items():
            setattr(db_product, key, value)
        db.commit()
        return db_product
    return {"error": "Product not found"}

@app.delete("/product/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(database_models.Product).filter(database_models.Product.id == id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return db_product
    return {"error": "Product not found"}
