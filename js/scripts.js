
let map;
let userCircle = [];


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
    return 4;
}

const level2Css = ['risk‑0','risk‑1','risk‑2','risk‑3','risk‑4'];
function iconFromHistory(events = []) {
    const lvl = riskLevel(events.length);
    return makeIcon(level2Css[lvl]);
}

setInterval(() => {
    if (userCircle.length > 0) {
        for (let i = 0; i < userCircle.length; i++) {
            userCircle[i].setRadius(userCircle[i].getRadius() + 1250 / 60);

            if (userCircle[i].getRadius() > 5000) {
                userCircle[i].setRadius(userCircle[i].getRadius() - 5000);
            }

            const radius = userCircle[i].getRadius();
            const fillOpacity = 0.3 * (1 - radius / 5000);

            userCircle[i].setStyle({ fillOpacity });
        }
    }
}, 1000 / 60);

function initMap(types = ['street']) {
    if (!map) {
        map = L.map('map', {
            center: [46.1512, 14.9955],
            zoom: 8.3,
            minZoom: 8.3,
            maxZoom: 18,
            maxBounds: [
                [45.35, 13.35],
                [46.88, 16.70]
            ],
            maxBoundsViscosity: 1.0
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;

        if (userCircle.length < 4) {
            for (var i = 0; i < 4; i++) {
                const circle = L.circle([latitude, longitude], {
                    radius: 1250 * i,
                    color: 'dimblue',
                    fillColor: '#00AABB',
                    fillOpacity: 0.2,
                    weight: 0
                })

                circle.addTo(map);
                userCircle.push(circle)
            }
        } else {
            userCircle.forEach((circle) => {
                circle.setLatLng([latitude, longitude])

                if (!map.hasLayer(circle)) {
                    circle.addTo(map);
                }
            });
        }
    }, error => {
        console.warn("Geolocation error:", error);
    });


    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer || layer === userCircle) return;
        map.removeLayer(layer);
    });


    const typeLabels = {
        0: 'street',
        1: 'railroad'
    };

    const sizeLabels = {
        0: 'None',
        1: 'Small',
        2: 'Big'
    };


    fetch('/api/get-data')
        .then(res => res.json())
        .then(data => {
            data
                .filter(entry => types.includes(typeLabels[entry.type]))
                .forEach(entry => {
                    const icon = makeIcon(level2Css[riskLevel(entry.accident_occurrences)]);

                    const formatter = new Intl.DateTimeFormat('en-GB', {
                        timeZone: 'Europe/Ljubljana',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    });

                    L.marker([parseFloat(entry.lat), parseFloat(entry.lng)], { icon })
                        .bindPopup(`
                            <strong>${entry.device_name}</strong><br/>
                            Type: ${typeLabels[entry.type] ?? 'unknown'}<br/>
                            Size: ${sizeLabels[entry.size] ?? "N/A"}<br/>
                            Reports: ${entry.accident_occurrences}<br/>
                            Reported: ${entry.eu_timestamp === "N/A" ? entry.eu_timestamp : formatter.format(new Date(entry.eu_timestamp))}
                        `)
                        .addTo(map);
                });
        })
        .catch(err => console.error('Cannot load data from /api/get-data', err));
}



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



window.addEventListener('load', () => {
    initMap(['street']);
    setActiveTab('streetTab');
});


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

document.addEventListener("DOMContentLoaded", () => {


    const personEntries = document.querySelectorAll(".persons-container .person-entry");

    personEntries.forEach(entry => {
        entry.addEventListener("mouseenter", () => {
            personEntries.forEach(otherEntry => {
                if (otherEntry !== entry) {
                    otherEntry.classList.remove("is-active");
                }
            });

            entry.classList.add("is-active");
        });

        entry.addEventListener("mouseleave", () => {
            entry.classList.remove("is-active");
        });
    });
});
