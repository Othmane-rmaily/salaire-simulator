# Simulateur de salaire — Maroc · PLF 2027

Simulateur de salaire net au Maroc, **calcul annuel complet** selon le Code général des impôts (art. 56, 57, 59, 73, 74) et le projet de loi de finances 2027 (n° 60-26) : CNSS, AMO, frais professionnels, barèmes transitoires 2026 → 2031, charges de famille (600 DH/an), indemnités, retraite complémentaire (CIMR) et coût employeur.

🔗 **En ligne : https://salaire-simulator.vercel.app**
📜 Texte officiel : https://www.finances.gov.ma/Publication/db/2027/corps-PLF2027-fr.pdf

## Fonctionnalités

- Conversion **Brut → Net** et **Net → Brut** (brut calculé automatiquement)
- Bulletin de paie détaillé, mensuel et annuel, au centime
- Impôt tranche par tranche, taux marginal, taux réel, sommes à déduire
- Comparaison 2026 / année choisie et graphique du net 2026 → 2031
- **Rapport complet téléchargeable en PDF**
- Interface **FR / EN**, thème **clair / sombre**
- Animations **Framer Motion** (cartes, graphique, montant net)

## Stack

React 19 · Vite 7 · Framer Motion 12 — moteur de calcul en JavaScript pur (`src/calc.js`), validé au centime contre des simulations publiées (Dreamjob, e-RH, Devstation).

## Développement

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans dist/
```

## Avertissement

Outil indicatif : le PLF 2027 est un texte déposé, susceptible d'évoluer avant sa publication au Bulletin officiel. Ce n'est pas un conseil fiscal.
