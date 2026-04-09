# SAP Lernapp 📚

Eine Progressive Web App (PWA) zur Vorbereitung auf die SAP-Zertifizierung **C_TS4FI_2023** (SAP S/4HANA FI/CO).

---

## 📱 App auf dem iPhone installieren

1. Öffne die GitHub Pages URL in **Safari** (nicht Chrome!)
2. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben)
3. Wähle **"Zum Home-Bildschirm"**
4. Tippe auf **"Hinzufügen"**
5. ✅ Die App erscheint jetzt mit eigenem Icon auf dem Homescreen

---

## 🤖 App auf Android installieren

1. Öffne die GitHub Pages URL in **Chrome**
2. Tippe auf die **drei Punkte** oben rechts
3. Wähle **"Zum Startbildschirm hinzufügen"**
4. ✅ Die App erscheint jetzt mit eigenem Icon auf dem Homescreen

---

## 🚀 GitHub Pages einrichten

1. Repository auf GitHub erstellen (Public)
2. Alle Dateien hochladen
3. **Settings** → **Pages** → Branch: `main` → **Save**
4. Nach 1–2 Minuten erreichbar unter:
   `https://DEIN-NAME.github.io/REPO-NAME`

---

## ✨ Features

| Feature | Beschreibung |
|---|---|
| 📚 187 Fragen | 100 WBS-Fragen + 87 SAP-Originalfragen |
| 🧠 Spaced Repetition | Fragen die du falsch beantwortest kommen häufiger |
| 💡 Erklärungen | Warum richtig/falsch + Eselsbrücken |
| 😅 Confidence Rating | Unsicher oder sicher — beeinflusst Wiederholung |
| ❌ Fehler-Pool | Nach jedem Durchlauf nur Fehler wiederholen |
| ⏱️ Prüfungsmodus | 80 Fragen, 180 Minuten, kein Feedback |
| 📊 Statistiken | Fortschritt pro Thema mit Balkenanzeige |
| 📶 Offline | Funktioniert komplett ohne Internet |

---

## 📂 Dateistruktur

```
├── index.html              # Haupt-App (alle Screens)
├── manifest.json           # PWA-Konfiguration (Icon, Name, Farbe)
├── sw.js                   # Service Worker (Offline-Unterstützung)
├── css/
│   └── style.css           # Gesamtes Design
├── js/
│   ├── app.js              # App-Logik (Quiz, Statistiken, SRS)
│   └── data.js             # 187 Fragen mit Erklärungen
└── icons/
    ├── icon-192.png        # App-Icon (Android + PWA)
    ├── icon-512.png        # App-Icon groß
    └── apple-touch-icon.png # App-Icon iPhone
```

---

## 🎯 Themen-Übersicht

Die 187 Fragen decken folgende Themen ab:

- **Anlagenbuchhaltung** (32 Fragen)
- **SAP Fiori** (19 Fragen)
- **Zahlungsverkehr** (14 Fragen)
- **Mahnwesen** (14 Fragen)
- **Sachkontenstammdaten** (13 Fragen)
- **SAP GUI** (7 Fragen)
- **Periodenabschluss** (6 Fragen)
- **Sonderhauptbuchvorgänge** (6 Fragen)
- **Ledger / Rechnungslegung** (6 Fragen)
- **Geschäftspartnerstammdaten** (6 Fragen)
- ... und 35 weitere Themen

---

## 🧠 So funktioniert Spaced Repetition

Das System merkt sich für jede Frage wie oft du sie richtig oder falsch beantwortet hast.

- **Richtig + sicher** → Frage kommt deutlich später wieder
- **Richtig + unsicher** → Frage kommt bald wieder
- **Falsch** → Frage kommt sehr bald wieder
- **3× richtig + sicher** → Frage gilt als **beherrscht** ✅

---

## 📊 Prüfungsinfo C_TS4FI_2023

| | |
|---|---|
| Fragen | 80 Multiple Choice |
| Zeit | 180 Minuten |
| Bestanden | ab 70% (≈ 56 richtige Antworten) |
| Sprache | Deutsch / Englisch |
| Gültig | SAP S/4HANA |

---

*Erstellt mit Claude · Alle Fragen basieren auf WBS Training und SAP Learning Hub Materialien*
