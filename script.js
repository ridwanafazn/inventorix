const API_BASE = "http://localhost:8080/api/barang";

let currentPage = 0;
let totalPages = 0;
let currentCategoryFilter = "";

const elements = {
  tbody: document.querySelector("#items-table tbody"),
  pageInfo: document.querySelector("#page-info"),
  prevPageBtn: document.querySelector("#prev-page"),
  nextPageBtn: document.querySelector("#next-page"),
  filterCategoryInput: document.querySelector("#filter-category"),
  categoriesDatalist: document.querySelector("#categories"),
  btnFilter: document.querySelector("#btn-filter"),
  btnClearFilter: document.querySelector("#btn-clear-filter"),
  formTitle: document.querySelector("#form-title"),
  form: document.querySelector("#item-form"),
  inputId: document.querySelector("#item-id"),
  inputName: document.querySelector("#name"),
  inputCategory: document.querySelector("#category"),
  inputStock: document.querySelector("#stock"),
  btnSubmit: document.querySelector("#btn-submit"),
  btnCancel: document.querySelector("#btn-cancel"),
};

async function fetchData(page = 0, category = "") {
  let url = `${API_BASE}?page=${page}`;
  if (category.trim() !== "") {
    // encodeURIComponent agar aman
    url += `&category=${encodeURIComponent(category.trim())}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    alert("Failed to load data: " + err.message);
    return null;
  }
}

async function fetchAllCategories() {
  // Simple way: get first pages of barang, extract unique categories
  // Alternatively, implement API endpoint for categories
  try {
    let categoriesSet = new Set();
    let page = 0;
    let keepFetching = true;

    while (keepFetching) {
      let url = `${API_BASE}?page=${page}`;
      let res = await fetch(url);
      if (!res.ok) break;
      let json = await res.json();

      json.content.forEach((item) => categoriesSet.add(item.category));
      if (json.last) keepFetching = false;
      else page++;
      if (page > 5) keepFetching = false; // limit max 6 pages for performance
    }

    return Array.from(categoriesSet).sort();
  } catch {
    return [];
  }
}

function renderTable(items) {
  elements.tbody.innerHTML = "";

  if (!items || items.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.style.textAlign = "center";
    td.textContent = "No items found.";
    tr.appendChild(td);
    elements.tbody.appendChild(tr);
    return;
  }

  items.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.stock}</td>
      <td>${item.dateOfEntry}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${item.id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
      </td>
    `;

    elements.tbody.appendChild(tr);
  });
}

function renderPagination(page, total) {
  elements.pageInfo.textContent = `Page ${page + 1} of ${total}`;
  elements.prevPageBtn.disabled = page <= 0;
  elements.nextPageBtn.disabled = page + 1 >= total;
}

function escapeHtml(text) {
  // basic escape to avoid XSS in this context
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadCategoriesDatalist() {
  const categories = await fetchAllCategories();
  elements.categoriesDatalist.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    elements.categoriesDatalist.appendChild(option);
  });
}

async function loadPage(page = 0, category = "") {
  const data = await fetchData(page, category);
  if (!data) return;

  currentPage = data.pageable.pageNumber || 0;
  totalPages = data.totalPages || 1;

  renderTable(data.content);
  renderPagination(currentPage, totalPages);
  await loadCategoriesDatalist();
}

function resetForm() {
  elements.inputId.value = "";
  elements.inputName.value = "";
  elements.inputCategory.value = "";
  elements.inputStock.value = "";
  elements.formTitle.textContent = "Add New Item";
  elements.btnSubmit.textContent = "Save";
}

function fillForm(item) {
  elements.inputId.value = item.id;
  elements.inputName.value = item.name;
  elements.inputCategory.value = item.category;
  elements.inputStock.value = item.stock;
  elements.formTitle.textContent = "Edit Item";
  elements.btnSubmit.textContent = "Update";
}

async function getItemById(id) {
  try {
    const res = await fetch(`${API_BASE}/by-id?id=${id}`);
    if (!res.ok) throw new Error("Item not found");
    return await res.json();
  } catch (err) {
    alert("Failed to get item: " + err.message);
    return null;
  }
}

async function deleteItem(id) {
  if (!confirm("Are you sure want to delete this item?")) return;
  try {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    alert(json.message);
    await loadPage(currentPage, currentCategoryFilter);
  } catch (err) {
    alert("Failed to delete item: " + err.message);
  }
}

async function createItem(data) {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Create failed");
    return await res.json();
  } catch (err) {
    alert("Failed to create item: " + err.message);
    return null;
  }
}

async function updateItem(id, data) {
  try {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Update failed");
    return await res.json();
  } catch (err) {
    alert("Failed to update item: " + err.message);
    return null;
  }
}

// Event listeners

elements.prevPageBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    loadPage(currentPage - 1, currentCategoryFilter);
  }
});

elements.nextPageBtn.addEventListener("click", () => {
  if (currentPage + 1 < totalPages) {
    loadPage(currentPage + 1, currentCategoryFilter);
  }
});

elements.btnFilter.addEventListener("click", () => {
  currentCategoryFilter = elements.filterCategoryInput.value.trim();
  loadPage(0, currentCategoryFilter);
});

elements.btnClearFilter.addEventListener("click", () => {
  currentCategoryFilter = "";
  elements.filterCategoryInput.value = "";
  loadPage(0, "");
});

elements.tbody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    const item = await getItemById(id);
    if (item) fillForm(item);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  } else if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    deleteItem(id);
  }
});

elements.btnCancel.addEventListener("click", (e) => {
  e.preventDefault();
  resetForm();
});

elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = elements.inputId.value.trim();
  const name = elements.inputName.value.trim();
  const category = elements.inputCategory.value.trim();
  const stock = Number(elements.inputStock.value);

  if (!name || !category || isNaN(stock) || stock < 0) {
    alert("Please fill all fields correctly.");
    return;
  }

  const data = { name, category, stock };

  if (id) {
    // update partial fields: user can edit 1-4 fields, but we send full data for safety
    const updated = await updateItem(id, data);
    if (updated) {
      alert("Item updated.");
      resetForm();
      loadPage(currentPage, currentCategoryFilter);
    }
  } else {
    // create new
    const created = await createItem(data);
    if (created) {
      alert("Item created.");
      resetForm();
      loadPage(currentPage, currentCategoryFilter);
    }
  }
});

// Initial load
loadPage();