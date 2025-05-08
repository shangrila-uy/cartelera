$(document).ready(function() {
    function render(jsonData) {

		const items = jsonData.values.slice(1); // Skip header row
		const catalog = $('.catalog');

		items.forEach(item => {
			const type = item[0];
			const title = item[1]
				.replace(" (edición grande)", "")
				.replace(" (folleto)", "")
				.replace(" (libro)", "");
			const symbol = item[2];
			const stock = item[3];
			const link = item[9];

			if (type !== '' 
				&& type !== undefined
			    && !type.includes("braille")
			    && !type.includes("Biblia (letra grande)")
			    && !type.includes("Tarjeta")
			    && !type.includes("Formulario")) {

				// Create section for each type
				let section = catalog.find(`.section[data-type="${type}"]`);
				if (section.length === 0) {
					const sectionTitle = $(`<h2>${type}</h2>`);
					section = $(`<ul class="section" data-type="${type}"></ul>`);
					catalog.append(sectionTitle);
					catalog.append(section);
				}
	
				if (stock > 0
				   && !title.includes("ed. estudio")) {

					let folder = '';
					let customType = type;

					switch (type) {
					    case "Biblia":
					        folder = 'bibles';
					        break;
					    case "Libro":
					    case "Libro (letra grande)":
					        folder = 'books';
					        break;
					    case "Folleto":
					        folder = 'brochures';
					        break;
					    case "Revista":
					        folder = 'magazines';
							const regex = /^g[0-9]/;
							const match = regex.test(symbol);

							if (match) {
								customType = '¡Despertad!';
							} else {
								customType = 'La Atalaya';
							}
					        break;
					    case "Tratado":
					        folder = 'tracts';
					        break;
					}

					// Create item
					const itemHtml = `
						<li class="item">
							<a href="${link}" target="_blank">
								<img src="images/library/${folder}/${symbol}.jpg" alt="${title}" />
								<div class="content">
									<span class="type">${customType}</span>
									<span class="title">${title}</span>
									<span class="stock"><span class="bold">${stock}</span> unidades</span>
								</div>
							</a>
						</li>
					`;
					section.append(itemHtml);
				}
			}
		});
    
    }
    
    const url = 'https://sheets.googleapis.com/v4/spreadsheets/1Qz4VqFTEbYCjfHH7WUZ3wFHkfDMPrN05i047muotqtc/values/publicaciones?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function() {
		render(JSON.parse(request.responseText));
    }
    request.send();
    
});