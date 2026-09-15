INSERT INTO products(id,name,price_paise,size,category) VALUES
('P001','Lemwiton Herbal Shampoo',44900,'250 ml','Hair Care'),
('P002','Lemwiton Fully Vital Hair Serum',35000,'15 ml','Hair Care'),
('P003','Lemwiton Maha Bhringraj Hair Oil',50000,'100 ml','Hair Care'),
('P004','Lemwiton Amla Hair Oil',30000,'100 ml','Hair Care'),
('P005','Lemwiton Ubtan Face Glow Pack',40000,'100 gm','Skin Care'),
('P006','Lemwiton Anti Hair Fall Pack',10000,'45 gm','Hair Care'),
('P007','Lemwiton Ubtan Soap',9900,'100 gm','Soaps'),
('P008','Lemwiton Kesuda Soap',9900,'100 gm','Soaps')
ON CONFLICT(id) DO NOTHING;