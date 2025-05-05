let streetMap;
let railMap;


// Setup for location marker type
function makeIcon(cssClass) {
    return L.divIcon({
        html: `<i class="bi bi-geo-alt-fill hvr-float ${cssClass}"></i>`,
        className: 'leaflet-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24]
    });
}

// Street map tab functions
function initStreetMap() {
    streetMap = L.map('map', {
        center: [46.1512, 14.9955],
        zoom: 8.3,
        minZoom: 8.3,
        maxZoom: 14,
        maxBounds: [
            [45.35, 13.35],
            [46.88, 16.70]
        ],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(streetMap);

    fetch('data/lanslide.json')
        .then(res => res.json())
        .then(slides => {
            slides
                .filter(s => s.type === 'street')
                .forEach(s => {
                    const icon = makeIcon(`status-${s.status}`);
                    L.marker([s.lat, s.lng], { icon })
                        .bindPopup(`
             <strong>${s.id}</strong><br/>
             Type: ${s.type}<br/>
             Size: ${s.size}<br/>
             Reported: ${new Date(s.reported_at).toLocaleString()}
           `)
                        .addTo(streetMap);
                });
        })
        .catch(err => console.error('Cannot load lanslide.json', err));
}

// Railroad map functions
function initRailMap() {
    railMap = L.map('mapRail', {
        center: [46.1512, 14.9955],
        zoom: 8.3,
        minZoom: 8.3,
        maxZoom: 14,
        maxBounds: [[45.35, 13.35], [46.88, 16.70]],
        maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(railMap);

    fetch('data/lanslide.json')
        .then(res => res.json())
        .then(slides => {
            slides
                .filter(s => s.type === 'railroad')
                .forEach(s => {
                    const icon = makeIcon(`status-${s.status}`);
                    L.marker([s.lat, s.lng], { icon })
                        .bindPopup(`
             <strong>${s.id}</strong><br/>
             Type: ${s.type}<br/>
             Status: ${s.status}<br/>
             Reported: ${new Date(s.reported_at).toLocaleString()}
           `)
                        .addTo(railMap);
                });
        })
        .catch(err => console.error('Cannot load lanslide.json', err));
}

// Changing between tabs functionality
document.getElementById('railTab').addEventListener('click', () => {
    const railDiv = document.getElementById('mapRail');
    const streetDiv = document.getElementById('map');

    if (railDiv.style.display === 'none') {
        railDiv.style.display = 'block';
        streetDiv.style.display = 'none';
        document.getElementById('railCard').style.zIndex = 2;
        document.getElementById('streetCard').style.zIndex = 1;
        if (!railMap) {
            initRailMap();
        }
        setTimeout(() => railMap.invalidateSize(), 0);
        // Toggle active class
        document.getElementById('railTab').classList.add('active');
        document.getElementById('streetTab').classList.remove('active');
    }
});

document.getElementById('streetTab').addEventListener('click', () => {
    const railDiv = document.getElementById('mapRail');
    const streetDiv = document.getElementById('map');

    if (streetDiv.style.display === 'none') {
        streetDiv.style.display = 'block';
        railDiv.style.display = 'none';
        document.getElementById('streetCard').style.zIndex = 2;
        document.getElementById('railCard').style.zIndex = 1;
        setTimeout(() => streetMap.invalidateSize(), 0);
        document.getElementById('streetTab').classList.add('active');
        document.getElementById('railTab').classList.remove('active');
    }
});

// Loader function (change only if map layout is different from original)
window.addEventListener('load', () => {
    document.getElementById('streetTab').classList.add('active');
    document.getElementById('railTab').classList.remove('active');
});

// Email subscription form
document.getElementById('subscribeForm').addEventListener('submit', async e => {
        e.preventDefault();
        const emailInput = document.querySelector('#exampleInputEmail1');
        if (!emailInput) {
            console.error('No email input found!');
            return;
        }
        const email = emailInput.value;
        const checkInput = document.querySelector('#exampleCheck1');
        if (!checkInput) {
            console.error('No check input found!');
            return;
        }
        const consent = checkInput.checked;
        if (!consent) return alert('You must agree to our privacy policy.');

        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, consent })
        });

        const text = await res.text();
        alert(text);
    });

// Currently loading only initial landing page street map and updating railroad map at click
window.addEventListener('load', initStreetMap);
