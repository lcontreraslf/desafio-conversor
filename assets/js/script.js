document.addEventListener("DOMContentLoaded", function () {
  const inputCLP = document.querySelector('input[type="text"]');
  const selectCurrency = document.getElementById("currency");
  const resultado = document.getElementById("resultado");
  const apiURL = "https://mindicador.cl/api/";
  const ctx = document.getElementById("myChart").getContext("2d");
  let myChart;

  inputCLP.addEventListener("input", function () {
    let value = inputCLP.value;

    if (!value.startsWith("$")) {
      value = `$${value}`;
    }

    if (value === "$") {
      value = "";
    }

    inputCLP.value = value;
  });

  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      const monedas = Object.keys(data).filter(
        (key) => key !== "version" && key !== "autor" && key !== "fecha"
      );
      monedas.forEach((moneda) => {
        const option = document.createElement("option");
        option.value = moneda;
        option.textContent = data[moneda].nombre;
        selectCurrency.appendChild(option);
      });
    })
    .catch((error) => console.error("Error al cargar las monedas:", error));

  document.querySelector("button").addEventListener("click", function () {
    const monedaSeleccionada = selectCurrency.value;
    const montoCLP = parseFloat(
      inputCLP.value.replace("$", "").replace(",", "")
    );

    if (!monedaSeleccionada || isNaN(montoCLP)) {
      alert("Por favor ingresa un monto válido y selecciona una moneda.");
      return;
    }

    fetch(`${apiURL}${monedaSeleccionada}`)
      .then((response) => response.json())
      .then((data) => {
        const tasaDeCambio = data.serie[0].valor;
        const montoConvertido = montoCLP / tasaDeCambio;
        resultado.textContent = `$${montoConvertido.toFixed(2)}`;

        const labels = data.serie
          .slice(0, 10)
          .map((d) => new Date(d.fecha).toLocaleDateString())
          .reverse();
        const valores = data.serie
          .slice(0, 10)
          .map((d) => d.valor)
          .reverse();

        if (myChart) {
          myChart.destroy();
        }

        // Crear el gráfico
        myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: `Valor de ${data.nombre} en los últimos 10 días`,
                data: valores,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Fecha",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Valor",
                },
              },
            },
          },
        });
      })
      .catch((error) =>
        console.error("Error al realizar la conversión:", error)
      );
  });
});

