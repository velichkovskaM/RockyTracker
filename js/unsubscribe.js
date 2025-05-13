document.addEventListener('DOMContentLoaded', () => {
    console.log("Am here.")
    const unsubscribeBtn = document.getElementById('unsubscribeBtn');
    const emailInput = document.getElementById('unsubscribeEmail');

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
        const emailInput = document.getElementById('unsubscribeEmail');
        if (emailInput) emailInput.value = emailParam;
    }

    if (unsubscribeBtn && emailInput) {
        unsubscribeBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();
            if (!email) {
                return alert('Please enter a valid email address.');
            }

            try {
                const res = await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const text = await res.text();
                alert(text);
            } catch (err) {
                console.error('Fetch error:', err);
                alert('Something went wrong.');
            }
        });
    } else {
        console.warn('Unsubscribe button or input not found.');
    }
});