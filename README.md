# Simulateur de salaire 2027 — Maroc

Simulateur de salaire net au Maroc, avec un calcul **annuel complet conforme à la loi** :
Code général des impôts (art. 56, 57, 59, 73, 74 et 247) et projet de loi de finances
2027 n° 60-26 (barèmes transitoires 2027-2030, barème définitif 2031).

**En ligne : https://salaire-simulator.vercel.app**

## Fonctionnalités

- Mode **Brut → Net** et **Net → Brut**
- Années 2026 à 2031 (barèmes transitoires du PLF 2027)
- Bulletin de paie détaillé, au centime, par mois et par an
- CNSS 4,48 % (IPE incluse) plafonnée, AMO 2,26 %, frais professionnels
  (35 %/25 % en 2026, 45 % dès 2027, plafond 35 000 DH/an)
- Réduction pour charges de famille : 600 DH/an/personne (LF 2026)
- Options avancées : indemnités exonérées (imposables en 2031, art. 57-1°),
  retraite complémentaire déductible (CIMR)
- Impôt tranche par tranche, sommes à déduire, coût employeur
- Rapport complet téléchargeable en PDF
- Interface FR / EN, thème clair / sombre
- Lien vers le texte officiel du PLF 2027 (Ministère de l'Économie et des Finances)

## Technique

Application statique en un seul fichier `index.html` (aucune dépendance),
déployée sur Vercel.

> Simulateur indicatif — le PLF 2027 est un texte déposé, susceptible
> d'amendements avant publication au Bulletin officiel. Ce n'est pas un conseil fiscal.
