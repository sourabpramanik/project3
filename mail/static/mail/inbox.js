document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#compose-form').onsubmit = compose_email;

    
    load_mailbox('inbox');
})

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').innerHTML = `
    <div id="emails-title"></div>
  <div id="main">
      <table id="inbox_table">
      </table>
  </div>`;

    // Show the mailbox name
    document.querySelector('#emails-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Update the mailbox with the latest emails to show for this mailbox.
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            thead = document.querySelector('#inbox_table');
            thead= [['sender', 5], ['subject', 3], ['timestamp', 4]];
            emails = [ ...emails];
            emails.forEach(email => {
                const td = document.createElement('td');
                td.classList.add("row","email-section", email["read"] ? "read" : "unread");
                
                thead.forEach(
                    element => {
                        const element_name = element[0];
                        const element_size = element[1];
                        const div_element = document.createElement('div');
                        div_element.classList.add(`col-${element_size}`, `${element_name}-element`);
                        div_element.innerHTML = `<p>${email[element_name]}</p>`;
                        td.append(div_element);

                    });
                document.querySelector('#emails-view').append(td);
                td.addEventListener('click', () => load_email(email["id"], mailbox));



            })
            

        })
        .catch(error => console.log(error));
};
function reply_email(email) {
    compose_email();
    document.querySelector('#compose-recipients').value = email["sender"];
    document.querySelector('#compose-subject').value =
        email["subject"].slice(0, 4) === "Reply: " ? email["subject"] : "Reply: " + email["subject"];
    const pre_body_text = `\n \n \n \n \n \n ------------------------------------------------------------------------------------------------------------------------------------------------------
     \n On ${email['timestamp']},  ${email["sender"]} wrote: \n \n`;
    document.querySelector('#compose-body').value = pre_body_text + email["body"].replace(/^/gm, "\t");
}

function archive_email(email_id, to_archive) {
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: to_archive
        })
    }).then(() => load_mailbox("inbox"));

}


function load_email(email_id, mailbox) {
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    
    document.querySelector('#emails-view').innerHTML = `
    <div id="email-main"></div>
  <div id="content">
      
  </div>`;
    
    fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
            if(mailbox!="sent"){
                
                let main = document.querySelector('#content');
                
                main.innerHTML = `
                <div class="email-view">
                <span class='sender-name'>From: <strong class="email-from"> ${email.sender}</strong ></span>
                </br>
                <span>To me.</span>
                <p class="email-time">${email.timestamp}</p>
                <div class="email-subject">Subject: ${email.subject}</div>
                </br>
                <p class="email-body">${email.body}</p>
                    
                </div>
                `
                const archive_and_reply = document.createElement('div');
                    archive_and_reply.classList.add("col-4");
                    const archive_and_reply_buttons = [
                        ["Reply", () => reply_email(email)],
                        [email["archived"] ? "Unarchive" : "Archive",
                            () => archive_email(email_id, !email["archived"] )] 
                    ];

                                 (mailbox === "sent" ?
                        archive_and_reply_buttons.slice(0,1) : archive_and_reply_buttons)
                    .forEach( button_tool_function => {
                        const button_tool = button_tool_function[0];
                        const callback_func = button_tool_function[1];
                        const button = document.createElement("button");
                        button.classList.add("float-right");
                        button.innerHTML = button_tool;
                        button.addEventListener('click', callback_func);
                        button.setAttribute("class", "btn btn-outline-danger");
                        button.setAttribute("id", "reply-archive")
                        archive_and_reply.append(button);
                    });
                    main.append(archive_and_reply);

            };
            if (mailbox === "sent"){
                let main = document.querySelector('#content')
                main.innerHTML = `
                <div class="email-view">
                    <span>To: <strong class="email-from"> ${email.sender}</strong ></span>
                    <p class="email-time">${email.timestamp}</p>
                    <div class="email-subject">${email.subject}</div>
                    </br><hr>
                    <p class="email-body">${email.body}</p>
                </div>`
            }
        });
    reply_button = document.createElement("button");
    reply_button.setAttribute("class", "btn btn-outline-danger");
    reply_button.innerHTML = `<i class="fa fa-reply" aria-hidden="true"></i>`
    tooltip = document.createElement("span")
    tooltip.setAttribute('class', 'alttext')
    tooltip.innerHTML = 'Reply'
    reply_button.appendChild(tooltip)


    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    }).then();

}

function compose_email() {

 
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
    document.querySelector('#compose-form').onsubmit = (e) => {

        e.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
            .then(response => response.json())
            .then(result => {

                alert(result.message)
                load_mailbox('sent')
            });
    }
}

