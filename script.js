// Login & Keep Logged: ------------------------------------------------------------------------------------------------------------------------
let user, refreshMsgs, refreshContacts, refreshLogin;

const nameInput = document.getElementById('input-login');
nameInput.addEventListener("keypress", function(event){ (event.key === "Enter")? document.querySelector(".box-login button").click() : funcNull() });

function login(){
    user = {name: nameInput.value};
    if (user.name === "Todos") {return alert("Nome inválido!");}

    document.querySelector('.box-login').classList.add('hidden');
    axios.post('https://mock-api.driven.com.br/api/v6/uol/participants',user).then(loginSucess).catch(loginError);
    document.querySelector('.box-loading').classList.remove('hidden');
}

function loginError(Response){
    let statusCode = Response.response.status;
    if (statusCode===400){
        alert("Usuário já logado!");
        document.querySelector('.box-login').classList.remove('hidden');
        document.querySelector('.box-loading').classList.add('hidden');
    } else {
        alert("Ocorreu um erro durante a execução.");
    }
}

function loginSucess(Response){
    let statusCode = Response.status;
    if (statusCode===200){
        document.querySelector('.screen-login').classList.add('hidden');
        document.querySelector('.screen-chat').classList.remove('hidden');
        loadMsgs();
        loadContacts();
        refreshMsgs = setInterval(loadMsgs,3000);
        refreshContacts = setInterval(loadContacts,10000);
    
        refreshLogin = setInterval(keepLogged,5000);
    } else {
        alert("Ocorreu um erro durante a execução.");
        document.querySelector('.box-login').classList.remove('hidden');
        document.querySelector('.box-loading').classList.add('hidden');
    }
}

function keepLogged(){
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status',user).catch(Response => console.log(Response.message));
}

// Load Messages: ------------------------------------------------------------------------------------------------------------------------
function insertMsgsDOM(Response){
    const data = Response.data;
    let ulTag = document.querySelector('main ul');
    ulTag.innerHTML = '';
    for (let i=0; i<data.length; i++){
        if (data[i].type === 'status'){
            ulTag.innerHTML +=
            `<li class="msg status" data-test="message">
                <span class="time">(${data[i].time})</span><span class="name">${data[i].from}</span> ${data[i].text}
            </li>`;
        } else if (data[i].type === 'message'){
            ulTag.innerHTML +=
            `<li class="msg public" data-test="message">
            <span class="time">(${data[i].time})</span><span class="name">${data[i].from}</span> para <span class="name">${data[i].to}</span>: ${data[i].text}
            </li>`;
        } else if (data[i].type === 'private_message' &&  (data[i].to === user.name || data[i].from === user.name)){
            ulTag.innerHTML +=
            `<li class="msg private" data-test="message">
                <span class="time">(${data[i].time})</span><span class="name">${data[i].from}</span> reservadamente para <span class="name">${data[i].to}</span>: ${data[i].text}
            </li>`;
        }
    }
    ulTag.lastElementChild.scrollIntoView({behavior:'smooth'});
}

function loadMsgs(){
    axios.get('https://mock-api.driven.com.br/api/v6/uol/messages').then(insertMsgsDOM).catch(Response => console.log(Response.message));
}

// Load Contacts: ------------------------------------------------------------------------------------------------------------------------
const contactsList = document.querySelector('.contacts');

function insertContactsDOM(Response){
    let data = Response.data;
    let contactTodos = contactsList.firstElementChild;
    contactsList.innerHTML = contactTodos.outerHTML;
    if (data.map(x => x.name).includes(contact) && contact !== "Todos"){
        contactsList.innerHTML += 
            `<li class="box-option selected" data-test="participant" onclick="selectContact(this);chatInfo()">
                    <div class="option">
                        <ion-icon name="person-circle"></ion-icon>
                        <p>${contact}</p>
                    </div>
                    <ion-icon name="checkmark-sharp" data-test="check"></ion-icon>
            </li>`;
    }
    for (let i=0; i<data.length; i++){
        if ( ! [user.name,contact].includes(data[i].name) ){
            contactsList.innerHTML +=
                `<li class="box-option" data-test="participant" onclick="selectContact(this);chatInfo()">
                    <div class="option">
                        <ion-icon name="person-circle"></ion-icon>
                        <p>${data[i].name}</p>
                    </div>
                    <ion-icon name="checkmark-sharp" data-test="check" class="hidden"></ion-icon>
                </li>`;
        }
    }
}

function loadContacts(){
    axios.get('https://mock-api.driven.com.br/api/v6/uol/participants').then(insertContactsDOM).catch(Response => console.log(Response.message));
}

// Open/Close Contacts Menu ------------------------------------------------------------------------------------------------------------------------
function openContacts(){
    document.querySelector('.container-screen-contacts').classList.remove('hidden');
}

function closeContacts(){
    document.querySelector('.container-screen-contacts').classList.add('hidden');
}

// Select Contact & Visibility ------------------------------------------------------------------------------------------------------------------------
let contact = "Todos";
function selectContact(button){
    if (button.firstElementChild.lastElementChild.innerHTML === "Todos" && visibility === "Reservadamente") {
        selectVisibility(document.querySelector(".visibilities").firstElementChild);
    }
    let buttonSelected = document.querySelector(".contacts .selected");
    let checkMarked = document.querySelector(".contacts .selected > ion-icon");

    if (buttonSelected !== null){
        buttonSelected.classList.remove("selected");
        checkMarked.classList.add("hidden");
    }
    button.classList.add("selected");
    document.querySelector(".contacts .selected > ion-icon").classList.remove("hidden");

    contact = document.querySelector(".contacts .selected p").innerHTML;
}

let visibility = "Público";
function selectVisibility(button){
    if (contact === "Todos" && button.firstElementChild.lastElementChild.innerHTML === "Reservadamente") {
        return;
    } else {
        let buttonSelected = document.querySelector(".visibilities .selected");
        let checkMarked = document.querySelector(".visibilities .selected > ion-icon");

        if (buttonSelected !== null){
            buttonSelected.classList.remove("selected");
            checkMarked.classList.add("hidden");
        }
        button.classList.add("selected");
        document.querySelector(".visibilities .selected > ion-icon").classList.remove("hidden");

        visibility = document.querySelector(".visibilities .selected p").innerHTML;
    }
}

function chatInfo(){
    document.querySelector(".chat-with").innerHTML = contact;
    document.querySelector(".chat-mode").innerHTML = visibility;
}

// Send Message ------------------------------------------------------------------------------------------------------------------------
const msgInput = document.getElementById('input-msg');

msgInput.addEventListener("keypress", function(event){ (event.key === "Enter")? document.querySelector("footer ion-icon").click() : funcNull() });

function sendMsg(){
    let msgObject = {
        from: user.name,
        to: contact,
        text: msgInput.value,
        type: (visibility === "Reservadamente")? "private_message" : "message"
    }
    msgInput.value = '';

    axios.post('https://mock-api.driven.com.br/api/v6/uol/messages',msgObject).then(sendMsgSucess).catch(sendMsgError);

    function sendMsgSucess(Response){
        loadMsgs();
    }

    function sendMsgError(Response){
        alert("Erro de conexão. Por favor, refaça o login.");
        window.location.reload()
    }
}