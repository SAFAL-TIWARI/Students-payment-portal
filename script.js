// Store transactions in localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Add these constants at the top of your script file
const ACCOUNT_DETAILS = {
    name: "Student Sati",  // Replace with actual name
    account: "9826000000",  // Replace with actual account number
    ifsc: "SBIN0019826",  // Replace with actual IFSC
    upi: "student.sati@ibl"  // Replace with actual UPI ID
};

// Add recipient's constant details
const RECIPIENT_DETAILS = {
    name: "Director Sati",
    account: "30961316837",
    ifsc: "SBIN0012193",
    upi: "directorsati@sbi"  // Replace with actual UPI ID
};

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userName = document.getElementById('Student_sati').value;
    const userAccount = document.getElementById('9826000000').value;
    const userIFSC = document.getElementById('SBIN0019826').value;
    const amount = document.getElementById('amount').value;
    const purpose = document.getElementById('purpose').value;
    
    // Create new transaction
    const transaction = {
        id: Date.now(),
        userName: userName,
        userAccount: userAccount,
        userIFSC: userIFSC,
        amount: amount,
        purpose: purpose,
        date: new Date().toLocaleString()
    };
    
    // Add to transactions array
    transactions.unshift(transaction);
    
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Update display
    displayTransactions();
    
    // Reset form
    this.reset();
    
    alert('Payment successful!');
});

function displayTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <h3>Transaction ID: ${transaction.id}</h3>
            <p><strong>From:</strong> ${transaction.userName}</p>
            <p><strong>Account:</strong> ${transaction.userAccount}</p>
            <p><strong>IFSC:</strong> ${transaction.userIFSC}</p>
            <p><strong>Amount:</strong> ₹${transaction.amount}</p>
            <p><strong>Purpose:</strong> ${transaction.purpose}</p>
            <p><strong>Date:</strong> ${transaction.date}</p>
        `;
        transactionList.appendChild(div);
    });
}

function shareDetails() {
    // Get latest transaction
    const lastTransaction = transactions[0];
    if (!lastTransaction) {
        alert('Please make a payment first!');
        return;
    }

    // Create a temporary div with all transaction details
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'screenshot-content';
    
    // Add all details
    detailsDiv.innerHTML = `
        <div class="screenshot-header">
            <h2>Payment Details</h2>
            <div class="details-section">
                <h3>Sender's Details</h3>
                <p><strong>Name:</strong> ${lastTransaction.userName}</p>
                <p><strong>Account Number:</strong> ${lastTransaction.userAccount}</p>
                <p><strong>IFSC Code:</strong> ${lastTransaction.userIFSC}</p>
            </div>
            <div class="details-section">
                <h3>Recipient's Details</h3>
                <p><strong>Account Name:</strong> ${RECIPIENT_DETAILS.name}</p>
                <p><strong>Account Number:</strong> ${RECIPIENT_DETAILS.account}</p>
                <p><strong>IFSC Code:</strong> ${RECIPIENT_DETAILS.ifsc}</p>
            </div>
            <div class="details-section">
                <h3>Transaction Details</h3>
                <p><strong>Amount:</strong> ₹${lastTransaction.amount}</p>
                <p><strong>Purpose:</strong> ${lastTransaction.purpose}</p>
                <p><strong>Date:</strong> ${lastTransaction.date}</p>
            </div>
        </div>
    `;

    // Temporarily add to document
    detailsDiv.style.padding = '20px';
    detailsDiv.style.background = 'white';
    detailsDiv.style.position = 'fixed';
    detailsDiv.style.left = '-9999px';
    document.body.appendChild(detailsDiv);

    // Generate screenshot
    html2canvas(detailsDiv, {
        backgroundColor: '#ffffff',
        scale: 2 // For better quality
    }).then(canvas => {
        // Remove temporary div
        document.body.removeChild(detailsDiv);

        // Convert to image
        const imageData = canvas.toDataURL('image/png');

        // Share image
        if (navigator.share) {
            // Convert base64 to blob
            fetch(imageData)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'payment-details.png', { type: 'image/png' });
                    navigator.share({
                        title: 'Payment Details',
                        files: [file]
                    }).catch(error => {
                        console.error('Error sharing:', error);
                        // Fallback to download if sharing fails
                        downloadImage(imageData);
                    });
                });
        } else {
            // Fallback to download if share API not available
            downloadImage(imageData);
        }
    });
}

function downloadImage(imageData) {
    const link = document.createElement('a');
    link.download = 'payment-details.png';
    link.href = imageData;
    link.click();
}

// Initialize when the document loads
document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.getElementById('amount');
    const purposeInput = document.getElementById('purpose');

    if(amountInput) {
        amountInput.value = '';
        amountInput.removeAttribute('disabled');
        amountInput.style.pointerEvents = 'auto';
    }
    if(purposeInput) {
        purposeInput.value = '';
        purposeInput.removeAttribute('disabled');
        purposeInput.style.pointerEvents = 'auto';
    }

    // Add input event listeners
    amountInput?.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Hide share button initially
    const existingShare = document.querySelector('.share-section');
    if (existingShare) {
        existingShare.style.display = 'none';
    }

    // Add click listeners to all payment buttons
    const payButtons = document.querySelectorAll('.pay-button');
    payButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const paymentMethod = this.classList.contains('phonepe') ? 'phonepe' :
                                this.classList.contains('gpay') ? 'gpay' :
                                'paytm';
            payWithApp(paymentMethod);
        });
    });

    // Remove any overlay or blocking elements
    const overlays = document.querySelectorAll('.overlay, .blocker');
    overlays.forEach(overlay => overlay.remove());

    // Enable all inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.pointerEvents = 'auto';
        input.style.cursor = 'text';
        input.removeAttribute('disabled');
    });
    
    // Remove any existing share buttons or sections
    document.querySelectorAll('.share-section, .share-button, [onclick*="shareTransactionDetails"]').forEach(el => el.remove());
    
    // Clear any old share buttons from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.forEach(t => {
        if (t.hasOwnProperty('shareButton')) {
            delete t.shareButton;
        }
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Display clean transaction history
    displayTransactionHistory();

    // Update PhonePe image
    const phonepeButton = document.querySelector('.phonepe img');
    if (phonepeButton) {
        phonepeButton.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzVmMjVhYyIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjxwYXRoIGZpbGw9IiM1ZjI1YWMiIGQ9Ik0xMiA4Yy0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTQtMS43OS00LTQtNHptMCA2Yy0xLjEgMC0yLS45LTItMnMuOS0yIDItMiAyIC45IDIgMi0uOSAyLTIgMnoiLz48L3N2Zz4="';
    }
});

function payWithApp(app) {
    const amount = document.getElementById('amount').value;
    const purpose = document.getElementById('purpose').value;

    if (!amount) {
        alert('Please enter amount');
        return;
    }
    if (!purpose) {
        alert('Please enter purpose');
        return;
    }

    const recipientDetails = {
        name: 'Director Sati',
        account: '30961316837',
        ifsc: 'SBIN0012193'
    };

    const transaction = {
        id: 'TXN' + Date.now(),
        amount: amount,
        purpose: purpose,
        date: new Date().toLocaleString(),
        recipient: recipientDetails,
        paymentMethod: app,
        status: 'pending'
    };

    localStorage.setItem('pendingTransaction', JSON.stringify(transaction));

    const paymentURLs = {
        phonepe: {
            mobile: `phonepe://pay?recipient=${recipientDetails.name}&amount=${amount}`,
            web: 'https://phonepe.com'
        },
        gpay: {
            mobile: 'tez://upi/pay',
            web: 'https://pay.google.com'
        },
        paytm: {
            mobile: 'paytmmp://pay',
            web: 'https://paytm.com'
        }
    };

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const selectedApp = paymentURLs[app];

    if (isMobile) {
        window.location.href = selectedApp.mobile;
        
        // Check for payment completion when app returns
        window.addEventListener('focus', function onFocus() {
            window.removeEventListener('focus', onFocus);
            setTimeout(() => {
                checkPaymentStatus();
            }, 1000);
        });
    } else {
        window.open(selectedApp.web, '_blank');
        // For desktop, show payment status check after a delay
        setTimeout(() => {
            checkPaymentStatus();
        }, 2000);
    }
}

function checkPaymentStatus() {
    const pendingTransaction = JSON.parse(localStorage.getItem('pendingTransaction'));
    if (pendingTransaction) {
        const confirmed = confirm('Did you complete the payment?');
        if (confirmed) {
            completeTransaction(pendingTransaction);
        } else {
            localStorage.removeItem('pendingTransaction');
        }
    }
}

function completeTransaction(transaction) {
    transaction.status = 'completed';
    
    // Save to transaction history
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Remove pending transaction
    localStorage.removeItem('pendingTransaction');
    
    // Create and show receipt with share button
    createReceiptAndShare(transaction);
    
    // Update display
    displayTransactionHistory();
}

function createReceiptAndShare(transaction) {
    // Remove any existing receipts
    const existingReceipt = document.querySelector('.receipt-container');
    if (existingReceipt) existingReceipt.remove();

    // Create receipt
    const receipt = document.createElement('div');
    receipt.className = 'receipt-container';
    receipt.innerHTML = `
        <div class="receipt" id="receipt-${transaction.id}">
            <div class="receipt-header">
                <h2>Payment Receipt</h2>
                <div class="receipt-logo">🏫 SATI</div>
            </div>
            <div class="receipt-body">
                <div class="receipt-amount">₹${transaction.amount}</div>
                <div class="receipt-details">
                    <p><strong>Purpose:</strong> ${transaction.purpose}</p>
                    <p><strong>Paid to:</strong> ${transaction.recipient.name}</p>
                    <p><strong>Account:</strong> ${transaction.recipient.account}</p>
                    <p><strong>IFSC:</strong> ${transaction.recipient.ifsc}</p>
                    <p><strong>Date:</strong> ${transaction.date}</p>
                    <p><strong>Status:</strong> Completed</p>
                </div>
            </div>
        </div>
        <button onclick="shareReceipt('${transaction.id}')" class="share-button">
            Share Receipt
        </button>
    `;

    // Insert above transaction history
    const transactionHistory = document.querySelector('.transaction-history');
    if (transactionHistory) {
        transactionHistory.parentNode.insertBefore(receipt, transactionHistory);
    }
}

async function shareReceipt(transactionId) {
    const receiptElement = document.getElementById(`receipt-${transactionId}`);
    
    try {
        // Create screenshot
        const canvas = await html2canvas(receiptElement, {
            backgroundColor: '#ffffff',
            scale: 2, // For better quality
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'payment-receipt.png', { type: 'image/png' });

            // Share image and text
            const transaction = JSON.parse(localStorage.getItem('transactions'))[0];
            const shareData = {
                files: [file],
                title: 'Payment Receipt',
                text: `
Amount: ₹${transaction.amount}
Purpose: ${transaction.purpose}
Paid to: ${transaction.recipient.name}
Date: ${transaction.date}
                `.trim()
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback for desktop
                    const link = document.createElement('a');
                    link.download = 'payment-receipt.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
            } catch (error) {
                console.error('Error sharing:', error);
                alert('Could not share receipt. Receipt downloaded instead.');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error creating receipt:', error);
        alert('Could not create receipt image.');
    }
}

function displayTransactionHistory() {
    const transactionList = document.getElementById('transactionList');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    transactionList.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-header">
                <span class="amount">₹${t.amount}</span>
                <span class="date">${t.date}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Purpose:</strong> ${t.purpose}</p>
                <p><strong>Paid to:</strong> ${t.recipient.name}</p>
                <p><strong>Account:</strong> ${t.recipient.account}</p>
                <p><strong>IFSC:</strong> ${t.recipient.ifsc}</p>
            </div>
        </div>
    `).join('');
}

// Updated CSS with smaller app icons and removed duplicate share button
const style = document.createElement('style');
style.textContent = `
    body {
        margin: 0 !important;
        padding: 0 !important;
        min-height: 100vh !important;
        background: linear-gradient(45deg, #f0f2f5, #e3e6e8) !important;  /* Light gray gradient background */
        font-family: 'Segoe UI', Arial, sans-serif !important;
    }

    .main-container {
        padding: 20px !important;
    }

    .portal-title {
        text-align: center !important;
        color: #0066cc !important;  /* Blue color for title */
        font-size: 28px !important;
        margin-bottom: 20px !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
    }

    .payment-form {
        background: rgba(255, 255, 255, 0.95) !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
        padding: 25px !important;
        margin: 0 auto !important;
        max-width: 600px !important;
        position: relative !important;
    }

    .sati-header {
        text-align: center !important;
        margin-bottom: 25px !important;
        padding-bottom: 20px !important;
        border-bottom: 2px solid rgba(0, 0, 0, 0.1) !important;
    }

    .sati-logo {
        width: 80px !important;  /* Adjusted size for gear logo */
        height: 80px !important;
        margin-bottom: 15px !important;
        object-fit: contain !important;
    }

    .recipient-details {
        background: #f8f9fa !important;
        padding: 15px !important;
        border-radius: 8px !important;
        margin-bottom: 20px !important;
    }

    .recipient-details h3 {
        color: #1976d2 !important;
        margin-top: 0 !important;
        margin-bottom: 15px !important;
        font-size: 18px !important;
    }

    .details-grid {
        display: grid !important;
        gap: 10px !important;
    }

    .details-grid p {
        margin: 0 !important;
        font-size: 14px !important;
        color: #333 !important;
    }

    input[type="number"],
    input[type="text"] {
        width: 100% !important;
        padding: 10px !important;
        border: 1px solid #ddd !important;
        border-radius: 6px !important;
        margin-bottom: 15px !important;
        font-size: 14px !important;
    }

    .payment-row {
        display: flex !important;
        justify-content: center !important;
        gap: 15px !important;
        margin: 20px 0 !important;
    }

    .app-button {
        flex: 1 !important;
        max-width: 120px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px !important;
        border: 1px solid #ddd !important;
        border-radius: 8px !important;
        background: white !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    }

    .app-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }

    .app-icon {
        height: 24px !important;
        width: auto !important;
    }

    @media (max-width: 768px) {
        .payment-form {
            margin: 10px !important;
            padding: 20px !important;
        }

        .portal-title {
            font-size: 24px !important;
        }
    }
`;
document.head.appendChild(style);

// Function to save transaction with persistence
function saveTransaction(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    
    // Save to localStorage with no limit
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Also save to IndexedDB for long-term storage
    saveToIndexedDB(transaction);
}

// IndexedDB setup for permanent storage
function initIndexedDB() {
    const request = indexedDB.open('PaymentHistory', 1);

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('transactions')) {
            db.createObjectStore('transactions', { keyPath: 'id' });
        }
    };
}

// Save transaction to IndexedDB
function saveToIndexedDB(transaction) {
    const request = indexedDB.open('PaymentHistory', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        store.add(transaction);
    };
}

// Load all transactions (combines localStorage and IndexedDB)
function loadAllTransactions() {
    return new Promise((resolve) => {
        const request = indexedDB.open('PaymentHistory', 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction('transactions', 'readonly');
            const store = tx.objectStore('transactions');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                let transactions = getAllRequest.result;
                // Combine with localStorage transactions
                const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
                
                // Merge and remove duplicates
                transactions = [...new Set([...transactions, ...localTransactions])];
                // Sort by date (newest first)
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                resolve(transactions);
            };
        };
    });
}

// Update display function to use combined transactions
async function displayTransactionHistory() {
    const transactionList = document.getElementById('transactionList');
    const transactions = await loadAllTransactions();

    transactionList.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-header">
                <span class="amount">₹${t.amount}</span>
                <span class="date">${t.date}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Purpose:</strong> ${t.purpose}</p>
                <p><strong>Paid to:</strong> ${t.recipient.name}</p>
                <p><strong>Account:</strong> ${t.recipient.account}</p>
                <p><strong>IFSC:</strong> ${t.recipient.ifsc}</p>
            </div>
        </div>
    `).join('');
}

// Initialize IndexedDB when page loads
document.addEventListener('DOMContentLoaded', function() {
    initIndexedDB();
    // ... (rest of your DOMContentLoaded code)
}); 