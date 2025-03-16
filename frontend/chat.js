// Constantes y variables globales
const APIurl = 'http://localhost:8888/agent';
const dataSetEndpoint = '/dataset/setup';
const responseEndpoint = '/dataset/responses';
const buyEndpoint = '/buy/responses';

let vectorStoreId;
let previousResponseId;
var opened = false;
let chatMode = ''; // 'info' o 'buy'
let content;
const userInfo = [];

// Elementos del chat
const elements = {
    floatingButton: null,
    optionsContainer: null,
    buyButton: null,
    infoButton: null,
    chatContainer: null,
    chatBody: null,
    chatInput: null
};

// Inicialización del chat
async function initializeChat() {
    createFloatingButton();
    createOptionsMenu();
    createChatContainer();
    await getDataset();
    setupEventListeners();
    document.body.appendChild(elements.floatingButton);
}

// Obtener configuración del dataset
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

// Crear el botón flotante
function createFloatingButton() {
    const floatingButton = document.createElement('button');
    floatingButton.classList.add('floating-button');
    floatingButton.innerHTML = '🛟';

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

    elements.floatingButton = floatingButton;
}

// Crear menú de opciones
function createOptionsMenu() {
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('options-container');
    optionsContainer.style.position = 'fixed';
    optionsContainer.style.bottom = '80px';
    optionsContainer.style.right = '20px';
    optionsContainer.style.display = 'none';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '10px';
    optionsContainer.style.zIndex = '1000';
    
    // Botón Comprar
    const buyButton = document.createElement('button');
    buyButton.textContent = '💳 Comprar';
    applyOptionButtonStyles(buyButton);
    
    // Botón Info
    const infoButton = document.createElement('button');
    infoButton.textContent = `✨ Contacta'ns`;
    applyOptionButtonStyles(infoButton);
    
    optionsContainer.appendChild(infoButton);
    optionsContainer.appendChild(buyButton);
    
    elements.optionsContainer = optionsContainer;
    elements.buyButton = buyButton;
    elements.infoButton = infoButton;
    
    document.body.appendChild(optionsContainer);
}

// Aplicar estilos a los botones de opciones
function applyOptionButtonStyles(button) {
    button.style.padding = '10px 15px';
    button.style.borderRadius = '20px';
    button.style.backgroundColor = '#fff';
    button.style.color = 'rgb(2, 3, 129)';
    button.style.border = '1px solid rgb(2, 3, 129)';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    button.style.fontFamily = 'Public Sans, sans-serif';
    button.style.fontSize = '14px';
    button.style.fontWeight = '500';
    button.style.width = '150px';
    button.style.textAlign = 'center';
    button.style.transition = 'all 0.3s ease';
    
    // Efectos hover
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = 'rgb(2, 3, 129)';
        button.style.color = '#fff';
    });
    
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#fff';
        button.style.color = 'rgb(2, 3, 129)';
    });
}

// Crear el contenedor del chat y sus componentes
function createChatContainer() {
    // Contenedor principal
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
    
    // Crear el header
    const chatHeader = createChatHeader();
    
    // Crear el cuerpo del chat
    const chatBody = document.createElement('div');
    chatBody.style.display = 'flex';
    chatBody.style.gap = '12px';
    chatBody.style.flexDirection = 'column';
    chatBody.style.flex = '1';
    chatBody.style.padding = '10px';
    chatBody.style.overflowY = 'auto';
    
    // Crear área de entrada
    const chatInputContainer = createInputArea();
    
    // Ensamblar componentes
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatBody);
    chatContainer.appendChild(chatInputContainer);
    
    elements.chatContainer = chatContainer;
    elements.chatBody = chatBody;
}

// Crear el header del chat
function createChatHeader() {
    const chatHeader = document.createElement('div');
    chatHeader.style.background = 'linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(20, 67, 147) 100%)';
    chatHeader.style.padding = '10px';
    chatHeader.style.color = '#fff';
    chatHeader.style.textAlign = 'center';
    chatHeader.style.fontWeight = 'normal';
    chatHeader.innerHTML = '<img width="110" height="31" src="https://www.payretailers.com/wp-content/uploads/2023/09/logo-light.svg" alt="Pay Retailers Logo" class="logo-pr ls-is-cached lazyloaded" data-src="https://www.payretailers.com/wp-content/uploads/2023/09/logo-light.svg" decoding="async" data-eio-rwidth="110" data-eio-rheight="31">';
    
    return chatHeader;
}

// Crear área de entrada
function createInputArea() {
    const chatInputContainer = document.createElement('div');
    chatInputContainer.style.display = 'flex';
    chatInputContainer.style.borderTop = '1px solid #ddd';

    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Escriu un missatge...';
    chatInput.style.flex = '1';
    chatInput.style.background = 'rgba(249, 195, 47, 0)';
    chatInput.style.border = 'none';
    chatInput.style.outline = 'none';

    const chatSendButton = document.createElement('button');
    chatSendButton.innerHTML = 'Enviar';
    chatSendButton.style.padding = '10px';
    chatSendButton.style.background = 'linear-gradient(135deg, rgb(2, 3, 129) 0%, rgb(20, 67, 147) 100%)';
    chatSendButton.style.color = '#fff';
    chatSendButton.style.border = 'none';
    chatSendButton.style.cursor = 'pointer';

    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(chatSendButton);
    
    elements.chatInput = chatInput;
    elements.chatSendButton = chatSendButton;
    
    return chatInputContainer;
}

// Configurar los event listeners
function setupEventListeners() {
    // Event listeners para el botón flotante
    elements.floatingButton.addEventListener('mouseover', () => {
        elements.floatingButton.style.backgroundColor = 'rgb(255, 219, 120)';
    });

    elements.floatingButton.addEventListener('mouseout', () => {
        elements.floatingButton.style.backgroundColor = '#f9c32f';
    });

    elements.floatingButton.addEventListener('click', toggleOptionsMenu);
    
    // Event listeners para los botones de opciones
    elements.buyButton.addEventListener('click', () => {
        openChatWithMode('buy');
    });
    
    elements.infoButton.addEventListener('click', () => {
        openChatWithMode('info');
    });
    
    // Event listeners para el input y botón de enviar
    elements.chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            manageSend();
        }
    });

    elements.chatSendButton.addEventListener('click', manageSend);
}

// Toggle menu de opciones
function toggleOptionsMenu() {
    if (opened) {
        // Si el chat está abierto, lo cerramos
        if (document.querySelector('.chatbot')) {
            if (chatMode === 'info') content = elements.chatBody.innerHTML;
            document.querySelector('.chatbot').remove();
        }
        elements.optionsContainer.style.display = 'none';
        opened = false;
    } else {
        // Mostramos el menú de opciones
        elements.optionsContainer.style.display = 'flex';
        opened = true;
    }
}

// Abrir chat según el modo seleccionado
function openChatWithMode(mode) {
    // Establecer el modo de chat
    chatMode = mode;
    
    // Ocultar el menú de opciones
    elements.optionsContainer.style.display = 'none';
    
    // Limpiar el contenido anterior del chat si existe
    if (elements.chatBody) {
        elements.chatBody.innerHTML = '';
    }
    
    // Añadir el chat al DOM
    document.body.appendChild(elements.chatContainer);
    elements.chatContainer.classList.add('chatbot');
    
    // Mostrar mensaje inicial según el modo
    if(mode === 'info' && content) elements.chatBody.innerHTML = content;
    else renderInitialMessageByMode(mode);
    if (mode === 'buy') questionari("Introdueix únicament el teu nom:");
}

function questionari(string) {
    getNomDiv = getResponseDiv(string);
    elements.chatBody.appendChild(getNomDiv);
    elements.chatInput.placeholder = 'Escriu...';
}

// Render mensaje inicial según el modo
function renderInitialMessageByMode(mode) {
    let initialMessage;
    if (mode === 'buy') {
        initialMessage = getResponseDiv("Asegura't d'estar mostrant a la pantalla clarament el preu de la compra o producte");
    } else {
        initialMessage = getResponseDiv("Soc l'assistent d'informació de PayRetailers. Com puc ajudar-te?");
    }
    
    elements.chatBody.appendChild(initialMessage);
}

// Funciones para el manejo de mensajes
async function manageSend() {
    const userMessage = elements.chatInput.value.trim();
    if (userMessage) {
        // Create and display user message
        const userMessageElement = messageComponent(userMessage, 'send');
        elements.chatBody.appendChild(userMessageElement);
        scrollToBottom();
        
        // Clear input
        elements.chatInput.value = '';

        if (chatMode === 'buy') {
            userInfo.push(userMessage);
            if(userInfo.length === 1) questionari("Introdueix únicament el teu cognom:");
            else{
                // Create camera button
                const cameraButton = document.createElement('button');
                cameraButton.innerHTML = '📷';
                cameraButton.style.width = '60px';
                cameraButton.style.height = '60px';
                cameraButton.style.borderRadius = '50%';
                cameraButton.style.backgroundColor = '#f9c32f';
                cameraButton.style.border = 'none';
                cameraButton.style.fontSize = '30px';
                cameraButton.style.cursor = 'pointer';
                cameraButton.style.margin = '20px auto';
                cameraButton.style.display = 'block';
                cameraButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                cameraButton.style.transition = 'all 0.3s ease';
                
                // Add hover effects
                cameraButton.addEventListener('mouseover', () => {
                    cameraButton.style.backgroundColor = 'rgb(255, 219, 120)';
                    cameraButton.style.transform = 'scale(1.05)';
                });
                
                cameraButton.addEventListener('mouseout', () => {
                    cameraButton.style.backgroundColor = '#f9c32f';
                    cameraButton.style.transform = 'scale(1)';
                });
                
                // Add click event
                cameraButton.addEventListener('click', async function () {
                    //foto a la pantalla
                    //base64imagen
                    document.querySelector('.chatbot').style.display = 'none';

                    // Create a function to take a screenshot
                    async function captureScreen() {
                        try {
                            // Demanar permís per capturar la pantalla
                            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    
                            // Crear un element vídeo per mostrar la captura
                            const video = document.createElement("video");
                            video.srcObject = stream;
                            video.play();
                    
                            // Esperar que el vídeo carregui
                            await new Promise(resolve => video.onloadedmetadata = resolve);
                    
                            // Crear un canvas per capturar un frame del vídeo
                            const canvas = document.createElement("canvas");
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                            // Aturar la captura per alliberar recursos
                            stream.getTracks().forEach(track => track.stop());
                    
                            // Obtenir la imatge com a data URL
                            return canvas.toDataURL("image/webp");
                            
                        } catch (err) {
                            console.error("Error capturant la pantalla:", err);
                        }
                    }
                    
                    const img = await captureScreen();
                    // Now that captureScreen has fully completed, show the chat again
                    document.querySelector('.chatbot').style.display = 'flex'; 
                    try {   
                        const response = await fetch(APIurl + buyEndpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json'},
                            body: JSON.stringify({ 
                                base64Image: img,
                                firstName: userInfo[0],
                                lastName: userInfo[1],
                            })
                        });
                        const data = await response.json();
                        if (data.form_action) {
                            // Create and display link
                            const redirDiv = getResponseDiv("Redirigint a la pàgina de pagament...", 'receive');
                            elements.chatBody.appendChild(redirDiv);
                            scrollToElement(redirDiv, 110);
                            setTimeout(() => {
                                window.open(data.form_action, '_blank');
                            }, 3000);
                        }   
                    }    
                    catch (error) {
                        console.error('Error:', error);
                        // Show error message
                        const errorMessage = messageComponent('En aquests moments no estic disponible', 'err');
                        elements.chatBody.appendChild(errorMessage);
                        scrollToElement(errorMessage, 110);
                    }     
                });

                const instructionsDiv = getResponseDiv("Es farà una foto de la pantalla actual. Assegura't que el producte i el preu estiguin clarament visibles.");
                elements.chatBody.appendChild(instructionsDiv);
                
                elements.chatBody.appendChild(cameraButton);
                scrollToBottom();
                
            }
            return;
        }

        const chargingBalls = [' ', '●', '●●', '●●●'];
        let charging = true;
        
        // Show typing indicator
        const typingIndicator = messageComponent('', 'receive');
        elements.chatBody.appendChild(typingIndicator);
        scrollToBottom();

        (function changeChargingBalls() {
            if (charging) {
                typingIndicator.textContent = chargingBalls[0];
                chargingBalls.push(chargingBalls.shift());
                scrollToBottom();
                setTimeout(changeChargingBalls, 500);
            }
        })();
        
        try {
            // Seleccionar el endpoint según el modo
            const endpoint = chatMode === 'buy' ? buyEndpoint : responseEndpoint;
            
            // Simulación de respuesta API - Reemplazar con llamada real según el modo
            // let data;
            // data = {
            //     output_text: `PayRetailers és un proveïdor líder de serveis de pagament en línia, fundat el 2017, amb seu a Espanya i oficines regionals a diversos països d'Amèrica Llatina, com Mèxic, Argentina, Brasil, i altres. Ofereix més de 250 mètodes de pagament locals, facilitant així que els comerços acceptin pagaments en diverses monedes sense necessitat d'una entitat local.

            //     ### Característiques Clau:
            //     - **Integració Senzilla**: La seva API permet una integració ràpida amb plataformes de comerç electrònic, millorant l'experiència de compra dels clients.
            //     - **Seguretat**: Utilitza tecnologia de tokenització per protegir les dades de pagament, garantint la seguretat en les transaccions.
            //     - **Suport Local**: Disposa d'un equip d'experts en cada país on opera, proporcionant assessorament sobre els mètodes de pagament més adequats per a cada mercat.
                
            //     ### Beneficis:
            //     - **Augment de Conversió**: Acceptar mètodes de pagament locals pot incrementar la taxa de conversió i la satisfacció del client.
            //     - **Cobertura Regional**: Permet a les empreses expandir-se a mercats emergents amb un enfocament en les necessitats locals.
                
            //     Si necessites més informació específica o detalls sobre un aspecte concret de PayRetailers, no dubtis a preguntar!`,
            //     response_id: 1
            // };

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

            if (typingIndicator.parentNode === elements.chatBody) {
                elements.chatBody.removeChild(typingIndicator);
            }

            if (data.error) throw new Error(data.error);
            
            previousResponseId = data.response_id;
            const responseDiv = getResponseDiv(data.output_text);
            elements.chatBody.appendChild(responseDiv);
            scrollToElement(responseDiv, 110);

        } catch (error) {
            console.error('Error:', error);
            charging = false;

            if (typingIndicator.parentNode === elements.chatBody) {
                elements.chatBody.removeChild(typingIndicator);
            }

            // Show error message
            const errorMessage = messageComponent('En aquests moments no estic disponible', 'err');
            elements.chatBody.appendChild(errorMessage);
            scrollToElement(errorMessage, 110);
        }
    }
}

// Utilidades de formateo y scroll
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

function getResponseDiv(mockResponse) {
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
            responseDiv.appendChild(createCodeBlock(part));
        }
    });
    
    return responseDiv;
}

function createCodeBlock(code) {
    // Contenidor per al pre i el botó de copiar
    const codeContainer = document.createElement('div');
    codeContainer.style.position = 'relative';
    
    const codePart = document.createElement('pre');
    codePart.style.fontSize = '15px';
    codePart.style.fontWeight = '300';
    codePart.textContent = code;
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
    copyButton.style.backgroundColor = 'rgba(50, 55, 60, 0.65)';
    copyButton.style.color = '#fff';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '4px';
    
    // Afegir funcionalitat al botó de copiar
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
            copyButton.textContent = 'Copiat!';
            setTimeout(() => {
                copyButton.textContent = 'Copiar';
            }, 2000);
        });
    });
    
    codeContainer.appendChild(copyButton);
    codeContainer.appendChild(codePart);
    
    return codeContainer;
}

function messageComponent(message, mode) {
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

// Funciones de scroll
function scrollToBottom() {
    elements.chatBody.scrollTo({
        top: elements.chatBody.scrollHeight,
        behavior: 'smooth'
    });
}

function scrollToElement(element, offset) { 
    elements.chatBody.scrollTo({
        top: element.offsetTop - offset,
        behavior: 'smooth'
    });
}

// Inicializar chat
initializeChat();