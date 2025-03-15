// Seleccionar l'element main
// Crear el botó flotant
const floatingButton = document.createElement('button');

var opened = false;

const APIurl = 'http://localhost:8888/agent';
const dataSetEndpoint = '/dataset/setup';
const responseEndpoint = '/response';

let vectorStoreId;

// Initialize the chat by fetching the dataset setup
async function getDataset() {
    try {
        const response = await fetch(APIurl + dataSetEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        vectorStoreId = data.vectorStoreId;
        console.log("Chat initialized with vectorStoreId:", vectorStoreId);
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

getDataset();

// Afegir classes i estil al botó
floatingButton.classList.add('floating-button');
floatingButton.innerHTML = '🛟'; // Si vols utilitzar Font Awesome, o posar text com "+"

// Estils CSS pel botó flotant
floatingButton.style.boxSizing = 'border-box';
floatingButton.style.position = 'fixed';
floatingButton.style.bottom = '20px';
floatingButton.style.right = '20px';
floatingButton.style.width = '50px';
floatingButton.style.height = '50px';
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
chatContainer.style.borderRadius = '6px';
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
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: 'smooth'
    });
};

const scrollToElement = (element, offset) => { 
    chatBody.scrollTo({
        top: element.offsetTop - offset,
        behavior: 'smooth'
    });
}

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

function parseMarkdown(markdown) {
    // Convert markdown to HTML with styling
    return markdown
        .replace(/^### (.*$)/gm, '<h3 style="font-size: 17px; margin: 0; font-weight:500;">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="font-size: 17px; margin: 0; font-weight:700;">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="font-size: 17px; margin: 0; font-weight:900;">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: rgb(20, 67, 147); text-decoration: none;">$1</a>')
        .replace(/- (.*$)/gm, '<li>$1</li>')
        .replace(/<li>(.*?)<\/li>/g, '<ul style="margin: 0 !important; padding-left: 20px !important; padding-right: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important;"><li>$1</li></ul>')
        .replace(/<\/ul><ul.*?>/g, '') 
        .replace(/\n+/g, '<br style="margin: 0; padding: 0;">');
}

const getResponseDiv = (mockResponse) =>{
    const parts = mockResponse.split('```');
    const responseDiv = document.createElement('div');
    responseDiv.style.display = 'flex';
    responseDiv.style.flexDirection = 'column';
    responseDiv.style.gap = '4px';
    parts.forEach((part, index) => {
        if (index % 2 === 0) {
            // Regular message part
            const messagePart = messageComponent(parseMarkdown(part), 'receive');
            responseDiv.appendChild(messagePart);
        } else {
            // Code part
            const codePart = document.createElement('pre');
            codePart.style.fontSize = '15px';
            codePart.style.fontWeight = '300';
            codePart.textContent = part;
            codePart.style.backgroundColor = '#f4f4f4';
            codePart.style.padding = '8px 12px';
            codePart.style.borderRadius = '6px';
            codePart.style.overflowX = 'auto';
            codePart.style.margin = '4px 0';
            
            // Crear el botó de copiar
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copiar';
            copyButton.style.position = 'absolute';
            copyButton.style.top = '11px';
            copyButton.style.right = '6px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.fontSize = '12px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.backgroundColor ='rgba(50, 55, 60, 0.65)';
            copyButton.style.color = '#fff';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            
            // Afegir funcionalitat al botó de copiar
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(part).then(() => {
                    copyButton.textContent = 'Copiat!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copiar';
                    }, 2000);
                });
            });
            
            // Contenidor per al pre i el botó de copiar
            const codeContainer = document.createElement('div');
            codeContainer.style.position = 'relative';
            codeContainer.appendChild(copyButton);
            codeContainer.appendChild(codePart);
            
            responseDiv.appendChild(codeContainer);
        }
    });
    return responseDiv;
}

const messageComponent = (message, mode) => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.style.fontSize = '15px';
    messageElement.style.fontWeight = '300';
    messageElement.style.lineHeight = '1.5';
    messageElement.style.wordWrap = 'break-word';
    if (mode === 'send'){
        messageElement.style.padding = '6px 10px';
        messageElement.style.alignSelf = 'flex-end';
        messageElement.style.backgroundColor = '#e6f2ff';
        messageElement.style.borderRadius = '6px';
        messageElement.style.maxWidth = '80%';
    } else {
        messageElement.style.minHeight = '20px';
        messageElement.style.padding = '0px 6px';
        messageElement.style.alignSelf = 'flex-start';
        messageElement.style.maxWidth = '100%';
        if (mode === "err"){
            messageElement.style.color = "#f9c32f";
        }
    }
    return messageElement;
}
const a = getResponseDiv("Soc l'assistent de PayRetailers. Com puc ajudar-te?");
chatBody.appendChild(a);
scrollToElement(a, 110);

var previousResponseId;

// Handle sending messages
async function manageSend() {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        // Create and display user message
        const userMessageElement = messageComponent(userMessage, 'send');
        chatBody.appendChild(userMessageElement);
        scrollToBottom();

        
        // Clear input
        chatInput.value = '';

        const chargingBalls = [' ', '●', '●●', '●●●'];
        let charging = true;
        
        // Show typing indicator
        const typingIndicator = messageComponent('', 'receive');
        chatBody.appendChild(typingIndicator);
        scrollToBottom();

        (function changeChargingBalls () {
            if (charging) {
                typingIndicator.textContent = chargingBalls[0];
                chargingBalls.push(chargingBalls.shift());
                scrollToBottom();
                setTimeout(changeChargingBalls, 500);
            }
        })()
        //comentar
        //Wait for 3 seconds before removing typing indicator
//         setTimeout(() => {
//             charging = false;
//             chatBody.removeChild(typingIndicator);
//             const mockResponse = `# PayRetailers

// PayRetailers és un proveïdor líder de serveis de pagament en línia, fundat el 2017, amb seu a Espanya i oficines regionals a diversos països d'Amèrica Llatina, com Mèxic, Argentina, Brasil, i altres. Ofereix més de 250 mètodes de pagament locals, facilitant així que els comerços acceptin pagaments en diverses monedes sense necessitat d'una entitat local.

// ### Característiques Clau:
// - **Integració Senzilla**: La seva API permet una integració ràpida amb plataformes de comerç electrònic, millorant l'experiència de compra dels clients.
// - **Seguretat**: Utilitza tecnologia de tokenització per protegir les dades de pagament, garantint la seguretat en les transaccions.
// - **Suport Local**: Disposa d'un equip d'experts en cada país on opera, proporcionant assessorament sobre els mètodes de pagament més adequats per a cada mercat.

// ### Beneficis:
// - **Augment de Conversió**: Acceptar mètodes de pagament locals pot incrementar la taxa de conversió i la satisfacció del client.
// - **Cobertura Regional**: Permet a les empreses expandir-se a mercats emergents amb un enfocament en les necessitats locals.

// Si necessites més informació específica o detalls sobre un aspecte concret de PayRetailers, no dubtis a preguntar!`;

//             const responseDiv = getResponseDiv(mockResponse);
//             chatBody.appendChild(responseDiv);
//             scrollToElement(responseDiv,110);
//         }, 0); 
        //fins aquí

        //descomentar        
        try {
            const response = await fetch(APIurl + responseEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    input: userMessage,
                    vectorStoreId,
                    previous_response_id: previousResponseId,
                })
            });
            const data = await response.json();
            charging = false;

            if (typingIndicator.parentNode === chatBody) {
                chatBody.removeChild(typingIndicator);
            }

            if (data.error) throw new Error(data.error)
            
            previousResponseId = data.response_id;
            const responseDiv = getResponseDiv(data.output_text);
            chatBody.appendChild(responseDiv);
            scrollToElement(responseDiv, 110);

        } catch (error) {
            console.error('Error:', error);
            charging = false;

            if (typingIndicator.parentNode === chatBody) {
                chatBody.removeChild(typingIndicator);
            }

            // Show error message
            const errorMessage = messageComponent('En aquests moments no estic disponible', 'err');
            chatBody.appendChild(errorMessage);
            scrollToElement(errorMessage,110);
        } 
        //fins aquí
    }
}

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        manageSend();
    }
});

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
