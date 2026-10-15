# DaySpend ✨ • *App iPhone & Multi-Dispositivo*

Un'applicazione elegante, intuitiva, curata nei minimi dettagli e dal tocco raffinato e femminile per ammortizzare le tue spese personali nel tempo, accessibile sia da **iPhone** che da **Mac e PC**.

---

## 🌸 Tutte le Nuove Funzionalità

### 📱 1. Esperienza Nativa da iPhone
- **Design iOS**: Bottom Tab Bar con icone curate (*Calcola* 🧮, *Diario* 📖, *Account* 👤), supporto per notch e dynamic island (`safe-area-inset`).
- **PWA Schermata Home**: Si installa direttamente da Safari come una vera app nativa, a schermo intero senza barre del browser.

### 📲 2. Accesso Multi-Dispositivo con Login
- Sistema di autenticazione integrato con **database SQLite cloud**.
- Puoi registrarti o accedere con email e password: le spese inserite su **iPhone** compariranno istantaneamente anche su **Mac** e viceversa!

### ⏳ 3. Aggiornamento Automatico dei Giorni Mancanti & Notifica con Frase a Tema
- L'app ricalcola automaticamente ogni giorno (e ad ogni apertura) i **giorni rimanenti esatti** per ogni spesa in corso.
- Quando una spesa arriva alla data di fine ammortamento, l'app attiva una **notifica speciale** (notifica web nativa + modale celebrativa con coriandoli) con una **frase a tema personalizzata** per la categoria:
  - 👗 **Shopping**: *"La tua spesa per «Borsa» è ora 100% ammortizzata! Da oggi la indossi con leggerezza assoluta e zero sensi di colpa. Splendi! ✨"*
  - 💄 **Beauty**: *"Il tuo investimento in bellezza e cura per «Profumo» è concluso! Una coccola che ha ripagato ogni singolo momento. 🌷"*
  - ✈️ **Viaggi**: *"Il tuo viaggio è ora completamente ripagato nel tempo! I ricordi restano per sempre preziosi e il conto è sereno e leggero. 🌸"*
  - 🧘‍♀️ **Benessere**: *"La cura per il tuo corpo e la tua mente è stato il miglior investimento possibile. Traguardo raggiunto! 💖"*
  - 🛋️ **Casa**, ☕ **Lifestyle**, 📱 **Tech**, 👑 **Altro**: frasi dedicate e motivanti!

### 🌸 4. Flusso a Seconda Schermata ("Dettagli Spesa")
- Nella prima schermata calcoli l'importo e scegli il periodo (1 Anno, 6 Mesi, 3 Mesi, 1 Mese, 1 Settimana o Qualche giorno).
- Cliccando su **"🌸 Salva questa Spesa nel Diario →"**, l'app naviga verso una **seconda schermata dedicata**:
  - Mostra il riepilogo in cima (€, durata, costo/giorno).
  - Permette di inserire il titolo della spesa, scegliere la categoria e le note.
  - **Date con i punti (`GG.MM.AAAA`)**: tutte le date (inizio, fine e anteprime) utilizzano rigorosamente il formato a punti come richiesto (es. `15.10.2026`).

### 📊 5. Esportazione in Excel / CSV
- Il pulsante **"📊 Esporta Excel"** genera un file `.csv` formattato specificamente per **Microsoft Excel**, **Apple Numbers** e **Google Sheets**.
- Utilizza il delimitatore italiano `;` (punto e virgola) e il prefisso BOM UTF-8, garantendo che lettere accentate, simboli `€` e numeri decimali vengano incolonnati alla perfezione!
- Date formattate con i punti (`GG.MM.AAAA`).

---

## 🚀 Come Avviare l'App e Connettere il tuo iPhone

### Passo 1: Avvia il Server dal Mac
Nel Terminale, all'interno della cartella `Dayspending`, avvia:
```bash
python3 server.py
```
*(Oppure fai doppio clic su `start.command` nel Finder).*

Il server mostrerà:
- 💻 **Da Mac**: `http://localhost:3333`
- 📱 **Dal tuo iPhone**: `http://192.168.1.22:3333`

---

### Passo 2: Come Aggiungerla alla Schermata Home del tuo iPhone
1. Assicurati che l'iPhone sia collegato alla **stessa rete Wi-Fi** del Mac.
2. Apri **Safari** sul tuo iPhone e vai su:
   **`http://192.168.1.22:3333`**
   *(oppure inquadra il **QR Code** visualizzato nella schermata "Account" dell'app!)*
3. Tocca il tasto **Condividi** in basso al centro (l'icona del quadratino con la freccia in su `⎋`).
4. Scorri verso il basso e tocca **"Aggiungi alla schermata Home"** (o *"Aggiungi a Home"*).
5. Tocca **Aggiungi** in alto a destra.

✨ **Fatto!** L'icona rosa pastello di **DaySpend** comparirà tra le app del tuo iPhone. Aprendola, funzionerà a tutto schermo come una vera applicazione per iOS!
