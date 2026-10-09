# Regola: Monitoraggio Costante dei Token e del Contesto

Questa regola impone all'assistente di fornire in modo trasparente e costante lo stato del consumo dei token e della context window della conversazione corrente.

## Direttiva Obbligatoria per le Risposte

In calce a **ogni risposta finale**, l'assistente DEVE includere un riquadro formattato che riepiloga:
1. **Modello attivo** e la sua capacità massima di contesto (es. Gemini 3.8 Flash ha una finestra di contesto di 1.048.576 token, ~1M token).
2. **Stima cumulativa dei token usati** nella conversazione (stimando la lunghezza del transcript, cronologia, file aperti e prompt).
3. **Percentuale della context window utilizzata**.
4. **Token stimati rimanenti** prima di raggiungere il limite del contesto.
5. **Indicatore di salute del contesto**:
   - 🟢 **Ottimale** (< 50%): Piena reattività e precisione.
   - 🟡 **Attenzione** (50% - 75%): Contesto ampio, valutare l'uso di subagenti per compiti isolati.
   - 🔴 **Critico** (> 75%): Consigliato iniziare una nuova conversazione (`New Chat`) per preservare velocità ed evitare perdita di aderenza alle istruzioni.

### Formato Standard del Box (Footer)

```markdown
---
> 📊 **Stato Contesto & Token (Gemini 3.8 Flash)**
> - **Contesto utilizzato**: ~[X] token ([Y]%)
> - **Token residui disponibili**: ~[Z] token
> - **Salute del contesto**: 🟢 Ottimale / 🟡 Medio / 🔴 Riavvio consigliato
```
