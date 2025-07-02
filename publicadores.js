async function loadData() {
  const json =
    "https://sheets.googleapis.com/v4/spreadsheets/1TXTFt4uPkygz9MOxeogkfWy4p4WTqDWLDUYqluEQhXg/values/publicadores?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s";
  const response = await fetch(json);
  const data = await response.json();

  const headers = data.values[0];
  const publishers = data.values.slice(1).map((row) => {
    const publisher = {};
    headers.forEach((header, index) => {
      publisher[header] = row[index];
    });
    return publisher;
  });

  let filteredPublishers = publishers;
  const urlParams = new URLSearchParams(window.location.search);
  const filtros = urlParams.get("filtros");

  if (filtros === "emergencia") {
    filteredPublishers = publishers.filter(
      (publisher) =>
        !publisher["Contacto emergencia"] &&
        !publisher["Relación emergencia"] &&
        !publisher["Teléfono emergencia"]
    );
  }

  const groupedPublishers = groupPublishersByGrupo(filteredPublishers);
  displayGroups(groupedPublishers, filtros);
}

function groupPublishersByGrupo(publishers) {
  const grouped = {};
  publishers.forEach((publisher) => {
    const grupo = publisher["Grupo"];
    // Skip if no group, or no baptized, and not a publisher
    if (
      grupo === "" ||
      (publisher["Bautizado"] === "FALSE" &&
        publisher["Publicador no bautizado"] === "FALSE")
    )
      return;
    if (!grouped[grupo]) {
      grouped[grupo] = [];
    }
    grouped[grupo].push(publisher);
  });
  return grouped;
}

function displayGroups(groupedPublishers, filtros) {
  const container = document.getElementById("container");
  container.innerHTML = ""; // Clear existing content
  const emergencyMessage = encodeURIComponent(
    "Por favor, completa este formulario: "
  );
  const lineBreak = "%0A";

  Object.entries(groupedPublishers).forEach(([grupo, publishers]) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h2");
    title.textContent = `Grupo ${grupo}`;
    const badge = document.createElement("span");
    badge.className = "publisher-badge";
    badge.textContent = publishers.length;

    // Append the badge to the header
    title.appendChild(badge);
    card.appendChild(title);

    publishers.forEach((publisher) => {
      const publisherEntry = document.createElement("div");
      if (filtros === "emergencia") {
        publisherEntry.classList.add("publisher-entry");
      }

      const nameLinkContainer = document.createElement("div");
      nameLinkContainer.classList.add("name-link-container");

      const nameElement = document.createElement("p");
      nameElement.textContent = publisher["Nombre Abreviado"];

      if (publisher["Superintendente"] === "TRUE") {
        nameElement.classList.add("overseer");
      }
      if (publisher["Auxiliar"] === "TRUE") {
        nameElement.classList.add("auxiliar");
      }

      if (filtros === "emergencia" && publisher["Formulario"]) {
        const link = document.createElement("a");
        link.href = publisher["Formulario"];
        link.target = "_blank";
        link.textContent = publisher["Nombre Abreviado"];
        link.classList.add("publisher-link");
        nameElement.innerHTML = ""; // Clear text content to append link
        nameElement.appendChild(link);
        publisherEntry.appendChild(nameElement); // Append name/link first

        if (publisher["Celular"] && publisher["Formulario"]) {
          const whatsappIcon = document.createElement("a");
          const phoneNumber = publisher["Celular"].replace(/^0/, "+598"); // Replace first '0' with '+598'
          const message =
            emergencyMessage +
            lineBreak +
            lineBreak +
            encodeURIComponent(publisher["Formulario"]);
          whatsappIcon.href = `https://wa.me/${phoneNumber}?text=${message}`;
          whatsappIcon.target = "_blank";
          whatsappIcon.classList.add("whatsapp-icon");
          whatsappIcon.innerHTML =
            '<img src="images/whatsapp.svg" alt="WhatsApp Icon" width="24" height="24" />';
          publisherEntry.appendChild(whatsappIcon); // Append WhatsApp icon second
        }
      } else {
        publisherEntry.appendChild(nameElement); // For non-emergencia filter, just append name
      }

      card.appendChild(publisherEntry);

      if (filtros === "emergencia") {
        const divider = document.createElement("div");
        divider.classList.add("publisher-divider");
        card.appendChild(divider);
      }
    });

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadData);
