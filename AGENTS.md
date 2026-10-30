# Instructions Agent : Intégration Front-End & Back-End (EndoPrev)

## 1. Contexte et Objectif
Ce projet réunit les fichiers statiques HTML/CSS/JS d'EndoPrev et la logique serveur.
L'objectif est d'interfacer le front-end visuel avec l'API back-end (authentification, rôles, publication, gestion de compte), d'adapter le schéma de base de données et de valider l'ensemble par une batterie de tests automatiques.

L'ensemble des fichier du back-end sont dans le dossier "demo" et l'ensemble des fichier du front-end sont dans "front-end"
---

## 2. Routage & Contrôle d'Accès

### 2.1 Page d'accueil et routes publiques
- La route racine `/` doit obligatoirement servir le fichier `index.html`.
- Toutes les pages (`index.html`, `login.html`, `signup.html`, `reset-password.html`, `chercheures.html`, `associations.html`, `temoignages.html`, etc.) sont **librement accessibles** sans authentification.

### 2.2 Protection de la page Compte
- **`compte.html`** est la seule page privée du site.
- **Règle de redirection** : Lors du chargement de `compte.html`, vérifier immédiatement le statut de connexion (token JWT / cookie de session).
  - Si l'utilisateur **n'est pas connecté** : Rediriger automatiquement vers `login.html`.
  - Si l'utilisateur **est connecté** : Charger les informations du profil depuis le back-end.

---

## 3. Comportements Dynamiques (Header & Restrictions)

### 3.1 Gestion de l'état de connexion dans le Header
Au chargement de chaque page (`DOMContentLoaded`) :
- **Utilisateur CONNECTÉ** : Le bouton "Connexion" devient **"Compte"** et redirige vers `compte.html`.
- **Utilisateur NON CONNECTÉ** : Le bouton reste **"Connexion"** et redirige vers `login.html`.

### 3.2 Restriction des Actions (Utilisateurs Non Connectés)
Lorsque l'utilisateur n'est pas authentifié, intercepter le clic et/ou désactiver visuellement :

| Page | Bouton Cible | Action attendue si non-connecté |
| :--- | :--- | :--- |
| `chercheures.html` | `"Publier l'annonce"` | Bloquer le clic + alerte / redirection `login.html` |
| `associations.html` | `"Envoyer notre demande"` | Bloquer le clic + alerte / redirection `login.html` |
| `temoignages.html` | `"Publier mon témoignage"` | Bloquer le clic + alerte / redirection `login.html` |

---

## 4. Modification du Système d'Inscription (`signup`) & Base de Données

### 4.1 Évolution du Schéma de Base de Données
- Ajouter une colonne/champ `type_account` dans la table/collection des utilisateurs (`users`).
- **Valeurs autorisées** : `'patiente'`, `'chercheure'`, `'admin'`.
- Valeur par défaut recommandée : `'patiente'`.

### 4.2 Adaptation du Front-End (`signup.html` & `script.js`)
- Rendre le composant de sélection (boutons radio / menu déroulant) fonctionnel dans `signup.html` pour laisser le choix entre **"patiente"** et **"chercheure"** (le rôle `"admin"` ne doit jamais être sélectionnable depuis le formulaire public).
- Récupérer cette valeur lors de la soumission du formulaire et l'inclure dans le body de la requête HTTP `POST` :
  ```json
  {
    "email": "user@example.com",
    "password": "secretPassword",
    "type_account": "chercheure"
  }
  ```

### 4.3 Validation Back-End (API `/signup` ou `/register`)
- Vérifier que la valeur transmise pour `type_account` appartient bien à `['patiente', 'chercheure']`.
- Bloquer toute tentative d'injection du rôle `'admin'` via l'API publique d'inscription (retourner une erreur `400 Bad Request`).
- Stocker la valeur `type_account` en base de données lors de la création de l'utilisateur.

---

## 5. Protocole de Tests & Validation par l'Agent

L'agent doit exécuter et réussir la suite de vérifications ci-dessous avant de valider les modifications :

### Phase 1 : Compilation & Démarrage
1. **Compilation Back-End** : Vérifier que le serveur démarre sans erreur de syntaxe ou d'importation (`npm start`, `node server.js`, etc.).
2. **Schéma DB** : Exécuter la migration ou la mise à jour de la BDD et vérifier la présence du champ `type_account`.

### Phase 2 : Tests des Endpoints API (`POST /signup` & `POST /login`)
1. **Inscription Patiente** : Créer un compte avec `type_account: "patiente"` $\rightarrow$ Succès `201 Created`, vérification en BDD.
2. **Inscription Chercheure** : Créer un compte avec `type_account: "chercheure"` $\rightarrow$ Succès `201 Created`, vérification en BDD.
3. **Rejet Inscription Admin** : Tenter d'envoyer `type_account: "admin"` via l'inscription publique $\rightarrow$ Rejet `400 Bad Request`.
4. **Rejet Données Invalides** : Tenter une inscription sans `type_account` ou avec un rôle inconnu $\rightarrow$ Rejet `400 Bad Request`.

### Phase 3 : Tests des Interactions Front-End & Sécurité
1. **Redirection Compte** : Simuler un accès direct à `compte.html` sans token $\rightarrow$ Vérifier la redirection vers `login.html`.
2. **Bouton Header** : Vérifier que le bouton bascule entre `"Connexion"` (non-connecté) et `"Compte"` (connecté).
3. **Protection des Boutons Restreints** : Vérifier le blocage du clic pour :
   - `chercheures.html` (`#btn-publier-annonce`)
   - `associations.html` (`#btn-envoyer-demande`)
   - `temoignages.html` (`#btn-publier-temoignage`)

---

## 6. Structure Code Recommandée (`script.js`)

```javascript
// Vérification de session
function isLoggedIn() {
    return !!localStorage.getItem('authToken');
}

// Interception formulaires & sécurisation
document.addEventListener('DOMContentLoaded', () => {
    // 1. Redirection compte.html
    if (window.location.pathname.endsWith('compte.html') && !isLoggedIn()) {
        window.location.href = 'login.html';
    }

    // 2. Bouton Header
    const authBtn = document.querySelector('.nav-login-btn');
    if (authBtn) {
        authBtn.textContent = isLoggedIn() ? 'Compte' : 'Connexion';
        authBtn.href = isLoggedIn() ? 'compte.html' : 'login.html';
    }

    // 3. Formulaire Inscription (signup)
    const signupForm = document.querySelector('#signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const accountTypeInput = document.querySelector('input[name="type_account"]:checked');
            const type_account = accountTypeInput ? accountTypeInput.value : 'patiente';

            const payload = {
                email: signupForm.email.value,
                password: signupForm.password.value,
                type_account: type_account
            };

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    window.location.href = 'login.html';
                } else {
                    const err = await response.json();
                    alert(err.message || 'Erreur lors de l\'inscription');
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            }
        });
    }
});
```