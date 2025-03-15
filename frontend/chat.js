// Seleccionar l'element main
// Crear el botó flotant
const floatingButton = document.createElement('button');

var opened = false;

// Afegir classes i estil al botó
floatingButton.classList.add('floating-button');
floatingButton.innerHTML = '🛟'; // Si vols utilitzar Font Awesome, o posar text com "+"

// Estils CSS pel botó flotant
floatingButton.style.boxSizing = 'border-box';
floatingButton.style.position = 'fixed';
floatingButton.style.bottom = '20px';
floatingButton.style.right = '20px';
floatingButton.style.width = '60px';
floatingButton.style.height = '60px';
floatingButton.style.borderRadius = '50%';
floatingButton.style.backgroundColor = "#f9c32f";
floatingButton.style.color = '#fff';
floatingButton.style.border = 'none';
floatingButton.style.fontSize = '24px';
floatingButton.style.cursor = 'pointer';
floatingButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
floatingButton.style.display = 'flex';
floatingButton.style.alignItems = 'center';
floatingButton.style.justifyContent = 'center';
floatingButton.style.zIndex = '1000';

// Afegir efecte hover
floatingButton.addEventListener('mouseover', () => {
    floatingButton.style.backgroundColor ='rgb(255, 219, 120)';
});

floatingButton.addEventListener('mouseout', () => {
    floatingButton.style.backgroundColor = '#f9c32f';
});

// Crear el contenidor del chatbot
const chatContainer = document.createElement('div');
chatContainer.style.fontFamily = "Public Sans, sans-serif";
chatContainer.style.position = 'fixed';
chatContainer.style.bottom = '90px';
chatContainer.style.right = '20px';
chatContainer.style.width = '450px';
chatContainer.style.height = '600px';
chatContainer.style.borderRadius = '10px';
chatContainer.style.backgroundColor = '#fff';
chatContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
chatContainer.style.zIndex = '1000';
chatContainer.style.display = 'flex';
chatContainer.style.flexDirection = 'column';
chatContainer.style.overflow = 'hidden';

// Crear el header del chatbot
const chatHeader = document.createElement('div');
chatHeader.style.background = 'linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(20, 67, 147) 100%)';
chatHeader.style.padding = '10px';
chatHeader.style.color = '#fff';
chatHeader.style.textAlign = 'center';
chatHeader.style.fontWeight = 'normal';
chatHeader.innerHTML = '<img width="110" height="31" src="https://www.payretailers.com/wp-content/uploads/2023/09/logo-light.svg" alt="Pay Retailers Logo" class="logo-pr ls-is-cached lazyloaded" data-src="https://www.payretailers.com/wp-content/uploads/2023/09/logo-light.svg" decoding="async" data-eio-rwidth="110" data-eio-rheight="31">';

// Crear el cos del chatbot
const chatBody = document.createElement('div');
chatBody.style.display = 'flex';
chatBody.style.gap = '12px';
chatBody.style.flexDirection = 'column';
chatBody.style.flex = '1';
chatBody.style.padding = '10px';
chatBody.style.overflowY = 'auto';

// Funció per fer scroll fins a baix
const scrollToBottom = () => {
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Fer scroll fins a baix quan s'afegeix un nou missatge
const observer = new MutationObserver(scrollToBottom);
observer.observe(chatBody, { childList: true });

// Fer scroll fins a baix inicialment
scrollToBottom();

// Crear l'input del chatbot
const chatInputContainer = document.createElement('div');
chatInputContainer.style.display = 'flex';
chatInputContainer.style.borderTop = '1px solid #ddd';

const chatInput = document.createElement('input');
chatInput.type = 'text';
chatInput.placeholder = 'Escriu un missatge...';
chatInput.style.flex = '1';
chatInput.style.background ='rgba(249, 195, 47, 0)';
chatInput.style.border = 'none';
chatInput.style.outline = 'none';

const chatSendButton = document.createElement('button');
chatSendButton.innerHTML = 'Enviar';
chatSendButton.style.padding = '10px';
chatSendButton.style.background = 'linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(20, 67, 147) 100%)';
chatSendButton.style.color = '#fff';
chatSendButton.style.border = 'none';
chatSendButton.style.cursor = 'pointer';

const messageComponent = (message, mode) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.fontSize = '15px';
    messageElement.style.padding = '6px 10px';
    messageElement.style.lineHeight = '1.5';
    messageElement.style.wordWrap = 'break-word';
    if (mode === 'send'){
        messageElement.style.alignSelf = 'flex-end';
        messageElement.style.backgroundColor = '#e6f2ff';
        messageElement.style.borderRadius = '15px';
        messageElement.style.maxWidth = '80%';
    } else {
        messageElement.textContent = message;
        messageElement.style.alignSelf = 'flex-start';
        messageElement.style.maxWidth = '100%';
    }
    return messageElement;
}

// Handle sending messages
function manageSend() {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        // Create and display user message
        const userMessageElement = messageComponent(userMessage, 'send');
        chatBody.appendChild(userMessageElement);
        
        // Clear input
        chatInput.value = '';

        const chargingBalls = [' ', '●', '●●', '●●●'];
        let charging = true;
        
        // Show typing indicator
        const typingIndicator = messageComponent('', 'receive');
        chatBody.appendChild(typingIndicator);

        (function changeChargingBalls () {
            if (charging) {
                typingIndicator.textContent = chargingBalls[0];
                chargingBalls.push(chargingBalls.shift());
                setTimeout(changeChargingBalls, 500);
            }
        })()
        
        // Wait for 3 seconds before removing typing indicator
        setTimeout(() => {
            charging = false;
            chatBody.removeChild(typingIndicator);
            const botMessage = messageComponent('Thanks for your message! We appreciate your input and will get back to you shortly. If you have any further questions, feel free to ask!', 'receive');
            chatBody.appendChild(botMessage);
        }, 3000);



        
        // // Example API call - replace with your actual endpoint
        // fetch('http://localhost:8888/agent/response', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ message: userMessage })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Create and display bot response
        //     const botMessage = document.createElement('div');
        //     botMessage.textContent = data.response || "Thanks for your message!";
        //     botMessage.style.alignSelf = 'flex-start';
        //     botMessage.style.backgroundColor = '#f1f1f1';
        //     botMessage.style.padding = '8px 12px';
        //     botMessage.style.borderRadius = '15px';
        //     botMessage.style.marginBottom = '8px';
        //     botMessage.style.maxWidth = '80%';
        //     chatBody.appendChild(botMessage);
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     // Show error message
        //     const errorMessage = document.createElement('div');
        //     errorMessage.textContent = "Sorry, couldn't process your request.";
        //     errorMessage.style.alignSelf = 'flex-start';
        //     errorMessage.style.color = 'red';
        //     errorMessage.style.padding = '8px 12px';
        //     errorMessage.style.marginBottom = '8px';
        //     chatBody.appendChild(errorMessage);
        // });
    }
}


chatSendButton.addEventListener('click', () => {
    manageSend();
});

chatInputContainer.appendChild(chatInput);
chatInputContainer.appendChild(chatSendButton);

// Afegir els elements al contenidor del chatbot
chatContainer.appendChild(chatHeader);
chatContainer.appendChild(chatBody);
chatContainer.appendChild(chatInputContainer);

// Afegir efecte clic (opcional)
floatingButton.addEventListener('click', () => {

    // Afegir el contenidor del chatbot al body
    if(opened) {
        document.querySelector('.chatbot').remove();
        opened = false;
    } else {
        //esborrar
        document.body.appendChild(chatContainer);
        chatContainer.classList.add('chatbot');
        //esborrar
        // if (document.querySelector('.chatbot')) {
        //     document.querySelector('.chatbot').style.display = 'flex';
        // }
        // else{
        //     document.body.appendChild(chatContainer);
        //     chatContainer.classList.add('chatbot');
        // }
        opened = true;
    }
});

// Afegir el botó a l'element main
document.body.appendChild(floatingButton);