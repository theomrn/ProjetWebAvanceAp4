// Données
const state = {
    cars: [],
    filteredCars: [],
    currentCarId: null,
    theme: 'light',
    searchTerm: '',
    brandFilter: '',
    sortFilter: 'newest'
};

// Proxy pour la synchronisation automatique
const stateProxy = new Proxy(state, {
    set(target, property, value) {
        target[property] = value;

        if (property === 'cars') {
            saveToStorage();
            applyFilters();
            updateStats();
            updateBrandFilter();
        }

        if (property === 'filteredCars') {
            renderCars();
        }

        if (property === 'theme') {
            applyTheme();
            saveThemeToStorage();
        }

        if (['searchTerm', 'brandFilter', 'sortFilter'].includes(property)) {
            applyFilters();
        }

        return true;
    }
});

// Exemples de voitures
const exampleCars = [
    {
        id: Date.now() + 1,
        brand: 'Ferrari',
        model: '488 Pista',
        year: 2019,
        price: 450000,
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop',
        description: 'Une supercar italienne emblématique avec un V8 biturbo de 720 ch. Performance et élégance à l\'état pur.'
    },
    {
        id: Date.now() + 2,
        brand: 'Porsche',
        model: '911 Turbo S',
        year: 2023,
        price: 250000,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop',
        description: 'L\'icône allemande avec un flat-6 biturbo de 650 ch. Le parfait équilibre entre confort et performance.'
    },
    {
        id: Date.now() + 3,
        brand: 'Lamborghini',
        model: 'Huracán EVO',
        year: 2022,
        price: 280000,
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop',
        description: 'Un taureau déchaîné avec un V10 atmosphérique de 640 ch. Design futuriste et sensations extrêmes.'
    },
    {
        id: Date.now() + 4,
        brand: 'McLaren',
        model: '720S',
        year: 2021,
        price: 300000,
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop',
        description: 'Une supercar britannique avec un V8 biturbo de 720 ch. Aérodynamisme et technologie de pointe.'
    }
];

// Initialisation
function init() {
    loadThemeFromStorage();

    // Si aucune voiture n'est encore stockée, on met les exemples dans le localStorage
    if (!localStorage.getItem('dreamCars')) {
        localStorage.setItem('dreamCars', JSON.stringify(exampleCars));
    }
    loadFromStorage();
    // Si aucune voiture, ajouter les exemples
    if (stateProxy.cars.length === 0) {
        stateProxy.cars = [...exampleCars];
    }
    loadFromStorage();

    applyFilters();
    updateStats();
    updateBrandFilter();

    attachEventListeners();
}

// Gestion du stockage
function saveToStorage() {
    const data = JSON.stringify(state.cars);
    try {
        localStorage.setItem('dreamCars', data);
    } catch (e) {
        console.error('Erreur de sauvegarde:', e);
    }
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem('dreamCars');
        if (data) {
            stateProxy.cars = JSON.parse(data);
        }
    } catch (e) {
        console.error('Erreur de chargement:', e);
    }
}

function saveThemeToStorage() {
    try {
        localStorage.setItem('dreamCarsTheme', state.theme);
    } catch (e) {
        console.error('Erreur de sauvegarde du thème:', e);
    }
}

function loadThemeFromStorage() {
    try {
        const savedTheme = localStorage.getItem('dreamCarsTheme');
        if (savedTheme) {
            stateProxy.theme = savedTheme;
        }
    } catch (e) {
        console.error('Erreur de chargement du thème:', e);
    }
}

// Gestion du thème
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.getElementById('themeIcon').textContent = state.theme === 'dark' ? '☀️' : '☾';
}

function toggleTheme() {
    stateProxy.theme = state.theme === 'light' ? 'dark' : 'light';
}

// Filtres et tri
function applyFilters() {
    let filtered = [...state.cars];

    // Recherche
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        filtered = filtered.filter(car =>
            car.brand.toLowerCase().includes(term) ||
            car.model.toLowerCase().includes(term) ||
            car.description.toLowerCase().includes(term)
        );
    }

    // Filtre par marque
    if (state.brandFilter) {
        filtered = filtered.filter(car => car.brand === state.brandFilter);
    }

    // Tri
    switch (state.sortFilter) {
        case 'newest':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'oldest':
            filtered.sort((a, b) => a.id - b.id);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
    }

    stateProxy.filteredCars = filtered;
}

// Mise à jour du filtre de marques
function updateBrandFilter() {
    const brands = [...new Set(state.cars.map(car => car.brand))].sort();
    const select = document.getElementById('brandFilter');
    const currentValue = select.value;

    select.innerHTML = '<option value="">Toutes les marques</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
    });

    select.value = currentValue;
}

// Statistiques
function updateStats() {
    const total = state.cars.length;
    const totalValue = state.cars.reduce((sum, car) => sum + car.price, 0);
    const avgPrice = total > 0 ? totalValue / total : 0;

    document.getElementById('totalCars').textContent = total;
    document.getElementById('totalValue').textContent = formatPrice(totalValue);
    document.getElementById('avgPrice').textContent = formatPrice(avgPrice);
}

// Rendu des voitures
function renderCars() {
    const grid = document.getElementById('carsGrid');

    if (state.filteredCars.length === 0) {
        grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🏎️</div>
                        <h3>Aucune voiture trouvée</h3>
                        <p>Ajoutez votre première voiture de rêve !</p>
                    </div>
                `;
        return;
    }
    window.toggleFavorite = function (id) {
        stateProxy.cars = state.cars.map(car =>
            car.id === id ? { ...car, isFavorite: !car.isFavorite } : car
        );
    };

    grid.innerHTML = state.filteredCars.map(car => `
                <div class="car-card" data-id="${car.id}">
                    <img src="${car.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'}" 
                         alt="${car.brand} ${car.model}" 
                         class="car-image"
                         onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop'">
                    <div class="car-content">
                        <div class="car-header">
                            <div class="car-brand">${car.brand}</div>
                            <div class="car-model">${car.model}</div>
                            <div class="car-year">${car.year}</div>
                        </div>
                        <p class="car-description">${car.description || 'Aucune description disponible.'}</p>
                        <div class="car-price">${formatPrice(car.price)}</div>
                        <div class="car-actions">
                        <button class="car-action-btn btn-fav" onclick="toggleFavorite(${car.id})">
                            ${car.isFavorite ? '❤️' : '🤍'}
                            </button>
                            <button class="car-action-btn btn-edit" onclick="editCar(${car.id})">
                                Modifier
                            </button>
                            <button class="car-action-btn btn-delete" onclick="deleteCar(${car.id})">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
}

// Formatage du prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Gestion du formulaire
function openModal(carId = null) {
    const modal = document.getElementById('carModal');
    const form = document.getElementById('carForm');
    const title = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    form.reset();
    clearErrors();

    if (carId) {
        const car = state.cars.find(c => c.id === carId);
        if (car) {
            title.textContent = 'Modifier la voiture';
            submitBtn.textContent = 'Modifier';
            document.getElementById('carId').value = car.id;
            document.getElementById('carBrand').value = car.brand;
            document.getElementById('carModel').value = car.model;
            document.getElementById('carYear').value = car.year;
            document.getElementById('carPrice').value = car.price;
            document.getElementById('carImage').value = car.image || '';
            document.getElementById('carDescription').value = car.description || '';
            stateProxy.currentCarId = carId;
        }
    } else {
        title.textContent = 'Ajouter une voiture';
        submitBtn.textContent = 'Ajouter';
        stateProxy.currentCarId = null;
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('carModal').classList.remove('active');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));
}

function validateForm() {
    clearErrors();
    let isValid = true;

    const brand = document.getElementById('carBrand');
    const model = document.getElementById('carModel');
    const year = document.getElementById('carYear');
    const price = document.getElementById('carPrice');

    if (!brand.value.trim()) {
        brand.classList.add('error');
        document.getElementById('brandError').classList.add('show');
        isValid = false;
    }

    if (!model.value.trim()) {
        model.classList.add('error');
        document.getElementById('modelError').classList.add('show');
        isValid = false;
    }

    if (!year.value || year.value < 1900 || year.value > 2025) {
        year.classList.add('error');
        document.getElementById('yearError').classList.add('show');
        isValid = false;
    }

    if (!price.value || price.value < 0) {
        price.classList.add('error');
        document.getElementById('priceError').classList.add('show');
        isValid = false;
    }

    return isValid;
}

function submitForm(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const carData = {
        brand: document.getElementById('carBrand').value.trim(),
        model: document.getElementById('carModel').value.trim(),
        year: parseInt(document.getElementById('carYear').value),
        price: parseFloat(document.getElementById('carPrice').value),
        image: document.getElementById('carImage').value.trim(),
        description: document.getElementById('carDescription').value.trim()
    };

    if (state.currentCarId) {
        // Modification
        stateProxy.cars = state.cars.map(car =>
            car.id === state.currentCarId
                ? { ...car, ...carData }
                : car
        );
    } else {
        // Ajout
        const newCar = {
            id: Date.now(),
            ...carData
        };
        stateProxy.cars = [...state.cars, newCar];
    }

    closeModal();
}

// Fonctions globales pour les boutons
window.editCar = function (id) {
    openModal(id);
};

window.deleteCar = function (id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.classList.add('removing');
            setTimeout(() => {
                stateProxy.cars = state.cars.filter(car => car.id !== id);
            }, 500);
        } else {
            stateProxy.cars = state.cars.filter(car => car.id !== id);
        }
    }
};

// Event listeners
function attachEventListeners() {
    // Thème
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Modal
    document.getElementById('addCarBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Fermeture du modal en cliquant à l'extérieur
    document.getElementById('carModal').addEventListener('click', (e) => {
        if (e.target.id === 'carModal') closeModal();
    });

    // Formulaire
    document.getElementById('carForm').addEventListener('submit', submitForm);

    // Recherche
    document.getElementById('searchInput').addEventListener('input', (e) => {
        stateProxy.searchTerm = e.target.value;
    });

    // Filtres
    document.getElementById('brandFilter').addEventListener('change', (e) => {
        stateProxy.brandFilter = e.target.value;
    });

    document.getElementById('sortFilter').addEventListener('change', (e) => {
        stateProxy.sortFilter = e.target.value;
    });
}

// Démarrage de l'application
init()
