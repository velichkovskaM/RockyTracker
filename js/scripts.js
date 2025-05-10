
let map;

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

function riskLevel(eventCount){
    if (eventCount === 0) return 0;
    if (eventCount <= 5) return 1;
    if (eventCount <= 10) return 2;
    if (eventCount <= 15) return 3;
    if (eventCount <= 25) return 4;
    return 5;
}

const level2Css = ['risk‑0','risk‑1','risk‑2','risk‑3','risk‑4','risk‑5'];
function iconFromHistory(events = []) {
    const lvl = riskLevel(events.length);
    return makeIcon(level2Css[lvl]);
}

function loadSites(map, wantedType){
    fetch('data/landslide.json')
        .then(r => r.json())
        .then(sites => {
            sites
                .filter(s => !wantedType || s.type === wantedType)
                .forEach(s => {
                    const icon = iconFromHistory(s.events);
                    const eventsArray = Array.isArray(s.events) ? s.events : [];
                    const last = eventsArray.length > 0 ? eventsArray[eventsArray.length - 1] : null;
                    L.marker([s.lat, s.lng], {icon})
                        .bindPopup(`
          <strong>${s.name || s.id}</strong><br/>
          Type: ${s.type || 'street'}<br/>
          Total events: ${eventsArray.length}<br/>
          Last event: ${last ? new Date(last.ts).toLocaleString() : '—'}
        `)
                        .addTo(map);
                });
        })
        .catch(err => console.error('sites.json load error', err));
}

function initMap(types = ['street']) {
    if (!map) {
        map = L.map('map', {
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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    // Clear previous markers
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return;
        map.removeLayer(layer);
    });


    // Add history markers
    types.forEach(type => loadSites(map, type));

    // Add slide markers
    fetch('data/landslide.json')
        .then(res => res.json())
        .then(slides => {
            slides
                .filter(s => types.includes(s.type))
                .forEach(s => {
                    const icon = makeIcon(`status-${s.status}`);
                    L.marker([s.lat, s.lng], { icon })
                        .bindPopup(`
                            <strong>${s.id}</strong><br/>
                            Type: ${s.type}<br/>
                            Size: ${s.size}<br/>
                            Reported: ${new Date(s.reported_at).toLocaleString()}
                        `)
                        .addTo(map);
                });
        })
        .catch(err => console.error('Cannot load landslide.json', err));
}

// Tab switching logic
function setActiveTab(tabId) {
    ['streetTab', 'railTab', 'bothTab'].forEach(id =>
        document.getElementById(id).classList.toggle('active', id === tabId)
    );
}

document.getElementById('streetTab').addEventListener('click', () => {
    initMap(['street']);
    setActiveTab('streetTab');
});

document.getElementById('railTab').addEventListener('click', () => {
    initMap(['railroad']);
    setActiveTab('railTab');
});

document.getElementById('bothTab').addEventListener('click', () => {
    initMap(['street', 'railroad']);
    setActiveTab('bothTab');
});

//email card toggle
document.addEventListener('DOMContentLoaded', () => {
    const liveUpdateBanner = document.getElementById('liveUpdateBanner');
    const emailCard = document.getElementById('emailCard');
    const closeEmailCard = document.getElementById('closeEmailCard');

    emailCard.style.display = 'none';
    overlay.style.display = 'none';

    liveUpdateBanner.addEventListener('click', () => {
        emailCard.style.display = 'flex';
        overlay.style.display = 'block';
    });

    closeEmailCard.addEventListener('click', () => {
        emailCard.style.display = 'none';
        overlay.style.display = 'none';
    });
});


// Initial load
window.addEventListener('load', () => {
    initMap(['street']);
    setActiveTab('streetTab');
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
