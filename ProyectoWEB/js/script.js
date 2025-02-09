const apiURL = "http://localhost:3000/salespersons";
const tableBody = document.getElementById("salesperson-table");
const searchInput = document.getElementById("search");
const filterSales = document.getElementById("filter-sales");
const paginationDiv = document.getElementById("pagination");
let salespersons = [];
let currentPage = 1;
const rowsPerPage = 3;

async function fetchSalespersons() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    salespersons = data.map((item) => {
      const info = item.infoResult.data[0];
      const compliance = info.budget > 0 ? ((info.sale / info.budget) * 100).toFixed(2) : 0;
      return {
        ...info,
        compliance: parseFloat(compliance),
        weeks: item.weekResult.data,
        id: item.id,
      };
    });
    displaySalespersons();
  } catch (error) {
    console.error("Error al cargar datos:", error);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar los datos</td></tr>';
  }
}

function displaySalespersons() {
  const filteredData = filterData();
  const paginatedData = paginate(filteredData, currentPage, rowsPerPage);

  tableBody.innerHTML = "";
  paginatedData.forEach((person) => {
    const cumplimientoClass = getCumplimientoClass(person.compliance);

    tableBody.innerHTML += `
      <tr>
        <td>${person.slpName}</td>
        <td>$${person.sale.toLocaleString()}</td>
        <td>$${person.budget.toLocaleString()}</td>
        <td>$${(person.sale - person.budget).toLocaleString()}</td>
        <td class="${cumplimientoClass}">${person.compliance}%</td>
        <td>
          <a href="dashboard.html?id=${person.id}" class="btn btn-primary btn-sm">
            <i class="bi bi-eye"></i> Detalles
          </a>
        </td>
      </tr>
    `;
  });

  setupPagination(filteredData);
}

function filterData() {
  const query = searchInput.value.toLowerCase();
  const salesFilter = filterSales.value;

  return salespersons.filter((person) => {
    const matchesName = person.slpName.toLowerCase().includes(query);
    const matchesSales =
      salesFilter === "all" ||
      (salesFilter === "low" && person.compliance < 60) ||
      (salesFilter === "medium" && person.compliance >= 60 && person.compliance <= 80) ||
      (salesFilter === "high" && person.compliance > 80);

    return matchesName && matchesSales;
  });
}

function paginate(data, page, rows) {
  const start = (page - 1) * rows;
  const end = start + rows;
  return data.slice(start, end);
}

function setupPagination(data) {
  paginationDiv.innerHTML = "";
  const pageCount = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const button = document.createElement("button");
    button.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`;
    button.innerText = i;
    button.addEventListener("click", () => {
      currentPage = i;
      displaySalespersons();
    });

    paginationDiv.appendChild(button);
  }
}

function getCumplimientoClass(compliance) {
  if (compliance < 60) return "text-danger";
  if (compliance <= 80) return "text-warning";
  return "text-success";
}

searchInput.addEventListener("input", displaySalespersons);
filterSales.addEventListener("change", displaySalespersons);

fetchSalespersons();
