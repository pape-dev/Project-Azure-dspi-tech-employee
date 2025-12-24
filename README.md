# 📄 Projet Azure Cloud Computing (Examen E4) : Dossier de Conception Détaillé

![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0089D6?style=flat&logo=microsoftazure)
![PowerShell](https://img.shields.io/badge/Automation-PowerShell-5391FE?style=flat&logo=powershell)
![MySQL](https://img.shields.io/badge/Database-MySQL%20Flexible%20Server-4479A1?style=flat&logo=mysql)
![Ubuntu](https://img.shields.io/badge/OS-Ubuntu_22.04_LTS-E95420?style=flat&logo=ubuntu)
![Node.js](https://img.shields.io/badge/Runtime-Node.js_20_LTS-339933?style=flat&logo=nodedotjs)
![Security](https://img.shields.io/badge/Security-Firewall_Active-success?style=flat)

## 📅 Contexte et Objectifs

Ce document détaille la conception architecturale et le plan d'action pour le déploiement des ressources Azure, conformément aux exigences de l'examen E4 (Décembre 2025).

### 🎯 Objectifs de l'Examen

| Exigence | Service Cible | Configuration | Note (Max) |
| :--- | :--- | :--- | :--- |
| **1. Hébergement Statique** | VM Windows Server 2025 | Page HTML simple via IIS (Port 80). | 4 |
| **2. Base de Données** | Azure Database for MySQL | Base de données PaaS (`apdb`) pour l'application. | 4 |
| **3. Déploiement Applicatif** | VM Ubuntu Server | Application conteneurisée (Node.js/React) via Docker (Ports 3000, 5000). | 4 |
| **Bonus** | Azure App Service | Déploiement en PaaS de l'application (en parallèle). | 3 |

---

## I. 🗺️ Architecture Générale

L'architecture est une solution hybride IaaS/PaaS, intégrant des composants de mise à l'échelle et de résilience, avec un point d'accès unique via un équilibreur de charge.



### 1.1 Composants Clés

* **Azure Load Balancer (Standard)** : Point d'entrée unique.
* **VNet & Subnet** : Réseau privé pour l'infrastructure IaaS.
* **Deux VMs** : Windows Server (Hébergement Statique) et Ubuntu (Application Docker).
* **Azure Database for MySQL** : Base de données gérée PaaS.
* **Azure Backup** : Solution de continuité dactivité pour les VMs.

---

## II. 🌐 Détail des Services Réseau et Sécurité

| Service | Rôle Principal | Nom / SKU | Configuration Spécifique |
| :--- | :--- | :--- | :--- |
| **VNet** | Réseau Privé Logique | `VNET-Project-Azure` | Préfixe d'Adresse : `10.10.0.0/16` |
| **Subnet** | Réseau des serveurs | `SUBNET-Project-Azure` | Préfixe d'Adresse : `10.10.1.0/24` |
| **Azure Load Balancer** | Distribution du trafic | `LB-Project-Azure` (SKU Standard) | **Pool Backend :** VM Windows et VM Ubuntu. **IP Frontend :** Publique, Statique. |
| **NSG** | Pare-feu de Sous-réseau / NIC | `NSG-Project-Azure` | **Règles Inbound Essentielles (Source : Load Balancer / IP Admin) :** Port 22 (SSH), Port 3389 (RDP), Port 80 (HTTP), Port 3000 (Backend), Port 5000 (Frontend). |

---

## III. 💻 Détail des Ressources de Calcul (VMs)

| Machine Virtuelle | Rôle | Image / SKU | Configuration Applicative |
| :--- | :--- | :--- | :--- |
| **VM-WINDOWS-01** | **Hébergement Statique (Exigence 1)** | Windows Server 2025 Datacenter Gen 2 / `Standard_B2s` | Installation de IIS (Web Server Role). Déploiement du fichier `index.html`. |
| **VM-UBUNTU-01** | **Application Conteneurisée (Exigence 3)** | Ubuntu 22.04 LTS / `Standard_B2s` | Installation de **Docker Engine** via script Bash. Déploiement de l'image Docker (React/Node.js). |

> **Note sur le Load Balancer :** Le trafic HTTP/80 sera dirigé vers le service IIS de la VM Windows, tandis que les ports 3000/5000 seront dirigés vers l'application Docker de la VM Ubuntu, le Load Balancer agissant comme un aiguilleur simple dans ce contexte.

---

## IV. 💾 Détail de la Base de Données et de la Résilience

| Service | Rôle | Configuration | Justification |
| :--- | :--- | :--- | :--- |
| **Azure Database for MySQL** | Base de Données PaaS (Exigence 2) | Nom : `apdb`. Tier : Flexible Server (Recommandé). Version : MySQL 8.0. | Solution PaaS recommandée pour réduire l'overhead d'administration (patching, maintenance). |
| **Sécurité DB** | Connexion sécurisée | Règle de Pare-feu autorisant l'accès depuis le VNet (`10.10.1.0/24`). | Restreindre l'accès à la base de données uniquement aux VMs de l'application. |
| **Azure Backup** | Sauvegarde des VMs (Résilience) | **Recovery Services Vault :** Création et configuration de la politique de sauvegarde. | Assure la continuité des opérations et la capacité de restauration complète des VMs IaaS. |
| **Azure App Service** | Bonus PaaS | Déploiement de l'application Node.js/React. | Démonstration d'une solution PaaS (sans gestion d'OS) pour l'application. |

---

## V. ⚙️ Outils de Déploiement

Le déploiement sera effectué en utilisant une combinaison d'outils standards pour une approche professionnelle :

1.  **Azure CLI (Interface en ligne de commande) :** Utilisé via des **scripts PowerShell** pour l'automatisation du déploiement de l'infrastructure (VNet, NSG, VMs, LB, DB).
2.  **Scripts Bash :** Utilisés via des extensions de VM ou après SSH pour la configuration spécifique de la VM Ubuntu (installation de Docker).
3.  **Commandes RDP/SSH :** Utilisées pour les configurations finales (IIS sur Windows, commande `docker run` sur Ubuntu).

---

## VI. ✅ Prochaines Étapes

1.  **Finalisation des Scripts d'Infrastructure :** Intégration complète des commandes Azure CLI pour créer toutes les ressources listées.
2.  **Script de Nettoyage :** Création d'un script (`cleanup.sh` ou `.ps1`) pour supprimer le groupe de ressources afin d'éviter les frais.
3.  **Tests de Validation :** Vérification de l'accès à la page HTML (Port 80) et à l'application Node.js (Ports 3000/5000) via l'IP Publique du Load Balancer.



---

# Partie 1 : Création du groupe de ressources - Vnet - NSG - deux VM linux
```
# =============================================================================
# SCRIPT D'AUTOMATISATION DU DÉPLOIEMENT D'INFRASTRUCTURE AZURE (IaaS)
# Version : 2.0 (Double VM Linux - No Windows)
# =============================================================================

# Connexion (décommentez si nécessaire)
# Connect-AzAccount

# =============================================================================
# 1. DÉFINITION DES VARIABLES GLOBALES
# =============================================================================

# --- Configuration de Base ---
$RESOURCE_GROUP = "Project-Azure"
$LOCATION = "norwayeast"

# --- Configuration Réseau ---
$VNET_NAME = "VNET-Project-Azure"
$VNET_PREFIX = "10.10.0.0/16"
$SUBNET_NAME = "SUBNET-Project-Azure"
$SUBNET_PREFIX = "10.10.1.0/24"

# --- Configuration Sécurité (NSG) ---
$NSG_NAME = "NSG-Project-Azure"

# --- Configuration des Machines Virtuelles (VM Linux uniquement) ---
$VM_LINUX_01 = "VM-UBUNTU-01"
$VM_LINUX_02 = "VM-UBUNTU-02"
$VM_SIZE = "Standard_B2s"
$UBUNTU_IMAGE = "Ubuntu2204"

# --- Informations d'Administration ---
$ADMIN_USER = "dspi"
$ADMIN_PASSWORD = "Azure@2023Hello#"

# =============================================================================
# 2. CRÉATION DU GROUPE DE RESSOURCES ET DU RÉSEAU
# =============================================================================
Write-Host "➡️ Démarrage du déploiement dans la région $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

Write-Host "Création du VNet et Subnet..."
az network vnet create -g $RESOURCE_GROUP -n $VNET_NAME --address-prefix $VNET_PREFIX --location $LOCATION --output none
az network vnet subnet create -g $RESOURCE_GROUP --vnet-name $VNET_NAME --name $SUBNET_NAME --address-prefix $SUBNET_PREFIX --output none

# =============================================================================
# 3. CRÉATION DU NSG ET RÈGLES (SSH, HTTP, HTTPS, NODE)
# =============================================================================
Write-Host "Création du NSG ($NSG_NAME) et des règles Linux..."
az network nsg create -g $RESOURCE_GROUP -n $NSG_NAME --location $LOCATION --output none

# SSH (22)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-SSH-Inbound --priority 100 --protocol Tcp --destination-port-ranges 22 --access Allow --direction Inbound --output none

# Web (80, 443)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-HTTP-Inbound --priority 110 --protocol Tcp --destination-port-ranges 80 --access Allow --direction Inbound --output none
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-HTTPS-Inbound --priority 120 --protocol Tcp --destination-port-ranges 443 --access Allow --direction Inbound --output none

# Node.js App (3000, 5000)
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-Node-3000 --priority 140 --protocol Tcp --destination-port-ranges 3000 --access Allow --direction Inbound --output none
az network nsg rule create -g $RESOURCE_GROUP --nsg-name $NSG_NAME --name Allow-Node-5000 --priority 150 --protocol Tcp --destination-port-ranges 5000 --access Allow --direction Inbound --output none

# =============================================================================
# 4. CRÉATION DES MACHINES VIRTUELLES LINUX
# =============================================================================

$VMS = @($VM_LINUX_01, $VM_LINUX_02)

foreach ($VM_NAME in $VMS) {
    Write-Host "🚀 Déploiement de la machine : $VM_NAME..."
    az vm create -g $RESOURCE_GROUP -n $VM_NAME `
      --location $LOCATION `
      --image $UBUNTU_IMAGE `
      --size $VM_SIZE `
      --vnet-name $VNET_NAME --subnet $SUBNET_NAME `
      --nsg $NSG_NAME `
      --admin-username $ADMIN_USER `
      --admin-password $ADMIN_PASSWORD `
      --public-ip-sku Standard `
      --output none
}

# =============================================================================
# 5. RÉSUMÉ DES RESSOURCES
# =============================================================================
Write-Host "---"
Write-Host "✅ DÉPLOIEMENT TERMINÉ."
Write-Host "---"

foreach ($VM_NAME in $VMS) {
    $IP = az vm show -g $RESOURCE_GROUP -n $VM_NAME --query "publicIps" -o tsv
    Write-Host "🖥️ $VM_NAME :"
    Write-Host "   - IP Publique : $IP"
    Write-Host "   - Connexion : ssh $ADMIN_USER@$IP"
}
Write-Host "---"
az vm list -g $RESOURCE_GROUP -o table
```


# Partie 2 : Déploiement Azure Database pour MySQL

## Connexion au server pour la création de la base de données
- MySQL Workbench


- Création de la base de données et les table
```
-- 1. Création de la base de données

CREATE DATABASE IF NOT EXISTS appdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Utiliser la base

USE appdb;

-- 3. Création de la table employees

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status ENUM('active','inactive','remote') NOT NULL DEFAULT 'active',
  hireDate DATE NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  avatar VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_email (email)
);

-- 4. Création de la table contact

CREATE TABLE IF NOT EXISTS contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

```

- Pare-feu de la base de données



# Partie 3 :  🐳 Installation Docker (Script Bash)

- Créer un fichier bash et lui donner les autorisations

```
#!/bin/bash

# =============================================================================
# SCRIPT D'INSTALLATION ET DE MISE À JOUR DE DOCKER ENGINE SUR UBUNTU
#
# Ce script exécute les étapes officielles pour désinstaller les anciennes versions,
# configurer le dépôt Docker et installer les dernières versions des paquets.
#
# Auteur : [Votre Nom/Équipe]
# Date : Décembre 2025
# Version : 1.2 (Basé sur les commandes Docker CLI officielles)
# =============================================================================

# --- 1. CONFIGURATION ET FONCTIONS ---
SCRIPT_NAME=$(basename "$0")
LOG_FILE="/var/log/docker_install_official_$(date +%Y%m%d_%H%M%S).log"
DOCKER_USER=$(whoami)

# Fonction pour afficher des messages d'erreur et quitter
function die {
    echo -e "\n🚨 ERREUR: $1" | tee -a "$LOG_FILE" >&2
    echo "Consultez le fichier de log pour plus de détails: $LOG_FILE"
    exit 1
}

# Fonction pour journaliser les actions
function log_action {
    echo "--- $(date +%Y-%m-%d\ %H:%M:%S) --- $1" | tee -a "$LOG_FILE"
    echo "➡️ $1"
}

# Vérification des privilèges
if [ "$EUID" -ne 0 ]; then
    die "Ce script doit être exécuté avec des privilèges root (sudo)."
fi

log_action "Démarrage du processus d'installation/mise à jour de Docker..."

# --- 2. DÉSINSTALLATION DES VERSIONS INCOMPATIBLES/OBSOLÈTES ---
log_action "Désinstallation des paquets Docker/Conteneur non officiels ou anciens..."

# Commande optimisée pour la désinstallation. Elle ne s'arrête pas s'il n'y a rien à supprimer.
dpkg --get-selections | grep -E 'docker.io|docker-compose|docker-compose-v2|docker-doc|podman-docker|containerd|runc' | awk '{print $1}' | xargs -r apt remove -y >> "$LOG_FILE" 2>&1

# Commande pour supprimer les configurations résiduelles (facultatif mais recommandé)
# apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1

# --- 3. PRÉPARATION ET CONFIGURATION DU DÉPÔT DOCKER ---
log_action "Installation des dépendances pour la gestion des dépôts (ca-certificates, curl)..."
apt update >> "$LOG_FILE" 2>&1 || die "Échec de la mise à jour des index APT."
apt install -y ca-certificates curl >> "$LOG_FILE" 2>&1 || die "Échec de l'installation des prérequis."

log_action "Configuration du répertoire GPG et téléchargement de la clé officielle Docker..."
install -m 0755 -d /etc/apt/keyrings >> "$LOG_FILE" 2>&1
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc >> "$LOG_FILE" 2>&1 || die "Échec du téléchargement de la clé GPG Docker."
chmod a+r /etc/apt/keyrings/docker.asc

log_action "Ajout du dépôt Docker Stable aux sources APT (/etc/apt/sources.list.d/docker.sources)..."
# Utilisation de 'tee' pour écrire dans le fichier avec sudo
tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# --- 4. INSTALLATION DE DOCKER ENGINE ---
log_action "Mise à jour des index APT après ajout du dépôt..."
apt update >> "$LOG_FILE" 2>&1 || die "Échec de la mise à jour des index après ajout du dépôt Docker."

log_action "Installation des paquets principaux Docker (docker-ce, cli, buildx, compose)..."
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >> "$LOG_FILE" 2>&1 || die "Échec de l'installation des paquets Docker."

# --- 5. GESTION DU SERVICE ET VÉRIFICATION ---
log_action "Vérification et démarrage du service Docker..."
systemctl start docker >> "$LOG_FILE" 2>&1
systemctl enable docker >> "$LOG_FILE" 2>&1

if systemctl is-active --quiet docker; then
    log_action "✅ Docker Engine est installé et le service est ACTIF."
else
    die "Le service Docker n'a pas pu démarrer. Vérifiez les dépendances."
fi

# Affichage du statut
systemctl status docker | head -n 3 | tee -a "$LOG_FILE"

# --- 6. CONFIGURATION POST-INSTALLATION (Docker sans sudo) ---
log_action "Ajout de l'utilisateur '$DOCKER_USER' au groupe 'docker'..."

# Ajout au groupe 'docker' (l'utilisateur doit se déconnecter/reconnecter)
usermod -aG docker "$DOCKER_USER" >> "$LOG_FILE" 2>&1

log_action "Exécution du test 'hello-world' (cela peut échouer si l'utilisateur n'est pas root/pas encore reconnecté)..."
docker run hello-world >> "$LOG_FILE" 2>&1 || log_action "ATTENTION: Le test 'hello-world' a échoué pour l'utilisateur. Le nouvel utilisateur du groupe 'docker' doit se déconnecter et se reconnecter."

# --- 7. FINALISATION ---
echo ""
echo "=================================================================="
echo "🎉 INSTALLATION DE DOCKER TERMINÉE AVEC SUCCÈS"
echo "=================================================================="
echo "Version de Docker : $(docker --version)"
echo "Utilisateur '$DOCKER_USER' ajouté au groupe 'docker'."
echo ""
echo "ACTION REQUISE : Pour utiliser Docker sans 'sudo', vous devez :"
echo "   1. VOUS DÉCONNECTER (logout)."
echo "   2. VOUS RECONNECTER à votre session."
echo ""
echo "Fichier de journalisation : $LOG_FILE"

exit 0
```
# Partie 4 : 📦 Dépendances applicatives dans chaque VM
```
sudo apt update && sudo apt upgrade -y
# Installation de Node.js (via NodeSource pour avoir une version récente)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
# Installation globale de PM2
sudo npm install -g pm2
```

## Cloner L'application 

### 🔐 Accès GitHub via SSH

Au niveau de chaque VM : 

- 1️⃣ Générer une clé SSH

```
ssh-keygen -t ed25519 -C "pape-dev"

```

- 3️⃣ Copier la clé publique

```
cat ~/.ssh/id_ed25519.pub

```

- 4️⃣ Ajouter la clé sur GitHub : GitHub → Settings → SSH and GPG keys → New SSH key - Colle la clé → Save

- 5️⃣ Cloner le repo en SSH

```
git clone git@github.com:pape-dev/dspi-tech-employee-hub.git

```
### Lancement avec PM2

```
cd ~/dspi-tech-employee-hub
pm2 start server/index.js --name "api-backend"
pm2 save 

```

## Installer les dépendances

```
npm install

```
## Build du projet

```
npm run build

```

## Configuration de Nginx (Reverse Proxy)

```
 nano /etc/nginx/sites-available/mon_app
 
```

code à mettre :

```
server {
    listen 80;
    server_name 4.235.106.204; # Votre IP Azure

    # Serveur de fichiers statiques (Frontend)
    location / {
        root /home/dspi/dspi-tech-employee-hub/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers le Backend (Express)
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```
## Gestion des permissions

```
# Autoriser Nginx à accéder à votre dossier utilisateur
sudo chmod +x /home/dspi

# Donner les droits de lecture sur le projet
sudo chmod -R 755 /home/dspi/dspi-tech-employee-hub

```
## Activation

```
sudo ln -s /etc/nginx/sites-available/mon_app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

```

## Quelques commandes utiles

```
# Voir si le backend est "online"
pm2 status

# Redémarrer le backend
pm2 restart api-backend

# Voir les logs du backend (erreurs de code ou base de données)
pm2 logs api-backend

# Sauvegarder pour le redémarrage automatique de la VM
pm2 save

```

## Statut du pm2

- VM 1


- VM 2



## Se connecter à l'application

- VM 1  : 20.251.223.213


- VM 2 : 4.235.106.204


## Vérifier les insertions de la base de données


# Configuration du load balancer

## Au niveau du code > VM 1 & VM 2 Mettre à jour la configuration du nginx

```
sudo nano /etc/nginx/sites-available/mon_app

```
Les IP "Server_Name" ont été remplacés par "_" : 

```
npm run build

sudo systemctl restart nginx

pm2 restart api-backend

```
## Se connecter avec l'IP du Load Balancer 

---


## ✅ Conclusion
Ce projet valide les compétences suivantes :
- Provisionnement IaaS via scripts automatisés.
- Gestion de services PaaS (MySQL Managé).
- Conteneurisation et Reverse Proxy (Docker / Nginx).
- Haute Disponibilité (Standard Load Balancer).
- Déployer & héberger des applications 
- Sécurisation (Groupes de sécurité et SSH).



---

# Application Web : DSPI-TECH Employee Hub

Application web complète de gestion des employés et des contacts pour DSPI-TECH. Cette application permet de gérer les informations des collaborateurs, d'ajouter de nouveaux employés, de consulter les données et d'exporter les informations au format CSV.

## 📋 Table des matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [Utilisation](#utilisation)
- [Scripts disponibles](#scripts-disponibles)
- [Déploiement](#déploiement)
- [Contribution](#contribution)

## 🎯 Description

DSPI-TECH Employee Hub est une application full-stack moderne permettant de :
- Visualiser et gérer les informations des employés
- Ajouter de nouveaux collaborateurs
- Gérer les contacts via un formulaire
- Exporter les données en CSV
- Filtrer et trier les données des employés

## ✨ Fonctionnalités

### Page d'accueil (Index)
- Vue d'ensemble avec statistiques des employés
- Présentation des fonctionnalités principales
- Navigation vers les différentes sections

### Gestion des salariés (Salaries)
- Affichage de tous les employés dans un tableau interactif
- Recherche par nom, email ou poste
- Filtrage par département et statut
- Tri par nom, département, poste, date d'embauche ou salaire
- Statistiques en temps réel (Total, Actifs, Remote, Inactifs)
- Export CSV des employés filtrés

### Ajout d'employé (Nouveau)
- Formulaire complet pour ajouter un nouvel employé
- Validation des champs obligatoires
- Génération automatique d'ID unique
- Gestion des départements et postes prédéfinis

### Contact
- Formulaire de contact pour les visiteurs
- Enregistrement des messages en base de données
- Export CSV des contacts
- Informations de contact de l'entreprise

## 🛠 Technologies utilisées

### Frontend
- **React 18.3.1** - Bibliothèque UI
- **TypeScript 5.8.3** - Typage statique
- **Vite 7.3.0** - Build tool et dev server
- **React Router DOM 6.30.1** - Routage
- **Tailwind CSS 3.4.17** - Framework CSS
- **shadcn/ui** - Composants UI basés sur Radix UI
- **Lucide React** - Icônes
- **TanStack Query** - Gestion des données serveur
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas

### Backend
- **Node.js** - Runtime JavaScript
- **Express 4.22.1** - Framework web
- **MySQL2 3.16.0** - Driver MySQL
- **CORS 2.8.5** - Gestion CORS
- **dotenv 16.6.1** - Variables d'environnement

### Outils de développement
- **ESLint** - Linter
- **TypeScript ESLint** - Linter TypeScript
- **Concurrently** - Exécution parallèle de scripts

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure) - [Télécharger Node.js](https://nodejs.org/)
- **npm** (inclus avec Node.js) ou **yarn**
- **MySQL** (version 8.0 ou supérieure) - [Télécharger MySQL](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Télécharger Git](https://git-scm.com/)

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone <URL_DU_REPOSITORY>
cd dspi-tech-employee-hub
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

Créez une base de données MySQL et exécutez le script SQL :

```bash
mysql -u root -p < Docs_Config/bd.sql
```

Ou connectez-vous à MySQL et exécutez le contenu du fichier `Docs_Config/bd.sql`.

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration de la base de données
DB_HOST="Server database for MySQL"
DB_PORT=3306
DB_NAME=appdb
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# Configuration du serveur API
PORT=3000

# Configuration du frontend (optionnel)
VITE_API_URL=http://localhost:3000
```

### 5. Démarrer l'application

#### Option 1 : Démarrer frontend et backend ensemble
```bash
npm run dev:full
```

#### Option 2 : Démarrer séparément

Terminal 1 - Frontend :
```bash
npm run dev
```

Terminal 2 - Backend :
```bash
npm run server
```

L'application sera accessible sur :
- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3000

## ⚙️ Configuration

### Variables d'environnement

#### Backend (`.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_HOST` | Adresse du serveur MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_NAME` | Nom de la base de données | `appdb` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | `password` |
| `PORT` | Port du serveur API | `3000` |

#### Frontend (`.env` ou `.env.local`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000` |

### Configuration Vite

Le fichier `vite.config.ts` configure :
- Port du serveur de développement : **8080**
- Alias `@` pour le dossier `src`
- Plugin React avec SWC pour une compilation rapide

## 📁 Structure du projet

```
dspi-tech-employee-hub/
├── Docs_Config/              # Documentation et scripts
│   ├── bd.sql               # Script de création de la base de données
│   ├── Architecture.png     # Diagramme d'architecture
│   ├── Deploy_VM.ps1       # Script de déploiement PowerShell
│   └── docker.sh           # Script Docker
├── public/                   # Fichiers statiques
│   ├── favicon.ico
│   └── robots.txt
├── server/                   # Backend Express
│   ├── db.js                # Configuration de la connexion MySQL
│   └── index.js              # Serveur API Express
├── src/                      # Code source frontend
│   ├── components/          # Composants React
│   │   ├── Layout.tsx      # Layout principal
│   │   ├── NavLink.tsx     # Composant de navigation
│   │   └── ui/             # Composants shadcn/ui
│   ├── data/               # Données statiques
│   │   └── employees.ts    # Types et données d'exemple
│   ├── hooks/              # Hooks React personnalisés
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utilitaires
│   │   └── utils.ts        # Fonctions utilitaires
│   ├── pages/              # Pages de l'application
│   │   ├── Index.tsx       # Page d'accueil
│   │   ├── Salaries.tsx    # Gestion des salariés
│   │   ├── Nouveau.tsx     # Ajout d'employé
│   │   ├── Contact.tsx      # Formulaire de contact
│   │   └── NotFound.tsx    # Page 404
│   ├── App.tsx             # Composant racine
│   ├── App.css             # Styles globaux
│   ├── index.css           # Styles Tailwind
│   ├── main.tsx            # Point d'entrée
│   └── vite-env.d.ts       # Types Vite
├── .env                     # Variables d'environnement (à créer)
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite
├── tailwind.config.ts      # Configuration Tailwind
└── README.md               # Ce fichier
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Vérifie l'état du serveur.

**Réponse :**
```json
{
  "status": "ok"
}
```

### Employés

#### Récupérer tous les employés
```
GET /api/employees
```

**Réponse :**
```json
[
  {
    "id": "EMP123456",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@dspi-tech.com",
    "phone": "+33 6 12 34 56 78",
    "department": "IT",
    "position": "Développeur",
    "status": "active",
    "hireDate": "2024-01-15",
    "salary": 50000,
    "avatar": null
  }
]
```

#### Créer un nouvel employé
```
POST /api/employees
```

**Body :**
```json
{
  "id": "EMP123456",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@dspi-tech.com",
  "phone": "+33 6 12 34 56 78",
  "department": "IT",
  "position": "Développeur",
  "status": "active",
  "hireDate": "2024-01-15",
  "salary": 50000,
  "avatar": null
}
```

**Réponse :**
```json
{
  "message": "Employé créé",
  "id": 1
}
```

### Contacts

#### Récupérer tous les contacts
```
GET /api/contact
```

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question",
    "message": "Bonjour...",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Créer un nouveau contact
```
POST /api/contact
```

**Body :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Bonjour, j'aimerais..."
}
```

**Réponse :**
```json
{
  "message": "Contact créé",
  "id": 1
}
```

## 🗄️ Base de données

### Structure

#### Table `employees`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | VARCHAR(50) | Identifiant unique (PK) |
| `firstName` | VARCHAR(100) | Prénom |
| `lastName` | VARCHAR(100) | Nom |
| `email` | VARCHAR(255) | Email (UNIQUE) |
| `phone` | VARCHAR(50) | Téléphone (nullable) |
| `department` | VARCHAR(100) | Département |
| `position` | VARCHAR(100) | Poste |
| `status` | ENUM | Statut : 'active', 'inactive', 'remote' |
| `hireDate` | DATE | Date d'embauche |
| `salary` | DECIMAL(10,2) | Salaire annuel |
| `avatar` | VARCHAR(255) | URL avatar (nullable) |

#### Table `contact`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT | Identifiant auto-incrémenté (PK) |
| `name` | VARCHAR(255) | Nom complet |
| `email` | VARCHAR(255) | Email |
| `subject` | VARCHAR(255) | Sujet |
| `message` | TEXT | Message |
| `created_at` | TIMESTAMP | Date de création (auto) |

### Script SQL

Le script de création de la base de données se trouve dans `Docs_Config/bd.sql`.

Pour créer la base de données :

```bash
mysql -u root -p < Docs_Config/bd.sql
```

## 💻 Utilisation

### Navigation

L'application propose 4 pages principales :

1. **Accueil** (`/`) - Vue d'ensemble et statistiques
2. **Salariés** (`/salaries`) - Liste et gestion des employés
3. **Nouveau** (`/nouveau`) - Formulaire d'ajout d'employé
4. **Contact** (`/contact`) - Formulaire de contact

### Fonctionnalités principales

#### Gestion des salariés
- Utilisez la barre de recherche pour filtrer par nom, email ou poste
- Sélectionnez un département dans le filtre déroulant
- Filtrez par statut (Actif, Remote, Inactif)
- Cliquez sur les en-têtes de colonnes pour trier
- Cliquez sur "Exporter" pour télécharger un CSV

#### Ajout d'employé
- Remplissez tous les champs obligatoires (marqués d'un *)
- Sélectionnez un département et un poste dans les listes déroulantes
- L'ID est généré automatiquement
- Le statut est défini par défaut sur "active"

#### Contact
- Remplissez le formulaire de contact
- Les messages sont enregistrés en base de données
- Utilisez le bouton "Exporter" pour télécharger tous les contacts en CSV

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement frontend (port 8080) |
| `npm run server` | Démarre le serveur API backend (port 3000) |
| `npm run dev:full` | Démarre frontend et backend simultanément |
| `npm run build` | Compile l'application pour la production |
| `npm run build:dev` | Compile en mode développement |
| `npm run preview` | Prévisualise la build de production |
| `npm run lint` | Exécute ESLint pour vérifier le code |

## 🚢 Déploiement

### Build de production

```bash
npm run build

```

Les fichiers compilés seront dans le dossier `dist/`.

### Déploiement du backend

Le serveur Express peut être déployé sur :
- **Heroku**
- **Railway**
- **Render**
- **VPS** (avec PM2)
- **Azure App Service**

### Variables d'environnement en production

Assurez-vous de configurer toutes les variables d'environnement nécessaires sur votre plateforme de déploiement.

### Exemple avec PM2

```bash
# Installer PM2
npm install -g pm2

# Démarrer le serveur
pm2 start server/index.js --name "dspi-api"

# Sauvegarder la configuration
pm2 save
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Notes

- L'application utilise MySQL pour la persistance des données
- Le frontend communique avec l'API via des requêtes HTTP
- Les exports CSV incluent un BOM UTF-8 pour une compatibilité optimale avec Excel
- Les filtres et tris sont appliqués côté client pour une meilleure performance


---

# Partie 5 : 🚀 Déploiement Infrastructure Azure App Service (Node.js)

Ce script PowerShell automatise la création d'une infrastructure de production robuste et sécurisée sur Azure pour héberger une application **Node.js**.

## 📋 Table des Matières
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Étapes du Déploiement](#étapes-du-déploiement)
- [Sécurité & Monitoring](#sécurité--monitoring)
- [Utilisation](#utilisation)

---

## 🏗 Architecture
L'infrastructure déployée repose sur les composants suivants :
* **Resource Group** : Conteneur logique pour organiser les ressources.
* **App Service Plan (Linux)** : Le moteur de calcul (Tier Basic B1) optimisé pour Node.js.
* **Web App** : L'instance d'hébergement de votre code.
* **Application Insights** : Monitoring de performance et journalisation des erreurs en temps réel.



---

## 🛠 Prérequis
1.  Un compte **Azure** actif.
2.  **Azure PowerShell (Module Az)** installé ou utilisation via **Azure Cloud Shell**.
3.  Droits de contributeur sur l'abonnement pour créer des ressources.

---

## 🚀 Étapes du Déploiement

Le script suit un processus en 5 étapes clés :

1.  **Initialisation du Groupe de Ressources** : Création de l'espace de travail dans la région `Norway East` (Norvège).
2.  **Configuration du Monitoring** : Déploiement d'Application Insights pour surveiller la santé de l'application.
3.  **Provisionnement du Plan Linux** : Création d'un serveur dédié sous Linux (plus performant pour Node.js).
4.  **Configuration du Runtime** : Verrouillage de la stack technique sur **Node.js 20 LTS**.
5.  **Injection des Variables** : Configuration automatique des clés de monitoring et de l'environnement (`NODE_ENV=production`).

---

## 🔒 Sécurité & Monitoring
Le script applique les standards de sécurité "Enterprise" :
* **HTTPS Only** : Redirection automatique du trafic HTTP vers HTTPS.
* **TLS 1.2** : Désactivation des protocoles SSL/TLS obsolètes.
* **Variables d'environnement** : Aucune clé n'est stockée en dur dans le code ; elles sont injectées directement dans les `App Settings` d'Azure.

---

## 💻 Utilisation

1.  Ouvrez votre terminal (ou Azure Cloud Shell).
2.  Copiez et collez le script `deployAppService.ps1`.
```
<#
.SYNOPSIS
    Script de déploiement d'infrastructure Azure Web App.
.DESCRIPTION
    Prépare l'environnement complet : Monitoring, Sécurité, Tags et Runtime Node.js.
#>

# --- 1. CONFIGURATION TOUT-EN-UN ---
$config = @{
    RGName      = "rg-node-prod-norway"
    Location    = "norwayeast"
    PlanName    = "asp-node-linux-premium"
    AppName     = "webapp-node-$(Get-Random -Minimum 1000 -Maximum 9999)"
    SkuTier     = "Basic"
    SkuSize     = "B1"
    Runtime     = "NODE|20-lts"
}

$tags = @{
    Environment = "Production"
    Project     = "Project-Azure-dspi"
}

Write-Host "`n[1/5] Préparation du Groupe de Ressources..." -ForegroundColor Magenta
if (!(Get-AzResourceGroup -Name $config.RGName -ErrorAction SilentlyContinue)) {
    New-AzResourceGroup -Name $config.RGName -Location $config.Location -Tag $tags -Force | Out-Null
}

# --- 2. MONITORING ---
Write-Host "[2/5] Configuration du monitoring (App Insights)..." -ForegroundColor Cyan
$appInsights = New-AzApplicationInsights -ResourceGroupName $config.RGName `
    -Name "$($config.AppName)-insights" -Location $config.Location -Force

# --- 3. PLAN ET WEB APP ---
Write-Host "[3/5] Création des services App Service Linux..." -ForegroundColor Cyan
$plan = New-AzAppServicePlan -Name $config.PlanName -ResourceGroupName $config.RGName `
    -Location $config.Location -Tier $config.SkuTier -NumberofWorkers 1 `
    -WorkerSize "Small" -Linux -ErrorAction Stop

$webApp = New-AzWebApp -Name $config.AppName -ResourceGroupName $config.RGName `
    -Location $config.Location -AppServicePlan $config.PlanName

# --- 4. CONFIGURATION SÉCURITÉ ET RUNTIME ---
Write-Host "[4/5] Application de la configuration système..." -ForegroundColor Cyan
# On modifie l'objet WebApp
$webApp.SiteConfig.LinuxFxVersion = $config.Runtime
$webApp.HttpsOnly = $true
$webApp.SiteConfig.MinTlsVersion = "1.2"

# Action 1 : On enregistre les modifications système
Set-AzWebApp -WebApp $webApp | Out-Null

# --- 5. CONFIGURATION DES APP SETTINGS ---
Write-Host "[5/5] Injection des variables d'environnement..." -ForegroundColor Cyan
$appSettings = @{
    "NODE_ENV"                              = "production"
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = $appInsights.InstrumentationKey
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = $appInsights.ConnectionString
}

# Action 2 : On enregistre les AppSettings séparément (Méthode 100% compatible)
Set-AzWebApp -ResourceGroupName $config.RGName -Name $config.AppName -AppSettings $appSettings | Out-Null

# --- 6. RAPPORT FINAL ---
Write-Host "`n=========================================================" -ForegroundColor Green
Write-Host "             INFRASTRUCTURE PRÊTE AU DÉPLOIEMENT" -ForegroundColor Green
Write-Host "========================================================="
Write-Host " URL Publique    : https://$($config.AppName).azurewebsites.net"
Write-Host " Groupe Ress.    : $($config.RGName)"
Write-Host " Runtime         : $($config.Runtime)"
Write-Host "========================================================="

```

4.  Une fois terminé, récupérez l'**URL Publique** affichée dans le rapport final.
5.  Déployez votre code via le portail Azure, VS Code ou GitHub.

---
> **Note :** Le nom de la Web App est généré de manière aléatoire (`webapp-node-XXXX`) pour garantir l'unicité mondiale requise par Azure.

## 📄 Licence

Ce projet est privé et propriétaire de DSPI-TECH.

## 👥 Auteurs

- **DSPI-TECH** - Développement initial

## 🆘 Support

Pour toute question ou problème, contactez l'équipe DSPI-TECH.




