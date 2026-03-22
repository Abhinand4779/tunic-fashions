/**
 * ASTRA - Contact Page Logic
 */

document.getElementById('contact-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.querySelector('.premium-submit span');
    const submitBtn = document.querySelector('.premium-submit');
    const originalText = btn.textContent;

    btn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;

    // Simulate sending
    setTimeout(() => {
        alert('Thank you for reaching out to ASTRA! Your message has been received and our team will get back to you shortly.');
        this.reset();
        btn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
    }, 1500);
});
