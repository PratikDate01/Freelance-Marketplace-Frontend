// Utility to detect if ad blockers are interfering with Stripe
export const detectAdBlocker = async () => {
  try {
    // Try to make a simple request to Stripe's API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://js.stripe.com/v3/', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return false; // No ad blocker detected
  } catch (error) {
    if (error.name === 'AbortError') {
      return true; // Likely blocked by ad blocker
    }
    return true; // Any other error suggests blocking
  }
};

export const detectStripeBlocking = () => {
  return new Promise((resolve) => {
    // Create a test element that ad blockers typically block
    const testElement = document.createElement('div');
    testElement.innerHTML = '&nbsp;';
    testElement.className = 'adsbox';
    testElement.style.position = 'absolute';
    testElement.style.left = '-999px';
    testElement.style.top = '-999px';
    
    document.body.appendChild(testElement);
    
    setTimeout(() => {
      const isBlocked = testElement.offsetHeight === 0;
      document.body.removeChild(testElement);
      resolve(isBlocked);
    }, 100);
  });
};

export const showAdBlockerWarning = () => {
  return {
    title: 'Payment Service Blocked',
    message: 'It appears that an ad blocker or browser extension is preventing the payment form from loading properly.',
    solutions: [
      'Disable your ad blocker for this website',
      'Add this site to your ad blocker\'s whitelist',
      'Try using a different browser',
      'Use the alternative payment method below'
    ]
  };
};