## Structura proiectului

email-agent-personal-backend/
├── agent_email_prompts.txt # Prompts AI pentru clasificare emailuri
├── app.js # Script principal al aplicației
├── auth.js # Modul autentificare (ex: WhatsApp)
├── classifyEmail.js # Logica clasificării emailurilor
├── classifyEmailAI.js # Clasificare AI folosind OpenAI
├── Dockerfile # Configurație Docker pentru container
├── getToken.js # Script pentru obținerea tokenurilor Google
├── gmailClient.js # Client Gmail API
├── loadToken.js # Încarcă tokenurile Google din fișiere
├── moveEmail.js # Mută emailuri în Gmail pe baza etichetelor
├── package.json # Configurare dependințe Node.js
├── prompturiAI.txt # Prompturi suplimentare AI
├── whatsappClient.js # Client WhatsApp Web (whatsapp-web.js)
├── tests/ # Teste unitare și funcționale
│ ├── testClassify.js
│ ├── test-debug.js
│ └── test-whatsapp.js
├── tokens/ # Tokenuri Google OAuth (gitignored)
│ ├── token.creativeinfinitysrl.json
│ ├── token.turbomatrixxxl.json
│ └── tokens.radubogdannaramzoiu.json
└── utils/ # Utilitare și servicii auxiliare
├── emailService.js # Serviciu email (ex: trimitere QR, notificări)
└── sendSummaryMessage.js # Funcționalitate trimitere rezumat WhatsApp
