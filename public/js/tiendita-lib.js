function showElement(element_id) {
  selectedElement = document.getElementById(element_id);
  selectedElement.classList.remove("tiendita-hide");
}

function hideElement(element_id) {
  selectedElement = document.getElementById(element_id);
  selectedElement.classList.add("tiendita-hide");
}
