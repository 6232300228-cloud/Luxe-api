const express = require("express");
const cors = require("cors");

const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURAR MERCADO PAGO
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-5562521962692930-030522-9080c61c1567cf8b93f52eb8a9dfa477-3247325848"
});

// RUTA PARA CREAR EL PAGO
app.post("/crear-preferencia", async (req, res) => {

  const carrito = req.body.items;

  const items = carrito.map(producto => ({
    title: producto.nombre,
    quantity: producto.cantidad || 1,
    unit_price: Number(producto.precio),
    currency_id: "MXN"
  }));

  try {

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items
      }
    });

    res.json({
      init_point: result.init_point
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error al crear pago");
  }

});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
