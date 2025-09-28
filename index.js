const express = require('express');
const app = express();
app.use(express.json());

// Variables d'environnement sécurisées
const PHONE_ID = process.env.PHONE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook pour recevoir les messages
app.post('/webhook', async (req, res) => {
  const body = req.body;
  
  console.log('Webhook reçu:', JSON.stringify(body, null, 2));
  
  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry[0];
    
    if (entry.changes && entry.changes[0].value.messages) {
      const message = entry.changes[0].value.messages[0];
      const from = message.from; // Numéro expéditeur
      const messageText = message.text?.body?.toLowerCase();

      console.log(`Message reçu de ${from}: ${messageText}`);

      // Si message == "/blague"
      if (messageText === '/blague') {
        console.log('Commande /blague détectée, envoi de la blague...');
        
        // Array de blagues pour varier
        const blagues = [
          'Pourquoi les programmeurs préfèrent le mode sombre ? Parce que la lumière attire les bugs ! 😂',
          'Que dit un escargot quand il croise une limace ? "Regarde ce punk avec son crâne rasé !" 🐌',
          'Pourquoi les poissons n\'aiment pas jouer au tennis ? Parce qu\'ils ont peur du filet ! 🐟',
          'Comment appelle-t-on un chat tombé dans un pot de peinture le jour de Noël ? Un chat-mallow ! 🎨',
          'Que dit un informaticien quand il se noie ? F1 ! F1 ! 💻'
        ];
        
        // Sélection aléatoire
        const blague = blagues[Math.floor(Math.random() * blagues.length)];
        
        // Envoi de la réponse
        await envoyerMessage(from, blague);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Fonction pour envoyer un message
async function envoyerMessage(destinataire, texte) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: destinataire,
    type: 'text',
    text: { body: texte }
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${ACCESS_TOKEN}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Message envoyé:', result);
    return result;
  } catch (error) {
    console.error('Erreur envoi message:', error);
  }
}

// Route pour vérifier webhook (Meta l'appelle en GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('Vérification webhook:', { mode, token, challenge });
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook vérifié avec succès !');
    res.status(200).send(challenge);
  } else {
    console.log('Échec vérification webhook');
    res.sendStatus(403);
  }
});

// Route de test
app.get('/', (req, res) => {
  res.send('🤖 Bot Blague est en ligne !');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Bot démarré sur le port ${port}`);
  console.log(`📱 Phone ID: ${PHONE_ID}`);
  console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`);
});